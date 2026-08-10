import asyncio
import logging
import time
import os
from datetime import datetime
from pathlib import Path
from sqlalchemy.orm import Session
from core.database import SessionLocal
import models
import cv2
import numpy as np

log = logging.getLogger("netre.ai_worker")

RECORDINGS_DIR = Path(__file__).parent.parent / "recordings"
RECORDINGS_DIR.mkdir(exist_ok=True)

SEGMENT_SECS = 300
MODEL_PATH = Path(__file__).parent.parent.parent / "detect-pipeline" / "models" / "yolov8n.onnx"

COCO_LABELS = [
    "person","bicycle","car","motorcycle","airplane","bus","train","truck","boat",
    "traffic light","fire hydrant","stop sign","parking meter","bench","bird","cat",
    "dog","horse","sheep","cow","elephant","bear","zebra","giraffe","backpack",
    "umbrella","handbag","tie","suitcase","frisbee","skis","snowboard","sports ball",
    "kite","baseball bat","baseball glove","skateboard","surfboard","tennis racket",
    "bottle","wine glass","cup","fork","knife","spoon","bowl","banana","apple",
    "sandwich","orange","broccoli","carrot","hot dog","pizza","donut","cake","chair",
    "couch","potted plant","bed","dining table","toilet","tv","laptop","mouse",
    "remote","keyboard","cell phone","microwave","oven","toaster","sink","refrigerator",
    "book","clock","vase","scissors","teddy bear","hair drier","toothbrush"
]

DETECT_LABELS = {"person", "car", "truck", "bicycle", "motorcycle", "dog", "cat", "bus"}

_session = None

def _get_ort_session():
    global _session
    if _session is not None:
        return _session
    if not MODEL_PATH.exists():
        log.warning(f"ONNX model not found at {MODEL_PATH}. Detection disabled.")
        return None
    try:
        import onnxruntime as ort
        opts = ort.SessionOptions()
        opts.inter_op_num_threads = 2
        opts.intra_op_num_threads = 2
        _session = ort.InferenceSession(str(MODEL_PATH), sess_options=opts, providers=["CPUExecutionProvider"])
        log.info(f"YOLOv8n ONNX loaded from {MODEL_PATH}")
        return _session
    except Exception as e:
        log.error(f"Failed to load ONNX model: {e}")
        return None


def _preprocess(frame: np.ndarray, size: int = 640):
    h, w = frame.shape[:2]
    scale = size / max(h, w)
    nh, nw = int(h * scale), int(w * scale)
    resized = cv2.resize(frame, (nw, nh))
    padded = np.zeros((size, size, 3), dtype=np.uint8)
    padded[:nh, :nw] = resized
    inp = padded.astype(np.float32) / 255.0
    inp = inp.transpose(2, 0, 1)[np.newaxis]
    return inp, scale, 0, 0


def _postprocess(outputs, scale, conf_thresh=0.35):
    preds = outputs[0][0].T
    results = []
    for row in preds:
        scores = row[4:]
        cls_id = int(np.argmax(scores))
        conf = float(scores[cls_id])
        if conf < conf_thresh:
            continue
        label = COCO_LABELS[cls_id] if cls_id < len(COCO_LABELS) else f"cls{cls_id}"
        if label not in DETECT_LABELS:
            continue
        cx, cy, bw, bh = row[:4]
        x1 = (cx - bw / 2) / scale
        y1 = (cy - bh / 2) / scale
        x2 = (cx + bw / 2) / scale
        y2 = (cy + bh / 2) / scale
        results.append((label, conf, x1, y1, x2, y2))
    return results


def _run_yolo(frame: np.ndarray):
    sess = _get_ort_session()
    if sess is None:
        return []
    inp, scale, _, _ = _preprocess(frame)
    outputs = sess.run(None, {sess.get_inputs()[0].name: inp})
    return _postprocess(outputs, scale)


def _resolve_url(cam: models.Camera) -> str:
    url = cam.stream_url or ""
    if url and not url.startswith(("http://", "https://", "rtsp://")):
        base = Path(__file__).parent.parent
        for candidate in [base / url, base.parent.parent / url]:
            if candidate.exists():
                return str(candidate)
    return url


_last_event: dict[tuple, float] = {}
_cam_fail: dict[int, int] = {}


def _check_zones(detections, zones, frame_w: int, frame_h: int, cam, db: Session):
    for label, conf, x1, y1, x2, y2 in detections:
        foot_x = (x1 + x2) / 2.0
        foot_y = y2

        for zone in zones:
            try:
                pts_raw = zone.polygon_points
                if not pts_raw or len(pts_raw) < 3:
                    continue
                polygon = np.array(
                    [[float(p[0]) * frame_w, float(p[1]) * frame_h] for p in pts_raw],
                    dtype=np.float32
                )
            except Exception as e:
                log.debug(f"Zone parse error: {e}")
                continue

            result = cv2.pointPolygonTest(polygon, (foot_x * frame_w, foot_y * frame_h), False)
            if result >= 0:
                key = (cam.id, zone.id, label)
                now = time.time()
                if now - _last_event.get(key, 0) > 10:
                    _last_event[key] = now
                    event = models.Event(
                        camera_id=cam.id,
                        zone_id=zone.id,
                        label=label,
                        confidence=conf,
                        caption=f"Detected {label} in zone '{zone.name}'"
                    )
                    db.add(event)
                    db.commit()
                    log.info(f"EVENT SAVED: {event.caption} | cam={cam.id} conf={conf:.0%}")


def run_inference_cycle():
    db: Session = SessionLocal()
    try:
        cameras = db.query(models.Camera).all()
        for cam in cameras:
            url = _resolve_url(cam)
            if not url:
                continue

            cap = cv2.VideoCapture(url)
            if not cap.isOpened():
                _cam_fail[cam.id] = _cam_fail.get(cam.id, 0) + 1
                if _cam_fail[cam.id] >= 3 and cam.status != "offline":
                    cam.status = "offline"
                    db.commit()
                    log.info(f"Camera {cam.id} marked offline")
                cap.release()
                continue

            _cam_fail[cam.id] = 0
            if cam.status != "online":
                cam.status = "online"
                db.commit()
                log.info(f"Camera {cam.id} marked online")

            ret, frame = cap.read()
            cap.release()

            if not ret or frame is None:
                continue

            zones = db.query(models.Zone).filter(models.Zone.camera_id == cam.id).all()
            if not zones:
                continue

            h, w = frame.shape[:2]
            detections = _run_yolo(frame)
            log.debug(f"Camera {cam.id}: {len(detections)} detections")

            if detections:
                _check_zones(detections, zones, w, h, cam, db)

    except Exception as e:
        log.error(f"Inference cycle error: {e}", exc_info=True)
    finally:
        db.close()


def run_recording_cycle():
    db: Session = SessionLocal()
    try:
        cameras = db.query(models.Camera).filter(models.Camera.status == "online").all()
        for cam in cameras:
            url = _resolve_url(cam)
            if not url:
                continue

            cap = cv2.VideoCapture(url)
            if not cap.isOpened():
                cap.release()
                continue

            fps = cap.get(cv2.CAP_PROP_FPS) or 20.0
            w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 640
            h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 480

            cam_dir = RECORDINGS_DIR / str(cam.id)
            cam_dir.mkdir(exist_ok=True)

            start_time = datetime.now()
            filename = f"{start_time.strftime('%Y%m%d_%H%M%S')}.mp4"
            filepath = cam_dir / filename

            fourcc = cv2.VideoWriter_fourcc(*"avc1")
            writer = cv2.VideoWriter(str(filepath), fourcc, fps, (w, h))
            frames_written = 0
            max_frames = int(SEGMENT_SECS * fps)

            while frames_written < max_frames:
                ret, frame = cap.read()
                if not ret:
                    break
                if frame.shape[1] != w or frame.shape[0] != h:
                    frame = cv2.resize(frame, (w, h))
                writer.write(frame)
                frames_written += 1

            cap.release()
            writer.release()

            if frames_written > 10:
                end_time = datetime.now()
                rec = models.Recording(
                    camera_id=cam.id,
                    file_path=str(filepath),
                    start_time=start_time,
                    end_time=end_time
                )
                db.add(rec)
                db.commit()
                log.info(f"Segment saved: {filepath} ({frames_written} frames)")
            else:
                filepath.unlink(missing_ok=True)

    except Exception as e:
        log.error(f"Recording cycle error: {e}", exc_info=True)
    finally:
        db.close()


async def ai_background_task():
    log.info("AI background worker started.")
    _get_ort_session()
    while True:
        await asyncio.to_thread(run_inference_cycle)
        await asyncio.sleep(2)


async def recording_background_task():
    log.info("Recording background worker started.")
    while True:
        await asyncio.to_thread(run_recording_cycle)
        await asyncio.sleep(1)

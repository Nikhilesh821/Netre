import asyncio
import logging
import time
import os
import sys
from datetime import datetime
from pathlib import Path
from sqlalchemy.orm import Session
from core.database import SessionLocal
import models
import cv2
import numpy as np

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "detect-pipeline"))

from detect_pipeline.motion import MotionDetector, MotionConfig
from detect_pipeline.onnx_detector import OnnxYoloDetector
from detect_pipeline.detector import RawDetection

log = logging.getLogger("netre.ai_worker")

RECORDINGS_DIR = Path(__file__).parent.parent / "recordings"
RECORDINGS_DIR.mkdir(exist_ok=True)

SEGMENT_DURATION_SECS = 300

model_path = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "detect-pipeline", "models", "yolov8n.onnx"
)

class _MockDetector:
    def detect(self, frame):
        return []

try:
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"YOLOv8 ONNX not found at {model_path}")
    detector = OnnxYoloDetector(model_path)
    log.info("YOLOv8n ONNX detector loaded successfully.")
except Exception as e:
    log.warning(f"Could not load ONNX detector: {e}. AI detection disabled until model is available.")
    detector = _MockDetector()

_camera_fail_counts: dict[int, int] = {}
_last_event_times: dict[tuple, float] = {}
_motion_detectors: dict[int, MotionDetector] = {}


def _get_motion_detector(cam_id: int, h: int, w: int) -> MotionDetector:
    key = (cam_id, h, w)
    if key not in _motion_detectors:
        _motion_detectors[key] = MotionDetector((h, w), MotionConfig())
    return _motion_detectors[key]


def _resolve_stream_url(cam: models.Camera) -> str:
    url = cam.stream_url or ""
    if url and not url.startswith(("http://", "https://", "rtsp://")):
        base = Path(__file__).parent.parent
        resolved = base / url
        if resolved.exists():
            return str(resolved)
        alt = Path(__file__).parent.parent.parent.parent / url
        if alt.exists():
            return str(alt)
    return url


def run_inference_cycle():
    db: Session = SessionLocal()
    try:
        cameras = db.query(models.Camera).all()
        for cam in cameras:
            stream_url = _resolve_stream_url(cam)
            if not stream_url:
                continue

            cap = cv2.VideoCapture(stream_url)
            if not cap.isOpened():
                _camera_fail_counts[cam.id] = _camera_fail_counts.get(cam.id, 0) + 1
                if _camera_fail_counts[cam.id] >= 3:
                    if cam.status != "offline":
                        cam.status = "offline"
                        db.commit()
                continue

            _camera_fail_counts[cam.id] = 0
            if cam.status != "online":
                cam.status = "online"
                db.commit()

            ret, frame = cap.read()
            cap.release()

            if not ret or frame is None:
                continue

            if not cam.zones:
                continue

            h, w = frame.shape[:2]
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            motion_det = _get_motion_detector(cam.id, h, w)
            motion_boxes = motion_det.detect(gray)

            if not motion_boxes or motion_det.is_calibrating():
                continue

            detections = detector.detect(frame)

            for det in detections:
                for zone in cam.zones:
                    try:
                        raw_pts = zone.polygon_points
                        if isinstance(raw_pts, list) and len(raw_pts) >= 3:
                            if isinstance(raw_pts[0], (list, tuple)):
                                polygon = [(float(p[0]) * w, float(p[1]) * h) for p in raw_pts]
                            else:
                                polygon = [(float(p.get("x", p[0])) * w, float(p.get("y", p[1])) * h) for p in raw_pts]
                        else:
                            continue
                    except Exception:
                        continue

                    bx1, by1, bx2, by2 = det.box
                    cx = ((bx1 + bx2) / 2.0) * w
                    cy = by2 * h

                    poly_arr = np.array(polygon, dtype=np.float32)
                    result = cv2.pointPolygonTest(poly_arr, (cx, cy), False)
                    if result >= 0:
                        key = (cam.id, zone.id, det.label)
                        now = time.time()
                        if now - _last_event_times.get(key, 0) > 10:
                            _last_event_times[key] = now
                            event = models.Event(
                                camera_id=cam.id,
                                zone_id=zone.id,
                                label=det.label,
                                confidence=det.confidence,
                                caption=f"Detected {det.label} in zone '{zone.name}'"
                            )
                            db.add(event)
                            db.commit()
                            log.info(f"EVENT: {event.caption} | cam={cam.id} confidence={det.confidence:.0%}")

    except Exception as e:
        log.error(f"AI inference cycle error: {e}", exc_info=True)
    finally:
        db.close()


def run_recording_cycle():
    db: Session = SessionLocal()
    try:
        cameras = db.query(models.Camera).filter(models.Camera.status == "online").all()
        for cam in cameras:
            stream_url = _resolve_stream_url(cam)
            if not stream_url:
                continue

            cap = cv2.VideoCapture(stream_url)
            if not cap.isOpened():
                continue

            fps = cap.get(cv2.CAP_PROP_FPS) or 20.0
            w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 640
            h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 480
            cap.release()

            cam_dir = RECORDINGS_DIR / str(cam.id)
            cam_dir.mkdir(exist_ok=True)

            start_time = datetime.now()
            filename = f"{start_time.strftime('%Y%m%d_%H%M%S')}.mp4"
            filepath = cam_dir / filename

            fourcc = cv2.VideoWriter_fourcc(*"mp4v")
            writer = cv2.VideoWriter(str(filepath), fourcc, fps, (w, h))

            cap2 = cv2.VideoCapture(stream_url)
            frames_written = 0
            max_frames = int(SEGMENT_DURATION_SECS * fps)

            while frames_written < max_frames:
                ret, frame = cap2.read()
                if not ret:
                    break
                if frame.shape[1] != w or frame.shape[0] != h:
                    frame = cv2.resize(frame, (w, h))
                writer.write(frame)
                frames_written += 1

            cap2.release()
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
                log.info(f"Recording saved: {filepath} ({frames_written} frames)")
            else:
                filepath.unlink(missing_ok=True)

    except Exception as e:
        log.error(f"Recording cycle error: {e}", exc_info=True)
    finally:
        db.close()


async def ai_background_task():
    log.info("AI background worker started.")
    recording_task = None
    while True:
        await asyncio.to_thread(run_inference_cycle)
        await asyncio.sleep(2)


async def recording_background_task():
    log.info("Recording background worker started.")
    while True:
        await asyncio.to_thread(run_recording_cycle)
        await asyncio.sleep(1)

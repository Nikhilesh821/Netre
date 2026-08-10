"""
Netre VMS — Offline Detection Tester
Usage: python test_detection.py <path_to_video.mp4>

Runs YOLO on every Nth frame and reports all detections.
No server or camera needed — just give it any video file.
"""
import sys
import os
import cv2
import numpy as np

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

MODEL_PATH = os.path.join(os.path.dirname(__file__), "detect-pipeline", "models", "yolov8n.onnx")


def preprocess(frame, size=640):
    h, w = frame.shape[:2]
    scale = size / max(h, w)
    nh, nw = int(h * scale), int(w * scale)
    resized = cv2.resize(frame, (nw, nh))
    padded = np.zeros((size, size, 3), dtype=np.uint8)
    padded[:nh, :nw] = resized
    inp = padded.astype(np.float32) / 255.0
    return inp.transpose(2, 0, 1)[np.newaxis], scale


def detect(sess, frame, conf_thresh=0.30):
    inp, scale = preprocess(frame)
    outputs = sess.run(None, {sess.get_inputs()[0].name: inp})
    preds = outputs[0][0].T
    results = []
    for row in preds:
        scores = row[4:]
        cls_id = int(np.argmax(scores))
        conf = float(scores[cls_id])
        if conf < conf_thresh:
            continue
        label = COCO_LABELS[cls_id] if cls_id < len(COCO_LABELS) else f"cls{cls_id}"
        cx, cy, bw, bh = row[:4]
        x1 = (cx - bw / 2) / scale
        y1 = (cy - bh / 2) / scale
        x2 = (cx + bw / 2) / scale
        y2 = (cy + bh / 2) / scale
        results.append((label, conf, int(x1), int(y1), int(x2), int(y2)))
    return sorted(results, key=lambda r: -r[1])


def main():
    video_path = sys.argv[1] if len(sys.argv) > 1 else None
    if not video_path or not os.path.exists(video_path):
        print("Usage: python test_detection.py <path_to_video.mp4>")
        print("\nExample: python test_detection.py C:\\Users\\nikhi\\Videos\\test.mp4")
        sys.exit(1)

    if not os.path.exists(MODEL_PATH):
        print(f"ERROR: Model not found at {MODEL_PATH}")
        print("Make sure yolov8n.onnx is in detect-pipeline/models/")
        sys.exit(1)

    print(f"\n{'='*60}")
    print(f"Netre VMS Detection Test")
    print(f"{'='*60}")
    print(f"Video: {video_path}")
    print(f"Model: {MODEL_PATH}")

    import onnxruntime as ort
    sess = ort.InferenceSession(MODEL_PATH, providers=["CPUExecutionProvider"])
    print(f"Model loaded successfully!")

    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    print(f"Video: {w}x{h} @ {fps:.1f}fps | {total} frames ({total/fps:.1f}s)\n")

    sample_every = max(1, int(fps))
    frame_idx = 0
    all_detections = []
    found_any = False

    print(f"Sampling every {sample_every} frames (1 per second)...\n")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_idx % sample_every == 0:
            t_secs = frame_idx / fps
            dets = detect(sess, frame)

            if dets:
                found_any = True
                print(f"t={t_secs:6.1f}s | Frame {frame_idx:5d} | {len(dets)} detection(s):")
                for label, conf, x1, y1, x2, y2 in dets[:5]:
                    print(f"  {'>'} {label:<15} conf={conf:.0%}  box=[{x1},{y1},{x2},{y2}]")
                all_detections.extend([(t_secs, label, conf) for label, conf, *_ in dets])
            else:
                print(f"t={t_secs:6.1f}s | Frame {frame_idx:5d} | no detections")

        frame_idx += 1

    cap.release()

    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    if not found_any:
        print("NO DETECTIONS FOUND in the entire video.")
        print("\nPossible reasons:")
        print("  - Objects too small or partially visible")
        print("  - Try lowering confidence threshold (edit conf_thresh=0.30 above)")
        print("  - Video might be too dark or blurry")
    else:
        from collections import Counter
        label_counts = Counter(label for _, label, _ in all_detections)
        avg_conf = {label: np.mean([c for _, l, c in all_detections if l == label]) for label in label_counts}
        print(f"Total detections across video: {len(all_detections)}")
        print(f"\nBy label:")
        for label, count in label_counts.most_common():
            print(f"  {label:<15} {count:3d} times  avg_confidence={avg_conf[label]:.0%}")
        print(f"\nIf you see 'person' detections here but not in the live app:")
        print(f"  1. Make sure you drew a ZONE on that camera (zones must exist)")
        print(f"  2. Make sure the camera status is 'online' (green dot)")
        print(f"  3. The person must walk through the DRAWN ZONE area, not just anywhere on screen")


if __name__ == "__main__":
    main()

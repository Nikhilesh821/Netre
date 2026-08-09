import asyncio
import logging
import time
from sqlalchemy.orm import Session
from core.database import SessionLocal
import models
import os
import sys

# Ensure detect_pipeline is in path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "detect-pipeline"))

from detect_pipeline.onnx_detector import OnnxYoloDetector
from detect_pipeline.detector import RawDetection
import cv2
import numpy as np

log = logging.getLogger("open_nvr.ai_worker")

class MockYoloDetector:
    """Fallback mock detector if YOLOv8 weights are missing"""
    def __init__(self, *args, **kwargs):
        pass
    def detect(self, crop):
        # Mock detection in the center of the screen simulating movement
        x_offset = (time.time() % 10) / 10.0 # moves across the screen
        return [RawDetection("person", 0.95, (x_offset, 0.4, x_offset + 0.1, 0.6))]

# Try loading real model, fallback to mock
model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "detect-pipeline", "models", "yolov8n.onnx")
try:
    if not os.path.exists(model_path):
        raise FileNotFoundError("YOLOv8 weights not found")
    detector = OnnxYoloDetector(model_path)
    log.info("YOLOv8 AI Detector loaded successfully.")
except Exception as e:
    log.warning(f"Failed to load YOLOv8 ONNX: {e}. Falling back to Mock AI.")
    detector = MockYoloDetector()

# Prevent spamming events for the same zone
last_event_times = {} # (camera_id, zone_id) -> timestamp

def run_inference_cycle():
    db = SessionLocal()
    try:
        # Get active cameras
        cameras = db.query(models.Camera).filter(models.Camera.status == 'online').all()
        for cam in cameras:
            # We only process if camera has zones defined
            if not cam.zones:
                continue
                
            # Quick grab of a frame using cv2 directly for low overhead
            cap = cv2.VideoCapture(cam.stream_url)
            if not cap.isOpened():
                continue
                
            ret, frame = cap.read()
            cap.release()
            
            if not ret or frame is None:
                continue
                
            # Run AI
            detections = detector.detect(frame)
            
            for det in detections:
                if det.label != "person":
                    continue # Only track people for security
                    
                # Check against all zones for this camera
                for zone in cam.zones:
                    # Convert zone JSON points to list of tuples
                    try:
                        polygon = [(pt[0], pt[1]) for pt in zone.polygon_points]
                    except:
                        continue
                        
                    # Calculate bottom-center of detection box
                    bx1, by1, bx2, by2 = det.box
                    cx = (bx1 + bx2) / 2.0
                    cy = by2 # Bottom center is better for tracking feet on the ground
                    
                    poly_arr = np.array(polygon, dtype=np.float32)
                    result = cv2.pointPolygonTest(poly_arr, (cx, cy), False)
                    if result >= 0:
                        # Rate limit events (1 per 10 seconds per zone)
                        key = (cam.id, zone.id)
                        now = time.time()
                        if now - last_event_times.get(key, 0) > 10:
                            last_event_times[key] = now
                            
                            # Save event
                            event = models.Event(
                                camera_id=cam.id,
                                zone_id=zone.id,
                                label=det.label,
                                confidence=det.confidence,
                                caption=f"Detected {det.label} in zone '{zone.name}'"
                            )
                            db.add(event)
                            db.commit()
                            log.info(f"AI TRIGGERED: {event.caption}")
    except Exception as e:
        log.error(f"AI Worker Error: {e}")
    finally:
        db.close()

async def ai_background_task():
    log.info("Starting Persistent AI Background Worker...")
    while True:
        # Run inference in threadpool to avoid blocking ASGI loop
        await asyncio.to_thread(run_inference_cycle)
        await asyncio.sleep(2) # Run cycle every 2 seconds

import cv2
import asyncio
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session
from pathlib import Path
from core.database import get_db
import models
import os
import sys

# Ensure detect_pipeline is in path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "detect-pipeline"))
try:
    from detect_pipeline.frame_source import UniversalFrameSource
except ImportError:
    UniversalFrameSource = None

router = APIRouter(prefix="/streams", tags=["streams"])

def frame_generator(url: str):
    if not UniversalFrameSource:
        yield b""
        return
        
    source = UniversalFrameSource(url)
    
    # Iterate over the Frame generator
    for frame in source.stream():
        # frame.data is YUV_I420 bytes
        import numpy as np
        yuv = np.frombuffer(frame.data, dtype=np.uint8).reshape((int(frame.height * 1.5), frame.width))
        bgr = cv2.cvtColor(yuv, cv2.COLOR_YUV2BGR_I420)
        
        # Downscale for lower latency MJPEG streaming
        scale = 720 / max(frame.height, 1)
        if scale < 1.0:
            bgr = cv2.resize(bgr, (int(frame.width * scale), int(frame.height * scale)))
        
        ret, buffer = cv2.imencode('.jpg', bgr, [cv2.IMWRITE_JPEG_QUALITY, 60])
        if not ret:
            continue
            
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

@router.get("/live/{camera_id}")
def get_live_stream(camera_id: int, db: Session = Depends(get_db)):
    db_camera = db.query(models.Camera).filter(models.Camera.id == camera_id).first()
    
    if db_camera and db_camera.stream_url:
        stream_url = db_camera.stream_url
    else:
        # Fallback to local test video if no real RTSP stream is configured
        stream_url = str(Path(__file__).parent.parent.parent.parent / "test_video.mp4")
    
    return StreamingResponse(
        frame_generator(stream_url), 
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@router.get("/playback/{recording_id}")
def get_playback_stream(recording_id: int):
    # For prototyping, directly serve the test video file
    file_path = Path(__file__).parent.parent.parent.parent / "test_video.mp4"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Video file not found on disk")
        
    return FileResponse(
        path=file_path, 
        media_type="video/mp4",
        filename=f"recording_{recording_id}.mp4"
    )

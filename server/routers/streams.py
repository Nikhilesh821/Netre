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

async def frame_generator(url: str):
    if not UniversalFrameSource:
        yield b""
        return
        
    source = UniversalFrameSource(url)
    try:
        while True:
            frame = source.read()
            if frame is None:
                await asyncio.sleep(0.1)
                continue
                
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                continue
                
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            
            await asyncio.sleep(1/30) # ~30 fps
    finally:
        source.release()

@router.get("/live/{camera_id}")
def get_live_stream(camera_id: int):
    # For prototyping, we directly serve the local test video as a simulated live stream
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

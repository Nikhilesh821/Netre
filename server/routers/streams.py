import cv2
import asyncio
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse, FileResponse, RedirectResponse
from sqlalchemy.orm import Session
from pathlib import Path
from core.database import get_db
import models
import os
import sys
import mimetypes

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "detect-pipeline"))
try:
    from detect_pipeline.frame_source import UniversalFrameSource
except ImportError:
    UniversalFrameSource = None

router = APIRouter(prefix="/streams", tags=["streams"])

SUPPORTED_VIDEO_EXTENSIONS = {
    ".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv", ".webm",
    ".m4v", ".ts", ".mts", ".3gp", ".hevc", ".h264"
}

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


def _mjpeg_generator(stream_url: str):
    cap = cv2.VideoCapture(stream_url)
    if not cap.isOpened():
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        ret2, buf = cv2.imencode(
            ".jpg", frame,
            [cv2.IMWRITE_JPEG_QUALITY, 75, cv2.IMWRITE_JPEG_OPTIMIZE, 1]
        )
        if not ret2:
            continue
        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" + buf.tobytes() + b"\r\n"
        )

    cap.release()


@router.get("/live/{camera_id}")
def get_live_stream(camera_id: int, db: Session = Depends(get_db)):
    cam = db.query(models.Camera).filter(models.Camera.id == camera_id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")

    stream_url = _resolve_stream_url(cam)

    if stream_url.startswith(("http://", "https://")):
        return RedirectResponse(url=stream_url)

    if stream_url.startswith("rtsp://"):
        return StreamingResponse(
            _mjpeg_generator(stream_url),
            media_type="multipart/x-mixed-replace; boundary=frame"
        )

    if stream_url and Path(stream_url).exists():
        ext = Path(stream_url).suffix.lower()
        if ext in SUPPORTED_VIDEO_EXTENSIONS:
            return FileResponse(path=stream_url, media_type="video/mp4")

    return StreamingResponse(
        _mjpeg_generator(stream_url),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@router.get("/playback/{camera_id}/latest")
def get_latest_recording(camera_id: int, db: Session = Depends(get_db)):
    rec = (
        db.query(models.Recording)
        .filter(models.Recording.camera_id == camera_id)
        .order_by(models.Recording.start_time.desc())
        .first()
    )
    if not rec or not Path(rec.file_path).exists():
        raise HTTPException(status_code=404, detail="No recordings found for this camera")

    return FileResponse(
        path=rec.file_path,
        media_type="video/mp4",
        filename=Path(rec.file_path).name
    )


@router.get("/playback/recording/{recording_id}")
def get_recording_by_id(recording_id: int, db: Session = Depends(get_db)):
    rec = db.query(models.Recording).filter(models.Recording.id == recording_id).first()
    if not rec or not Path(rec.file_path).exists():
        raise HTTPException(status_code=404, detail="Recording not found")

    ext = Path(rec.file_path).suffix.lower()
    mime = mimetypes.types_map.get(ext, "video/mp4")

    return FileResponse(
        path=rec.file_path,
        media_type=mime,
        filename=Path(rec.file_path).name
    )


@router.get("/playback/{camera_id}")
def get_playback_stream(camera_id: int, db: Session = Depends(get_db)):
    rec = (
        db.query(models.Recording)
        .filter(models.Recording.camera_id == camera_id)
        .order_by(models.Recording.start_time.desc())
        .first()
    )
    if rec and Path(rec.file_path).exists():
        return FileResponse(
            path=rec.file_path,
            media_type="video/mp4",
            filename=Path(rec.file_path).name
        )

    cam = db.query(models.Camera).filter(models.Camera.id == camera_id).first()
    if cam and cam.file_path and Path(cam.file_path).exists():
        ext = Path(cam.file_path).suffix.lower()
        mime = mimetypes.types_map.get(ext, "video/mp4")
        return FileResponse(path=cam.file_path, media_type=mime)

    raise HTTPException(
        status_code=404,
        detail="No recordings found. Record a segment first or add a file_path to this camera."
    )

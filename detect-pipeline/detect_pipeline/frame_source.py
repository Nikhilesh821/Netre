import cv2
import time
from typing import Iterator
from dataclasses import dataclass
import logging

log = logging.getLogger("detect_pipeline.frame_source")

@dataclass(frozen=True)
class Frame:
    data: bytes
    width: int
    height: int
    seq: int
    ts: float

    @property
    def y_plane(self) -> bytes:
        return self.data[: self.width * self.height]

class UniversalFrameSource:
    """Unified Frame Source that accepts RTSP/HTTP stream URLs or local MP4 files using OpenCV."""
    
    def __init__(self, source_path: str, max_frames: int = None, backoff_seconds: float = 1.0) -> None:
        self.source_path = source_path
        self.max_frames = max_frames
        self.backoff_seconds = backoff_seconds

    def stream(self) -> Iterator[Frame]:
        restarts = 0
        while True:
            cap = cv2.VideoCapture(self.source_path)
            if not cap.isOpened():
                log.error(f"Failed to open source: {self.source_path}")
                time.sleep(self.backoff_seconds)
                restarts += 1
                if restarts > 5:
                    return
                continue
            
            fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
            seq = 0
            
            try:
                while True:
                    ok, bgr = cap.read()
                    if not ok:
                        break
                    
                    h, w = bgr.shape[:2]
                    w -= w % 2
                    h -= h % 2
                    bgr = bgr[:h, :w]
                    
                    yuv = cv2.cvtColor(bgr, cv2.COLOR_BGR2YUV_I420)
                    yield Frame(yuv.tobytes(), w, h, seq, seq / fps)
                    
                    seq += 1
                    if self.max_frames and seq >= self.max_frames:
                        return
                        
            finally:
                cap.release()
            
            # If we reached the end of a file, we stop.
            # If it's a stream URL, it might have disconnected, so we loop to reconnect.
            if not self.source_path.startswith(('http://', 'https://', 'rtsp://')):
                break
                
            log.warning(f"Stream {self.source_path} disconnected. Reconnecting...")
            time.sleep(self.backoff_seconds)

def probe_stream(url: str, timeout: float = 15.0):
    """Probe stream using OpenCV instead of ffprobe."""
    cap = cv2.VideoCapture(url)
    if not cap.isOpened():
        return None
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = float(cap.get(cv2.CAP_PROP_FPS))
    cap.release()
    return w, h, fps

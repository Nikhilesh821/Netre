from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class ZoneBase(BaseModel):
    name: str
    polygon_points: Any

class ZoneCreate(ZoneBase):
    pass

class ZoneOut(ZoneBase):
    id: int
    camera_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class CameraBase(BaseModel):
    name: str
    source_type: str = "live"
    stream_url: Optional[str] = None
    file_path: Optional[str] = None

class CameraCreate(CameraBase):
    pass

class CameraUpdate(BaseModel):
    name: Optional[str] = None
    source_type: Optional[str] = None
    stream_url: Optional[str] = None
    file_path: Optional[str] = None
    status: Optional[str] = None

class CameraOut(CameraBase):
    id: int
    status: str
    created_at: datetime
    zones: List[ZoneOut] = []
    class Config:
        from_attributes = True

class EventBase(BaseModel):
    label: str
    confidence: Optional[float] = None
    caption: Optional[str] = None
    thumbnail_path: Optional[str] = None

class EventOut(EventBase):
    id: int
    camera_id: int
    zone_id: Optional[int] = None
    occurred_at: datetime
    class Config:
        from_attributes = True

class RecordingBase(BaseModel):
    file_path: str
    start_time: datetime
    end_time: Optional[datetime] = None

class RecordingOut(RecordingBase):
    id: int
    camera_id: int
    created_at: datetime
    class Config:
        from_attributes = True

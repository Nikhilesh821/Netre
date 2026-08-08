import enum
from sqlalchemy import JSON, Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class SourceType(str, enum.Enum):
    live = "live"
    recorded = "recorded"

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    source_type = Column(String(20), nullable=False, default="live")
    stream_url = Column(String(500), nullable=True)
    file_path = Column(String(500), nullable=True)
    status = Column(String(20), nullable=False, default="offline")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    zones = relationship("Zone", back_populates="camera", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="camera", cascade="all, delete-orphan")
    recordings = relationship("Recording", back_populates="camera", cascade="all, delete-orphan")

class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    polygon_points = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    camera = relationship("Camera", back_populates="zones")
    events = relationship("Event", back_populates="zone")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True, index=True)
    label = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=True)
    caption = Column(Text, nullable=True)
    thumbnail_path = Column(String(500), nullable=True)
    occurred_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    camera = relationship("Camera", back_populates="events")
    zone = relationship("Zone", back_populates="events")

class Recording(Base):
    __tablename__ = "recordings"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False, index=True)
    file_path = Column(String(500), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    camera = relationship("Camera", back_populates="recordings")

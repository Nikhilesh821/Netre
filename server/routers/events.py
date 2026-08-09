from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
import models, schemas
import os
from datetime import datetime

router = APIRouter(prefix="/events", tags=["events"])

@router.get("/system-stats")
def get_system_stats(db: Session = Depends(get_db)):
    # Calculate actual storage used by iterating recording files
    recordings = db.query(models.Recording).all()
    total_bytes = 0
    for rec in recordings:
        if os.path.exists(rec.file_path):
            total_bytes += os.path.getsize(rec.file_path)
            
    # Add size of database as well
    db_path = "netre.db"
    if os.path.exists(db_path):
        total_bytes += os.path.getsize(db_path)
        
    return {
        "storage_used_bytes": total_bytes,
        "storage_used_mb": round(total_bytes / (1024 * 1024), 2),
        "total_recordings": len(recordings)
    }

@router.get("/", response_model=List[schemas.EventOut])
def list_events(
    camera_id: Optional[int] = None,
    zone_id: Optional[int] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(models.Event)
    
    if camera_id:
        query = query.filter(models.Event.camera_id == camera_id)
    if zone_id:
        query = query.filter(models.Event.zone_id == zone_id)
    if start_time:
        query = query.filter(models.Event.occurred_at >= start_time)
    if end_time:
        query = query.filter(models.Event.occurred_at <= end_time)
        
    return query.order_by(models.Event.occurred_at.desc()).limit(limit).all()

from datetime import timedelta

@router.get("/recent-alerts", response_model=List[schemas.EventOut])
def recent_alerts(db: Session = Depends(get_db)):
    one_hour_ago = datetime.now() - timedelta(hours=1)
    return db.query(models.Event).filter(models.Event.occurred_at >= one_hour_ago).order_by(models.Event.occurred_at.desc()).limit(20).all()

@router.get("/stats-summary")
def stats_summary(db: Session = Depends(get_db)):
    total_cameras = db.query(models.Camera).count()
    online_cameras = db.query(models.Camera).filter(models.Camera.status == "online").count()
    offline_cameras = total_cameras - online_cameras
    
    now = datetime.now()
    one_day_ago = now - timedelta(hours=24)
    one_hour_ago = now - timedelta(hours=1)
    
    total_events_24h = db.query(models.Event).filter(models.Event.occurred_at >= one_day_ago).count()
    total_events = db.query(models.Event).count()
    recent_alerts_count = db.query(models.Event).filter(models.Event.occurred_at >= one_hour_ago).count()
    
    # storage calculation logic
    recordings = db.query(models.Recording).all()
    total_bytes = 0
    for rec in recordings:
        if os.path.exists(rec.file_path):
            total_bytes += os.path.getsize(rec.file_path)
    db_path = "netre.db"
    if os.path.exists(db_path):
        total_bytes += os.path.getsize(db_path)
        
    return {
        "total_cameras": total_cameras,
        "online_cameras": online_cameras,
        "offline_cameras": offline_cameras,
        "total_events_24h": total_events_24h,
        "total_events": total_events,
        "storage_used_mb": round(total_bytes / (1024 * 1024), 2),
        "recent_alerts_count": recent_alerts_count
    }

from pydantic import BaseModel

class SearchQuery(BaseModel):
    query: str

@router.post("/search", response_model=List[schemas.EventOut])
def search_events(req: SearchQuery, db: Session = Depends(get_db)):
    """Natural Language Search over AI events"""
    q = req.query.lower()
    
    # Very simple NLP keyword extraction
    target_label = None
    for label in ["person", "car", "truck", "dog", "cat", "bird", "bicycle", "motorcycle"]:
        if label in q:
            target_label = label
            break
            
    db_query = db.query(models.Event)
    
    # Fuzzy match caption for location context
    words = q.split()
    for word in words:
        # Ignore stop words
        if word not in ["find", "show", "me", "a", "an", "the", "in", "at", "on", "yesterday", "today", "last", "week", "recent"]:
            db_query = db_query.filter(models.Event.caption.ilike(f"%{word}%"))
            
    if target_label:
        db_query = db_query.filter(models.Event.label == target_label)
        
    return db_query.order_by(models.Event.occurred_at.desc()).limit(20).all()

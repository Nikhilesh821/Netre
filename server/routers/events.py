from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
import models, schemas
import os
from datetime import datetime, timedelta
from pydantic import BaseModel

router = APIRouter(prefix="/events", tags=["events"])


@router.get("/system-stats")
def get_system_stats(db: Session = Depends(get_db)):
    recordings = db.query(models.Recording).all()
    total_bytes = sum(
        os.path.getsize(r.file_path)
        for r in recordings
        if os.path.exists(r.file_path)
    )
    db_path = "netre.db"
    if os.path.exists(db_path):
        total_bytes += os.path.getsize(db_path)
    return {
        "storage_used_bytes": total_bytes,
        "storage_used_mb": round(total_bytes / (1024 * 1024), 2),
        "total_recordings": len(recordings)
    }


@router.get("/recent-alerts", response_model=List[schemas.EventOut])
def recent_alerts(db: Session = Depends(get_db)):
    one_hour_ago = datetime.now() - timedelta(hours=1)
    return (
        db.query(models.Event)
        .filter(models.Event.occurred_at >= one_hour_ago)
        .order_by(models.Event.occurred_at.desc())
        .limit(20)
        .all()
    )


@router.get("/stats-summary")
def stats_summary(db: Session = Depends(get_db)):
    total_cameras = db.query(models.Camera).count()
    online_cameras = db.query(models.Camera).filter(models.Camera.status == "online").count()
    now = datetime.now()
    one_day_ago = now - timedelta(hours=24)
    one_hour_ago = now - timedelta(hours=1)
    total_events_24h = db.query(models.Event).filter(models.Event.occurred_at >= one_day_ago).count()
    recent_alerts_count = db.query(models.Event).filter(models.Event.occurred_at >= one_hour_ago).count()
    recordings = db.query(models.Recording).all()
    total_bytes = sum(
        os.path.getsize(r.file_path)
        for r in recordings
        if os.path.exists(r.file_path)
    )
    return {
        "total_cameras": total_cameras,
        "online_cameras": online_cameras,
        "offline_cameras": total_cameras - online_cameras,
        "total_events_24h": total_events_24h,
        "total_events": db.query(models.Event).count(),
        "storage_used_mb": round(total_bytes / (1024 * 1024), 2),
        "recent_alerts_count": recent_alerts_count
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


class SearchQuery(BaseModel):
    query: str


@router.post("/search", response_model=List[schemas.EventOut])
def search_events(req: SearchQuery, db: Session = Depends(get_db)):
    q = req.query.lower().strip()
    now = datetime.now()

    date_filter = None
    if "today" in q:
        date_filter = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif "yesterday" in q:
        yesterday = now - timedelta(days=1)
        date_filter = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
    elif "this morning" in q or "morning" in q:
        date_filter = now.replace(hour=6, minute=0, second=0, microsecond=0)
    elif "last hour" in q:
        date_filter = now - timedelta(hours=1)
    elif "last 24" in q or "24 hours" in q:
        date_filter = now - timedelta(hours=24)

    keywords = [w for w in q.split() if w not in {
        "find", "show", "detect", "detected", "today", "yesterday",
        "morning", "last", "hour", "hours", "in", "the", "a", "an"
    }]

    query = db.query(models.Event)
    if date_filter:
        query = query.filter(models.Event.occurred_at >= date_filter)

    if keywords:
        from sqlalchemy import or_
        conditions = [
            models.Event.label.ilike(f"%{kw}%") |
            models.Event.caption.ilike(f"%{kw}%")
            for kw in keywords
        ]
        query = query.filter(or_(*conditions))

    return query.order_by(models.Event.occurred_at.desc()).limit(50).all()

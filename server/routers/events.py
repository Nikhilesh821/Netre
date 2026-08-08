from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
import models, schemas
from datetime import datetime

router = APIRouter(prefix="/events", tags=["events"])

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

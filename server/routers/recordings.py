from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
import models, schemas
from datetime import datetime

router = APIRouter(prefix="/recordings", tags=["recordings"])

@router.get("/", response_model=List[schemas.RecordingOut])
def list_recordings(
    camera_id: Optional[int] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(models.Recording)
    
    if camera_id:
        query = query.filter(models.Recording.camera_id == camera_id)
    if start_time:
        query = query.filter(models.Recording.start_time >= start_time)
    if end_time:
        query = query.filter(models.Recording.start_time <= end_time)
        
    return query.order_by(models.Recording.start_time.desc()).limit(limit).all()

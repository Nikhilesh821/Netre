from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
import models, schemas

router = APIRouter(prefix="/cameras", tags=["cameras"])

@router.get("/", response_model=List[schemas.CameraOut])
def list_cameras(db: Session = Depends(get_db)):
    return db.query(models.Camera).all()

@router.post("/", response_model=schemas.CameraOut)
def create_camera(camera: schemas.CameraCreate, db: Session = Depends(get_db)):
    db_camera = models.Camera(**camera.model_dump())
    db.add(db_camera)
    db.commit()
    db.refresh(db_camera)
    return db_camera

@router.get("/{camera_id}", response_model=schemas.CameraOut)
def get_camera(camera_id: int, db: Session = Depends(get_db)):
    db_camera = db.query(models.Camera).filter(models.Camera.id == camera_id).first()
    if db_camera is None:
        raise HTTPException(status_code=404, detail="Camera not found")
    return db_camera

@router.delete("/{camera_id}")
def delete_camera(camera_id: int, db: Session = Depends(get_db)):
    db_camera = db.query(models.Camera).filter(models.Camera.id == camera_id).first()
    if db_camera is None:
        raise HTTPException(status_code=404, detail="Camera not found")
    db.delete(db_camera)
    db.commit()
    return {"ok": True}

@router.get("/{camera_id}/zones", response_model=List[schemas.ZoneOut])
def list_zones(camera_id: int, db: Session = Depends(get_db)):
    return db.query(models.Zone).filter(models.Zone.camera_id == camera_id).all()

@router.post("/{camera_id}/zones", response_model=schemas.ZoneOut)
def create_zone(camera_id: int, zone: schemas.ZoneCreate, db: Session = Depends(get_db)):
    db_camera = db.query(models.Camera).filter(models.Camera.id == camera_id).first()
    if db_camera is None:
        raise HTTPException(status_code=404, detail="Camera not found")
    db_zone = models.Zone(**zone.model_dump(), camera_id=camera_id)
    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)
    return db_zone

@router.delete("/{camera_id}/zones/{zone_id}")
def delete_zone(camera_id: int, zone_id: int, db: Session = Depends(get_db)):
    db_zone = db.query(models.Zone).filter(models.Zone.id == zone_id, models.Zone.camera_id == camera_id).first()
    if db_zone is None:
        raise HTTPException(status_code=404, detail="Zone not found")
    db.delete(db_zone)
    db.commit()
    return {"ok": True}

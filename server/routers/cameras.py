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

@router.patch("/{camera_id}", response_model=schemas.CameraOut)
def update_camera(camera_id: int, camera: schemas.CameraUpdate, db: Session = Depends(get_db)):
    db_camera = db.query(models.Camera).filter(models.Camera.id == camera_id).first()
    if db_camera is None:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    update_data = camera.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_camera, key, value)
        
    db.commit()
    db.refresh(db_camera)
    return db_camera

import random
from datetime import datetime, timedelta

@router.post("/seed-demo")
def seed_demo(db: Session = Depends(get_db)):
    # Create 4 cameras
    camera_names = ["Front Door", "Parking Lot", "Backyard", "Lobby"]
    cameras = []
    for name in camera_names:
        cam = models.Camera(
            name=name,
            source_type="live",
            stream_url="test_video.mp4",
            status="online"
        )
        db.add(cam)
        cameras.append(cam)
    db.commit()
    for cam in cameras:
        db.refresh(cam)
        
    # Create 2 zones per camera
    zones = []
    zone_names = ["Entry Zone", "Restricted Area"]
    for cam in cameras:
        for z_name in zone_names:
            zone = models.Zone(
                name=z_name,
                camera_id=cam.id,
                polygon_points=[{"x": random.randint(0, 100), "y": random.randint(0, 100)} for _ in range(4)]
            )
            db.add(zone)
            zones.append(zone)
    db.commit()
    for zone in zones:
        db.refresh(zone)

    # Create 30+ events spread across the last 24 hours
    labels = ["person", "car", "dog", "bicycle"]
    events = []
    for _ in range(35):
        cam = random.choice(cameras)
        zone = random.choice([z for z in zones if z.camera_id == cam.id])
        label = random.choice(labels)
        confidence = round(random.uniform(0.78, 0.97), 2)
        caption = f"Detected {label} near {cam.name} {zone.name.lower()}"
        hours_ago = random.uniform(0, 24)
        occurred_at = datetime.now() - timedelta(hours=hours_ago)
        
        event = models.Event(
            camera_id=cam.id,
            zone_id=zone.id,
            label=label,
            confidence=confidence,
            caption=caption,
            occurred_at=occurred_at
        )
        db.add(event)
        events.append(event)
    db.commit()
    
    return {
        "summary": "Demo data seeded successfully",
        "cameras_created": len(cameras),
        "zones_created": len(zones),
        "events_created": len(events)
    }

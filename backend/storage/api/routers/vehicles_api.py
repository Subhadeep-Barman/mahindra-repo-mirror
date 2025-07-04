from backend.storage.api.api_utils import get_db
from fastapi import APIRouter, HTTPException, Depends, Body
from pathlib import Path
import json
from backend.storage.models.models import Vehicle
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from backend.storage.crud.create_vehicle import create_vehicle as crud_create_vehicle, vehicle_to_dict

router = APIRouter()

# Pydantic schema for Vehicle
class VehicleSchema(BaseModel):
    vehicle_id: str
    project_code: str = None
    vehicle_serial_number: Optional[str] = None  # Changed to Optional[str]
    vehicle_body_number: str = None
    vehicle_model: str = None
    vehicle_number: str = None
    vehicle_build_level: str = None
    transmission_type: str = None
    final_drive_axle_ratio: str = None
    domain: str = None
    coast_down_test_reference_report: str = None
    tyre_make: str = None
    tyre_size: str = None
    tyre_pressure_front: float = None
    tyre_pressure_rear: float = None
    tyre_run_in: float = None
    engine_run_in: float = None
    gearbox_run_in: float = None
    axle_run_in: float = None
    engine_oil_specification: str = None
    axle_oil_specification: str = None
    transmission_oil_specification: str = None
    wd_type: str = None
    driven_wheel: str = None
    intercooler_location: str = None
    gear_ratio: str = None
    id_of_creator: Optional[str] = None
    created_on: datetime = None
    id_of_updater: Optional[str] = None
    updated_on: datetime = None

@router.get("/project-codes")
def get_project_codes():
    base_path = Path(__file__).parent.parent.parent / "json_data"
    try:
        with open(base_path / "project_code.json", encoding="utf-8") as f:
            project_codes = json.load(f)
        return project_codes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/vehicle-models")
def get_vehicle_models():
    base_path = Path(__file__).parent.parent.parent / "json_data"
    try:
        with open(base_path / "vehicle_models.json", encoding="utf-8") as f:
            vehicle_models = json.load(f)
        return vehicle_models
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/vehicles", response_model=VehicleSchema)
def create_vehicle_api(
    vehicle: VehicleSchema = Body(...),
    db: Session = Depends(get_db)
):
    vehicle_data = vehicle.dict(exclude_unset=True)
    new_vehicle = crud_create_vehicle(db, vehicle_data)
    return vehicle_to_dict(new_vehicle)

@router.get("/vehicles", response_model=List[VehicleSchema])
def read_vehicles(db: Session = Depends(get_db)):
    vehicles = db.query(Vehicle).all()
    return [vehicle_to_dict(v) for v in vehicles]

@router.get("/vehicles/{vehicle_id}", response_model=VehicleSchema)
def read_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle_to_dict(vehicle)

@router.put("/vehicles/{vehicle_id}", response_model=VehicleSchema)
def update_vehicle(
    vehicle_id: str,
    vehicle_update: VehicleSchema = Body(...),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    update_data = vehicle_update.dict(exclude_unset=True)
    update_data.pop("vehicle_id", None)
    for key, value in update_data.items():
        setattr(vehicle, key, value)
    vehicle.updated_on = datetime.utcnow()
    db.commit()
    db.refresh(vehicle)
    return vehicle_to_dict(vehicle)

@router.delete("/vehicles/{vehicle_id}")
def delete_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    db.delete(vehicle)
    db.commit()
    return {"detail": "Vehicle deleted successfully"}

@router.get("/vehicle-body-numbers")
def get_vehicle_body_numbers(db: Session = Depends(get_db)):
    results = db.query(Vehicle.vehicle_body_number, Vehicle.vehicle_number).all()
    # Return list of dicts with both body number and vehicle number
    return [
        {"vehicle_body_number": bn, "vehicle_number": vn}
        for bn, vn in results if bn is not None
    ]

@router.get("/vehicles/by-body-number/{vehicle_body_number}", response_model=VehicleSchema)
def get_vehicle_by_body_number(vehicle_body_number: str, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_body_number == vehicle_body_number).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found for the given body number")
    return vehicle_to_dict(vehicle)
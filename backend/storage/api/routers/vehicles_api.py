from backend.storage.api.api_utils import get_db, limiter
from fastapi import APIRouter, HTTPException, Depends, Body, Request
from pathlib import Path
import json
from backend.storage.models.models import Vehicle, Engine
from sqlalchemy.orm import Session
from typing import List, Optional, Union
from datetime import datetime
from pydantic import BaseModel
from backend.storage.crud.create_vehicle import create_vehicle as crud_create_vehicle, vehicle_to_dict

router = APIRouter()

# Pydantic schema for Vehicle
class VehicleSchema(BaseModel):
    project_code: Optional[str] = None
    vehicle_serial_number: Optional[str] = None
    vehicle_body_number: Optional[str] = None
    vehicle_model: Optional[str] = None
    vehicle_build_level: Optional[str] = None
    transmission_type: Optional[str] = None
    final_drive_axle_ratio: Optional[str] = None
    domain: Optional[str] = None
    tyre_make: Optional[str] = None
    tyre_size: Optional[str] = None
    tyre_pressure_front: Optional[float] = None
    tyre_pressure_rear: Optional[float] = None
    tyre_run_in: Optional[float] = None
    engine_run_in: Optional[float] = None
    gearbox_run_in: Optional[float] = None
    axle_run_in: Optional[float] = None
    engine_oil_specification: Optional[str] = None
    axle_oil_specification: Optional[str] = None
    transmission_oil_specification: Optional[str] = None
    wd_type: Optional[str] = None
    driven_wheel: Optional[str] = None
    intercooler_location: Optional[str] = None
    gear_ratio_1: Optional[str] = None
    gear_ratio_2: Optional[str] = None
    gear_ratio_3: Optional[str] = None
    gear_ratio_4: Optional[str] = None
    gear_ratio_5: Optional[str] = None
    gear_ratio_6: Optional[str] = None
    reverse_gear_ratio: Optional[str] = None
    department: Optional[str] = None
    id_of_creator: Optional[str] = None
    name_of_creator: Optional[str] = None
    created_on: Optional[datetime] = None
    id_of_updater: Optional[str] = None
    name_of_updater: Optional[str] = None
    updated_on: Optional[datetime] = None
    vehicle_kerb_weight: Optional[Union[str, float]] = None
    vehicle_gvw: Optional[Union[str, float]] = None
    kerb_faw: Optional[Union[str, float]] = None
    kerb_raw: Optional[Union[str, float]] = None
    awd_rwd_fwd: Optional[str] = None

    class Config:
        orm_mode = True

@router.get("/project-codes")
@limiter.limit("50/minute")
def get_project_codes(request: Request):
    base_path = Path(__file__).parent.parent.parent / "json_data"
    try:
        with open(base_path / "project_code.json", encoding="utf-8") as f:
            project_codes = json.load(f)
        return project_codes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/vehicle-models")
@limiter.limit("50/minute")
def get_vehicle_models(request: Request):
    base_path = Path(__file__).parent.parent.parent / "json_data"
    try:
        with open(base_path / "vehicle_models.json", encoding="utf-8") as f:
            vehicle_models = json.load(f)
        return vehicle_models
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/vehicles", response_model=VehicleSchema)
@limiter.limit("50/minute")
def create_vehicle_api(
    request: Request,
    vehicle: VehicleSchema = Body(...),
    db: Session = Depends(get_db)
):
    vehicle_data = vehicle.dict(exclude_unset=True)
    new_vehicle = crud_create_vehicle(db, vehicle_data)
    return vehicle_to_dict(new_vehicle)

@router.get("/vehicles", response_model=List[VehicleSchema])
@limiter.limit("50/minute")
def read_vehicles(
    request: Request,
    db: Session = Depends(get_db),
    department: Optional[str] = None
):
    query = db.query(Vehicle)
    if department:
        query = query.filter(Vehicle.department == department)
    vehicles = query.all()
    return [vehicle_to_dict(v) for v in vehicles]

@router.get("/vehicles/{vehicle_serial_number}", response_model=VehicleSchema)
@limiter.limit("50/minute")
def read_vehicle(vehicle_serial_number: str, request: Request, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_serial_number == vehicle_serial_number).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle_to_dict(vehicle)

@router.put("/vehicles/{vehicle_serial_number}", response_model=VehicleSchema)
@limiter.limit("50/minute")
def update_vehicle(
    vehicle_serial_number: str,
    request: Request,
    vehicle_update: VehicleSchema = Body(...),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_serial_number == vehicle_serial_number).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    update_data = vehicle_update.dict(exclude_unset=True)
    update_data.pop("vehicle_serial_number", None)
    for key, value in update_data.items():
        setattr(vehicle, key, value)
    vehicle.updated_on = datetime.utcnow()
    db.commit()
    db.refresh(vehicle)
    return vehicle_to_dict(vehicle)

@router.delete("/vehicles/{vehicle_serial_number}")
@limiter.limit("10/minute")
def delete_vehicle(vehicle_serial_number: str, request: Request, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_serial_number == vehicle_serial_number).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    db.delete(vehicle)
    db.commit()
    return {"detail": "Vehicle deleted successfully"}

@router.get("/vehicle-body-numbers")
@limiter.limit("50/minute")
def get_vehicle_body_numbers(
    request: Request,
    db: Session = Depends(get_db),
    department: Optional[str] = None
):
    query = db.query(Vehicle.vehicle_body_number, Vehicle.vehicle_serial_number)
    if department:
        query = query.filter(Vehicle.department == department)
    results = query.all()
    # Return list of dicts with both body number and vehicle number
    return [
        {"vehicle_body_number": bn, "vehicle_serial_number": vn}
        for bn, vn in results if bn is not None
    ]

@router.get("/vehicles/by-body-number/{vehicle_body_number}", response_model=VehicleSchema)
@limiter.limit("50/minute")
def get_vehicle_by_body_number(vehicle_body_number: str, request: Request, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_body_number == vehicle_body_number).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found for the given body number")
    return vehicle_to_dict(vehicle)

@router.get("/vehicles/by-project/{project_code}")
@limiter.limit("50/minute")
def get_vehicles_by_project(
    project_code: str, 
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get all vehicle body numbers and their corresponding engines for a specific project code.
    """
    vehicles = db.query(Vehicle).filter(Vehicle.project_code == project_code).all()
    
    if not vehicles:
        raise HTTPException(
            status_code=404, 
            detail=f"No vehicles found for project code: {project_code}"
        )
    
    result = []
    for vehicle in vehicles:
        # Skip vehicles without body numbers
        if not vehicle.vehicle_body_number:
            continue
        
        # Find all engines associated with this vehicle
        engines = db.query(Engine).filter(Engine.vehicle_serial_number == vehicle.vehicle_serial_number).all()
        engine_numbers = [engine.engine_serial_number for engine in engines] if engines else []
            
        vehicle_data = {
            "vehicle_serial_number": vehicle.vehicle_serial_number,
            "vehicle_body_number": vehicle.vehicle_body_number,
            "engine_numbers": engine_numbers
        }
        result.append(vehicle_data)
    
    return {
        "project_code": project_code,
        "vehicle_count": len(result),
        "vehicles": result
    }
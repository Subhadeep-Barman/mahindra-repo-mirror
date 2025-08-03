from fastapi import APIRouter, HTTPException, Depends, Body
from pathlib import Path
import json
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from backend.storage.api.api_utils import get_db
from backend.storage.models.models import Engine
from backend.storage.crud.create_engine import create_engine as crud_create_engine, engine_to_dict

router = APIRouter()

class EngineSchema(BaseModel):
    engine_serial_number: Optional[str] = None
    motor_serial_number: Optional[str] = None
    vehicle_body_number: Optional[str] = None
    engine_domain: Optional[str] = None
    project_code: Optional[str] = None
    engine_build_level: Optional[str] = None
    engine_capacity: Optional[float] = None
    engine_type: Optional[str] = None
    number_of_cylinders: Optional[str] = None
    compression_ratio: Optional[float] = None
    bore_mm: Optional[float] = None
    stroke_mm: Optional[float] = None
    vacuum_modulator_make: Optional[str] = None
    vacuum_modulator_details: Optional[str] = None
    ecu_make: Optional[str] = None
    ecu_id_number: Optional[str] = None
    ecu_dataset_number: Optional[str] = None
    ecu_dataset_details: Optional[str] = None
    injector_type: Optional[str] = None
    turbo_charger_type: Optional[str] = None
    blow_by_recirculation: Optional[bool] = None
    nozzle_hole_count: Optional[str] = None
    nozzle_through_flow: Optional[float] = None
    egr_valve_make: Optional[str] = None
    egr_valve_type: Optional[str] = None
    egr_valve_diameter_mm: Optional[float] = None
    egr_cooler_make: Optional[str] = None
    egr_cooler_capacity_kw: Optional[float] = None
    catcon_make: Optional[str] = None
    catcon_type: Optional[str] = None
    catcon_loading: Optional[str] = None
    dpf_make: Optional[str] = None
    dpf_capacity: Optional[str] = None
    scr_make: Optional[str] = None
    scr_capacity: Optional[str] = None
    acc_compressor: Optional[bool] = None
    acc_compressor_details: Optional[str] = None
    ps_pump: Optional[str] = None
    ps_details: Optional[str] = None
    water_bypass: Optional[str] = None
    kerb_weight_faw_kg: Optional[float] = None
    kerb_weight_raw_kg: Optional[float] = None
    emission_status: Optional[str] = None
    thermostat_details: Optional[str] = None
    vehicle_serial_number: Optional[str] = None
    engine_family: Optional[str] = None
    hv_battery_make: Optional[str] = None
    hv_battery_capacity: Optional[float] = None
    hv_battery_voltage: Optional[float] = None
    hv_battery_current: Optional[float] = None
    ev_motor_power_kw: Optional[float] = None
    motor_make: Optional[str] = None
    motor_front: Optional[bool] = None
    motor_rear: Optional[bool] = None
    front_motor_serial_number: Optional[str] = None
    rear_motor_serial_number: Optional[str] = None
    front_motor_max_power: Optional[float] = None
    rear_motor_max_power: Optional[float] = None
    front_motor_max_torque: Optional[float] = None
    rear_motor_max_torque: Optional[float] = None
    front_motor_make: Optional[str] = None
    rear_motor_make: Optional[str] = None
    motor_max_voltage: Optional[float] = None
    battery_capacity_kwh: Optional[float] = None
    battery_max_voltage: Optional[float] = None
    battery_max_current: Optional[float] = None
    department: Optional[str] = None
    id_of_creator: Optional[str] = None
    created_on: Optional[datetime] = None
    id_of_updater: Optional[str] = None
    updated_on: Optional[datetime] = None

    class Config:
        orm_mode = True
        # Exclude unset (None) fields from the response
        exclude_unset = True

@router.get("/engine-families")
def get_engine_families():
    base_path = Path(__file__).parent.parent.parent / "json_data"
    try:
        with open(base_path / "engine_family.json", encoding="utf-8") as f:
            engine_families = json.load(f)
        return engine_families
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/engines", response_model=EngineSchema)
def create_engine_api(
    engine: EngineSchema = Body(...),
    db: Session = Depends(get_db)
):
    engine_data = engine.dict(exclude_unset=True)
    try:
        new_engine = crud_create_engine(db, engine_data)
        return engine_to_dict(new_engine)
    except IntegrityError as e:
        db.rollback()
        # Check for duplicate primary key or unique constraint
        if "UNIQUE constraint failed" in str(e.orig) or "duplicate key value" in str(e.orig):
            raise HTTPException(status_code=400, detail=f"Engine with ID '{engine_data.get('engine_serial_number')}' already exists.")
        raise HTTPException(status_code=400, detail="Database integrity error: " + str(e.orig))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create engine: " + str(e))

@router.get("/engines", response_model=List[EngineSchema])
def read_engines(
    db: Session = Depends(get_db),
    department: Optional[str] = None
):
    try:
        query = db.query(Engine)
        if department:
            query = query.filter(Engine.department == department)
        engines = query.all()
        return [engine_to_dict(e) for e in engines]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch engines: " + str(e))

@router.get("/engines/{engine_serial_number}", response_model=EngineSchema)
def read_engine(engine_serial_number: str, db: Session = Depends(get_db)):
    try:
        engine = db.query(Engine).filter(Engine.engine_serial_number == engine_serial_number).first()
        if not engine:
            raise HTTPException(status_code=404, detail=f"Engine with ID '{engine_serial_number}' not found")
        return engine_to_dict(engine)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch engine: " + str(e))

@router.put("/engines/{engine_serial_number}", response_model=EngineSchema)
def update_engine(
    engine_serial_number: str,
    engine_update: EngineSchema = Body(...),
    db: Session = Depends(get_db)
):
    try:
        engine = db.query(Engine).filter(Engine.engine_serial_number == engine_serial_number).first()
        if not engine:
            raise HTTPException(status_code=404, detail=f"Engine with ID '{engine_serial_number}' not found")
        update_data = engine_update.dict(exclude_unset=True)
        update_data.pop("engine_serial_number", None)
        for key, value in update_data.items():
            setattr(engine, key, value)
        engine.updated_on = datetime.utcnow()
        db.commit()
        db.refresh(engine)
        return engine_to_dict(engine)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database integrity error: " + str(e.orig))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update engine: " + str(e))

@router.delete("/engines/{engine_serial_number}")
def delete_engine(engine_serial_number: str, db: Session = Depends(get_db)):
    try:
        engine = db.query(Engine).filter(Engine.engine_serial_number == engine_serial_number).first()
        if not engine:
            raise HTTPException(status_code=404, detail=f"Engine with ID '{engine_serial_number}' not found")
        db.delete(engine)
        db.commit()
        return {"detail": "Engine deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete engine: " + str(e))

@router.get("/engine-numbers")
def get_engine_serial_numbers(
    db: Session = Depends(get_db),
    department: Optional[str] = None
):
    query = db.query(Engine.engine_serial_number)
    if department:
        query = query.filter(Engine.department == department)
    engine_serial_numbers = query.all()
    # Flatten list of tuples and filter out None values
    return [en[0] for en in engine_serial_numbers if en[0] is not None]

@router.get("/engines/by-engine-number/{engine_serial_number}", response_model=EngineSchema)
def get_engine_by_engine_serial_number(engine_serial_number: str, db: Session = Depends(get_db)):
    engine = db.query(Engine).filter(Engine.engine_serial_number == engine_serial_number).first()
    if not engine:
        raise HTTPException(status_code=404, detail="Engine not found for the given engine number")
    return engine_to_dict(engine)

from fastapi import APIRouter, HTTPException, Depends, Body
from pathlib import Path
import json
from typing import List
from datetime import datetime
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from backend.storage.api.api_utils import get_db
from backend.storage.models.models import Engine
from backend.storage.crud.create_engine import create_engine as crud_create_engine, engine_to_dict

router = APIRouter()

class EngineSchema(BaseModel):
    engine_id: str
    engine_serial_number: str = None
    engine_build_level: str = None
    engine_capacity: float = None
    engine_type: str = None
    number_of_cylinders: str = None
    compression_ratio: float = None
    bore_mm: float = None
    stroke_mm: float = None
    vacuum_modulator_make: str = None
    vacuum_modulator_details: str = None
    ecu_make: str = None
    ecu_id_number: str = None
    ecu_dataset_number: str = None
    ecu_dataset_details: str = None
    injector_type: str = None
    turbo_charger_type: str = None
    blow_by_recirculation: bool = None
    nozzle_hole_count: str = None
    nozzle_through_flow: float = None
    egr_valve_make: str = None
    egr_valve_type: str = None
    egr_valve_diameter_mm: float = None
    egr_cooler_make: str = None
    egr_cooler_capacity_kw: float = None
    catcon_make: str = None
    catcon_type: str = None
    catcon_loading: str = None
    dpf_make: str = None
    dpf_capacity: str = None
    scr_make: str = None
    scr_capacity: str = None
    acc_compressor: bool = None
    acc_compressor_details: str = None
    ps_pump: str = None
    ps_details: str = None
    water_bypass: str = None
    kerb_weight_faw_kg: float = None
    kerb_weight_raw_kg: float = None
    emission_status: str = None
    thermostat_details: str = None
    vehicle_serial_number: str = None
    engine_family: str = None
    hv_battery_make: str = None
    hv_battery_capacity: float = None
    hv_battery_voltage: float = None
    hv_battery_current: float = None
    ev_motor_power_kw: float = None
    id_of_creator: str = None
    created_on: datetime = None
    id_of_updater: str = None
    updated_on: datetime = None

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
            raise HTTPException(status_code=400, detail=f"Engine with ID '{engine_data.get('engine_id')}' already exists.")
        raise HTTPException(status_code=400, detail="Database integrity error: " + str(e.orig))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create engine: " + str(e))

@router.get("/engines", response_model=List[EngineSchema])
def read_engines(db: Session = Depends(get_db)):
    try:
        engines = db.query(Engine).all()
        return [engine_to_dict(e) for e in engines]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch engines: " + str(e))

@router.get("/engines/{engine_id}", response_model=EngineSchema)
def read_engine(engine_id: str, db: Session = Depends(get_db)):
    try:
        engine = db.query(Engine).filter(Engine.engine_id == engine_id).first()
        if not engine:
            raise HTTPException(status_code=404, detail=f"Engine with ID '{engine_id}' not found")
        return engine_to_dict(engine)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch engine: " + str(e))

@router.put("/engines/{engine_id}", response_model=EngineSchema)
def update_engine(
    engine_id: str,
    engine_update: EngineSchema = Body(...),
    db: Session = Depends(get_db)
):
    try:
        engine = db.query(Engine).filter(Engine.engine_id == engine_id).first()
        if not engine:
            raise HTTPException(status_code=404, detail=f"Engine with ID '{engine_id}' not found")
        update_data = engine_update.dict(exclude_unset=True)
        update_data.pop("engine_id", None)
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

@router.delete("/engines/{engine_id}")
def delete_engine(engine_id: str, db: Session = Depends(get_db)):
    try:
        engine = db.query(Engine).filter(Engine.engine_id == engine_id).first()
        if not engine:
            raise HTTPException(status_code=404, detail=f"Engine with ID '{engine_id}' not found")
        db.delete(engine)
        db.commit()
        return {"detail": "Engine deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete engine: " + str(e))

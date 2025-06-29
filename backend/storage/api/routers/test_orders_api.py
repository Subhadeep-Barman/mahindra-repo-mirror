from fastapi import APIRouter, HTTPException
from pathlib import Path
import json

from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List
from datetime import datetime, date
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.storage.api.api_utils import get_db
from backend.storage.models.models import TestOrder

router = APIRouter()

@router.get("/test-types")
def get_test_types():
    base_path = Path(__file__).parent.parent.parent / "json_data"
    try:
        with open(base_path / "test_type.json") as f:
            test_types = json.load(f)
        return test_types
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/inertia-classes")
def get_inertia_classes():
    base_path = Path(__file__).parent.parent.parent / "json_data"
    try:
        with open(base_path / "inertia_class.json") as f:
            inertia_classes = json.load(f)
        return inertia_classes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/modes")
def get_modes():
    base_path = Path(__file__).parent.parent.parent / "json_data"
    try:
        with open(base_path / "mode.json") as f:
            modes = json.load(f)
        return modes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/fuel-types")
def get_fuel_types():
    base_path = Path(__file__).parent.parent.parent / "json_data"
    try:
        with open(base_path / "fuel_type.json") as f:
            fuel_types = json.load(f)
        return fuel_types
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class TestOrderSchema(BaseModel):
    test_order_id: str
    job_order_id: str = None
    CoastDownData_id: str = None
    test_type: str = None
    test_objective: str = None
    vehicle_location: str = None
    cycle_gear_shift: str = None
    inertia_class: str = None
    dataset_name: str = None
    dpf: str = None
    dataset_flashed: bool = None
    ess: str = None
    mode: str = None
    hardware_change: str = None
    equipment_required: str = None
    shift: str = None
    preferred_date: date = None
    emission_check_date: date = None
    emission_check_attachment: str = None
    specific_instruction: str = None
    status: str = None
    id_of_creator: str = None
    name_of_creator: str = None
    created_on: datetime = None
    id_of_updater: str = None
    name_of_updater: str = None
    updated_on: datetime = None

def testorder_to_dict(testorder: TestOrder):
    return {
        "test_order_id": testorder.test_order_id,
        "job_order_id": testorder.job_order_id,
        "CoastDownData_id": testorder.CoastDownData_id,
        "test_type": testorder.test_type,
        "test_objective": testorder.test_objective,
        "vehicle_location": testorder.vehicle_location,
        "cycle_gear_shift": testorder.cycle_gear_shift,
        "inertia_class": testorder.inertia_class,
        "dataset_name": testorder.dataset_name,
        "dpf": testorder.dpf,
        "dataset_flashed": testorder.dataset_flashed,
        "ess": testorder.ess,
        "mode": testorder.mode,
        "hardware_change": testorder.hardware_change,
        "equipment_required": testorder.equipment_required,
        "shift": testorder.shift,
        "preferred_date": testorder.preferred_date,
        "emission_check_date": testorder.emission_check_date,
        "emission_check_attachment": testorder.emission_check_attachment,
        "specific_instruction": testorder.specific_instruction,
        "status": testorder.status,
        "id_of_creator": testorder.id_of_creator,
        "name_of_creator": testorder.name_of_creator,
        "created_on": testorder.created_on,
        "id_of_updater": testorder.id_of_updater,
        "name_of_updater": testorder.name_of_updater,
        "updated_on": testorder.updated_on,
    }

@router.post("/testorders", response_model=TestOrderSchema)
def create_testorder_api(
    testorder: TestOrderSchema = Body(...),
    db: Session = Depends(get_db)
):
    testorder_data = testorder.dict(exclude_unset=True)
    new_testorder = TestOrder(**testorder_data)
    db.add(new_testorder)
    db.commit()
    db.refresh(new_testorder)
    return testorder_to_dict(new_testorder)

@router.get("/testorders", response_model=List[TestOrderSchema])
def read_testorders(db: Session = Depends(get_db)):
    testorders = db.query(TestOrder).all()
    return [testorder_to_dict(t) for t in testorders]

@router.get("/testorders/{test_order_id}", response_model=TestOrderSchema)
def read_testorder(test_order_id: str, db: Session = Depends(get_db)):
    testorder = db.query(TestOrder).filter(TestOrder.test_order_id == test_order_id).first()
    if not testorder:
        raise HTTPException(status_code=404, detail="TestOrder not found")
    return testorder_to_dict(testorder)

@router.put("/testorders/{test_order_id}", response_model=TestOrderSchema)
def update_testorder(
    test_order_id: str,
    testorder_update: TestOrderSchema = Body(...),
    db: Session = Depends(get_db)
):
    testorder = db.query(TestOrder).filter(TestOrder.test_order_id == test_order_id).first()
    if not testorder:
        raise HTTPException(status_code=404, detail="TestOrder not found")
    update_data = testorder_update.dict(exclude_unset=True)
    update_data.pop("test_order_id", None)
    for key, value in update_data.items():
        setattr(testorder, key, value)
    testorder.updated_on = datetime.utcnow()
    db.commit()
    db.refresh(testorder)
    return testorder_to_dict(testorder)

@router.delete("/testorders/{test_order_id}")
def delete_testorder(test_order_id: str, db: Session = Depends(get_db)):
    testorder = db.query(TestOrder).filter(TestOrder.test_order_id == test_order_id).first()
    if not testorder:
        raise HTTPException(status_code=404, detail="TestOrder not found")
    db.delete(testorder)
    db.commit()
    return {"detail": "TestOrder deleted successfully"}
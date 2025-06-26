from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List
from datetime import datetime
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.storage.api.api_utils import get_db
from backend.storage.models.models import CoastDownData

router = APIRouter()

class CoastDownDataSchema(BaseModel):
    CoastDownData_id: str
    job_order_id: str = None
    coast_down_reference: str = None
    vehicle_reference_mass: float = None
    a_value: float = None
    b_value: float = None
    c_value: float = None
    f0_value: float = None
    f1_value: float = None
    f2_value: float = None
    id_of_creator: str = None
    created_on: datetime = None
    id_of_updater: str = None
    updated_on: datetime = None

def coastdown_to_dict(cd: CoastDownData):
    return {
        "CoastDownData_id": cd.CoastDownData_id,
        "job_order_id": cd.job_order_id,
        "coast_down_reference": cd.coast_down_reference,
        "vehicle_reference_mass": cd.vehicle_reference_mass,
        "a_value": cd.a_value,
        "b_value": cd.b_value,
        "c_value": cd.c_value,
        "f0_value": cd.f0_value,
        "f1_value": cd.f1_value,
        "f2_value": cd.f2_value,
        "id_of_creator": cd.id_of_creator,
        "created_on": cd.created_on,
        "id_of_updater": cd.id_of_updater,
        "updated_on": cd.updated_on,
    }

@router.post("/coastdown", response_model=CoastDownDataSchema)
def create_coastdown_api(
    coastdown: CoastDownDataSchema = Body(...),
    db: Session = Depends(get_db)
):
    coastdown_data = coastdown.dict(exclude_unset=True)
    new_cd = CoastDownData(**coastdown_data)
    db.add(new_cd)
    db.commit()
    db.refresh(new_cd)
    return coastdown_to_dict(new_cd)

@router.get("/coastdown", response_model=List[CoastDownDataSchema])
def read_coastdowns(db: Session = Depends(get_db)):
    cds = db.query(CoastDownData).all()
    return [coastdown_to_dict(cd) for cd in cds]

@router.get("/coastdown/{CoastDownData_id}", response_model=CoastDownDataSchema)
def read_coastdown(CoastDownData_id: str, db: Session = Depends(get_db)):
    cd = db.query(CoastDownData).filter(CoastDownData.CoastDownData_id == CoastDownData_id).first()
    if not cd:
        raise HTTPException(status_code=404, detail="CoastDownData not found")
    return coastdown_to_dict(cd)

@router.put("/coastdown/{CoastDownData_id}", response_model=CoastDownDataSchema)
def update_coastdown(
    CoastDownData_id: str,
    coastdown_update: CoastDownDataSchema = Body(...),
    db: Session = Depends(get_db)
):
    cd = db.query(CoastDownData).filter(CoastDownData.CoastDownData_id == CoastDownData_id).first()
    if not cd:
        raise HTTPException(status_code=404, detail="CoastDownData not found")
    update_data = coastdown_update.dict(exclude_unset=True)
    update_data.pop("CoastDownData_id", None)
    for key, value in update_data.items():
        setattr(cd, key, value)
    cd.updated_on = datetime.utcnow()
    db.commit()
    db.refresh(cd)
    return coastdown_to_dict(cd)

@router.delete("/coastdown/{CoastDownData_id}")
def delete_coastdown(CoastDownData_id: str, db: Session = Depends(get_db)):
    cd = db.query(CoastDownData).filter(CoastDownData.CoastDownData_id == CoastDownData_id).first()
    if not cd:
        raise HTTPException(status_code=404, detail="CoastDownData not found")
    db.delete(cd)
    db.commit()
    return {"detail": "CoastDownData deleted successfully"}

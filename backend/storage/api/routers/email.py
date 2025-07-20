from http.client import HTTPException
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, Body
from backend.storage.models.models import JobOrder
from sqlalchemy.orm import Session
from backend.storage.api.api_utils import get_db
import os
import json

router = APIRouter()

JSON_DATA_PATH = os.path.join(
    os.path.dirname(__file__), "../../../json_data/mail_body.json"
)


def get_mail_template(caseid: str, data: dict) -> Dict[str, str]:
    """
    Load the mail template for the given caseid and fill in the data.
    """
    with open(JSON_DATA_PATH, "r", encoding="utf-8") as f:
        templates = json.load(f)
    if caseid not in templates:
        raise HTTPException(status_code=400, detail="Invalid caseid")
    template = templates[caseid]
    subject = template["subject"].format(**data)
    body = template["body"].format(**data)
    return {"subject": subject, "body": body}


def send_email(db: Session, to_email: str, subject: str, body: str):
    """
    Placeholder for actual email sending logic.
    """
    # Implement your email sending logic here (e.g., SMTP, SendGrid, etc.)
    pass


@router.post("/send")
async def send_email_endpoint(
    caseid: str = Body(...),
    to_email: str = Body(...),
    data: dict = Body(...),
    db: Session = Depends(get_db),
):
    """
    Endpoint to send an email based on caseid and data.
    """
    try:
        mail_content = get_mail_template(caseid, data)
        send_email(
            db=db,
            to_email=to_email,
            subject=mail_content["subject"],
            body=mail_content["body"],
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to send email: please try again later"
        )


@router.post("/cft_members/add")
async def add_cft_member(
    job_order_id: str, member: dict, db: Session = Depends(get_db)
):
    job_order = (
        db.query(JobOrder)
        .filter(JobOrder.job_order_id == job_order_id)
        .first()
    )
    if not job_order:
        raise HTTPException(status_code=404, detail="JobOrder not found")
    job_order.cft_members.append(member)
    db.commit()
    return job_order


@router.get("/cft_members/read")
async def read_cft_members(job_order_id: str, db: Session = Depends(get_db)):
    job_order = (
        db.query(JobOrder)
        .filter(JobOrder.job_order_id == job_order_id)
        .first()
    )
    if not job_order:
        raise HTTPException(status_code=404, detail="JobOrder not found")
    return job_order.cft_members


@router.put("/cft_members/update")
async def update_cft_member(
    job_order_id: str,
    member_index: int,
    updated_member: dict,
    db: Session = Depends(get_db),
):
    job_order = (
        db.query(JobOrder)
        .filter(JobOrder.job_order_id == job_order_id)
        .first()
    )
    if not job_order:
        raise HTTPException(status_code=404, detail="JobOrder not found")
    if member_index >= len(job_order.cft_members):
        raise HTTPException(status_code=404, detail="CFT member not found")
    job_order.cft_members[member_index] = updated_member
    db.commit()
    return job_order


@router.delete("/cft_members/delete")
async def delete_cft_member(
    job_order_id: str, member_index: int, db: Session = Depends(get_db)
):
    job_order = (
        db.query(JobOrder)
        .filter(JobOrder.job_order_id == job_order_id)
        .first()
    )
    if not job_order:
        raise HTTPException(status_code=404, detail="JobOrder not found")
    if member_index >= len(job_order.cft_members):
        raise HTTPException(status_code=404, detail="CFT member not found")
    job_order.cft_members.pop(member_index)
    db.commit()
    return job_order

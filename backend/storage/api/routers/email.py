from http.client import HTTPException
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, Body
from backend.storage.models.models import JobOrder, TestOrder, User # adjust import as per your models
from sqlalchemy.orm import Session
from backend.storage.api.api_utils import get_db
import os
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import re

router = APIRouter()

EMAIL_TEMPLATE_PATH = os.path.join(
    os.path.dirname(__file__), "../../../json_data/mail_body.json"
)


def get_employee_email_by_role(db: Session, job_order_id: str, role: str):
    """
    Fetch email(s) for a given role and job_order_id.
    - For both roles, fetch the user whose id matches JobOrder.id_of_creator and whose role matches.
    """
    job_order = db.query(JobOrder).filter(JobOrder.job_order_id == job_order_id).first()
    if not job_order:
        return []
    user = db.query(User).filter(User.id == job_order.id_of_creator, User.role == role).first()
    if not user or not user.email:
        return []
    return [user.email]


def load_email_template(caseid: str, data: dict):
    """
    Load and format the email template for the given caseid.
    """
    with open(EMAIL_TEMPLATE_PATH, "r", encoding="utf-8") as f:
        templates = json.load(f)
    email_cases = templates.get("email_cases", [])
    template = next((case for case in email_cases if case["id"] == caseid), None)
    if not template:
        raise HTTPException(status_code=400, detail="Invalid caseid")
    subject = template["body"]["subject"].format(**data)
    message = template["body"]["message"].format(**data)
    return subject, message


def send_email(to_emails, subject, body):
    smtp_host = os.environ.get("SMTP_SERVER", "")
    smtp_port = int(os.environ.get("SMTP_PORT", 587))
    smtp_user = os.environ.get("SENDER_EMAIL", "")
    smtp_pass = os.environ.get("SENDER_PASSWORD", "")
    from_email = smtp_user

    if not smtp_host or not smtp_user or not smtp_pass:
        raise HTTPException(
            status_code=500,
            detail="SMTP_SERVER, SENDER_EMAIL, or SENDER_PASSWORD environment variable is not set."
        )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = ", ".join(to_emails)
    msg.attach(MIMEText(body, "html"))

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(from_email, to_emails, msg.as_string())


@router.post("/send")
async def send_email_endpoint(
    job_order_id: str = Body(...),
    role: str = Body(..., description="ProjectTeam or TestEngineer"),
    caseid: str = Body(...),
    data: dict = Body(...),
    db: Session = Depends(get_db),
):
    """
    Send an email to ProjectTeam or TestEngineer for a job/test order.
    """
    role = role.strip()
    if role not in ("ProjectTeam", "TestEngineer"):
        raise HTTPException(status_code=400, detail="Role must be ProjectTeam or TestEngineer")
    to_emails = get_employee_email_by_role(db, job_order_id, role)
    print(f"To Emails: {to_emails}")  # Debugging line to check email addresses
    if not to_emails:
        raise HTTPException(status_code=404, detail="No recipient found for the given role/job_order_id")
    subject, body = load_email_template(caseid, data)
    send_email(to_emails, subject, body)
    return {"detail": f"Email sent to {role} successfully"}


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
    job_order.cft_members.pop(member_index)
    db.commit()
    return job_order

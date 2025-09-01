from http.client import HTTPException
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, Body
from backend.storage.models.models import JobOrder, TestOrder, User, AddFields # adjust import as per your models
from backend.storage.models.models import RDEJobOrder
from sqlalchemy.orm import Session
from backend.storage.api.api_utils import get_db
import os
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import re

from backend.storage.logging_config import vtc_logger

router = APIRouter()

EMAIL_TEMPLATE_PATH = os.path.join(
    os.path.dirname(__file__), "../../json_data/mail_body.json"
)


def get_employee_email_by_role(db: Session, job_order_id: str, role: str) -> list:
    """
    Fetch email(s) for a given role and job_order_id.

    Args:
        db (Session): SQLAlchemy database session.
        job_order_id (str): The job order ID.
        role (str): The user role to filter.

    Returns:
        list: List of email addresses for the given role and job order.

    Raises:
        HTTPException: If job order is not found.
    """
    try:
        job_order = db.query(JobOrder).filter(JobOrder.job_order_id == job_order_id).first()
        if not job_order:
            job_order = db.query(RDEJobOrder).filter(RDEJobOrder.job_order_id == job_order_id).first()
            vtc_logger.warning(f"JobOrder not found for job_order_id: {job_order_id}")
            return []
        user = db.query(User).filter(User.id == job_order.id_of_creator, User.role == role).first()
        if not user or not user.email:
            vtc_logger.info(f"No user found with role {role} for job_order_id: {job_order_id}")
            return []
        return [user.email]
    except Exception as e:
        vtc_logger.error(f"Error in get_employee_email_by_role: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


def get_role_for_caseid(caseid: str) -> str:
    """
    Get the role from mail_body.json for the given caseid.

    Args:
        caseid (str): The case ID to look up.

    Returns:
        str: The role associated with the caseid.

    Raises:
        HTTPException: If the caseid is invalid.
    """
    try:
        vtc_logger.debug(f"Fetching role for caseid: {caseid}")
        with open(EMAIL_TEMPLATE_PATH, "r", encoding="utf-8") as f:
            templates = json.load(f)
        email_cases = templates.get("email_cases", [])
        vtc_logger.debug(f"Found {len(email_cases)} email cases in template")
        template = next((case for case in email_cases if case["id"] == caseid), None)
        if not template:
            vtc_logger.warning(f"Invalid caseid: {caseid}")
            raise HTTPException(status_code=400, detail="Invalid caseid")
        role = template.get("receivers")
        vtc_logger.debug(f"Role for caseid {caseid}: {role}")
        return role
    except Exception as e:
        vtc_logger.error(f"Error in get_role_for_caseid: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


def get_all_emails_by_role(db: Session, role: str) -> list:
    """
    Fetch all emails for users with the given role.

    Args:
        db (Session): SQLAlchemy database session.
        role (str): The user role to filter.

    Returns:
        list: List of email addresses for the given role.
    """
    try:
        users = db.query(User).filter(User.role == role).all()
        emails = [user.email for user in users if user.email]
        vtc_logger.info(f"Found {len(emails)} emails for role {role}")
        return emails
    except Exception as e:
        vtc_logger.error(f"Error in get_all_emails_by_role: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


def load_email_template(caseid: str) -> tuple:
    """
    Load the email template for the given caseid.

    Args:
        caseid (str): The case ID to look up.

    Returns:
        tuple: (subject, message) from the template.

    Raises:
        HTTPException: If the caseid is invalid.
    """
    try:
        vtc_logger.debug(f"Loading email template for caseid: {caseid}")
        with open(EMAIL_TEMPLATE_PATH, "r", encoding="utf-8") as f:
            templates = json.load(f)
        email_cases = templates.get("email_cases", [])
        template = next((case for case in email_cases if case["id"] == caseid), None)
        if not template:
            vtc_logger.warning(f"Invalid caseid for template: {caseid}")
            raise HTTPException(status_code=400, detail="Invalid caseid")
        subject = template["body"]["subject"]
        message = template["body"]["message"]
        vtc_logger.debug(f"Template loaded for caseid {caseid}. Subject: {subject[:30]}...")
        return subject, message
    except Exception as e:
        vtc_logger.error(f"Error in load_email_template: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


def get_cft_member_emails(job_order, db: Session) -> list:
    """
    Extract email addresses from CFT members of a job order.
    If email is not present, try to fetch from User table using code, else fallback to code@mahindra.com.

    Args:
        job_order (JobOrder): The job order instance.
        db (Session): SQLAlchemy database session.

    Returns:
        list: List of email addresses from CFT members.
    """
    emails = []
    vtc_logger.debug(f"Extracting CFT member emails for job order")
    
    if hasattr(job_order, "cft_members") and job_order.cft_members:
        vtc_logger.debug(f"Raw CFT members: {job_order.cft_members}")
        for member in job_order.cft_members:
            code = None
            email = None
            if isinstance(member, dict):
                code = member.get("code")
                email = member.get("email")
                vtc_logger.debug(f"CFT member dict: code={code}, email={email}")
            elif isinstance(member, str):
                try:
                    import json
                    member_dict = json.loads(member)
                    code = member_dict.get("code")
                    email = member_dict.get("email")
                    vtc_logger.debug(f"CFT member string parsed: code={code}, email={email}")
                except Exception as e:
                    vtc_logger.error(f"Error parsing CFT member string: {e}")
                    code = None
                    email = None
            # If email is not present, try to fetch from User table
            if not email and code:
                user = db.query(User).filter(User.id == code).first()
                if user and user.email:
                    email = user.email
                    vtc_logger.debug(f"Found email {email} for code {code} in User table")
                else:
                    email = f"{code}@mahindra.com"
                    vtc_logger.debug(f"Using fallback email {email} for code {code}")
            if email:
                emails.append(email)
    
    vtc_logger.info(f"Extracted {len(emails)} CFT member emails: {emails}")
    return emails


def send_email(to_emails: list, subject: str, body: str, cc_emails: list = None) -> None:
    """
    Send an email using SMTP.

    Args:
        to_emails (list): List of recipient email addresses.
        subject (str): Email subject.
        body (str): Email body (HTML).
        cc_emails (list, optional): List of CC email addresses.

    Raises:
        HTTPException: If SMTP configuration is missing or sending fails.
    """
    try:
        vtc_logger.debug(f"Sending email with subject: {subject}")
        smtp_host = os.environ.get("SMTP_SERVER", "")
        smtp_port = int(os.environ.get("SMTP_PORT", 587))
        smtp_user = os.environ.get("SENDER_EMAIL", "")
        smtp_pass = os.environ.get("SENDER_PASSWORD", "")
        from_email = smtp_user

        vtc_logger.debug(f"SMTP config - host: {smtp_host}, port: {smtp_port}, user: {smtp_user}")
        if not smtp_host or not smtp_user or not smtp_pass:
            vtc_logger.error("SMTP configuration missing in environment variables.")
            raise HTTPException(
                status_code=500,
                detail="SMTP_SERVER, SENDER_EMAIL, or SENDER_PASSWORD environment variable is not set."
            )

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = from_email
        msg["To"] = ", ".join(to_emails)
        if cc_emails:
            msg["Cc"] = ", ".join(cc_emails)
        msg.attach(MIMEText(body, "html"))

        all_recipients = to_emails + (cc_emails if cc_emails else [])
        vtc_logger.debug(f"Recipients: TO={to_emails}, CC={cc_emails}")

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            vtc_logger.debug("SMTP TLS started")
            server.login(smtp_user, smtp_pass)
            vtc_logger.debug("SMTP login successful")
            server.sendmail(from_email, all_recipients, msg.as_string())
            vtc_logger.debug("Email sent successfully")
        vtc_logger.info(f"Email sent to: {to_emails} with CC: {cc_emails} and subject: {subject}")
    except Exception as e:
        vtc_logger.error(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email")


def get_group_email_for_caseid(caseid: str) -> str:
    """
    Get the group email from mail_body.json for the given caseid.
    """
    try:
        vtc_logger.debug(f"Fetching group email for caseid: {caseid}")
        with open(EMAIL_TEMPLATE_PATH, "r", encoding="utf-8") as f:
            templates = json.load(f)
        email_cases = templates.get("email_cases", [])
        template = next((case for case in email_cases if case["id"] == caseid), None)
        if not template:
            vtc_logger.warning(f"Invalid caseid: {caseid}")
            return None
        group_email = template.get("group_email")
        vtc_logger.debug(f"Group email for caseid {caseid}: {group_email}")
        return group_email
    except Exception as e:
        vtc_logger.error(f"Error in get_group_email_for_caseid: {e}")
        return None


def get_total_tests_for_job(db: Session, job_order_id: str) -> int:
    """
    Return the total number of TestOrder records for a given job_order_id.
    """
    try:
        return db.query(TestOrder).filter(TestOrder.job_order_id == job_order_id).count()
    except Exception as e:
        vtc_logger.error(f"Error in get_total_tests_for_job: {e}")
        return 0


def get_job_creator_info(db: Session, job_order) -> dict:
    """
    Return a dict with creator's name, id (token), and job creation time.
    """
    try:
        creator = db.query(User).filter(User.id == job_order.id_of_creator).first()
        creator_name = creator.username if creator and hasattr(creator, "username") else "N/A"
        creator_id = creator.id if creator and hasattr(creator, "id") else "N/A"
        created_at = job_order.created_on.strftime("%Y-%m-%d %H:%M:%S") if hasattr(job_order, "created_on") and job_order.created_on else "N/A"
        return {
            "creator_name": creator_name,
            "creator_id": creator_id,
            "created_at": created_at
        }
    except Exception as e:
        vtc_logger.error(f"Error in get_job_creator_info: {e}")
        return {
            "creator_name": creator_name,
            "creator_id": creator_id,
            "created_at": created_at
        }


def get_test_order_remarks(db: Session, test_order_id: str) -> dict:
    """
    Fetch remarks, rejection_remarks, mail_remarks, complete_remarks from TestOrder.
    """
    try:
        vtc_logger.debug(f"Fetching remarks for test_order_id: {test_order_id}")
        test_order = db.query(TestOrder).filter(TestOrder.test_order_id == test_order_id).first()
        if not test_order:
            vtc_logger.warning(f"TestOrder not found for test_order_id: {test_order_id}")
            return {
                "remark": "",
                "rejection_remarks": "",
                "mail_remarks": "",
                "complete_remarks": ""
            }
        
        remarks = {
            "remark": test_order.remark or "",
            "rejection_remarks": test_order.rejection_remarks or "",
            "mail_remarks": test_order.mail_remarks or "",
            "complete_remarks": test_order.complete_remarks or ""
        }
        
        vtc_logger.debug(f"Remarks for test_order_id {test_order_id}: {remarks}")
        return remarks
    except Exception as e:
        vtc_logger.error(f"Error in get_test_order_remarks: {e}")
        return {
            "remark": "",
            "rejection_remarks": "",
            "mail_remarks": "",
            "complete_remarks": ""
        }


def get_job_order_test_status(db: Session, job_order_id: str) -> str:
    """
    Fetch test_status from JobOrder.
    """
    try:
        job_order = db.query(JobOrder).filter(JobOrder.job_order_id == job_order_id).first()
        return job_order.test_status if job_order and hasattr(job_order, "test_status") else ""
    except Exception as e:
        vtc_logger.error(f"Error in get_job_order_test_status: {e}")
        return ""


def get_job_order_completed_test_count(db: Session, job_order_id: str) -> int:
    """
    Fetch completed_test_count from JobOrder.
    """
    try:
        job_order = db.query(JobOrder).filter(JobOrder.job_order_id == job_order_id).first()
        return job_order.completed_test_count if job_order and hasattr(job_order, "completed_test_count") else 0
    except Exception as e:
        vtc_logger.error(f"Error in get_job_order_completed_test_count: {e}")
        return 0


def get_test_order_type_and_objective(db: Session, test_order_id: str) -> dict:
    """
    Fetch test_type and test_objective from TestOrder.
    """
    try:
        vtc_logger.debug(f"Fetching test type and objective for test_order_id: {test_order_id}")
        test_order = db.query(TestOrder).filter(TestOrder.test_order_id == test_order_id).first()
        if not test_order:
            vtc_logger.warning(f"TestOrder not found for test_order_id: {test_order_id}")
            return {
                "test_type": "",
                "test_objective": "",
                "test_creator": "",
                "test_created_at": ""
            }
            
        test_type = test_order.test_type if hasattr(test_order, "test_type") else ""
        test_objective = test_order.test_objective if hasattr(test_order, "test_objective") else ""
        test_creator = test_order.name_of_creator if hasattr(test_order, "name_of_creator") else ""
        test_created_at = test_order.created_on.strftime("%Y-%m-%d %H:%M:%S") if hasattr(test_order, "created_on") and test_order.created_on else ""

        vtc_logger.debug(f"Test type: {test_type}, Test objective: {test_objective}, Test creator: {test_creator}, Test created at: {test_created_at}")
        return {
            "test_type": test_type,
            "test_objective": test_objective,
            "test_creator": test_creator,
            "test_created_at": test_created_at
        }
    except Exception as e:
        vtc_logger.error(f"Error in get_test_order_type_and_objective: {e}")
        return {
            "test_type": "",
            "test_objective": "",
            "test_creator": "",
            "test_created_at": ""
        }


def get_test_order_id(db: Session, test_order_id: str) -> str:
    """
    Fetch test_order_id from TestOrder (returns the same if exists).
    """
    try:
        test_order = db.query(TestOrder).filter(TestOrder.test_order_id == test_order_id).first()
        return test_order.test_order_id if test_order and hasattr(test_order, "test_order_id") else ""
    except Exception as e:
        vtc_logger.error(f"Error in get_test_order_id: {e}")
        return ""


def get_notify_data(db: Session) -> dict:
    """
    Fetch the most recent notify_fields and notify_values from the AddFields table.
    
    Args:
        db (Session): SQLAlchemy database session.
        
    Returns:
        dict: Dictionary containing notify_fields and notify_values.
    """
    try:
        vtc_logger.debug("Fetching notify data from AddFields table")
        # Get the most recent entry (highest ID)
        add_fields = db.query(AddFields).order_by(AddFields.id.desc()).first()
        
        if not add_fields:
            vtc_logger.warning("No AddFields record found")
            return {
                "notify_fields": [],
                "notify_values": {}
            }
        
        notify_fields = add_fields.notify_fields or []
        notify_values = add_fields.notify_values or {}
        
        vtc_logger.debug(f"Retrieved notify_fields: {notify_fields}")
        vtc_logger.debug(f"Retrieved notify_values: {notify_values}")
        
        return {
            "notify_fields": notify_fields,
            "notify_values": notify_values
        }
    except Exception as e:
        vtc_logger.error(f"Error in get_notify_data: {e}")
        return {
            "notify_fields": [],
            "notify_values": {}
        }


def get_job_department(job_order) -> str:
    """
    Helper function to extract department/team from job order.
    Works with both JobOrder and RDEJobOrder objects.
    
    Args:
        job_order: JobOrder or RDEJobOrder instance
        
    Returns:
        str: Department/team name or None if not found
    """
    if not job_order:
        print("DEBUG - get_job_department: job_order is None")
        return None
    
    print(f"DEBUG - get_job_department: processing job_order of type {type(job_order).__name__}")
    
    # Try direct access to specific department attributes
    for attr in ["department", "team", "dept", "team_id", "department_id", "deptId", "teamId"]:
        if hasattr(job_order, attr):
            value = getattr(job_order, attr)
            print(f"DEBUG - get_job_department: checking attribute '{attr}' = {value}")
            if value:
                normalized = normalize_department_name(value)
                print(f"DEBUG - get_job_department: found department '{value}', normalized to '{normalized}'")
                return normalized
    
    # Try to find attributes that contain department/team in their name
    if hasattr(job_order, "__dict__"):
        job_dict = job_order.__dict__
        for key in job_dict:
            if any(term in key.lower() for term in ["department", "team", "dept"]):
                value = job_dict[key]
                print(f"DEBUG - get_job_department: found attribute '{key}' = {value}")
                if value:
                    normalized = normalize_department_name(value)
                    print(f"DEBUG - get_job_department: found department in key '{key}' = '{value}', normalized to '{normalized}'")
                    return normalized
    
    # Try to extract from "name" or "description" if they exist
    for attr in ["name", "description", "title"]:
        if hasattr(job_order, attr):
            value = getattr(job_order, attr)
            print(f"DEBUG - get_job_department: checking for department in '{attr}' = {value}")
            if value and isinstance(value, str):
                # Look for department names in these fields
                value_lower = value.lower()
                if "vtc" in value_lower and "nashik" in value_lower:
                    print(f"DEBUG - get_job_department: found 'VTC Nashik' in {attr}")
                    return "VTC_JO Nashik"
                elif "vtc" in value_lower and ("chennai" in value_lower or "chenn" in value_lower):
                    print(f"DEBUG - get_job_department: found 'VTC Chennai' in {attr}")
                    return "VTC_JO Chennai"
                elif "rde" in value_lower:
                    print(f"DEBUG - get_job_department: found 'RDE' in {attr}")
                    return "RDE JO"
                elif "pdcd" in value_lower and "chennai" in value_lower:
                    print(f"DEBUG - get_job_department: found 'PDCD Chennai' in {attr}")
                    return "PDCD_JO Chennai"
    
    # If it's a JobOrder, check if the job_order_id has clues about the department
    if hasattr(job_order, "job_order_id"):
        job_id = job_order.job_order_id
        print(f"DEBUG - get_job_department: checking job_order_id {job_id} for department clues")
        job_id_lower = job_id.lower()
        
        # Extract department from job_order_id
        if "vtc" in job_id_lower and "nsk" in job_id_lower:
            print(f"DEBUG - get_job_department: found 'VTC Nashik' in job_order_id")
            return "VTC_JO Nashik"
        elif "vtc" in job_id_lower and "chn" in job_id_lower:
            print(f"DEBUG - get_job_department: found 'VTC Chennai' in job_order_id")
            return "VTC_JO Chennai"
        elif "rde" in job_id_lower:
            print(f"DEBUG - get_job_department: found 'RDE' in job_order_id")
            return "RDE JO"
        elif "pdcd" in job_id_lower:
            print(f"DEBUG - get_job_department: found 'PDCD' in job_order_id")
            return "PDCD_JO Chennai"
    
    # Last resort: check type name of the object
    obj_type = type(job_order).__name__
    print(f"DEBUG - get_job_department: checking object type {obj_type}")
    if "RDE" in obj_type:
        print(f"DEBUG - get_job_department: found 'RDE' in object type")
        return "RDE JO"
    
    # No department found
    print(f"DEBUG - get_job_department: no department found")
    return None


def normalize_department_name(department_name):
    """
    Normalize department name to ensure consistent lookup in email maps.
    This handles case-insensitive matching and common variations.
    """
    if not department_name:
        return None
        
    # Convert to string if not already
    department_name = str(department_name).strip()
    
    # Common department name mappings - be extremely comprehensive
    department_map = {
        # VTC Chennai variations
        "vtc_jo chennai": "VTC_JO Chennai",
        "vtc jo chennai": "VTC_JO Chennai",
        "vtc chennai": "VTC_JO Chennai",
        "vtc_chennai": "VTC_JO Chennai",
        "vtc-chennai": "VTC_JO Chennai",
        "vtc-jo chennai": "VTC_JO Chennai",
        "vtcjo chennai": "VTC_JO Chennai",
        "vtc jochennai": "VTC_JO Chennai",
        "vtc_jochennai": "VTC_JO Chennai",
        "vtc jo_chennai": "VTC_JO Chennai",
        "vtcjo_chennai": "VTC_JO Chennai",
        "vtc": "VTC_JO Chennai",  # Default if just "vtc"
        
        # VTC Nashik variations
        "vtc_jo nashik": "VTC_JO Nashik",
        "vtc jo nashik": "VTC_JO Nashik",
        "vtc nashik": "VTC_JO Nashik",
        "vtc_nashik": "VTC_JO Nashik",
        "vtc-nashik": "VTC_JO Nashik",
        "vtc-jo nashik": "VTC_JO Nashik",
        "vtcjo nashik": "VTC_JO Nashik",
        "vtc jonashik": "VTC_JO Nashik",
        "vtc_jonashik": "VTC_JO Nashik",
        "vtc jo_nashik": "VTC_JO Nashik",
        "vtcjo_nashik": "VTC_JO Nashik",
        "nashik": "VTC_JO Nashik",  # If just "nashik" assume VTC_JO Nashik
        
        # RDE variations
        "rde_jo": "RDE JO",
        "rde jo": "RDE JO",
        "rde": "RDE JO",
        "rde-jo": "RDE JO",
        "rdejo": "RDE JO",
        
        # PDCD Chennai variations
        "pdcd_jo chennai": "PDCD_JO Chennai",
        "pdcd jo chennai": "PDCD_JO Chennai",
        "pdcd chennai": "PDCD_JO Chennai",
        "pdcd_chennai": "PDCD_JO Chennai",
        "pdcd-chennai": "PDCD_JO Chennai",
        "pdcd-jo chennai": "PDCD_JO Chennai",
        "pdcdjo chennai": "PDCD_JO Chennai",
        "pdcd jochennai": "PDCD_JO Chennai",
        "pdcd_jochennai": "PDCD_JO Chennai",
        "pdcd jo_chennai": "PDCD_JO Chennai",
        "pdcdjo_chennai": "PDCD_JO Chennai",
        "pdcd": "PDCD_JO Chennai",  # Default if just "pdcd"
    }
    
    # Try to find a match in our map (case-insensitive)
    lowercase_name = department_name.lower()
    if lowercase_name in department_map:
        normalized = department_map[lowercase_name]
        print(f"DEBUG - Normalized '{department_name}' to '{normalized}'")
        return normalized
    
    # Special handling for words in the department name
    if "vtc" in lowercase_name and "nashik" in lowercase_name:
        print(f"DEBUG - Special handling: '{department_name}' contains 'vtc' and 'nashik', normalizing to 'VTC_JO Nashik'")
        return "VTC_JO Nashik"
    
    if "vtc" in lowercase_name and "chennai" in lowercase_name:
        print(f"DEBUG - Special handling: '{department_name}' contains 'vtc' and 'chennai', normalizing to 'VTC_JO Chennai'")
        return "VTC_JO Chennai"
    
    if "rde" in lowercase_name:
        print(f"DEBUG - Special handling: '{department_name}' contains 'rde', normalizing to 'RDE JO'")
        return "RDE JO"
    
    if "pdcd" in lowercase_name and "chennai" in lowercase_name:
        print(f"DEBUG - Special handling: '{department_name}' contains 'pdcd' and 'chennai', normalizing to 'PDCD_JO Chennai'")
        return "PDCD_JO Chennai"
        
    # If no match, return original name
    print(f"DEBUG - No normalization found for '{department_name}', returning as-is")
    return department_name


def get_department_group_email(job_order, caseid=None) -> str:
    """
    Returns the department-specific group email if the job order's department/team matches.
    
    For case IDs 2 and 5 (Test Order Created and Test Order Updated):
        - Return department-specific group email
    
    For other case IDs, return None
    """
    # Case IDs 2 and 5 should use department-specific group email
    if caseid in ("2", "5", "8"):
        # Get department using helper function
        department = get_job_department(job_order)
            
        # Debug log to trace the department value
        vtc_logger.debug(f"Department for group email: {department}")
        print(f"DEBUG - Department detected for job order: {department}")
        print(f"DEBUG - Original job_order value: {job_order}")
        
        # Ensure department exists and map it to the correct email
        if department:
            department_email_map = {
                "VTC_JO Chennai": "VTCLAB@mahindra.com",
                "VTC_JO Nashik": "vtclab_nsk@mahindra.com",
                "RDE JO": "RDELAB@mahindra.com",
                "PDCD_JO Chennai": "TEAMPDCD1@mahindra.com"
            }
            
            # Add more debugging
            print(f"DEBUG - Looking up department '{department}' in email map")
            print(f"DEBUG - Department email map keys: {list(department_email_map.keys())}")
            
            email = department_email_map.get(department)
            print(f"DEBUG - Found email for department '{department}': {email}")
            return email
    
    # For all other cases, don't use department-specific group email
    return None


def get_department_cc_emails(job_order, db: Session) -> list:
    """
    Returns department-specific CC group emails for test order-related cases.
    - VTC_JO Chennai: ['EDC-VTCLAB@mahindra.com']
    - RDE_JO: ['EDC-RDELAB@mahindra.com']
    - VTC_JO Nashik: []
    - PDCD_JO Chennai: []
    
    Used for case IDs 3, 4, 6, 9 (actions by test engineers) to include department in CC.
    """
    # Get department using helper function
    department = get_job_department(job_order)
    
    # If department is still None, try to find RDE job order
    if not department and hasattr(job_order, "job_order_id"):
        try:
            rde_job_order = db.query(RDEJobOrder).filter(RDEJobOrder.job_order_id == job_order.job_order_id).first()
            if rde_job_order:
                department = get_job_department(rde_job_order)
                print(f"DEBUG - Found RDE job order, department: {department}")
        except Exception as e:
            vtc_logger.error(f"Error getting RDE job order: {e}")
    
    vtc_logger.debug(f"Department for CC emails: {department}")
    print(f"DEBUG - Department detected for CC emails: {department}")
    print(f"DEBUG - Original job_order value: {job_order}")
    
    # Map department to CC email addresses
    cc_map = {
        "VTC_JO Chennai": ["VTCLAB@mahindra.com"],
        "RDE JO": ["RDELAB@mahindra.com"],
        "VTC_JO Nashik": [],
        "PDCD_JO Chennai": []
    }
    
    # Add more debugging
    print(f"DEBUG - Looking up department '{department}' in CC email map")
    print(f"DEBUG - CC email map keys: {list(cc_map.keys())}")
    
    cc_emails = cc_map.get(department, [])
    print(f"DEBUG - Found CC emails for department '{department}': {cc_emails}")
    
    return cc_emails


@router.post("/send")
async def send_email_endpoint(
    job_order_id: str = Body(...),
    caseid: str = Body(...),
    test_order_id: str = Body(None),
    notify_fields: List[str] = Body(None),
    notify_values: Dict[str, List[str]] = Body(None),
    db: Session = Depends(get_db),
):
    print("notify fieldsssssssssssssssss",notify_fields, notify_values)
    """
    Send an email to recipients based on the case ID:
    
    - Case ID 2, 5 (Test Order Created, Test Order Updated):
      TO: Department-specific group email
      CC: CFT members
      
    - Case ID 3, 4, 6, 9 (Test Re-edit, Rejection, Completion, Document Upload):
      TO: Test order creator (Project Team who created the test)
      CC: CFT members, Department-specific group email
    """
    try:
        vtc_logger.info(f"Processing email send request for job_order_id: {job_order_id}, caseid: {caseid}, test_order_id: {test_order_id}")
        
        # Get notify data from AddFields table if not provided in request
        db_notify_data = get_notify_data(db)
        
        # Use provided notify_fields and notify_values if available, otherwise use from database
        if notify_fields is None:
            notify_fields = db_notify_data.get("notify_fields", [])
            vtc_logger.debug(f"Using notify_fields from database: {notify_fields}")
        else:
            vtc_logger.debug(f"Using notify_fields from request: {notify_fields}")
            
        if notify_values is None:
            notify_values = db_notify_data.get("notify_values", {})
            vtc_logger.debug(f"Using notify_values from database: {notify_values}")
        else:
            vtc_logger.debug(f"Using notify_values from request: {notify_values}")

        # Get role for the caseid
        role = get_role_for_caseid(caseid)
        if not role:
            vtc_logger.warning(f"Role not found for caseid: {caseid}")
            raise HTTPException(status_code=400, detail="Role not found for caseid")

        # Fetch job order
        job_order = db.query(JobOrder).filter(JobOrder.job_order_id == job_order_id).first()
        if not job_order:
            # Try to fetch from RDEJobOrder if job_order_id belongs to RDE
            rde_job_order = db.query(RDEJobOrder).filter(RDEJobOrder.job_order_id == job_order_id).first()
            if rde_job_order:
                job_order = rde_job_order
                vtc_logger.debug(f"Fetched RDEJobOrder for job_order_id '{job_order_id}': {job_order}")
            else:
                vtc_logger.warning(f"JobOrder not found for job_order_id: {job_order_id}")
        
        # Print department info for debugging
        if job_order:
            dept = None
            if hasattr(job_order, "department") and job_order.department:
                dept = job_order.department
            elif hasattr(job_order, "team") and job_order.team:
                dept = job_order.team
            print(f"DEBUG - Job Order Department/Team: {dept}")
            print(f"DEBUG - Job Order Type: {type(job_order).__name__}")
            print(f"DEBUG - Job Order Attributes: {dir(job_order)}")
            
            # Print all job_order attributes for debugging
            try:
                print(f"DEBUG - Job Order Dict: {job_order.__dict__}")
            except:
                print("DEBUG - Could not print job_order.__dict__")

        # Initialize to_emails and cc_emails
        to_emails = []
        cc_emails = []

        # LOGIC FOR DETERMINING TO AND CC RECIPIENTS BASED ON CASE ID
        # ----------------------------------------------------------
        
        # Get CFT member emails for CC in all cases
        if job_order:
            cft_emails = get_cft_member_emails(job_order, db)
            cc_emails.extend(cft_emails)
            vtc_logger.debug(f"Added CFT members to CC: {cft_emails}")
        
        # Case-specific recipient logic
        if caseid in ["2", "5"]:  # Test Order Created, Test Order Updated
            # TO: Department-specific group email
            if job_order:
                # Get department email with improved detection
                dept_email = get_department_group_email(job_order, caseid)
                print(f"DEBUG - Department email for case {caseid}: {dept_email}")
                
                if dept_email:
                    to_emails = [dept_email]
                    vtc_logger.debug(f"Using department group email for TO: {dept_email}")
                else:
                    # Fallback to role-based emails if no department email
                    to_emails = get_all_emails_by_role(db, role)
                    vtc_logger.debug(f"Using role-based emails for TO: {to_emails}")
            else:
                # Fallback to role-based emails if no job order
                to_emails = get_all_emails_by_role(db, role)
                vtc_logger.debug(f"Using role-based emails for TO: {to_emails}")
                
        elif caseid in ["3", "4", "6", "9"]:  # Test Re-edit, Rejection, Completion, Document Upload
            # TO: Test order creator (person who created that test)
            if test_order_id:
                test_order = db.query(TestOrder).filter(TestOrder.test_order_id == test_order_id).first()
                if test_order and hasattr(test_order, "id_of_creator") and test_order.id_of_creator:
                    creator = db.query(User).filter(User.id == test_order.id_of_creator).first()
                    if creator and creator.email:
                        to_emails = [creator.email]
                        vtc_logger.debug(f"Using test creator email for TO: {creator.email}")
                    else:
                        # Fallback to job order creator if test creator not found
                        if job_order and hasattr(job_order, "id_of_creator"):
                            job_creator = db.query(User).filter(User.id == job_order.id_of_creator).first()
                            if job_creator and job_creator.email:
                                to_emails = [job_creator.email]
                                vtc_logger.debug(f"Using job creator email for TO: {job_creator.email}")
                
            # If still no TO emails, use role-based emails as fallback
            if not to_emails:
                to_emails = get_all_emails_by_role(db, role)
                vtc_logger.debug(f"Using role-based emails for TO: {to_emails}")
            
            # CC: Department-specific group email + CFT members
            if job_order:
                # Add department group email to CC
                dept_email = get_department_group_email(job_order, "2")  # Use case 2's logic to get dept email
                print(f"DEBUG - Department group email for CC: {dept_email}")
                if dept_email and dept_email not in cc_emails:
                    cc_emails.append(dept_email)
                    vtc_logger.debug(f"Added department group email to CC: {dept_email}")
                
                # Also add department-specific CC emails
                dept_cc_emails = get_department_cc_emails(job_order, db)
                print(f"DEBUG - Department CC emails: {dept_cc_emails}")
                for cc_email in dept_cc_emails:
                    if cc_email and cc_email not in cc_emails:
                        cc_emails.append(cc_email)
                vtc_logger.debug(f"Added department CC emails: {dept_cc_emails}")
                
        else:  # For other case IDs, use default logic from role
            to_emails = get_all_emails_by_role(db, role)
            vtc_logger.debug(f"Using role-based emails for TO: {to_emails}")
            
            # Check if there's a specific group email defined in the template
            group_email = get_group_email_for_caseid(caseid)
            if group_email:
                to_emails = [group_email]
                vtc_logger.debug(f"Using group email from template: {group_email}")

        # Ensure we have recipients
        if not to_emails:
            vtc_logger.warning(f"No recipient found for caseid: {caseid}")
            raise HTTPException(status_code=404, detail="No recipient found for the email")

        # Load email template
        subject, body = load_email_template(caseid)
        vtc_logger.debug(f"Original subject template: {subject}")
        vtc_logger.debug(f"Original body template length: {len(body)} characters")

        # Gather data for replacements
        total_tests = get_total_tests_for_job(db, job_order_id) if job_order_id else 0
        vtc_logger.debug(f"Total tests for job order {job_order_id}: {total_tests}")

        creator_info = get_job_creator_info(db, job_order) if job_order else {"creator_name": "", "creator_id": "", "created_at": ""}
        vtc_logger.debug(f"Creator info: {creator_info}")

        # Fetch additional details for mail body based on caseid
        test_order_remarks = get_test_order_remarks(db, test_order_id) if test_order_id else {}
        test_order_type_obj = get_test_order_type_and_objective(db, test_order_id) if test_order_id else {}
        job_test_status = get_job_order_test_status(db, job_order_id) if job_order_id else ""
        job_completed_test_count = get_job_order_completed_test_count(db, job_order_id) if job_order_id else 0

        # Fetch rating and rating_remarks for caseid 8
        rating = ""
        rating_remarks = ""
        if caseid == "8" and test_order_id:
            test_order = db.query(TestOrder).filter(TestOrder.test_order_id == test_order_id).first()
            if test_order:
                rating = str(test_order.rating) if hasattr(test_order, "rating") and test_order.rating is not None else ""
                rating_remarks = test_order.rating_remarks if hasattr(test_order, "rating_remarks") else ""
            vtc_logger.debug(f"Case 8 - Rating: {rating}, Rating Remarks: {rating_remarks}")

        # Replace placeholders with actual IDs and info
        subject = subject.replace("{{job_order_id}}", str(job_order_id))
        subject = subject.replace("{{test_order_id}}", str(test_order_id) if test_order_id else "")

        body = body.replace("{{job_order_id}}", str(job_order_id))
        body = body.replace("{{test_order_id}}", str(test_order_id) if test_order_id else "")
        body = body.replace("{{total_tests}}", str(total_tests))
        body = body.replace("{{creator_name}}", creator_info.get("creator_name", ""))
        body = body.replace("{{creator_id}}", creator_info.get("creator_id", ""))
        body = body.replace("{{created_at}}", creator_info.get("created_at", ""))
        
        # Replace notify_fields placeholder with actual field names
        if "{{notify_fields}}" in body:
            fields_str = ", ".join(notify_fields) if notify_fields else ""
            body = body.replace("{{notify_fields}}", fields_str)
            vtc_logger.debug(f"Replaced {{notify_fields}} with: {fields_str}")
        
        # Replace notify_values placeholder with formatted values
        if "{{notify_values}}" in body:
            # Format notify_values as a readable string
            values_parts = []
            if notify_values:
                for field, values in notify_values.items():
                    value_str = ", ".join(values) if values else ""
                    values_parts.append(f"{field}: {value_str}")
            values_str = "; ".join(values_parts)
            body = body.replace("{{notify_values}}", values_str)
            vtc_logger.debug(f"Replaced {{notify_values}} with: {values_str}")
        
        vtc_logger.debug(f"Processed subject: {subject}")
        vtc_logger.debug(f"Processed body length: {len(body)} characters")

        # For caseid-specific replacements
        if caseid == "1.1":
            body = body.replace("{{test_objective}}", test_order_type_obj.get("test_objective", ""))
            vtc_logger.debug(f"Case 1.1 - Added test objective: {test_order_type_obj.get('test_objective', '')}")
        elif caseid == "2":
            body = body.replace("{{test_creator}}", test_order_type_obj.get("test_creator", ""))
            body = body.replace("{{test_created_at}}", test_order_type_obj.get("test_created_at", ""))
            vtc_logger.debug(f"Case 2 - Using job_order_id: {job_order_id}")
        elif caseid == "3":
            body = body.replace("{{test_objective}}", test_order_type_obj.get("test_objective", ""))
            body = body.replace("{{remark}}", test_order_remarks.get("remark", ""))
            vtc_logger.debug(f"Case 3 - Added test objective and remarks")
        elif caseid == "4":
            body = body.replace("{{test_objective}}", test_order_type_obj.get("test_objective", ""))
            body = body.replace("{{rejection_remarks}}", test_order_remarks.get("rejection_remarks", ""))
            vtc_logger.debug(f"Case 4 - Added test objective and rejection remarks")
        elif caseid == "5":
            body = body.replace("{{total_tests_created}}", str(total_tests))
            body = body.replace("{{total_tests_completed}}", str(job_completed_test_count))
            vtc_logger.debug(f"Case 5 - Added total tests created and completed")
        elif caseid == "6":
            body = body.replace("{{test_objective}}", test_order_type_obj.get("test_objective", ""))
            body = body.replace("{{complete_remarks}}", test_order_remarks.get("complete_remarks", ""))
            vtc_logger.debug(f"Case 6 - Added test objective and complete remarks")
        elif caseid == "7":
            # Format notify fields and values for email body
            fields_str = ", ".join(notify_fields) if notify_fields else ""
            
            values_parts = []
            if notify_values:
                for field, values in notify_values.items():
                    value_str = ", ".join(values) if values else ""
                    values_parts.append(f"{field}: {value_str}")
            values_str = "; ".join(values_parts)
            
            body = body.replace("{{notify_fields}}", fields_str)
            body = body.replace("{{notify_values}}", values_str)
            vtc_logger.debug(f"Case 7 - Added notify fields: {fields_str} and values: {values_str}")
        elif caseid == "8":
            body = body.replace("{{rating}}", rating)
            body = body.replace("{{rating_remarks}}", rating_remarks)
            vtc_logger.debug(f"Case 8 - Added rating and rating remarks")

        # Send the email
        vtc_logger.info(f"Sending email for case {caseid} - TO: {to_emails}, CC: {cc_emails}")
        send_email(to_emails, subject, body, cc_emails=cc_emails)
        vtc_logger.info(f"Email sent successfully for caseid {caseid}")
        return {"detail": f"Email sent successfully for case {caseid}"}
    except HTTPException as he:
        raise he
    except Exception as e:
        vtc_logger.error(f"Error in send_email_endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/cft_members/add")
async def add_cft_member(
    job_order_id: str, member: dict, db: Session = Depends(get_db)
):
    """
    Add a CFT member to a job order.

    Args:
        job_order_id (str): The job order ID.
        member (dict): The member data to add.
        db (Session): SQLAlchemy database session.

    Returns:
        JobOrder: The updated job order with the new member.

    Raises:
        HTTPException: If job order is not found.
    """
    try:
        job_order = (
            db.query(JobOrder)
            .filter(JobOrder.job_order_id == job_order_id)
            .first()
        )
        if not job_order:
            vtc_logger.warning(f"JobOrder not found for job_order_id: {job_order_id}")
            raise HTTPException(status_code=404, detail="JobOrder not found")
        job_order.cft_members.append(member)
        db.commit()
        vtc_logger.info(f"Added CFT member to job_order_id: {job_order_id}")
        return job_order
    except Exception as e:
        vtc_logger.error(f"Error in add_cft_member: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/cft_members/read")
async def read_cft_members(job_order_id: str, db: Session = Depends(get_db)):
    """
    Read all CFT members for a job order.

    Args:
        job_order_id (str): The job order ID.
        db (Session): SQLAlchemy database session.

    Returns:
        list: List of CFT members.

    Raises:
        HTTPException: If job order is not found.
    """
    try:
        job_order = (
            db.query(JobOrder)
            .filter(JobOrder.job_order_id == job_order_id)
            .first()
        )
        if not job_order:
            vtc_logger.warning(f"JobOrder not found for job_order_id: {job_order_id}")
            raise HTTPException(status_code=404, detail="JobOrder not found")
        vtc_logger.info(f"Read CFT members for job_order_id: {job_order_id}")
        return job_order.cft_members
    except Exception as e:
        vtc_logger.error(f"Error in read_cft_members: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/cft_members/update")
async def update_cft_member(
    job_order_id: str,
    member_index: int,
    updated_member: dict,
    db: Session = Depends(get_db),
):
    """
    Update a CFT member for a job order.

    Args:
        job_order_id (str): The job order ID.
        member_index (int): Index of the member to update.
        updated_member (dict): Updated member data.
        db (Session): SQLAlchemy database session.

    Returns:
        JobOrder: The updated job order.

    Raises:
        HTTPException: If job order or member is not found.
    """
    try:
        job_order = (
            db.query(JobOrder)
            .filter(JobOrder.job_order_id == job_order_id)
            .first()
        )
        if not job_order:
            vtc_logger.warning(f"JobOrder not found for job_order_id: {job_order_id}")
            raise HTTPException(status_code=404, detail="JobOrder not found")
        if member_index >= len(job_order.cft_members):
            vtc_logger.warning(f"CFT member not found at index {member_index} for job_order_id: {job_order_id}")
            raise HTTPException(status_code=404, detail="CFT member not found")
        job_order.cft_members[member_index] = updated_member
        db.commit()
        vtc_logger.info(f"Updated CFT member at index {member_index} for job_order_id: {job_order_id}")
        return job_order
    except Exception as e:
        vtc_logger.error(f"Error in update_cft_member: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/debug_email_routing")
async def debug_email_routing(
    job_order_id: str,
    caseid: str,
    test_order_id: str = None,
    db: Session = Depends(get_db),
):
    """
    Debug endpoint to check email routing logic for different case IDs.
    Returns the calculated TO and CC recipients without actually sending an email.
    """
    try:
        job_order = db.query(JobOrder).filter(JobOrder.job_order_id == job_order_id).first()
        if not job_order:
            rde_job_order = db.query(RDEJobOrder).filter(RDEJobOrder.job_order_id == job_order_id).first()
            if rde_job_order:
                job_order = rde_job_order
            else:
                return {"error": "Job order not found"}

        # Debug job order details
        department = get_job_department(job_order)
        job_type = type(job_order).__name__
        
        # Print job order details for debugging
        print(f"DEBUG - Job Order Type: {job_type}")
        print(f"DEBUG - Department from helper: {department}")
        
        # Try to get department directly
        direct_dept = None
        if hasattr(job_order, "department"):
            direct_dept = job_order.department
        elif hasattr(job_order, "team"):
            direct_dept = job_order.team
        print(f"DEBUG - Direct department: {direct_dept}")
        
        # If direct_dept has a value, normalize it
        normalized_direct_dept = None
        if direct_dept:
            normalized_direct_dept = normalize_department_name(direct_dept)
            print(f"DEBUG - Normalized direct department: {normalized_direct_dept}")
        
        # Try to print job_order attributes
        job_order_attrs = {}
        try:
            job_order_dict = job_order.__dict__
            for key, value in job_order_dict.items():
                if not key.startswith('_'):
                    job_order_attrs[key] = value
            print(f"DEBUG - Job Order Attributes: {job_order_attrs}")
        except:
            print("DEBUG - Could not extract job_order attributes")

        # Get role for the caseid
        role = get_role_for_caseid(caseid)
        
        # Initialize recipients
        to_emails = []
        cc_emails = []
        
        # Get CFT member emails for CC in all cases
        if job_order:
            cft_emails = get_cft_member_emails(job_order, db)
            cc_emails.extend(cft_emails)
        
        # Case-specific recipient logic
        if caseid in ["2", "5"]:  # Test Order Created, Test Order Updated
            # TO: Department-specific group email
            if job_order:
                dept_email = get_department_group_email(job_order, caseid)
                if dept_email:
                    to_emails = [dept_email]
                else:
                    # Fallback to role-based emails if no department email
                    to_emails = get_all_emails_by_role(db, role)
            else:
                # Fallback to role-based emails if no job order
                to_emails = get_all_emails_by_role(db, role)

        elif caseid in ["3", "4", "6", "9"]:  # Test Re-edit, Rejection, Completion, Document Upload
            # TO: Test order creator (person who created that test)
            if test_order_id:
                test_order = db.query(TestOrder).filter(TestOrder.test_order_id == test_order_id).first()
                if test_order and hasattr(test_order, "id_of_creator") and test_order.id_of_creator:
                    creator = db.query(User).filter(User.id == test_order.id_of_creator).first()
                    if creator and creator.email:
                        to_emails = [creator.email]
                    else:
                        # Fallback to job order creator if test creator not found
                        if job_order and hasattr(job_order, "id_of_creator"):
                            job_creator = db.query(User).filter(User.id == job_order.id_of_creator).first()
                            if job_creator and job_creator.email:
                                to_emails = [job_creator.email]
                
            # If still no TO emails, use role-based emails as fallback
            if not to_emails:
                to_emails = get_all_emails_by_role(db, role)
            
            # CC: Department-specific group email + CFT members
            if job_order:
                dept_email = get_department_group_email(job_order, "2")  # Use case 2's logic to get dept email
                if dept_email and dept_email not in cc_emails:
                    cc_emails.append(dept_email)
                
                # Also add department-specific CC emails
                dept_cc_emails = get_department_cc_emails(job_order, db)
                for cc_email in dept_cc_emails:
                    if cc_email and cc_email not in cc_emails:
                        cc_emails.append(cc_email)
                
        else:  # For other case IDs, use default logic from role
            to_emails = get_all_emails_by_role(db, role)
            
            # Check if there's a specific group email defined in the template
            group_email = get_group_email_for_caseid(caseid)
            if group_email:
                to_emails = [group_email]
        
        # Collect all department-related information for debugging
        department_info = {
            "normalized_department": department,
            "direct_department": direct_dept,
            "normalized_direct_dept": normalized_direct_dept,
            "department_detection_methods": {
                "from_helper_function": department,
                "from_direct_attribute": direct_dept,
                "normalized_direct": normalized_direct_dept
            },
            "department_email_lookup_result": get_department_group_email(job_order, caseid),
            "department_cc_emails_lookup_result": get_department_cc_emails(job_order, db)
        }
        
        return {
            "case_id": caseid,
            "role": role,
            "to_emails": to_emails,
            "cc_emails": cc_emails,
            "department_info": department_info,
            "job_order_type": job_type,
            "job_order_attributes": job_order_attrs,
            "cft_members_count": len(get_cft_member_emails(job_order, db)) if job_order else 0
        }
    except Exception as e:
        vtc_logger.error(f"Error in debug_email_routing: {e}")
        return {"error": str(e)}


@router.delete("/cft_members/delete")
async def delete_cft_member(
    job_order_id: str, member_index: int, db: Session = Depends(get_db)
):
    """
    Delete a CFT member from a job order.

    Args:
        job_order_id (str): The job order ID.
        member_index (int): Index of the member to delete.
        db (Session): SQLAlchemy database session.

    Returns:
        JobOrder: The updated job order.

    Raises:
        HTTPException: If job order or member is not found.
    """
    try:
        job_order = (
            db.query(JobOrder)
            .filter(JobOrder.job_order_id == job_order_id)
            .first()
        )
        if not job_order:
            vtc_logger.warning(f"JobOrder not found for job_order_id: {job_order_id}")
            raise HTTPException(status_code=404, detail="JobOrder not found")
        if member_index >= len(job_order.cft_members):
            vtc_logger.warning(f"CFT member not found at index {member_index} for job_order_id: {job_order_id}")
            raise HTTPException(status_code=404, detail="CFT member not found")
        job_order.cft_members.pop(member_index)
        db.commit()
        db.refresh(job_order)
        vtc_logger.info(f"Deleted CFT member at index {member_index} for job_order_id: {job_order_id}")
        return job_order
    except Exception as e:
        vtc_logger.error(f"Error in delete_cft_member: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
        vtc_logger.info(f"Deleted CFT member at index {member_index} for job_order_id: {job_order_id}")
        return job_order
    except Exception as e:
        vtc_logger.error(f"Error in delete_cft_member: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

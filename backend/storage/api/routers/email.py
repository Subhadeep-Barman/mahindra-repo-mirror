from http.client import HTTPException
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, Body
from backend.storage.models.models import JobOrder, TestOrder, User, AddFields # adjust import as per your models
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
                "test_objective": ""
            }
            
        test_type = test_order.test_type if hasattr(test_order, "test_type") else ""
        test_objective = test_order.test_objective if hasattr(test_order, "test_objective") else ""
        
        vtc_logger.debug(f"Test type: {test_type}, Test objective: {test_objective}")
        return {
            "test_type": test_type,
            "test_objective": test_objective
        }
    except Exception as e:
        vtc_logger.error(f"Error in get_test_order_type_and_objective: {e}")
        return {
            "test_type": "",
            "test_objective": ""
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


# def get_department_group_email(job_order, caseid=None) -> str:
#     """
#     Returns the department-specific group email if the job order's department/team matches,
#     but only for caseid '1' or '2'. Returns None otherwise.
#     """
#     if caseid not in ("1", "2"):
#         return None
#     department = getattr(job_order, "department", None) or getattr(job_order, "team", None)
#     department_email_map = {
#         "VTC_JO Chennai": "VTCLAB@mahindra.com",
#         "VTC_JO Nashik": "vtclab_nsk@mahindra.com",
#         "RDE JO": "RDELAB@mahindra.com",
#         "PDCD_JO Chennai": "PDCDOFFICERS@mahindra.com"
#     }
#     return department_email_map.get(department)


# def get_department_cc_emails(job_order) -> list:
#     """
#     Returns department-specific CC group emails for test order-related cases.
#     - VTC_JO Chennai: ['EDC-VTCLAB@mahindra.com']
#     - RDE_JO: ['EDC-RDELAB@mahindra.com']
#     - VTC_JO Nashik: []
#     - PDCD_JO Chennai: []
#     """
#     department = getattr(job_order, "department", None) or getattr(job_order, "team", None)
#     print(f"Fetching CC emails for department: {department}")
#     cc_map = {
#         "VTC_JO Chennai": ["EDC-VTCLAB@mahindra.com"],
#         "RDE JO": ["EDC-RDELAB@mahindra.com"],
#         "VTC_JO Nashik": [],
#         "PDCD_JO Chennai": []
#     }
#     print(f"Departmentttttttttttttttttttt: {department}, CC Emails: {cc_map.get(department, [])}")
#     return cc_map.get(department, [])


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
    Send an email to a group email (if defined) or all users of the role specified in mail_body.json for the given caseid.
    Also CC all CFT members added to the job order.
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

        # Check if group email is defined for this caseid
        group_email = get_group_email_for_caseid(caseid)

        # Fetch job order for department-based override
        # job_order = db.query(JobOrder).filter(JobOrder.job_order_id == job_order_id).first()
        # # --- Department-based recipient override for ALL cases ---
        # if job_order:
        #     dept_group_email = get_department_group_email(job_order)
        #     if dept_group_email:
        #         group_email = dept_group_email
        #         vtc_logger.info(f"Overriding group email for department: {dept_group_email}")

        if group_email:
            to_emails = [group_email]
            vtc_logger.info(f"Using group email for caseid {caseid}: {group_email}")
        else:
            to_emails = get_all_emails_by_role(db, role)
            vtc_logger.debug(f"To Emails: {to_emails}")
            if not to_emails:
                vtc_logger.warning(f"No recipient found for the given role: {role}")
                raise HTTPException(status_code=404, detail="No recipient found for the given role")

        # Load email template
        subject, body = load_email_template(caseid)
        vtc_logger.debug(f"Original subject template: {subject}")
        vtc_logger.debug(f"Original body template length: {len(body)} characters")

        # Fetch job order and related info if needed
        job_order = db.query(JobOrder).filter(JobOrder.job_order_id == job_order_id).first()
        if not job_order:
            vtc_logger.warning(f"JobOrder not found for job_order_id: {job_order_id}")

        # Gather data for replacements
        total_tests = get_total_tests_for_job(db, job_order_id) if job_order else 0
        vtc_logger.debug(f"Total tests for job order {job_order_id}: {total_tests}")

        creator_info = get_job_creator_info(db, job_order) if job_order else {"creator_name": "", "creator_email": "", "created_at": ""}
        vtc_logger.debug(f"Creator info: {creator_info}")

        # Fetch additional details for mail body based on caseid
        test_order_remarks = get_test_order_remarks(db, test_order_id) if test_order_id else {}
        test_order_type_obj = get_test_order_type_and_objective(db, test_order_id) if test_order_id else {}
        job_test_status = get_job_order_test_status(db, job_order_id) if job_order_id else ""
        job_completed_test_count = get_job_order_completed_test_count(db, job_order_id) if job_order_id else 0

        vtc_logger.debug(f"Test order remarks: {test_order_remarks}")
        vtc_logger.debug(f"Test type and objective: {test_order_type_obj}")
        vtc_logger.debug(f"Job test status: {job_test_status}")
        vtc_logger.debug(f"Job completed test count: {job_completed_test_count}")

        # Replace placeholders with actual IDs and info
        subject = subject.replace("{{job_order_id}}", str(job_order_id))
        subject = subject.replace("{{test_order_id}}", str(test_order_id) if test_order_id else "")

        body = body.replace("{{job_order_id}}", str(job_order_id))
        body = body.replace("{{test_order_id}}", str(test_order_id) if test_order_id else "")
        body = body.replace("{{total_tests}}", str(total_tests))
        body = body.replace("{{creator_name}}", creator_info.get("creator_name", ""))
        body = body.replace("{{creator_email}}", creator_info.get("creator_email", ""))
        body = body.replace("{{created_at}}", creator_info.get("created_at", ""))
        body = body.replace("{{redirect_link}}", os.environ.get("REDIRECT_LINK", ""))
        
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

        # Fetch CFT member emails for CC
        cc_emails = get_cft_member_emails(job_order, db) if job_order else []

        # Add department-specific CC group emails for test order-related cases
        # test_order_cases = {"1.1", "3", "4", "5", "6"}
        # if caseid in test_order_cases and job_order:
        #     dept_cc = get_department_cc_emails(job_order)
        #     # Only add if not already present in cc_emails
        #     for cc in dept_cc:
        #         if cc and cc not in cc_emails:
        #             cc_emails.append(cc)
        #     vtc_logger.debug(f"CC Emails after department addition: {cc_emails}")

        # Send the email
        send_email(to_emails, subject, body, cc_emails=cc_emails)
        vtc_logger.info(f"Email sent successfully for caseid {caseid}")
        return {"detail": f"Email sent to group or all users with role {role} and CFT members successfully"}
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

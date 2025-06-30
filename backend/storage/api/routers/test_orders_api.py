import os
from fastapi import Request
from fastapi import APIRouter, HTTPException
from pathlib import Path
import json
import uuid
import aiofiles
from fastapi import APIRouter, HTTPException, Depends, Body, UploadFile, File, Form
from typing import List
from datetime import datetime, date
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.storage.api.api_utils import get_db
from backend.storage.models.models import TestOrder
from google.cloud import storage
router = APIRouter()

STORAGE = os.getenv("STORAGE")
if STORAGE == "UAT":
    UPLOAD_PATH = "DBMRS_VTC/uploads/UAT_ENV_UPLOADS"
else:
    UPLOAD_PATH = "DBMRS_VTC/uploads/TEST_ENV_UPLOADS"


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


MAX_FILE_SIZE = 4 * 1024 * 1024 * 1024  # maximum files size upto 4GB only
UPLOAD_TIMEOUT = 300
chunk_storage = {}

STORAGE = os.getenv("STORAGE")
BUCKET_NAME = "gto_cloud_storage"
DESTINATION_FOLDER = "logs/dbmrs"
CREDENTIALS_PATH = os.path.join(
    os.getcwd(), "gto-projects-dev-993026-153ee6510ab1.json"
)

@router.post("/upload_chunk")
async def upload_chunk(
    chunk: UploadFile = File(...),
    file_name: str = Form(...),
    chunk_index: int = Form(...),
    total_chunks: int = Form(...),
    sess_idt: str = Form(None),
    job_order_id: str = Form(...),
    test_order_id: str = Form(None),
    attachment_type: str = Form(...),
    user: str = Form(...),
    request: Request = None,
):
    """
    Upload a chunk of a file to the server in a resumable upload process.

    Args:
        chunk (UploadFile): The file chunk to be uploaded.
        file_name (str): The name of the file being uploaded.
        chunk_index (int): The index of the chunk being uploaded.
        total_chunks (int): The total number of chunks expected.
        sess_idt (str): Unique session identifier for the upload.
        job_order_id (str): ID to associate with job order.
        test_order_id (str): ID to associate with test order.
        attachment_type (str): The type/category of attachment.
        user (str): The user uploading the file.

    Returns:
        dict: Upload status, session ID, user, and upload time.
    """
    if sess_idt is None:
        sess_idt = str(uuid.uuid4())

    # Folder path structure
    if test_order_id is None:
        folder_path = f"{UPLOAD_PATH}/{job_order_id}/{attachment_type}/"
    else:
        folder_path = f"{UPLOAD_PATH}/{job_order_id}/{test_order_id}/{attachment_type}/"

    upload_time = datetime.utcnow().isoformat() + "Z"

    try:
        os.makedirs(folder_path, exist_ok=True)
        chunk_path = os.path.join(folder_path, f"{sess_idt}_part_{chunk_index}")

        async with aiofiles.open(chunk_path, "wb") as f:
            chunk_data = await chunk.read()
            await f.write(chunk_data)

        if sess_idt not in chunk_storage:
            chunk_storage[sess_idt] = {
                "file_name": file_name,
                "total_chunks": total_chunks,
                "chunks_received": set(),
                "total_size": 0,
                "user": user,
                "upload_time": upload_time,
            }

        chunk_storage[sess_idt]["chunks_received"].add(chunk_index)
        chunk_storage[sess_idt]["total_size"] += os.path.getsize(chunk_path)

        if chunk_storage[sess_idt]["total_size"] > MAX_FILE_SIZE:
            # Clean up the uploaded chunks
            for i in range(total_chunks):
                part_path = os.path.join(folder_path, f"{sess_idt}_part_{i}")
                if os.path.exists(part_path):
                    os.remove(part_path)
            del chunk_storage[sess_idt]
            return {
                "sess_idt": sess_idt,
                "completed": False,
                "error": "File size is too large to upload.",
                "user": user,
                "upload_time": upload_time,
            }

    except Exception as e:
        return {
            "sess_idt": sess_idt,
            "completed": False,
            "error": f"Error uploading chunk: {str(e)}",
            "user": user,
            "upload_time": upload_time,
        }

    # Final merge if all chunks are received
    if len(chunk_storage[sess_idt]["chunks_received"]) == total_chunks:
        try:
            upload_results = await merge_chunks(
                sess_idt, folder_path, file_name, attachment_type, chunk
            )
            del chunk_storage[sess_idt]
            return {
                "sess_idt": sess_idt,
                "completed": True,
                "upload_results": upload_results,
                "user": user,
                "upload_time": upload_time,
            }
        except Exception as e:
            # Log the actual error for debugging
            import traceback
            error_details = traceback.format_exc()
            # Optionally print or log error_details here
            for i in range(total_chunks):
                part_path = os.path.join(folder_path, f"{sess_idt}_part_{i}")
                if os.path.exists(part_path):
                    os.remove(part_path)
            del chunk_storage[sess_idt]
            return {
                "sess_idt": sess_idt,
                "completed": False,
                "error": f"File upload failed: {str(e)}",
                "details": error_details,
                "user": user,
                "upload_time": upload_time,
            }

    return {
        "sess_idt": sess_idt,
        "completed": False,
        "user": user,
        "upload_time": upload_time,
    }


async def merge_chunks(sess_idt, folder_path, file_name, attachment_type, file):
    """
    Merge the uploaded file chunks into a single file and upload it to Google Cloud Storage.

    @param:
    sess_idt (str): Unique session identifier for the upload.
    folder_path (str): The path where the file chunks are stored.
    file_name (str): The name of the final file to be created.
    attachment_type (str): The type/category of attachment.

    @return:
    list: A list of dictionaries containing the status of each file upload.
    """
    final_file_path = os.path.join(folder_path, file_name)
    upload_results = []

    try:
        async with aiofiles.open(final_file_path, "wb") as final_file:
            total_chunks = chunk_storage.get(sess_idt, {}).get("total_chunks", 0)
            if total_chunks == 0:
                raise ValueError(f"No chunks found for session: {sess_idt}")

            for i in range(total_chunks):
                chunk_path = os.path.join(folder_path, f"{sess_idt}_part_{i}")
                try:
                    async with aiofiles.open(chunk_path, "rb") as chunk_file:
                        content = await chunk_file.read()
                        await final_file.write(content)
                except FileNotFoundError:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Chunk {i} not found for session {sess_idt}. Please try again.",
                    )
                except Exception as e:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Error reading chunk {i} for session {sess_idt}: {str(e)}",
                    )

        storage_client = storage.Client.from_service_account_json(CREDENTIALS_PATH)
        bucket = storage_client.bucket(BUCKET_NAME)
        blob_path = f"{folder_path.rstrip('/')}/{file_name}"
        blob = bucket.blob(blob_path)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Error while preparing file or connecting to Google Cloud Storage. Please try again later.",
        )

    try:
        blob.upload_from_filename(final_file_path, timeout=UPLOAD_TIMEOUT)
        upload_results.append({"filename": file_name, "status": "uploaded"})

        if (
            attachment_type == "wearAnalysisReportAttachment"
            and file_name.lower().endswith((".xls", ".xlsx"))
        ):
            try:
                file.file.seek(0)
                pdf_result = convert_excel_to_pdf(file)
                if pdf_result is None:
                    raise ValueError(
                        "PDF conversion failed: convert_excel_to_pdf returned None."
                    )
                pdf_filename, pdf_content = pdf_result
                pdf_blob = bucket.blob(folder_path + pdf_filename)
                pdf_blob.upload_from_string(pdf_content, content_type="application/pdf")
                upload_results.append({"filename": pdf_filename, "status": "uploaded"})
            except Exception as e:
                upload_results.append(
                    {
                        "filename": os.path.splitext(file_name)[0] + ".pdf",
                        "status": "failed",
                        "error": "PDF conversion and upload failed. Please try again later.",
                    }
                )
    except Exception as e:
        os.remove(final_file_path)
        raise HTTPException(
            status_code=500,
            detail=f"Error uploading file {file_name} to GCS. Please try again later.",
        )
    finally:
        if os.path.exists(final_file_path):
            os.remove(final_file_path)
    return upload_results


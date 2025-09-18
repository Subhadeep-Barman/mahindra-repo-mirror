import os
from fastapi import Request
from fastapi import APIRouter, HTTPException
from pathlib import Path
import json
import uuid
import aiofiles
from fastapi import APIRouter, HTTPException, Depends, Body, UploadFile, File, Form
from typing import List, Optional, Union
from fastapi import Query
from datetime import datetime, date
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.storage.api.api_utils import get_db, limiter
from backend.storage.models.models import TestOrder, JobOrder
from google.cloud import storage
import tempfile
import io
from google.cloud.storage.blob import Blob
import zipfile
from fastapi.responses import FileResponse, Response, StreamingResponse
router = APIRouter()

STORAGE = os.getenv("STORAGE")
if STORAGE == "UAT":
    UPLOAD_PATH = "DBMRS_VTC/uploads/UAT_ENV_UPLOADS"
else:
    UPLOAD_PATH = "DBMRS_VTC/uploads/TEST_ENV_UPLOADS"


@router.get("/test-types")
@limiter.limit("50/minute")
def get_test_types(request: Request):
    base_path = Path(__file__).parent.parent.parent / "json_data"
    try:
        with open(base_path / "test_type.json") as f:
            test_types = json.load(f)
        return test_types
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/inertia-classes")
@limiter.limit("50/minute")
def get_inertia_classes(request: Request):
    base_path = Path(__file__).parent.parent.parent / "json_data"
    try:
        with open(base_path / "inertia_class.json") as f:
            inertia_classes = json.load(f)
        return inertia_classes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/modes")
@limiter.limit("50/minute")
def get_modes(request: Request):
    base_path = Path(__file__).parent.parent.parent / "json_data"
    try:
        with open(base_path / "mode.json") as f:
            modes = json.load(f)
        return modes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/fuel-types")
@limiter.limit("50/minute")
def get_fuel_types(request: Request):
    base_path = Path(__file__).parent.parent.parent / "json_data"
    try:
        with open(base_path / "fuel_type.json") as f:
            fuel_types = json.load(f)
        return fuel_types
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class TestOrderSchema(BaseModel):
    test_order_id: Optional[str] = None
    job_order_id: Optional[str] = None
    CoastDownData_id: Optional[str] = None
    coast_down_data: Optional[dict] = None
    engine_number: Optional[str] = None
    test_type: Optional[str] = None
    test_objective: Optional[str] = None
    vehicle_location: Optional[str] = None
    cycle_gear_shift: Optional[str] = None
    inertia_class: Optional[str] = None
    dataset_name: Optional[str] = None
    dpf: Optional[str] = None
    dpf_regen_occurs: Optional[str] = None
    dataset_flashed: Optional[bool] = None
    ess: Optional[str] = None
    mode: Optional[str] = None
    fuel_type: Optional[str] = None
    hardware_change: Optional[str] = None
    equipment_required: Optional[str] = None
    shift: Optional[str] = None
    preferred_date: Optional[date] = None
    emission_check_date: Optional[date] = None
    emission_check_attachment: Optional[List[dict]] = None
    dataset_attachment: Optional[List[dict]] = None
    a2l_attachment: Optional[List[dict]] = None
    experiment_attachment: Optional[List[dict]] = None
    dbc_attachment: Optional[List[dict]] = None
    wltp_attachment: Optional[List[dict]] = None
    pdf_report: Optional[List[dict]] = None
    excel_report: Optional[List[dict]] = None
    dat_file_attachment: Optional[List[dict]] = None
    others_attachement: Optional[List[dict]] = None
    specific_instruction: Optional[str] = None
    remark: Optional[str] = None
    rejection_remarks: Optional[str] = None
    mail_remarks: Optional[str] = None
    complete_remarks: Optional[str] = None
    status: Optional[str] = None
    id_of_creator: Optional[str] = None
    name_of_creator: Optional[str] = None
    created_on: Optional[datetime] = None
    id_of_updater: Optional[str] = None
    name_of_updater: Optional[str] = None
    updated_on: Optional[datetime] = None
    validated_by: Optional[str] = None
    validated_on: Optional[datetime] = None
    validation_status: Optional[str] = None
    rating: Optional[int] = None
    rating_remarks: Optional[str] = None
    rated_by: Optional[str] = None
    rated_on: Optional[datetime] = None

def extract_filename(value):
    if isinstance(value, list):
        return ",".join([v["path"] for v in value if isinstance(v, dict) and "path" in v])
    if isinstance(value, dict) and "path" in value:
        return value["path"]
    return value

def extract_attachment_list(value):
    if value is None:
        return None
    if isinstance(value, list):
        return [v for v in value if isinstance(v, dict)]
    if isinstance(value, dict):
        return [value]
    if isinstance(value, str):
        return [{"path": value}]
    return None

def testorder_to_dict(testorder: TestOrder):
    attachment_fields = [
        "dataset_attachment", "a2l_attachment", "experiment_attachment", "dbc_attachment",
        "wltp_attachment", "pdf_report", "excel_report", "dat_file_attachment", "others_attachement"
    ]
    result = {
        "test_order_id": testorder.test_order_id,
        "job_order_id": testorder.job_order_id,
        "CoastDownData_id": testorder.CoastDownData_id,
        "coast_down_data": testorder.coast_down_data,
        "engine_number": testorder.engine_number,
        "test_type": testorder.test_type,
        "test_objective": testorder.test_objective,
        "vehicle_location": testorder.vehicle_location,
        "cycle_gear_shift": testorder.cycle_gear_shift,
        "inertia_class": testorder.inertia_class,
        "dataset_name": testorder.dataset_name,
        "dpf": testorder.dpf,
        "dpf_regen_occurs": testorder.dpf_regen_occurs,
        "dataset_flashed": testorder.dataset_flashed,
        "ess": testorder.ess,
        "mode": testorder.mode,
        "fuel_type": testorder.fuel_type,
        "hardware_change": testorder.hardware_change,
        "equipment_required": testorder.equipment_required,
        "shift": testorder.shift,
        "preferred_date": testorder.preferred_date,
        "emission_check_date": testorder.emission_check_date,
        "emission_check_attachment": testorder.emission_check_attachment,
        "dataset_attachment": testorder.dataset_attachment,
        "a2l_attachment": testorder.a2l_attachment,
        "experiment_attachment": testorder.experiment_attachment,
        "dbc_attachment": testorder.dbc_attachment,
        "wltp_attachment": testorder.wltp_attachment,
        "pdf_report": testorder.pdf_report,
        "excel_report": testorder.excel_report,
        "dat_file_attachment": testorder.dat_file_attachment,
        "others_attachement": testorder.others_attachement,
        "specific_instruction": testorder.specific_instruction,
        "remark": testorder.remark if testorder.remark is not None else "",
        "rejection_remarks": testorder.rejection_remarks if testorder.rejection_remarks is not None else "",
        "mail_remarks": testorder.mail_remarks if testorder.mail_remarks is not None else "",
        "complete_remarks": testorder.complete_remarks if testorder.complete_remarks is not None else "",
        "status": testorder.status,
        "id_of_creator": testorder.id_of_creator,
        "name_of_creator": testorder.name_of_creator,
        "created_on": testorder.created_on,
        "id_of_updater": testorder.id_of_updater,
        "name_of_updater": testorder.name_of_updater,
        "updated_on": testorder.updated_on,
        "validated_by": testorder.validated_by,
        "validated_on": testorder.validated_on,
        "validation_status": testorder.validation_status,
        "rating": testorder.rating,
        "rating_remarks": testorder.rating_remarks,
        "rated_by": testorder.rated_by,
        "rated_on": testorder.rated_on,
    }
    for key in attachment_fields:
        val = result.get(key)
        if val == "" or val is None:
            result[key] = []
    return result

@router.post("/testorders", response_model=TestOrderSchema)
@limiter.limit("50/minute")
def create_testorder_api(
    request: Request,
    testorder: dict = Body(...),
    db: Session = Depends(get_db)
):
    attachment_fields = [
        "dataset_attachment", "a2l_attachment", "experiment_attachment", "dbc_attachment",
        "wltp_attachment", "pdf_report", "excel_report", "dat_file_attachment", "others_attachement"
    ]
    for key in attachment_fields:
        if key in testorder and testorder[key] == "":
            testorder[key] = []
    if "emission_check_attachment" in testorder and (
        testorder["emission_check_attachment"] == "" or testorder["emission_check_attachment"] == []
    ):
        testorder["emission_check_attachment"] = None
    testorder_obj = TestOrderSchema(**testorder)
    testorder_data = testorder_obj.dict(exclude_unset=True)
    # Normalize all attachment fields to list of dicts
    for key in attachment_fields:
        if key in testorder_data:
            testorder_data[key] = extract_attachment_list(testorder_data[key])
    new_testorder = TestOrder(**testorder_data)
    db.add(new_testorder)
    db.commit()
    db.refresh(new_testorder)

    print("DEBUG: Entering GCP folder rename logic after test order creation")
    temp_id = "test0"
    print(f"DEBUG: Possible temp ID to check for renaming: {temp_id}")

    new_test_order_id = str(getattr(new_testorder, "test_order_id", ""))
    job_order_id = str(getattr(new_testorder, "job_order_id", ""))
    print(f"DEBUG: New test_order_id: {new_test_order_id}, job_order_id: {job_order_id}")

    # Only rename if temp_id is not empty and not already the new id
    if temp_id and temp_id != new_test_order_id:
        print(f"DEBUG: Attempting to rename GCP folder from {temp_id} to {new_test_order_id}")
        try:
            rename_gcp_test_order_id(temp_id, new_test_order_id, job_order_id)
            print(f"DEBUG: Rename function called for {temp_id} -> {new_test_order_id}")
        except Exception as e:
            print(f"DEBUG: Exception during GCP folder rename: {e}")
            pass

    return testorder_to_dict(new_testorder)

@router.get("/testorders", response_model=List[TestOrderSchema])
@limiter.limit("50/minute")
def read_testorders(request: Request, db: Session = Depends(get_db)):
    testorders = db.query(TestOrder).all()
    return [testorder_to_dict(t) for t in testorders]

@router.get("/testorders-single", response_model=TestOrderSchema)
@limiter.limit("50/minute")
def read_testorder(request: Request, test_order_id: str, db: Session = Depends(get_db)):
    print(test_order_id)
    testorder = db.query(TestOrder).filter(TestOrder.test_order_id == test_order_id).first()
    if not testorder:
        raise HTTPException(status_code=404, detail="TestOrder not found")
    return testorder_to_dict(testorder)

@router.put("/testorders-update", response_model=TestOrderSchema)
@limiter.limit("50/minute")
def update_testorder(
    request: Request,
    test_order_id: str,
    testorder_update: TestOrderSchema = Body(...),
    db: Session = Depends(get_db)
):
    testorder = db.query(TestOrder).filter(TestOrder.test_order_id == test_order_id).first()
    if not testorder:
        raise HTTPException(status_code=404, detail="TestOrder not found")
    update_data = testorder_update.dict(exclude_unset=True)
    for key in [
        "dataset_attachment", "a2l_attachment", "experiment_attachment", "dbc_attachment",
        "wltp_attachment", "pdf_report", "excel_report", "dat_file_attachment", "others_attachement"
    ]:
        if key in update_data:
            update_data[key] = extract_attachment_list(update_data[key])
    for key, value in update_data.items():
        setattr(testorder, key, value)
    testorder.updated_on = datetime.utcnow()
    db.commit()
    db.refresh(testorder)
    return testorder_to_dict(testorder)

@router.delete("/testorders/{test_order_id}")
@limiter.limit("10/minute")
def delete_testorder(request: Request, test_order_id: str, db: Session = Depends(get_db)):
    testorder = db.query(TestOrder).filter(TestOrder.test_order_id == test_order_id).first()
    if not testorder:
        raise HTTPException(status_code=404, detail="TestOrder not found")
    db.delete(testorder)
    db.commit()
    return {"detail": "TestOrder deleted successfully"}


MAX_FILE_SIZE = 4 * 1024 * 1024 * 1024
UPLOAD_TIMEOUT = 300
chunk_storage = {}

STORAGE = os.getenv("STORAGE")
BUCKET_NAME = "gto_cloud_storage"
DESTINATION_FOLDER = "logs/dbmrs"
CREDENTIALS_PATH = os.path.join(
    os.getcwd(), "gto-projects-dev-993026-153ee6510ab1.json"
)

@router.post("/upload_chunk")
@limiter.limit("50/minute")
async def upload_chunk(
    request: Request,
    chunk: UploadFile = File(...),
    file_name: str = Form(...),
    chunk_index: int = Form(...),
    total_chunks: int = Form(...),
    sess_idt: str = Form(None),
    job_order_id: str = Form(...),
    test_order_id: str = Form(None),
    attachment_type: str = Form(...),
    user: str = Form(...),
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

def build_prefix(job_order_id: str, test_order_id: str = None, attachment_type: str = None, filename: str = None):
    prefix = f"{UPLOAD_PATH}/{job_order_id}"
    if test_order_id:
        prefix += f"/{test_order_id}"
    if attachment_type:
        prefix += f"/{attachment_type}"
    if filename:
        prefix += f"/{filename}"
    return prefix

@router.get("/check_files_GCP")
@limiter.limit("50/minute")
def check_files_GCP(
    request: Request,
    job_order_id: str = Query(...),
    test_order_id: str = Query(None),
    attachment_type: str = Query(None)
):
    """
    Endpoint to check if files exist in GCP bucket based on job_order_id and test_order_id.

    Args:
    - job_order_id (str): The job order ID, which is the prefix for the blobs.
    - test_order_id (str): The test order ID to narrow down the files inside job_order_id.
    - attachment_type (str): The type of attachment to further narrow down the files.

    Returns:
    - dict: A dictionary containing the status of files and the list of file names.
    """
    try:
        client = storage.Client.from_service_account_json(CREDENTIALS_PATH)
        bucket = client.bucket(BUCKET_NAME)
        prefix = build_prefix(job_order_id, test_order_id, attachment_type)
        # Debug: log the prefix being used
        print(f"Checking GCP files with prefix: {prefix}")
        blobs = list(bucket.list_blobs(prefix=prefix))
        print(f"Found {len(blobs)} blobs for prefix: {prefix}")
        if not blobs:
            print(f"No files found in bucket '{BUCKET_NAME}' with prefix '{prefix}'")
            return {"status": False, "files": []}
        file_names = [blob.name.split("/")[-1] for blob in blobs]
        print(f"Files found for prefix '{prefix}': {file_names}")
        return {"status": True, "files": file_names}
    except Exception as e:
        print("Error checking files in GCP.")
        print(f"Error details: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error checking files in GCP: please try again later",
        )

@router.get("/download_job_order_id/")
@limiter.limit("50/minute")
async def download_files_as_zip_or_single(
    request: Request,
    response: Response,
    job_order_id: str = None,
    test_order_id: str = None,
    attachment_type: str = None,
    filename: str = None,
):
    """
    Endpoint to download files from a GCP bucket based on job_order_id and test_order_id,
    and return them as a zip archive or single file based on the number of files.

    Args:
    - job_order_id (str): The job order ID, which is the prefix for the blobs.
    - test_order_id (str): The test order ID to narrow down the files inside job_order_id.
    - attachment_type (str): The type of attachment to further narrow down the files.
    - filename (str): The name of the file to download.

    Returns:
    - StreamingResponse: A downloadable zip file or a single file.
    """
    # try:
    client = storage.Client.from_service_account_json(CREDENTIALS_PATH)
    bucket = client.bucket(BUCKET_NAME)

    # Use prefix to narrow down the files to download
    prefix = build_prefix(job_order_id, test_order_id, attachment_type, filename)
    blobs = list(bucket.list_blobs(prefix=prefix))

    if not blobs:
        raise HTTPException(
            status_code=404, detail="No files found with the given prefix."
        )

    # If there is only one file in GCP blob then download it directly, otherwise create a zip file
    # If filename is passed then download the file directly
    if (attachment_type and len(blobs) == 1) or (
        attachment_type and filename and len(blobs) == 1
    ):
        file_response = await serve_single_file(blobs[0])
        response.headers["Access-Control-Expose-Headers"] = "Content-Disposition"
        return file_response

    zip_response = await serve_zip_file(blobs, job_order_id)
    response.headers["Access-Control-Expose-Headers"] = "Content-Disposition"
    return zip_response
    # except Exception as e:
    #     raise HTTPException(
    #         status_code=500,
    #         detail=f"Error downloading files from GCP: please try again later",
    #     )

async def serve_zip_file(blobs: List[Blob], job_order_id: str) -> StreamingResponse:
    """
    Create a zip archive from multiple files and return it as a downloadable response.

    Args:
    - blobs: List of GCP Blob objects to be included in the zip.
    - job_order_id (str): Job order ID used to name the zip file.

    Returns:
    - StreamingResponse: Response with the zip archive content.
    """
    try:
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for blob in blobs:
                file_data = blob.download_as_bytes()
                relative_path = blob.name.replace(f"{UPLOAD_PATH}/", "")
                zip_file.writestr(relative_path, file_data)
        zip_buffer.seek(0)

        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename={job_order_id}.zip"},
        )
    except Exception as e:
        print(f"Error creating zip file: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to serve the zip file. Please try again later.",
        )
    
async def serve_single_file(blob: Blob) -> StreamingResponse:
    """
    Serve a single file as a direct download.

    Args:
    - blob: The GCP Blob object to be downloaded.

    Returns:
    - StreamingResponse: Response with the file content.
    """
    try:
        file_data = blob.download_as_bytes()
        file_name = blob.name.split("/")[-1]

        return StreamingResponse(
            io.BytesIO(file_data),
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={file_name}"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to serve the file. Please try again later.",
        )

@router.delete("/delete-file")
@limiter.limit("10/minute")
async def delete_file(
    request: Request,
    job_order_id: str = Form(...),
    test_order_id: str = Form(None),
    attachment_type: str = Form(...),
    filename: str = Form(...),
):
    """
    Delete a file from Google Cloud Storage (GCS).

    @param:
    job_order_id (str): The unique identifier of the folder where the file is stored.
    test_order_id (str): The unique identifier of the test order folder.
    attachment_type (str): The type of attachment.
    file_name (str): The name of the file to delete.

    @return:
    dict: A dictionary indicating whether the file was successfully deleted or if it failed.
    """
    # Construct path to the file to be deleted
    if test_order_id is None:
        blob_name = f"{UPLOAD_PATH}/{job_order_id}/{attachment_type}/{filename}"
    else:
        blob_name = (
            f"{UPLOAD_PATH}/{job_order_id}/{test_order_id}/{attachment_type}/{filename}"
        )

    try:
        storage_client = storage.Client.from_service_account_json(CREDENTIALS_PATH)
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(blob_name)
        if not blob.exists():
            raise HTTPException(
                status_code=404,
                detail=f"File {filename} does not exist in the specified folder.",
            )
        blob.delete()
    except Exception as e:

        raise HTTPException(
            status_code=500, detail="Error deleting file. Please try again later."
        )
    else:
        return {"status": True, "message": f"File {filename} deleted successfully."}

# api to check the validation status of a test order
@router.post("/testorders/validation")
@limiter.limit("50/minute")
def validate_test_order(
    request: Request,
    data: dict = Body(...),
    db: Session = Depends(get_db)
):
    """
    Validate a test order by updating its validation status and details.

    Args:
        data (dict): Should contain test_order_id, validation_status, validated_by, validated_on.
        db (Session): Database session dependency.

    Returns:
        dict: Updated test order details.
    """
    test_order_id = data.get("test_order_id")
    validation_status = data.get("validation_status")
    validated_by = data.get("validated_by")
    validated_on = data.get("validated_on")

    testorder = db.query(TestOrder).filter(TestOrder.test_order_id == test_order_id).first()
    if not testorder:
        raise HTTPException(status_code=404, detail="TestOrder not found")

    testorder.validation_status = validation_status
    testorder.validated_by = validated_by
    testorder.validated_on = validated_on
    db.commit()
    db.refresh(testorder)

    return testorder_to_dict(testorder)


@router.post("/testorders/rating")
@limiter.limit("50/minute")
def rate_test_order(
    request: Request,
    data: dict = Body(...),
    db: Session = Depends(get_db)
):
    """
    Rate a test order by updating its rating and related details.

    Args:
        data (dict): Should contain test_order_id, rating, rating_remarks, rated_by, rated_on.
        db (Session): Database session dependency.

    Returns:
        dict: Updated test order details.
    """
    test_order_id = data.get("test_order_id")
    rating = data.get("rating")
    rating_remarks = data.get("rating_remarks")
    rated_by = data.get("rated_by")
    rated_on = data.get("rated_on")

    testorder = db.query(TestOrder).filter(TestOrder.test_order_id == test_order_id).first()
    if not testorder:
        raise HTTPException(status_code=404, detail="TestOrder not found")

    testorder.rating = rating
    testorder.rating_remarks = rating_remarks
    testorder.rated_by = rated_by
    testorder.rated_on = rated_on
    db.commit()
    db.refresh(testorder)

    return testorder_to_dict(testorder)

@router.post("/clone-testorder-files")
@limiter.limit("10/minute")
def clone_testorder_files(
    request: Request,
    job_order_id: str = Body(...),
    source_test_order_id: str = Body(...),
    target_test_order_id: str = Body(...),
):
    """
    Clone all files from source_test_order_id to target_test_order_id for a given job_order_id.
    This is useful when cloning a test order form so that all previously uploaded files are visible in the new form.
    """
    try:
        client = storage.Client.from_service_account_json(CREDENTIALS_PATH)
        bucket = client.bucket(BUCKET_NAME)
        # List all attachment types under the source test order folder
        source_prefix = f"{UPLOAD_PATH}/{job_order_id}/{source_test_order_id}/"
        blobs = list(bucket.list_blobs(prefix=source_prefix))
        if not blobs:
            return {"status": False, "message": "No files found to clone."}
        for blob in blobs:
            # Compute new blob name for target test order
            new_blob_name = blob.name.replace(
                f"/{source_test_order_id}/", f"/{target_test_order_id}/"
            )
            # Only copy if not already present (avoid duplicates)
            target_blob = bucket.blob(new_blob_name)
            if not target_blob.exists():
                target_blob.rewrite(blob)
        return {"status": True, "message": "Files cloned successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error cloning files: {str(e)}"
        )


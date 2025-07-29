import os


LOG_FILE_PATH = "backend/storage/api/routers/user_interactions.log"
STORAGE = os.getenv("STORAGE")
BUCKET_NAME = "gto_cloud_storage"
DESTINATION_FOLDER = "logs/dbmrs"
CREDENTIALS_PATH = os.path.join(
    os.getcwd(), "gto-projects-dev-993026-153ee6510ab1.json"
)
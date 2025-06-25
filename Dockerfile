FROM python:3.10.11
WORKDIR /app
COPY backend/requirements.txt /app/requirements.txt

RUN apt-get update && \
    apt-get install -y postgresql-client && \
    rm -rf /var/lib/apt/lists/* 
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --upgrade -r /app/requirements.txt
COPY backend /app/backend

CMD ["uvicorn", "backend.storage.api.api:app", "--host", "0.0.0.0", "--port", "8000"]
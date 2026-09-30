# --- AWS Dockerfile for Netre VMS Backend (FastAPI) ---
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (OpenCV / FFmpeg required for AI pipeline)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY server/ ./

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

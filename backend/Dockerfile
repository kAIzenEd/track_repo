FROM python:3.10-slim

# Install system dependencies for audio processing (ffmpeg)
# build-essential and git might be needed to compile some dependencies for whisperx
RUN apt-get update && apt-get install -y ffmpeg build-essential git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Ensure storage path is owned by the container
RUN mkdir -p /app/storage/audio /app/storage/transcripts

COPY requirements-main.txt .
RUN pip install --no-cache-dir -r requirements-main.txt

# Mount local backend logic inside
COPY ./backend /app/backend

# Need the root dir dependencies like create_table if run directly
COPY ./create_table.py /app/create_table.py

EXPOSE 8000

# Added log-level trace for clarity during complex transcription debugging
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "info"]

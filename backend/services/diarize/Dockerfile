FROM python:3.10-slim

RUN apt-get update && apt-get install -y ffmpeg git build-essential && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements-diarize.txt .

# Install pyannote deps (bump comment to bust cache after requirement changes)
# diarize-deps: 2026-05-22-pyannote-3.4-hf-hub-pin
RUN pip install --no-cache-dir -r requirements-diarize.txt \
    && python -c "import numpy, pyannote.audio; print('numpy', numpy.__version__, 'pyannote', pyannote.audio.__version__)"
# Add FastAPI for the standalone microservice wrapper
RUN pip install fastapi uvicorn python-multipart requests

COPY ./backend/services/diarize /app/backend/services/diarize

# We don't need to COPY the .env; Docker Compose will pass it via 'environment'

EXPOSE 8001

CMD ["uvicorn", "backend.services.diarize.api:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "1"]

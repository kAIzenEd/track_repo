from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

import shutil
import os
import json
from datetime import datetime
import time

from backend.services.transcribe import transcribe_audio
from backend.db import get_db
from backend.models import Meeting


app = FastAPI(
    title="kAI Track",
    description=(
        "kAI Track is a local-first AI meeting assistant that converts audio recordings into readable meeting transcripts with timestamps. It eliminates the need for manual note-taking by providing a structured, searchable record of your discussions, while providing summaries and insights through an AI agent which also assigns tasks to participants and provides a task manager."
    ),
    version="v0.1",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


AUDIO_DIR = "backend/storage/audio"
TRANSCRIPT_DIR = "backend/storage/transcripts"

# Make sure folders exist so nothing crashes randomly
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(TRANSCRIPT_DIR, exist_ok=True)


@app.get("/")
def home():
    return {"status": "kAI Track Backend Up and Walking (hehehe Running)...."}


@app.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    mode: str = "accurate",
    db: Session = Depends(get_db),
):
    """
    Upload audio (.wav, .mp3) -> returns transcript -> saves locally + saves into DB
    """

    # Upload audio -> returns transcript -> saves to local
    if not file.filename.lower().endswith((".wav", ".mp3", ".aac")):
        return JSONResponse(
            status_code=400,
            content={
                "error": "This will not do!!! Upload only .wav, .mp3 or .aac files >:|"
            },
        )

    # Saving audio file locally
    audio_path = os.path.join(AUDIO_DIR, file.filename)

    with open(audio_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    start_time = time.time()

    # Run Transcription (backend does the heavy lifting)
    segments = transcribe_audio(audio_path, mode=mode)

    end_time = time.time()
    transcribe_seconds = round(end_time - start_time, 2)

    print(f"\nDayum, it literally took {transcribe_seconds} seconds in dis ({mode})\n")

    # Format Transcript Output neatly
    transcript_segments = [
        {
            "start": round(seg["start"], 2),
            "end": round(seg["end"], 2),
            "text": seg["text"].strip(),
        }
        for seg in segments
    ]

    # Save transcript into SQLite DB (Meeting table)
    meeting = Meeting(
        audio_file=file.filename,
        transcript=transcript_segments,
    )

    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    # Save transcript JSON File also (local storage backup)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    transcript_filename = f"{file.filename}_{timestamp}.json"
    transcript_path = os.path.join(TRANSCRIPT_DIR, transcript_filename)

    transcript_data = {
        "meeting_id": meeting.id,
        "audio_file": file.filename,
        "created_at": timestamp,
        "mode": mode,
        "segments": transcript_segments,
    }

    with open(transcript_path, "w", encoding="utf-8") as f:
        json.dump(transcript_data, f, indent=4)

    # Return Message
    return {
        "message": "Yo yo yo, da audio been done transcribed.....",
        "meeting_id": meeting.id,
        "audio_file": file.filename,
        "mode_used": mode,
        "transcription_time_seconds": transcribe_seconds,
        "transcript_saved_as": transcript_filename,
        "segments": transcript_segments,
    }


@app.get("/meetings/{meeting_id}")
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):

    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()

    if not meeting:
        return JSONResponse(
            status_code=404,
            content={"error": "Meeting not found"}
        )

    return {
        "id": meeting.id,
        "audio_file": meeting.audio_file,
        "created_at": meeting.created_at,
        "transcript": meeting.transcript,
    }


@app.get("/list_meetings")
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    #returns entire metadata of one meeting using id value

    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()

    if meeting is None:
        return JSONResponse(status_code = 404,
                             content = {"error": f"Don't you get it this meetind id {meeting_id} doesn't exist?!"},)
    return{
        "id": meeting.id,
        "audio_file": meeting.audio_file,
        "created_at": meeting.created_at,
        "transcript": meeting.transcript,
    }

@app.delete("/meetings/{meeting_id}")
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()

    if not meeting:
        return JSONResponse(status_code=404, content={"error": "Meeting not found"})

    db.delete(meeting)
    db.commit()

    return {"message": f"Meeting {meeting_id} deleted"}

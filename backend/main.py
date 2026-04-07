# backend/main.py
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from typing import List

from sqlalchemy.orm import Session

import shutil
import os
import json
from datetime import datetime
import time
from pathlib import Path

# Import the local services we need
from backend.services.diarization_router import diarize_with_pyannote, DiarizationError
from backend.services.assign_speakers import assign_speakers
from backend.services.transcribe import transcribe_audio
from backend.db import get_db
from backend.models import Meeting, MeetingInsights
from backend.services.ai_insights import transcript_to_text, generate_insights

# ---- App ----
app = FastAPI(
    title="kAI Track",
    description=(
        "kAI Track is a local-first AI meeting assistant that converts audio recordings "
        "into readable meeting transcripts with timestamps and speaker labels."
    ),
    version="v0.1",
)

# CORS Middleware - allows frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage directories
PROJECT_ROOT = Path(__file__).resolve().parents[1]
AUDIO_DIR = PROJECT_ROOT / "storage" / "audio"
TRANSCRIPT_DIR = PROJECT_ROOT / "storage" / "transcripts"

# Ensure storage folders exist
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(TRANSCRIPT_DIR, exist_ok=True)


@app.get("/")
def home():
    """Health check endpoint"""
    return {"status": "kAI Track Backend is running"}


@app.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    mode: str = "accurate",
    db: Session = Depends(get_db),
):
    """
    Upload audio (.wav, .mp3, .aac) -> transcribe -> diarize -> assign speakers -> save to DB + local storage -> return result
    """

    # Validate file extension
    if not file.filename.lower().endswith((".wav", ".mp3", ".aac")):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload .wav, .mp3, or .aac files only."
        )

    # Save uploaded audio to disk
    audio_path = str(AUDIO_DIR / file.filename)
    try:
        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {e}")

    # ------------------------------------------------------------------
    # STEP 1: TRANSCRIPTION (WhisperX) - blocking call
    # ------------------------------------------------------------------
    try:
        print("⏳ Starting transcription...")
        t0 = time.time()
        raw_segments = transcribe_audio(audio_path, mode=mode)
        transcribe_time = round(time.time() - t0, 2)
        print(f"Transcription completed in {transcribe_time}s ({mode})")
    except Exception as e:
        # If transcription fails, do not leave partial DB records
        raise HTTPException(status_code=500, detail=f"Transcription error: {e}")

    # Format transcript segments (clean text, rounded timestamps)
    transcript_segments = [
        {
            "start": round(seg["start"], 2),
            "end": round(seg["end"], 2),
            "text": seg["text"].strip(),
        }
        for seg in raw_segments
    ]

    # ------------------------------------------------------------------
    # STEP 2: DIARIZATION (isolated Pyannote venv subprocess)
    # ------------------------------------------------------------------
    try:
        print("Starting diarization (pyannote)...")
        t0 = time.time()
        diarization_segments = diarize_with_pyannote(audio_path)
        diarize_time = round(time.time() - t0, 2)
        print(f"Diarization completed in {diarize_time}s (segments: {len(diarization_segments)})")
    except DiarizationError as de:
        # Diarization is mandatory — surface a clean 500 with the error detail
        raise HTTPException(status_code=500, detail=f"Diarization error: {str(de)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected diarization error: {e}")

    # ------------------------------------------------------------------
    # STEP 3: ASSIGN SPEAKERS (overlap-based)
    # ------------------------------------------------------------------
    try:
        print("Assigning speakers to transcript segments...")

        print("Transcript sample:", transcript_segments[:2])
        print("Diarization sample:", diarization_segments[:2])
        t0 = time.time()
        enriched_segments = assign_speakers(transcript_segments, diarization_segments)
        print("Enriched sample:", enriched_segments[:2])
        align_time = round(time.time() - t0, 2)
        print(f"Speaker assignment completed in {align_time}s")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speaker assignment error: {e}")

    total_time = round(transcribe_time + diarize_time + align_time, 2)
    print(f"\nTotal processing time: {total_time}s\n")

    # ------------------------------------------------------------------
    # Save to database (store enriched segments with speaker labels)
    # ------------------------------------------------------------------
    try:
        meeting = Meeting(
            audio_file=file.filename,
            transcript=json.loads(json.dumps(enriched_segments)),  # includes speaker
        )
        db.add(meeting)
        db.commit()
        db.refresh(meeting)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database save error: {e}")

    # ------------------------------------------------------------------
    # Save local JSON backup
    # ------------------------------------------------------------------
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    transcript_filename = f"{file.filename}_{timestamp}.json"
    transcript_path = TRANSCRIPT_DIR / transcript_filename

    transcript_data = {
        "meeting_id": meeting.id,
        "audio_file": file.filename,
        "created_at": timestamp,
        "mode": mode,
        "processing_times": {
            "transcription": transcribe_time,
            "diarization": diarize_time,
            "alignment": align_time,
            "total": total_time,
        },
        "segments": enriched_segments,
    }

    try:
        with open(transcript_path, "w", encoding="utf-8") as f:
            json.dump(transcript_data, f, indent=4)
    except Exception as e:
        # JSON backup failure shouldn't block the API response, but log it and notify
        print(f"Failed to write JSON backup: {e}")

    # ------------------------------------------------------------------
    # Return response
    # ------------------------------------------------------------------
    return {
        "message": "Transcription with speaker diarization completed successfully",
        "meeting_id": meeting.id,
        "audio_file": file.filename,
        "mode_used": mode,
        "processing_times": {
            "transcription": transcribe_time,
            "diarization": diarize_time,
            "alignment": align_time,
            "total": total_time,
        },
        "transcript_saved_as": transcript_filename,
        "segments": enriched_segments
    }


@app.get("/meetings")
def list_meetings(db: Session = Depends(get_db)):
    """
    Returns a list of all meetings (metadata only)
    """
    meetings = db.query(Meeting).order_by(Meeting.created_at.desc()).all()
    return [
        {
            "id": m.id,
            "audio_file": m.audio_file,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in meetings
    ]


@app.get("/meetings/{meeting_id}")
def get_meeting_by_id(meeting_id: int, db: Session = Depends(get_db)):
    """
    Returns full meeting details including transcript for a specific meeting ID
    """
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    insight = db.query(MeetingInsights).filter(
        MeetingInsights.meeting_id == meeting.id
    ).first()

    print("[FETCH INSIGHTS]", insight)
    
    parsed_json = {}
    if insight and insight.action_items_json:
        try:
            parsed_json = json.loads(insight.action_items_json)
        except:
            pass
            
    if isinstance(parsed_json, list):
        action_items = parsed_json
        improvements = []
    else:
        action_items = parsed_json.get("actions", [])
        improvements = parsed_json.get("improvements", [])

    return {
        "id": meeting.id,
        "audio_file": meeting.audio_file,
        "created_at": meeting.created_at.isoformat() if meeting.created_at else None,
        "transcript": meeting.transcript,
        "insights": {
            "summary": insight.summary_text if insight else "",
            "action_items": action_items,
            "improvements": improvements
        }
    }


@app.delete("/meetings/{meeting_id}")
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    """
    Deletes a meeting and its associated data by ID
    """
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    # Optionally delete associated audio file
    audio_path = AUDIO_DIR / meeting.audio_file
    if audio_path.exists():
        try:
            audio_path.unlink()
        except Exception:
            pass

    db.delete(meeting)
    db.commit()

    return {"message": f"Meeting {meeting_id} deleted successfully"}

class UpdateMeetingRequest(BaseModel):
    segments: List[dict]

@app.patch("/meetings/{meeting_id}")
async def update_meeting(meeting_id: int, body: UpdateMeetingRequest, db: Session = Depends(get_db)):
    # 1. Update in the DB
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    meeting.transcript = body.segments
    db.commit()
    db.refresh(meeting)

    # 2. Update the local JSON backup if it exists
    if meeting.audio_file:
        for json_file in TRANSCRIPT_DIR.glob(f"*_*.json"):
            try:
                with open(json_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                
                # Update if it matches this exact meeting
                if data.get("meeting_id") == meeting_id or data.get("audio_file") == meeting.audio_file:
                    data["segments"] = body.segments
                    with open(json_file, "w", encoding="utf-8") as f:
                        json.dump(data, f, indent=4)
                    break
            except Exception as e:
                print(f"Failed to update JSON backup {json_file}: {e}")

    return {"id": meeting_id, "segments": body.segments}

@app.get("/debug/ai")
def debug_ai():
    from backend.services.ai_insights import generate_insights

    test_text = "Alice: We need to finish the report. Bob: I will handle it."

    result = generate_insights(test_text)

    return result

@app.post("/meetings/{meeting_id}/generate-insights")
def generate_meeting_insights(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    transcript = meeting.transcript

    from backend.services.ai_insights import transcript_to_text, generate_insights

    transcript_text = transcript_to_text(transcript)

    insights = generate_insights(transcript_text)

    summary = insights.get("summary", "")
    action_items = insights.get("action_items", [])
    improvements = insights.get("improvements", [])

    existing = db.query(MeetingInsights).filter(
        MeetingInsights.meeting_id == meeting.id
    ).first()

    if existing:
        existing.summary_text = summary
        existing.action_items_json = json.dumps({
            "actions": action_items,
            "improvements": improvements
        })
    else:
        new = MeetingInsights(
            meeting_id=meeting.id,
            summary_text=summary,
            action_items_json=json.dumps({
                "actions": action_items,
                "improvements": improvements
            })
        )
        db.add(new)

    db.commit()

    return {
        "summary": summary,
        "action_items": action_items,
        "improvements": improvements
    }
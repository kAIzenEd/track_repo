
```md
# kAI Track

kAI Track is an AI-driven meeting assistant MVP that transcribes meeting audio into structured text with timestamps, stores meeting history, and provides a foundation for upcoming features like speaker diarization, summarization, and action-item extraction.

This project is being built as a local-first prototype with a FastAPI backend, SQLite storage, and a React-based frontend for testing and iteration.

---

## Current Features (Sprint 1 Complete)

- Audio upload and transcription using Whisper (accurate and fast modes)
- Timestamped transcript segmentation
- Automatic saving of transcripts to:
  - Local JSON files
  - SQLite database
- Meeting history API endpoints
- React MVP dashboard:
  - Drag-and-drop audio upload
  - Transcript display in a structured table
  - Meeting archive sidebar with transcript retrieval

---

## Upcoming Features (Sprint 2 and Beyond)

- Speaker diarization ("who said what")
- Speaker labeling and renaming in the UI
- Meeting summarization using LLMs
- Action-item extraction and assignment
- Task manager integration and workflow completion

---

## Project Structure

```

kAI_track/
│
├── backend/
│   ├── main.py                # FastAPI entrypoint
│   ├── db.py                  # Database engine + session
│   ├── models.py              # SQLAlchemy meeting model
│   ├── init_db.py             # Initializes SQLite database
│   │
│   ├── services/
│   │   └── transcribe.py       # Whisper transcription logic
│   │
│   ├── storage/
│       ├── kai_track.db        # SQLite database file
│       ├── audio/              # Uploaded audio files
│       └── transcripts/        # Saved transcript JSON outputs
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main UI orchestration
│   │   ├── App.css             # Liquid-glass style UI base
│   │   ├── index.css           # Global styling
│   │   │
│   │   ├── api/
│   │   │   └── backend.js       # Backend request helpers
│   │   │
│   │   └── components/
│   │       ├── UploadBox.jsx
│   │       ├── MeetingSidebar.jsx
│   │       └── TranscriptTable.jsx
│   │
│   └── package.json
│
├── README.md
└── whisper_test.py             # Early experimentation file

````

---

## Requirements

### Core Stack

- Python 3.12+
- Node.js 18+
- NVIDIA GPU recommended (RTX 3050 works)

---

## Backend Setup (WSL Recommended)

### 1. Create and activate environment

```bash
cd kAI_track
python3 -m venv venv
source venv/bin/activate
````

### 2. Install dependencies (uv only)

```bash
uv pip install fastapi uvicorn sqlalchemy
uv pip install torch whisperx numpy==1.26.4
```

### 3. Initialize the database

```bash
python -m backend.init_db
```

This creates:

* `backend/storage/kai_track.db`

### 4. Run backend server

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be live at:

* http://<WSL-IP>:8000
* Swagger docs: http://<WSL-IP>:8000/docs

To find your WSL IP:

```bash
hostname -I
```

---

## Backend Setup (Windows Terminal Alternative)

If running without WSL:

```powershell
cd kAI_track
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy
pip install torch whisperx numpy==1.26.4
python -m backend.init_db
uvicorn backend.main:app --reload
```

---

## Frontend Setup (React Dashboard)

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Start the frontend dev server

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

Frontend will run at:

* [http://localhost:5173](http://localhost:5173)

Make sure the backend is running before uploading files.

---

## How Transcription Works

1. Upload `.wav` or `.mp3` file from the frontend
2. Backend runs Whisper transcription
3. Transcript segments are generated with timestamps
4. Results are stored in:

   * SQLite (`meetings` table)
   * JSON transcript archive
5. Frontend displays transcript + meeting history

---

## Notes

* Accurate mode uses larger Whisper models and may be slower.
* Fast mode is intended for quick testing and iteration.
* Speaker diarization will be added in Sprint 2 using a cloud-based MVP approach for reliability.

---

## Next Development Step


* Transcript history UI improvements
* Speaker diarization integration
* Speaker-to-text mapping inside transcripts

---

```


Transcript History UI upgrade (full archive view + playback + speaker-ready structure).
```

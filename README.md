# kAI Track

> AI-driven meeting assistant MVP for structured transcription and meeting intelligence.

---

## Introduction

**kAI Track** is a local-first AI-powered meeting assistant designed to transcribe meeting audio into structured, timestamped text. It stores meeting history and lays the foundation for advanced features such as speaker diarization, summarization, and action-item extraction.

This MVP is built with:

- **Backend:** FastAPI  
- **Database:** SQLite  
- **Frontend:** React (Vite)  
- **Transcription Engine:** Whisper  

---

## Table of Contents

- [Current Features](#current-features-sprint-1-complete)
- [Upcoming Features](#upcoming-features-sprint-2-and-beyond)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
  - [1. Install Git](#1-install-git)
  - [2. Authenticate with GitHub](#2-authenticate-with-github)
  - [3. Clone the Repository](#3-clone-the-repository)
  - [4. Install Python 3.12](#4-install-python-312)
  - [5. Create Virtual Environment](#5-create-and-activate-a-python-virtual-environment)
  - [6. Install uv](#6-install-uv)
  - [7. Install Python Dependencies](#7-install-python-dependencies)
  - [8. Create Storage Directories](#8-create-storage-directories)
  - [9. Initialize the Database](#9-initialize-the-database)
  - [10. Run the Backend](#10-run-the-backend-fastapi)
  - [11. Run the Frontend](#11-frontend-install-and-run-react--vite)
  - [12. End-to-End Testing](#12-test-end-to-end)
  - [13. Verification Commands](#13-useful-verification-commands)

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
  - Structured transcript display
  - Meeting archive sidebar with retrieval

---

## Upcoming Features (Sprint 2 and Beyond)

- Speaker diarization ("who said what")
- Speaker labeling and renaming in the UI
- LLM-powered meeting summarization
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
```

---

# Installation & Setup

---

## 1. Install Git

### WSL / Ubuntu

```bash
sudo apt update
sudo apt install -y git curl unzip
git --version
```
### Windows (PowerShell)
#### Download and run the installer:
```
https://git-scm.com/download/win
```
### Verify:
```
git --version
```
##### 2. Authenticate with GitHub (Recommended: GitHub CLI)
##### Using gh avoids token copy/paste issues when cloning private repositories.

### WSL / Ubuntu
```
sudo apt install -y gh
gh auth login
```
Choose:

GitHub.com

HTTPS

Authenticate with browser

### Windows (PowerShell)
```
winget install --id GitHub.cli
gh auth login
```
### 3. Clone the Repository
Replace with your repository if different.

### WSL / Ubuntu
```
cd ~/projects
git clone https://github.com/kAIzenEd/track_repo.git
cd track_repo
```
### Windows (PowerShell)
```
cd C:\Users\<YourUser>\projects
git clone https://github.com/kAIzenEd/track_repo.git
cd track_repo
```
If the repository is private and prompts for credentials, ensure gh auth login has been completed.

## 4. Install Python 3.12
### WSL / Ubuntu
```
sudo apt install -y python3.12 python3.12-venv python3-pip
python3.12 --version
```
### Windows
```
Download installer:
https://www.python.org/downloads/release/python-3123/

During installation:

Check "Add Python to PATH"
```
#### Verify:
```
python --version
```
## 5. Create and Activate a Python Virtual Environment
### WSL / Ubuntu
```
python3.12 -m venv venv
source venv/bin/activate
```
### Windows (PowerShell)
```
python -m venv venv
venv\Scripts\activate
```
## 6. Install uv
### macOS / Linux / WSL
```
curl -LsSf https://astral.sh/uv/install.sh | sh
uv --version
```
### Windows (PowerShell)
```
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
uv --version
```
If uv is unavailable, you may use pip install directly.

## 7. Install Python Dependencies
##### If requirements.txt exists:
```
uv pip install -r requirements.txt
```
##### Otherwise, install core backend dependencies:
```
uv pip install fastapi uvicorn[standard] sqlalchemy python-multipart requests
uv pip install numpy==1.26.4
uv pip install torch torchaudio
uv pip install whisperx faster-whisper
```
## Notes
### numpy < 2 (1.26.4) is required.

For GPU acceleration, install the correct torch wheel for your CUDA version from:
https://pytorch.org/

## 8. Create Storage Directories
```
mkdir -p backend/storage/audio
mkdir -p backend/storage/transcripts
```
## 9. Initialize the Database
```
python -m backend.init_db
```
This creates:
```
backend/storage/kai_track.db
```
## 10. Run the Backend (FastAPI)
### Development (Linux / WSL)
```
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```
### Windows
```
uvicorn backend.main:app --reload
```
Verify:

Open:
```
http://localhost:8000/docs
```
(Use WSL IP if accessing from Windows browser.)

## 11. Frontend: Install and Run (React / Vite)
```
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```
Open the URL printed by Vite (usually):
```
http://localhost:5173
```
## 12. Test End-to-End
+ Ensure backend is running.
+ Ensure frontend is running.
+ Open the frontend UI.
+ Upload a .wav or .mp3 file.

Confirm:

* File uploads to /transcribe
* Transcript JSON is saved in backend/storage/transcripts
* Meeting appears in /meetings
* Meeting appears in frontend sidebar

## 13. Useful Verification Commands
- git status
- python --version
- uv --version
- npm -v
- node -v
- uvicorn --version

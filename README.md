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

## Project Architecture

This project uses a **Two-Venv Architecture** to prevent dependency conflicts between `faster-whisper` and `pyannote.audio`.

1. **Main Environment (`venv`)**:
   - Runs the FastAPI web server, SQLite database, and WhisperX transcription.
   - Dependencies: `requirements-main.txt`
2. **Pyannote Environment (`venv_pyannote`)**:
   - Strictly used by the backend via a subprocess to perform speaker diarization.
   - Dependencies: `requirements-diarize.txt`

The frontend is a standard Vite + React application in the `frontend/` folder.

---

# 🚀 Getting Started (Beginner Guide)

This guide is for anyone setting up the project for the first time on **Windows**. Follow these steps exactly.

---

## Step 1: Install the Tools
You need three main things installed on your computer:
1. **Git**: Used to download and update code. [Download here](https://git-scm.com/download/win).
2. **Python 3.12**: The language the "brain" of the app uses. [Download here](https://www.python.org/downloads/release/python-3123/). 
   - **IMPORTANT**: During installation, check the box that says **"Add Python to PATH"**.
3. **Node.js**: Used for the "visual" part of the app. [Download here (LTS version)](https://nodejs.org/).

---

## Step 2: Clone the Project
1. Open **PowerShell** (Click Start, type "PowerShell").
2. Type these commands one by one:
   ```powershell
   cd Desktop
   git clone https://github.com/kAIzenEd/track_repo.git
   cd track_repo
   ```

---

## Step 3: Setup the Backend (The "Brain")
The app uses two separate environments to keep things clean and avoid crashes.

### 3a. Main Environment (Transcription)
1. In the same PowerShell window, type:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   pip install uv
   uv pip install -r requirements-main.txt
   ```
2. Keep this window open.

### 3b. Diarization Environment (Speaker Identification)
1. Open a **SECOND** PowerShell window.
2. Navigate to the project folder:
   ```powershell
   cd Desktop/track_repo
   ```
3. Type these commands:
   ```powershell
   python -m venv backend\services\diarize\venv_pyannote
   .\backend\services\diarize\venv_pyannote\Scripts\activate
   pip install uv
   uv pip install -r requirements-diarize.txt
   ```
4. You can close this second window after it finishes.

---

## Step 4: Configure & Initialize
1. Go back to your **FIRST** PowerShell window (the one where `(venv)` is visible on the left).
2. Create your storage folders:
   ```powershell
   mkdir -p backend/storage/audio
   mkdir -p backend/storage/transcripts
   ```
3. Initialize the database:
   ```powershell
   python -m backend.init_db
   ```
4. **HuggingFace Token**: 
   - Create a file named `.env` inside the `backend` folder.
   - Go to [Hugging Face](https://huggingface.co/settings/tokens) and get a token.
   - Paste this inside your `.env` file: `HF_TOKEN=your_token_here`

---

## Step 5: Run the App!
You need two things running at the same time:

### 1. The Backend
In your PowerShell window with `(venv)` active:
```powershell
uvicorn backend.main:app --reload
```

### 2. The Frontend (The Visuals)
1. Open a **NEW** PowerShell window.
2. Type:
   ```powershell
   cd Desktop/track_repo/frontend
   npm install
   npm run dev
   ```
3. Open your browser and go to the link it shows (usually `http://localhost:5173`).

---

# 🛠 Project Architecture (Technical)

This project uses a **Two-Venv Architecture**...


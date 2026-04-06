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

## Sprint 3 (Complete)
- **Local AI Agents:** Fully integrated Ollama for private, on-device Insights generation.
- **Agent Roles:** Setup CrewAI / Multi-agent pipelines to handle distinct summary, action item, and process improvement tasks.

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

# 🚀 Quick Start (Docker - Recommended)

The easiest way to give this project to a friend or set it up on a new machine is using **Docker**. They don't need to install Python, Node, or manage virtual environments.

### 📥 0. Download the Project
[**⬇️ Download Project Zip**][https://www.transfernow.net/dl/20260406FMTe5wBT] 
*Unzip this file before proceeding to the steps below.*

### 1. Prerequisites
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
- Create a `.env` file inside the `backend/` folder and add your HuggingFace token:
  ```env
  HF_TOKEN=your_token_here
  ```
- **IMPORTANT - Hugging Face Authorization:**
  Before Pyannote can diarize audio, you MUST visit Hugging Face and accept the user conditions for these two models using the same account attached to your token:
  1. [pyannote/speaker-diarization-3.1](https://huggingface.co/pyannote/speaker-diarization-3.1)
  2. [pyannote/segmentation-3.0](https://huggingface.co/pyannote/segmentation-3.0)

### 2. Run with One Command
Open a terminal in the project root and run:
```bash
docker-compose up --build -d
```
- **App Dashboard:** [http://localhost](http://localhost) (or port 80/3000)
- **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

# 🛠 Manual Setup (Advanced / Legacy)

If you prefer to run the project without Docker, follow these steps exactly.

## Step 1: Install Tools
Install **Git**, **Python 3.12** (add to PATH), and **Node.js** (LTS).

## Step 2: Setup Environments
This project uses a **Two-Venv Architecture** to avoid dependency conflicts.

### Backend (Main)
```powershell
python -m venv venv
.\venv\Scripts\activate
pip install uv
uv pip install -r requirements-main.txt
```

### Diarization Service
```powershell
python -m venv backend/services/diarize/venv_pyannote
.\backend\services\diarize\venv_pyannote\Scripts\activate
pip install uv
uv pip install -r requirements-diarize.txt
```

## Step 3: Run Manually
You need **three** things running in separate terminals:

1. **Diarize Service:** `uvicorn backend.services.diarize.api:app --port 8001`
2. **Main Backend:** `uvicorn backend.main:app --reload`
3. **Frontend:** `cd frontend && npm install && npm run dev`

---

## Project Architecture (Technical)

kAI Track is now a containerized multi-service application:
- **Frontend:** Nginx/React (Port 80)
- **Backend:** FastAPI/WhisperX (Port 8000)
- **Diarization:** FastAPI/Pyannote (Port 8001 - Internal)
- **Ollama:** Local LLM Server (Port 11434)


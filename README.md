# 🎙️ kAI Track

[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/release/python-3120/)
[![WhisperX](https://img.shields.io/badge/AI-WhisperX-red.svg)](https://github.com/m-bain/whisperx)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

**kAI Track** is a local-first AI meeting assistant that converts audio recordings into readable meeting transcripts with timestamps. It eliminates the need for manual note-taking by providing a structured, searchable record of your discussions.

---

## ✨ Features

### ✅ Current Capabilities
* **High-Accuracy Transcription:** Converts `.wav` and `.mp3` recordings into text using Whisper Large V3 Turbo.
* **Precise Timestamps:** Adds start/end times to every segment for easy reference.
* **Privacy-First:** All processing happens locally on your machine—no cloud uploads required.
* **VAD Integration:** Uses Silero VAD to intelligently skip silent portions of audio.

### 🛠️ Coming Soon (Roadmap)
* **Speaker Diarization:** Identify and label unique voices (Speaker A, Speaker B).
* **AI Summarization:** Generate "Too Long; Didn't Read" (TL;DR) meeting abstracts.
* **Action Item Extraction:** Automatically detect tasks and assignments.
* **Task Manager UI:** A dedicated dashboard to track and edit assigned responsibilities.

---

## 📂 Project Structure

```text
kAI_track/
├── backend/
│   ├── services/
│   │   └── transcribe.py    # Core transcription logic (WhisperX)
│   ├── storage/
│   │   ├── audio/           # Input directory for .wav/.mp3 files
│   │   └── transcripts/     # JSON/Text output destination
│   └── test_transcribe.py   # CLI Test runner script
├── frontend/                # [Planned] React/FastAPI Dashboard
└── README.md
⚙️ Setup Instructions
Prerequisites
Python 3.12

FFmpeg: Required for audio processing.

NVIDIA GPU (Recommended): Ensure CUDA drivers are installed for 10x faster transcription.

Option 1: WSL Ubuntu (Recommended)
Open WSL:

Bash
wsl
cd /mnt/c/Users/Admin/Desktop/Python/kAI_track
Activate Environment:

Bash
source ../venv/bin/activate
Install Dependencies:

Bash
uv pip install "numpy<2"
uv pip install torch==2.5.1 torchaudio==2.5.1
uv pip install git+[https://github.com/m-bain/whisperx.git](https://github.com/m-bain/whisperx.git) --no-deps
Option 2: Windows CMD / PowerShell
Navigate to Project:

DOS
cd C:\Users\Admin\Desktop\Python\kAI_track
..\venv\Scripts\activate
Install Dependencies:

DOS
uv pip install "numpy<2"
uv pip install torch==2.5.1 torchaudio==2.5.1
uv pip install git+[https://github.com/m-bain/whisperx.git](https://github.com/m-bain/whisperx.git) --no-deps
▶️ Running Transcription
Add Audio: Place your file (e.g., meeting.wav) in backend/storage/audio/.

Execute Runner:

Bash
python backend/test_transcribe.py
Check Output: The console will display the timestamped segments:

Plaintext
[0.00 - 2.50] Hello everyone.
[2.51 - 6.10] Thanks for joining today's meeting.

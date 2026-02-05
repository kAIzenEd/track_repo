# 🎙️ kAI Track

**kAI Track** is a local-first AI meeting assistant that converts audio recordings into readable meeting transcripts with timestamps.

The goal of this project is to build an end-to-end workflow for:

- Audio transcription  
- Speaker separation (diarization)  
- Meeting summarization  
- Action item extraction  
- Task assignment  

Currently, the project supports **local transcription** using WhisperX.

---

## ✨ Features

### ✅ Audio Transcription (Implemented)

- Converts `.wav` and `.mp3` meeting recordings into text
- Adds timestamps to each spoken segment
- Runs locally using GPU (if available)

Example output:

[0.00 - 2.50] Hello everyone
[2.51 - 6.10] Thanks for joining today's meeting


---

## 🛠 Technologies Used

- **WhisperX** — Speech-to-text transcription pipeline  
- **Whisper Large V3 Turbo** — Open-source transcription model  
- **PyTorch** — Deep learning runtime  
- **CUDA (optional)** — GPU acceleration  
- **Silero VAD** — Skips silent parts of audio  

---

## 📂 Project Structure

kAI_track/
│
├── backend/
│ ├── services/
│ │ └── transcribe.py # Core transcription logic
│ │
│ ├── storage/
│ │ ├── audio/ # Place audio files here
│ │ └── transcripts/ # Transcript outputs (later)
│ │
│ └── test_transcribe.py # Test runner script
│
├── frontend/ # UI will be added later
│
└── README.md


---

## ✅ Requirements

- Python **3.12**
- NVIDIA GPU (optional, but recommended)
- Audio formats supported: **WAV, MP3**

---

# ⚙️ Setup Instructions

## Option 1 — Setup in WSL Ubuntu (Recommended)

### Step 1: Open WSL

```bash
wsl
Step 2: Go to the project folder
cd /mnt/c/Users/Admin/Desktop/Python/kAI_track
Step 3: Activate your virtual environment
source ../venv/bin/activate
You should see:

(venv) jordan@...
Step 4: Install dependencies (using uv)
uv pip install "numpy<2"

uv pip install torch==2.5.1 torchaudio==2.5.1

uv pip install git+https://github.com/m-bain/whisperx.git --no-deps
Option 2 — Setup in Windows CMD / PowerShell
Step 1: Open Command Prompt
Press:

Win + R → cmd
Step 2: Go to the project folder
cd C:\Users\Admin\Desktop\Python\kAI_track
Step 3: Activate virtual environment
..\venv\Scripts\activate
You should see:

(venv)
Step 4: Install dependencies
uv pip install "numpy<2"

uv pip install torch==2.5.1 torchaudio==2.5.1

uv pip install git+https://github.com/m-bain/whisperx.git --no-deps
▶️ Running Transcription
Step 1: Add an audio file
Place a .wav or .mp3 file inside:

backend/storage/audio/
Example:

backend/storage/audio/test.wav
Step 2: Run the test script
From the root project folder:

In WSL:
python backend/test_transcribe.py
In Windows CMD:
python backend\test_transcribe.py
Expected Output
[0.00 - 3.20] Hello everyone
[3.21 - 6.50] Welcome to the meeting
...
Notes
Transcription accuracy depends on audio clarity

Multi-speaker recordings may be less accurate until diarization is added

GPU support improves speed significantly

License
This project uses open-source models and libraries (WhisperX, Whisper, PyTorch).

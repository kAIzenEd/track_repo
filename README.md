# kAI Track Assistant 🎙️🤖

> **An offline, AI-driven meeting assistant for structured transcription, speaker diarization, and meeting intelligence.**

kAI Track leverages state-of-the-art AI models to automatically transcribe audio, identify *who* spoke *when* (diarization), and pass the transcripts to a local multi-agent LLM pipeline to generate summaries, action items, and process improvements—**all while running 100% locally and privately on your machine.**

---

## 🚀 The "Zero-Error" Setup Guide

You do **NOT** need to install Python, Node.js, `pip`, `npm`, or configure tricky computer "PATH" variables. This project relies entirely on **Docker** to automatically create sterile, perfect environments for the AI models on your system. 

Follow these steps exactly, and the app will boot flawlessly. If you get an error, re-read these steps!

### Step 1: Download the Project
1. If you are downloading a `.zip` file: Right-click the `.zip` file and select **"Extract All"**. Open the extracted folder.
2. If you are using GitHub: Run `git clone https://github.com/kAIzenEd/track_repo.git` in your terminal, then type `cd kAI_track`.

### Step 2: Install Docker Desktop 🐳
The engine that runs the isolated app.
1. Download [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. Run the installer. 
3. **Important**: Open the Docker Desktop application after it installs! You must see a **Green Light** (or "Engine Running") in the bottom corner of Docker Desktop before proceeding to the next steps.

### Step 3: Get Your Hugging Face Key 🔑
The application uses the famous `Pyannote` AI to figure out who is speaking. To use it for free, you must quickly authorize your account.
1. Go to [HuggingFace.co](https://huggingface.co/) and create a free account.
2. **You MUST visit these two pages and click "Agree and access repository"** (if you don't do this, the app will crash):
   - ➜ [Accept Pyannote Speaker Diarization 3.1](https://huggingface.co/pyannote/speaker-diarization-3.1)
   - ➜ [Accept Pyannote Segmentation 3.0](https://huggingface.co/pyannote/segmentation-3.0)
3. Go to your [Hugging Face Access Tokens Page](https://huggingface.co/settings/tokens).
4. Click **"Create new token"** (Type: Read) and copy the long token code starting with `hf_...`.

### Step 4: Configure Your `.env` Secret
1. Open the `kAI_track/backend/` folder.
2. Create a brand new file exactly named: `.env` (make sure Windows doesn't name it `.env.txt`).
3. Open it in Notepad and paste your token exactly like this:
   ```env
   HF_TOKEN=hf_your_long_token_code_goes_here
   ```
4. Save the file.

### Step 5: Start the App! 🟢
1. Open your terminal (**PowerShell** or Command Prompt).
2. Change into the project directory (where the `docker-compose.yml` file is):
   ```bash
   cd path/to/the/folder/kAI_track
   ```
3. Run the magical Docker command:
   ```bash
   docker-compose up --build -d
   ```
   *Note: Go grab a coffee! ☕ If this is your very first time running it, Docker will download Ubuntu, Node, Python, WhisperX, Pyannote, and Ollama LLM models from scratch. It could take 60+ minutes depending on your internet connection. Next time you run the app, it will boot in seconds.*

### Step 6: Use It!
Once your terminal finishes and returns you to the prompt:
- 🖥️ **Open your Browser to:** [http://localhost](http://localhost) (or `http://localhost:3000`) to view the beautiful User Interface.
- ⚙️ **API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)

*(To turn it off entirely later, open the terminal in the folder and type: `docker-compose down`)*

---

## 🧠 What's Happening Under The Hood?
This project uses an advanced **Docker Multi-Container Microservice Architecture**:
- **`frontend` Container:** Compiles the React + Vite dashboard and serves it hyper-fast via an Alpine Nginx proxy that securely routes API calls to the backend automatically.
- **`backend` Container:** Runs FastAPI and WhisperX to transcribe your audio cleanly. Handles database tracking and storage bindings.
- **`diarize` Container:** Because Pyannote requires immensely specific PyTorch dependencies, it has been carved out into a 30-line FastAPI microservice! The main backend talks to it via HTTP to get timestamps of different speakers securely, preventing dependency hell.
- **`ollama` Container:** Serves local LLMs (`nemotron-3-nano:4b`) using your system's hardware. The LLMs read the meeting transcript, debate privately using DeepSeek reasoning tracks, and finally output perfectly structured Meeting Summaries and Action Items.

The data (`audio`, `transcripts`, `sqlite databases`, and `LLM model weights`) is physically mounted back to your host machine's hard drive so you permanently own your data.

---

## 🛠️ Advanced / Developer Setup (Manual Workflow)
If you refuse to use Docker or are explicitly developing new backend code requiring `pdb` breakpoints, follow this logic.

### Dependencies
1. Install Python 3.10-3.12 (Add to PATH) and install `uv`.
2. Install Node.js (LTS).

### Environment 1: Core App
1. In the root, create: `python -m venv venv` and activate it.
2. `uv pip install -r requirements-main.txt`
3. Run: `uvicorn backend.main:app --reload`

### Environment 2: Isolated Diarization
1. Create a 2nd terminal.
2. Create: `python -m venv backend/services/diarize/venv_pyannote` and activate it.
3. `uv pip install -r requirements-diarize.txt`
4. Run: `uvicorn backend.services.diarize.api:app --port 8001`
*(The backend tries `DIARIZE_URL=http://localhost:8001/diarize`. If it fails, it has a built-in hybrid fallback to attempt to find the `venv_pyannote/python.exe` and execute it automatically).*

### Frontend
1. Create a 3rd terminal.
2. `cd frontend && npm install`
3. `npm run dev`

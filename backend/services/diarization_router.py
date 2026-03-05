from pathlib import Path
import subprocess
import json
import os
from typing import List, Dict


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DIARIZE_DIR = PROJECT_ROOT / "backend" / "services" / "diarize"

# Handle Windows vs Linux/Mac venv structure
if os.name == 'nt':
    PYANNOTE_VENV_PYTHON = DIARIZE_DIR / "venv_pyannote" / "Scripts" / "python.exe"
else:
    PYANNOTE_VENV_PYTHON = DIARIZE_DIR / "venv_pyannote" / "bin" / "python"

PYANNOTE_SCRIPT = DIARIZE_DIR / "run_pyannote.py"


class DiarizationError(Exception):
    pass


def diarize_with_pyannote(audio_path: str) -> List[Dict]:
    """
    Run pyannote diarization via isolated venv subprocess.
    """

    if not Path(audio_path).exists():
        raise DiarizationError(f"Audio file not found: {audio_path}")

    # Ensure venv Python exists
    if not PYANNOTE_VENV_PYTHON.exists():
        raise DiarizationError(
            f"Pyannote venv not found at {PYANNOTE_VENV_PYTHON}. "
            "Please run the setup script to create the diarization environment."
        )

    result = subprocess.run(
        [
            str(PYANNOTE_VENV_PYTHON),
            str(PYANNOTE_SCRIPT),
            audio_path
        ],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        raise DiarizationError(result.stderr or result.stdout)

    try:
        data = json.loads(result.stdout)
    except json.JSONDecodeError:
        raise DiarizationError("Invalid JSON returned from diarization")

    if not data.get("success"):
        raise DiarizationError(data.get("error", "Unknown diarization error"))

    return data["segments"]
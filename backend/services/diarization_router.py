from pathlib import Path
from typing import List, Dict
import os
import requests

class DiarizationError(Exception):
    pass

def diarize_with_pyannote(audio_path: str) -> List[Dict]:
    """
    Call the isolated Pyannote Docker microservice via HTTP.
    Uses 'diarize' host from docker-compose, or localhost if run locally.
    """
    if not Path(audio_path).exists():
        raise DiarizationError(f"Audio file not found: {audio_path}")

    diarize_url = os.environ.get("DIARIZE_URL", "http://localhost:8001/diarize")
    
    try:
        response = requests.post(diarize_url, json={"audio_path": str(audio_path)}, timeout=1200) # Give long timeout for huge audio
        
        if response.status_code != 200:
            raise DiarizationError(f"Diarize service error (HTTP {response.status_code}): {response.text}")
            
        data = response.json()
        if not data.get("success"):
            raise DiarizationError("Diarization failed internally.")
            
        return data.get("segments", [])
        
    except requests.exceptions.RequestException as e:
        raise DiarizationError(f"Could not connect to diarize service container ({diarize_url}): {e}")
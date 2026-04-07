from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sys
import json
import os
import warnings
from pathlib import Path

import torch
from dotenv import load_dotenv
from pyannote.audio import Pipeline

warnings.filterwarnings("ignore", message="std(): degrees of freedom is <= 0")
warnings.filterwarnings("ignore", category=UserWarning, module="pyannote.audio.models.blocks.pooling")

torch.backends.cuda.matmul.allow_tf32 = True
torch.backends.cudnn.allow_tf32 = True

MODEL_ID = "pyannote/speaker-diarization-community-1"

# Automatically load the HF token from the environment variable (or .env if copied over)
load_dotenv(dotenv_path="/app/.env")
token = os.getenv("HF_TOKEN")

app = FastAPI(title="kAI Track - Diarization Microservice")

print("Initializing Pyannote Diarization Pipeline...")
try:
    if token:
        pipeline = Pipeline.from_pretrained(MODEL_ID, token=token)
    else:
        pipeline = Pipeline.from_pretrained(MODEL_ID, local_files_only=True)
    device = torch.device("cpu") # Adjust to "cuda" if hardware supports it dynamically
    pipeline.to(device)
    pipeline_loaded = True
    print("Diarization pipeline highly loaded into RAM successfully.")
except Exception as e:
    print(f"Failed to load pipeline: {e}")
    pipeline_loaded = False
    pipeline = None

class DiarizeRequest(BaseModel):
    audio_path: str

@app.post("/diarize")
def diarize(request: DiarizeRequest):
    if not pipeline_loaded:
        raise HTTPException(status_code=500, detail="Pipeline not loaded (Check HF_TOKEN or manual cache download)")
        
    path = Path(request.audio_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"File not found within storage volume: {path}")

    try:
        output = pipeline(str(path))
        
        segments = []
        if hasattr(output, "speaker_diarization"):
            output = output.speaker_diarization
            
        if hasattr(output, "itertracks"):
            for segment, _, speaker in output.itertracks(yield_label=True):
                segments.append({
                    "start": round(segment.start, 3),
                    "end": round(segment.end, 3),
                    "speaker": speaker
                })
            return {"success": True, "segments": segments}
        else:
            raise TypeError("Unsupported diarization output form")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import sys
import traceback
import warnings
from pathlib import Path

import torch
from dotenv import load_dotenv
from pyannote.audio import Pipeline
import pyannote.audio

warnings.filterwarnings("ignore", message="std(): degrees of freedom is <= 0")
warnings.filterwarnings(
    "ignore", category=UserWarning, module="pyannote.audio.models.blocks.pooling"
)

# Reduce CPU thread contention / memory spikes in Docker
torch.set_num_threads(2)
torch.set_num_interop_threads(1)

torch.backends.cuda.matmul.allow_tf32 = True
torch.backends.cudnn.allow_tf32 = True

PYANNOTE_MAJOR = int(pyannote.audio.__version__.split(".")[0])

pipeline = None
pipeline_loaded = False


def _model_id() -> str:
    if PYANNOTE_MAJOR >= 4:
        return "pyannote/speaker-diarization-community-1"
    return "pyannote/speaker-diarization-3.1"


def _load_pipeline(hf_token: str | None):
    model_id = _model_id()
    if hf_token:
        if PYANNOTE_MAJOR >= 4:
            return Pipeline.from_pretrained(model_id, token=hf_token)
        return Pipeline.from_pretrained(model_id, use_auth_token=hf_token)
    return Pipeline.from_pretrained(model_id, local_files_only=True)


load_dotenv()
token = os.getenv("HF_TOKEN")


@asynccontextmanager
async def lifespan(app: FastAPI):
    global pipeline, pipeline_loaded
    print(
        f"Initializing Pyannote Diarization Pipeline "
        f"(pyannote.audio {pyannote.audio.__version__}, model {_model_id()})...",
        flush=True,
    )
    try:
        pipeline = _load_pipeline(token)
        pipeline.to(torch.device("cpu"))
        pipeline_loaded = True
        print("Diarization pipeline loaded into RAM successfully.", flush=True)
    except Exception as e:
        traceback.print_exc()
        print(f"Failed to load pipeline: {e}", flush=True)
        pipeline_loaded = False
        pipeline = None
    yield
    pipeline = None
    pipeline_loaded = False


app = FastAPI(title="kAI Track - Diarization Microservice", lifespan=lifespan)


@app.get("/health")
def health():
    return {
        "pipeline_loaded": pipeline_loaded,
        "pyannote_version": pyannote.audio.__version__,
        "model": _model_id() if pipeline_loaded else None,
    }


class DiarizeRequest(BaseModel):
    audio_path: str


@app.post("/diarize")
def diarize(request: DiarizeRequest):
    print(f"POST /diarize audio_path={request.audio_path}", flush=True)

    if not pipeline_loaded:
        raise HTTPException(
            status_code=503,
            detail="Pipeline not loaded (check HF_TOKEN and model access)",
        )

    path = Path(request.audio_path)
    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"File not found within storage volume: {path}",
        )

    try:
        size_mb = path.stat().st_size / (1024 * 1024)
        print(f"Running diarization on {path.name} ({size_mb:.1f} MB)...", flush=True)

        with torch.inference_mode():
            output = pipeline(str(path))

        segments = []
        diarization = (
            output.speaker_diarization
            if hasattr(output, "speaker_diarization")
            else output
        )

        if hasattr(diarization, "itertracks"):
            for segment, _, speaker in diarization.itertracks(yield_label=True):
                segments.append(
                    {
                        "start": round(segment.start, 3),
                        "end": round(segment.end, 3),
                        "speaker": speaker,
                    }
                )
        else:
            for turn, speaker in diarization:
                segments.append(
                    {
                        "start": round(turn.start, 3),
                        "end": round(turn.end, 3),
                        "speaker": speaker,
                    }
                )

        print(f"Diarization done: {len(segments)} segments", flush=True)
        return {"success": True, "segments": segments}

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


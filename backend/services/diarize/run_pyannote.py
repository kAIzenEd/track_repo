import sys
import json
import os
import warnings
from pathlib import Path

import torch
from dotenv import load_dotenv
from pyannote.audio import Pipeline

# -----------------------------
# Suppress non-actionable warnings
# -----------------------------
warnings.filterwarnings("ignore", message="std(): degrees of freedom is <= 0")
warnings.filterwarnings("ignore", category=UserWarning, module="pyannote.audio.models.blocks.pooling")

torch.backends.cuda.matmul.allow_tf32 = True
torch.backends.cudnn.allow_tf32 = True

MODEL_ID = "pyannote/speaker-diarization-community-1"


def load_pipeline(token: str | None):
    if token:
        pipeline = Pipeline.from_pretrained(MODEL_ID, token=token)
    else:
        pipeline = Pipeline.from_pretrained(MODEL_ID, local_files_only=True)

    device = torch.device("cpu")
    pipeline.to(device)
    return pipeline


def extract_segments(output):
    segments = []

    # Handle wrapper types
    if hasattr(output, "speaker_diarization"):
        output = output.speaker_diarization

    if hasattr(output, "itertracks"):
        for segment, _, speaker in output.itertracks(yield_label=True):
            segments.append({
                "start": round(segment.start, 3),
                "end": round(segment.end, 3),
                "speaker": speaker
            })
        return segments

    raise TypeError(f"Unsupported diarization output type: {type(output)}")


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Audio path argument required"}))
        sys.exit(1)

    audio_path = sys.argv[1]

    if not Path(audio_path).exists():
        print(json.dumps({"error": f"Audio file not found: {audio_path}"}))
        sys.exit(1)

    # Load token if exists
    project_root = Path(__file__).resolve().parents[3]
    env_path = project_root / "backend" / ".env"
    load_dotenv(dotenv_path=env_path)
    token = os.getenv("HF_TOKEN")

    try:
        pipeline = load_pipeline(token)
        output = pipeline(audio_path)
        segments = extract_segments(output)

        print(json.dumps({
            "success": True,
            "segments": segments
        }))

        sys.exit(0)

    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()
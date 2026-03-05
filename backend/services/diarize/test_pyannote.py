import os
import sys
import time
import warnings
from pathlib import Path

import torch
from dotenv import load_dotenv
from pyannote.audio import Pipeline

# Suppress internal Pyannote warnings that are not actionable
warnings.filterwarnings("ignore", message="std(): degrees of freedom is <= 0")
warnings.filterwarnings("ignore", category=UserWarning, module="pyannote.audio.models.blocks.pooling")


PROJECT_ROOT = Path(__file__).resolve().parents[3]
BACKEND_ROOT = PROJECT_ROOT / "backend"
ENV_PATH = BACKEND_ROOT / ".env"
AUDIO_FILE = BACKEND_ROOT / "storage" / "audio" / "test_audio_4.wav"
MODEL_ID = "pyannote/speaker-diarization-community-1"


load_dotenv(dotenv_path=ENV_PATH)
HF_TOKEN = os.getenv("HF_TOKEN")

# Enable TF32 for better performance (optional, removes the reproducibility warning)
torch.backends.cuda.matmul.allow_tf32 = True
torch.backends.cudnn.allow_tf32 = True


def validate_environment() -> bool:
    if not AUDIO_FILE.exists():
        raise FileNotFoundError(f"Audio file not found: {AUDIO_FILE}")
    if HF_TOKEN is None:
        print("⚠ HF_TOKEN not found. Attempting local-only load.")
        return False
    return True


def load_pipeline(online: bool) -> Pipeline:
    print("Loading Pyannote pipeline...")
    if online:
        pipeline = Pipeline.from_pretrained(MODEL_ID, token=HF_TOKEN)
    else:
        pipeline = Pipeline.from_pretrained(MODEL_ID, local_files_only=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    pipeline.to(device)
    return pipeline


def extract_segments(diarization_output):
    """
    Extract speaker segments from various possible output formats.
    Returns a list of dicts with 'start', 'end', 'speaker'.
    """

    # Handle DiarizeOutput (wrapper from newer pyannote pipelines)
    if hasattr(diarization_output, "speaker_diarization"):
        annotation = diarization_output.speaker_diarization
        return extract_segments(annotation)

    # Handle pyannote.core.Annotation (standard case)
    if hasattr(diarization_output, "itertracks"):
        segments = []
        for segment, _, speaker in diarization_output.itertracks(yield_label=True):
            segments.append({
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "speaker": speaker
            })
        return segments

    # If it's a dictionary (e.g., from some HuggingFace pipelines)
    if isinstance(diarization_output, dict):
        # Look for common keys
        if "segments" in diarization_output:
            for seg in diarization_output["segments"]:
                segments.append({
                    "start": round(seg.get("start", 0), 2),
                    "end": round(seg.get("end", 0), 2),
                    "speaker": seg.get("speaker", "UNKNOWN")
                })
            return segments
        elif "diarization" in diarization_output:
            # Recursively handle nested diarization output
            return extract_segments(diarization_output["diarization"])

    # If it's a list (maybe direct list of segments)
    if isinstance(diarization_output, list):
        for item in diarization_output:
            if isinstance(item, dict) and "start" in item and "end" in item:
                segments.append({
                    "start": round(item["start"], 2),
                    "end": round(item["end"], 2),
                    "speaker": item.get("speaker", "UNKNOWN")
                })
            else:
                # Try to treat item as a tuple (start, end, speaker)
                try:
                    start, end, speaker = item
                    segments.append({
                        "start": round(start, 2),
                        "end": round(end, 2),
                        "speaker": speaker
                    })
                except (ValueError, TypeError):
                    pass
        return segments

    # Last resort: try to use timeline and labels (works for pyannote Annotation without itertracks)
    try:
        from pyannote.core import Annotation
        if isinstance(diarization_output, Annotation):
            for segment in diarization_output.get_timeline():
                labels = diarization_output.get_labels(segment, unique=True)
                if labels:
                    speaker = labels[0]  # assume one speaker per segment
                else:
                    speaker = "UNKNOWN"
                segments.append({
                    "start": round(segment.start, 2),
                    "end": round(segment.end, 2),
                    "speaker": speaker
                })
            return segments
    except ImportError:
        pass

    # If we still have nothing, raise an error with diagnostic info
    raise TypeError(
        f"Cannot extract segments from output of type {type(diarization_output)}. "
        f"Output dir: {dir(diarization_output)}"
    )


def main():
    try:
        online_mode = validate_environment()
        start_time = time.time()

        pipeline = load_pipeline(online=online_mode)

        print("Running diarization...")
        output = pipeline(str(AUDIO_FILE))

        # Debug: print output type (optional, remove in production)
        print(f"Output type: {type(output)}")

        segments = extract_segments(output)

        print("\n=== SPEAKER SEGMENTS ===\n")
        for seg in segments:
            print(f"{seg['start']:.2f} - {seg['end']:.2f} | {seg['speaker']}")

        elapsed = time.time() - start_time
        print(f"\nCompleted in {elapsed:.2f} seconds")

    except Exception as e:
        print(f"\n ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
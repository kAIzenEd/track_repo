import os
import torch
import whisperx
import pandas as pd
from collections import defaultdict
from pyannote.audio import Pipeline

# ============================
# CONFIG
# ============================

device = "cuda" if torch.cuda.is_available() else "cpu"

audio_file = "/mnt/c/Users/Admin/Desktop/Python/kAIzen/test_audio_2.mp3"

hf_token = os.getenv("HF_TOKEN")
if hf_token is None:
    raise ValueError(
        "HF_TOKEN not set.\nRun:\n"
        'export HF_TOKEN="hf_xxxxxxxxxxxxxxxxx"\n'
    )

# ============================
# 1. TRANSCRIBE (WhisperX)
# ============================

print("Loading Whisper model...")

model = whisperx.load_model(
    "large-v3-turbo",
    device=device,
    compute_type="float16",
    vad_method="silero"
)

print("Transcribing...")
result = model.transcribe(audio_file)

print("Detected language:", result["language"])

# ============================
# 2. ALIGN (Word timestamps)
# ============================

print("Loading alignment model...")

model_a, metadata = whisperx.load_align_model(
    language_code=result["language"],
    device=device
)

print("Aligning words...")

result = whisperx.align(
    result["segments"],
    model_a,
    metadata,
    audio_file,
    device
)

# ============================
# 3. DIARIZATION (Pyannote)
# ============================

print("Running diarization (Pyannote)...")

pipeline = Pipeline.from_pretrained(
    "pyannote/speaker-diarization",
    use_auth_token=hf_token
)

annotation = pipeline(audio_file)

# Convert annotation → DataFrame
rows = []
for segment, _, speaker in annotation.itertracks(yield_label=True):
    rows.append(
        {"start": segment.start, "end": segment.end, "speaker": speaker}
    )

diarize_df = pd.DataFrame(rows)

# ============================
# 4. WORD-LEVEL SPEAKER ASSIGNMENT (Most Accurate)
# ============================

def speaker_for_time(t, diarize_df):
    """Find speaker active at time t."""
    match = diarize_df[
        (diarize_df["start"] <= t) & (diarize_df["end"] >= t)
    ]
    if len(match) == 0:
        return "UNKNOWN"
    return match.iloc[0]["speaker"]


print("Assigning speakers to words...")

for seg in result["segments"]:
    if "words" not in seg:
        continue

    for w in seg["words"]:
        mid_time = (w["start"] + w["end"]) / 2
        w["speaker"] = speaker_for_time(mid_time, diarize_df)

# ============================
# 5. SEGMENT SPEAKER = MAJORITY VOTE OF WORDS
# ============================

print("\n===== FINAL SPEAKER TRANSCRIPT =====\n")

for seg in result["segments"]:
    if "words" not in seg:
        continue

    counts = defaultdict(int)
    for w in seg["words"]:
        counts[w["speaker"]] += 1

    # majority speaker
    speaker = max(counts, key=counts.get)

    print(
        f"[{seg['start']:.2f} - {seg['end']:.2f}] {speaker}: {seg['text']}"
    )

print("\nDone.")

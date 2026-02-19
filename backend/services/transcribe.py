import whisperx
import torch


# Use GPU if available
device = "cuda" if torch.cuda.is_available() else "cpu"


def transcribe_audio(audio_path: str, mode: str = "accurate"):
    """
    Transcribes an audio file (WAV/MP3) into timestamped text segments.
    """

    print("Loading WhisperX model...")

    if mode == "fast":
        model_name = "medium"
        compute_type = "int8"
    else:
        model_name = "large-v3-turbo"
        compute_type = "float16"

    print(f"Tryin' real hard to load this stuff bro: {model_name} ({mode})")

    model = whisperx.load_model(
        model_name,
        device=device,
        compute_type=compute_type,
        vad_method="silero"
    )

    print("Tryna transcribe dis audio bruv......")

    result = model.transcribe(audio_path)

    print("Yo yo yo, da audio been done transcribed....\n")

    segments = result["segments"]

# Split long segments into smaller ones
    segments = split_segments(segments, max_duration=3.0)

    return segments


def split_segments(segments, max_duration=3.0):
    """
    Splits long Whisper segments into smaller chunks.
    max_duration = maximum seconds per segment.
    """

    new_segments = []

    for seg in segments:
        start = seg["start"]
        end = seg["end"]
        text = seg["text"].strip()

        duration = end - start

        # If already short enough, keep as-is
        if duration <= max_duration:
            new_segments.append(seg)
            continue

        # Otherwise split into smaller parts
        midpoint = start + duration / 2

        words = text.split()
        half = len(words) // 2

        seg1 = {
            "start": start,
            "end": midpoint,
            "text": " ".join(words[:half])
        }

        seg2 = {
            "start": midpoint,
            "end": end,
            "text": " ".join(words[half:])
        }

        new_segments.append(seg1)
        new_segments.append(seg2)

    return new_segments

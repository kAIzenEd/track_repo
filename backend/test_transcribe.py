from services.transcribe import transcribe_audio


audio_file = "backend/storage/audio/test_audio_2.mp3"  # change if mp3

segments = transcribe_audio(audio_file)

print("\n===== TRANSCRIPT OUTPUT =====\n")

for seg in segments:
    print(f"[{seg['start']:.2f} - {seg['end']:.2f}] {seg['text']}")

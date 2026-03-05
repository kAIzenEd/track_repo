from typing import List, Dict


def compute_overlap(a_start, a_end, b_start, b_end):
    return max(0.0, min(a_end, b_end) - max(a_start, b_start))


def assign_speakers(transcript_segments: List[Dict], diarization_segments: List[Dict]) -> List[Dict]:

    enriched = []

    for t in transcript_segments:
        t_start = float(t["start"])
        t_end = float(t["end"])

        best_speaker = "UNKNOWN"
        best_overlap = 0.0

        for d in diarization_segments:

            d_start = float(d["start"])
            d_end = float(d["end"])
            speaker = d["speaker"]

            overlap = compute_overlap(t_start, t_end, d_start, d_end)

            if overlap > best_overlap:
                best_overlap = overlap
                best_speaker = speaker

        enriched.append({
            "start": t_start,
            "end": t_end,
            "text": t["text"],
            "speaker": best_speaker
        })

    return enriched
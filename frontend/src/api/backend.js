import axios from "axios";

export const BACKEND_URL = "http://172.28.255.166:8000";

export async function fetchMeetings() {
  const res = await axios.get(`${BACKEND_URL}/meetings`);
  return res.data;
}

export async function fetchMeetingById(id) {
  const res = await axios.get(`${BACKEND_URL}/meetings/${id}`);
  return res.data;
}

export async function transcribeAudio(file, mode = "accurate") {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axios.post(
    `${BACKEND_URL}/transcribe?mode=${mode}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 0,
    }
  );
  return res.data;
}

/**
 * updateMeeting — PATCH /meetings/{id}
 *
 * Sends the full edited segments array to the backend.
 * Body: { segments: [{ speaker, start, end, text }, ...] }
 *
 * ─── FastAPI endpoint you need to add ──────────────────────────────────────
 *
 * from pydantic import BaseModel
 * from typing import List, Any
 *
 * class UpdateMeetingRequest(BaseModel):
 *     segments: List[dict]
 *
 * @app.patch("/meetings/{meeting_id}")
 * async def update_meeting(meeting_id: int, body: UpdateMeetingRequest):
 *     # 1. Update in your DB (e.g. SQLite/SQLModel)
 *     # 2. Overwrite the stored JSON file for this meeting
 *     # 3. Return the updated meeting object
 *     ...
 *     return { "id": meeting_id, "segments": body.segments }
 *
 * ──────────────────────────────────────────────────────────────────────────
 */
export async function updateMeeting(id, segments) {
  const res = await axios.patch(`${BACKEND_URL}/meetings/${id}`, { segments });
  return res.data;
}
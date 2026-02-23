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

  const res = await axios.post(`${BACKEND_URL}/transcribe?mode=${mode}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 0, // long running transcripts
  });
  return res.data;
}

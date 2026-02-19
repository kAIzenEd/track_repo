import { useState, useEffect } from "react";
import {
  fetchMeetings,
  fetchMeetingById,
  transcribeAudio,
} from "./api/backend";

import UploadBox from "./components/UploadBox";
import MeetingSidebar from "./components/MeetingSidebar";
import TranscriptTable from "./components/TranscriptTable";

import "./App.css";

export default function App() {
  const [status, setStatus] = useState("Drop an audio file to begin...");
  const [segments, setSegments] = useState([]);
  const [mode, setMode] = useState("accurate");
  const [timeTaken, setTimeTaken] = useState(null);

  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  async function loadMeetingHistory() {
    try {
      const data = await fetchMeetings();
      setMeetings(data);
    } catch (e) {
      console.error("loadMeetings error", e);
    }
  }

  useEffect(() => {
    loadMeetingHistory();
  }, []);

  async function openMeeting(id) {
    try {
      setStatus("Loading saved transcript...");
      setSelectedMeeting(id);
      const data = await fetchMeetingById(id);
      setSegments(data.transcript || []);
      setStatus("✅ Loaded saved transcript!");
    } catch (e) {
      console.error("openMeeting error", e);
      setStatus("❌ Failed to load transcript");
    }
  }

  async function handleUpload(file) {
    try {
      setStatus("Uploading + Transcribing...");
      setSegments([]);
      setTimeTaken(null);

      const start = performance.now();
      const data = await transcribeAudio(file, mode);
      const end = performance.now();

      setTimeTaken(((end - start) / 1000).toFixed(2));
      setSegments(data.segments || []);
      setStatus("✅ Transcript Ready!");
      await loadMeetingHistory();
    } catch (e) {
      console.error("upload error", e);
      setStatus("❌ Transcription failed: " + (e?.message || e));
    }
  }

  return (
    <div className="app-shell">
      <div className="app-grid">
        {/* Sidebar */}
        <div className="sidebar">
          <MeetingSidebar
            meetings={meetings}
            selectedMeeting={selectedMeeting}
            onSelect={openMeeting}
          />
        </div>

        {/* Main Panel */}
        <div className="main-panel">
          <h1>kAI Track</h1>
          <p>AI meeting transcription with timestamps.</p>

          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <select
              className="mode-select"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="accurate">Accurate (Default)</option>
              <option value="fast">Fast Mode</option>
            </select>
          </div>

          <UploadBox onUpload={handleUpload} />

          <p className="status-text">{status}</p>

          {timeTaken && (
            <p style={{ marginTop: 6 }}>
              ⏱ Completed in <b>{timeTaken}s</b> ({mode})
            </p>
          )}

          <TranscriptTable segments={segments} />
        </div>
      </div>
    </div>
  );
}

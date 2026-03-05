import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { fetchMeetings, fetchMeetingById, transcribeAudio } from "./api/backend";

import UploadBox from "./components/UploadBox";
import MeetingSidebar from "./components/MeetingSidebar";
import TranscriptTable from "./components/TranscriptTable";
import TranscriptModal from "./components/TranscriptModal";
import MeetingHistoryPage from "./components/MeetingHistoryPage";
import GlassPanel from "./components/ui/GlassPanel";
import LiquidBackground from "./components/ui/LiquidBackground";
import Snackbar from "./components/ui/Snackbar";
import "./styles/glass.css";

export default function App() {
  const [status, setStatus] = useState("Drop an audio file to begin...");
  const [segments, setSegments] = useState([]);
  const [mode, setMode] = useState("accurate");
  const [timeTaken, setTimeTaken] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [modalMeeting, setModalMeeting] = useState(null);
  const [modalSegments, setModalSegments] = useState([]);
  const [showHistoryPage, setShowHistoryPage] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: "" });

  function showSnackbar(message) {
    setSnackbar({ visible: true, message });
  }

  async function loadMeetingHistory() {
    try {
      const data = await fetchMeetings();
      setMeetings(data);
    } catch (e) {
      console.error("loadMeetings error", e);
    }
  }

  useEffect(() => { loadMeetingHistory(); }, []);

  async function handleSidebarSelect(id) {
    try {
      const data = await fetchMeetingById(id);
      const meeting = meetings.find((m) => m.id === id) ?? { id };
      setModalMeeting(meeting);
      setModalSegments(data.transcript || []);
    } catch (e) {
      console.error("handleSidebarSelect error", e);
      showSnackbar("❌ Could not load transcript.");
    }
  }

  async function handleUpload(file) {
    try {
      setStatus("Uploading + Transcribing...");
      setSegments([]);
      setTimeTaken(null);
      const start = performance.now();
      const data = await transcribeAudio(file, mode);
      setTimeTaken(((performance.now() - start) / 1000).toFixed(2));
      setSegments(data.segments || []);
      setStatus("✅ Transcript Ready!");
      await loadMeetingHistory();
    } catch (e) {
      console.error("upload error", e);
      setStatus("❌ Transcription failed: " + (e?.message || e));
    }
  }

  return (
    <>
      <LiquidBackground />
      <div style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "35px",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{
          width: "100%",
          maxWidth: "1200px",
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: "24px",
          alignItems: "start",
        }}>

          {/* Sidebar */}
          <MeetingSidebar
            meetings={meetings}
            selectedMeeting={modalMeeting?.id}
            onSelect={handleSidebarSelect}
            onViewAll={() => setShowHistoryPage(true)}
          />

          {/* Main panel */}
          <GlassPanel style={{ padding: "36px", height: "85vh", overflowY: "auto" }}>
            <h1 style={{
              margin: "0 0 6px 0",
              background: "linear-gradient(45deg, var(--liquid-primary), var(--liquid-secondary))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              kAI Track
            </h1>
            <p style={{ color: "var(--text-muted)", marginTop: 0, marginBottom: 16 }}>
              AI meeting transcription with liquid precision.
            </p>

            {/* Mode select — plain div, no dropzone anywhere near it */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)" }}>
                Mode:
              </label>
              <select
                className="glass-input"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                style={{ cursor: "pointer" }}
              >
                <option value="accurate">Accurate (Default)</option>
                <option value="fast">Fast Mode</option>
              </select>
            </div>

            {/* UploadBox: dropzone confined to its own inner element */}
            <UploadBox onUpload={handleUpload} />

            <p style={{
              marginTop: 10,
              fontWeight: 600,
              color: status.includes("✅") ? "#1d6e3f"
                   : status.includes("❌") ? "#b91c1c"
                   : "var(--text-main)",
            }}>
              {status}
            </p>

            {timeTaken && (
              <p style={{ marginTop: 4, fontSize: 13, color: "var(--text-muted)" }}>
                ⏱ Completed in <b>{timeTaken}s</b> ({mode})
              </p>
            )}

            <TranscriptTable segments={segments} />
          </GlassPanel>
        </div>
      </div>

      <TranscriptModal
        meeting={modalMeeting}
        segments={modalSegments}
        onClose={() => setModalMeeting(null)}
      />

      <AnimatePresence>
        {showHistoryPage && (
          <MeetingHistoryPage
            meetings={meetings}
            onClose={() => setShowHistoryPage(false)}
            onSnackbar={showSnackbar}
          />
        )}
      </AnimatePresence>

      <Snackbar
        message={snackbar.message}
        visible={snackbar.visible}
        onHide={() => setSnackbar((s) => ({ ...s, visible: false }))}
      />
    </>
  );
}
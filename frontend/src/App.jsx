import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { fetchMeetings, fetchMeetingById, transcribeAudio, BACKEND_URL } from "./api/backend";

import UploadBox from "./components/UploadBox";
import MeetingSidebar from "./components/MeetingSidebar";
import MeetingDetailPanel from "./components/MeetingDetailPanel";
import AIInsightsPanel from "./components/AIInsightsPanel";
import TranscriptTable from "./components/TranscriptTable";
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
  const [modalInsights, setModalInsights] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  
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
      setModalInsights(data.insights || null);
    } catch (e) {
      console.error("handleSidebarSelect error", e);
      showSnackbar("❌ Could not load transcript.");
    }
  }

  async function handleGenerateInsights() {
    if (!modalMeeting) return;
    setLoadingAI(true);
    try {
      const res = await fetch(`${BACKEND_URL}/meetings/${modalMeeting.id}/generate-insights`, { method: "POST" });
      const data = await res.json();
      setModalInsights(data);
      showSnackbar("✅ AI Insights generated successfully!");
    } catch (e) {
      console.error(e);
      showSnackbar("❌ Failed to generate insights.");
    }
    setLoadingAI(false);
  }

  async function handleUpload(file) {
    try {
      setModalMeeting(null);
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
          maxWidth: "1400px",
          display: "grid",
          gridTemplateColumns: "280px 1fr 340px",
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
          <GlassPanel style={{ padding: "32px", height: "85vh", display: "flex", flexDirection: "column" }}>
            <div style={{ flexShrink: 0, marginBottom: modalMeeting ? 24 : 0 }}>
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

              <UploadBox onUpload={handleUpload} />

              {(status !== "Drop an audio file to begin..." || timeTaken) && (
                <div style={{ marginTop: 16 }}>
                  <p style={{
                    margin: 0,
                    fontWeight: 600,
                    color: status.includes("✅") ? "#1d6e3f"
                        : status.includes("❌") ? "#b91c1c"
                        : "var(--text-main)",
                  }}>
                    {status}
                  </p>
                  {timeTaken && (
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
                      ⏱ Completed in <b>{timeTaken}s</b> ({mode})
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Transcript Table / Details Display */}
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", marginTop: 16 }}>
              {modalMeeting ? (
                <MeetingDetailPanel
                  meeting={modalMeeting}
                  segments={modalSegments}
                  onUpdateSegments={setModalSegments}
                  onSnackbar={showSnackbar}
                />
              ) : (
                segments.length > 0 ? (
                  <TranscriptTable segments={segments} />
                ) : (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", marginTop: 60 }}>
                    Select a meeting from the sidebar or upload a new audio file.
                  </div>
                )
              )}
            </div>
          </GlassPanel>

          {/* Right Panel: AI Insights */}
          <GlassPanel style={{ padding: "28px", height: "85vh", overflowY: "auto" }}>
            <AIInsightsPanel
              meeting={modalMeeting}
              insights={modalInsights}
              loading={loadingAI}
              onGenerate={handleGenerateInsights}
            />
          </GlassPanel>
        </div>
      </div>

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
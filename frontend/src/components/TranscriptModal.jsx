import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassPanel from "./ui/GlassPanel";
import AIInsightsPanel from "./AIInsightsPanel";
import ActionItemsPanel from "./ActionItemsPanel";
import TranscriptTable from "./TranscriptTable";
import { BACKEND_URL } from "../api/backend";

/**
 * TranscriptModal — quick-view floating modal, opened from sidebar.
 *
 * Read-only. For editing, use MeetingHistoryPage (View All → expand → Edit).
 *
 * Controlled entirely by App.jsx:
 *   meeting={null}  → modal closed (exit animation plays)
 *   meeting={obj}   → modal opens
 *
 * Closes on: backdrop click, Escape key, or × button.
 */
export default function TranscriptModal({ meeting, segments, insights, onClose }) {
  const [loadingAI, setLoadingAI] = useState(false);
  const [localInsights, setLocalInsights] = useState(insights);
  
  useEffect(() => { setLocalInsights(insights); }, [insights]);

  async function handleGenerateInsights() {
    setLoadingAI(true);
    try {
      const res = await fetch(`${BACKEND_URL}/meetings/${meeting.id}/generate-insights`, { method: "POST" });
      const data = await res.json();
      setLocalInsights(data);
    } catch (e) {
      console.error(e);
    }
    setLoadingAI(false);
  }

  useEffect(() => {
    if (!meeting) return;
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [meeting, onClose]);

  return (
    <AnimatePresence>
      {meeting && (
        <>
          {/* ── Backdrop ─────────────────────────────────────────── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.32)",
              backdropFilter: "blur(5px)",
              zIndex: 500,
            }}
          />

          {/* ── Modal box ────────────────────────────────────────── */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(820px, 90vw)",
              maxHeight: "82vh",
              zIndex: 501,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <GlassPanel
              variant="modal"
              animate={false}
              style={{
                padding: "28px",
                maxHeight: "82vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 20,
                  flexShrink: 0,
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text-main)" }}>
                    Meeting #{meeting.id}
                  </h2>
                  <p style={{ margin: "5px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
                    {meeting.audio_file} · {new Date(meeting.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    background: "rgba(255,255,255,0.55)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    cursor: "pointer",
                    fontSize: 18,
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginLeft: 16,
                    color: "var(--text-main)",
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                <button 
                  className="glass-button" 
                  style={{ padding: "6px 12px", fontSize: 13 }} 
                  onClick={handleGenerateInsights}
                >
                  {loadingAI ? "Generating..." : "Generate AI Insights"}
                </button>
              </div>

              <div style={{ display: "flex", gap: "20px", overflowY: "auto", flex: 1 }}>
                
                <div style={{ flex: 2, overflowY: "auto", height: "100%" }}>
                  <TranscriptTable segments={segments} />
                </div>

                <div style={{ flex: 1, overflowY: "auto", height: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
                  <AIInsightsPanel insights={localInsights} />
                  <ActionItemsPanel meetingId={meeting.id} />
                </div>

              </div>
            </GlassPanel>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
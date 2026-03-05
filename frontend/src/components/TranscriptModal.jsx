import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassPanel from "./ui/GlassPanel";

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
export default function TranscriptModal({ meeting, segments, onClose }) {
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

              {/* Transcript table */}
              <div style={{ overflowY: "auto", flex: 1 }}>
                {!segments || segments.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                    No transcript data available.
                  </p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr>
                        {["Speaker", "Start", "End", "Text"].map((h) => (
                          <th
                            key={h}
                            style={{
                              textAlign: "left",
                              padding: "8px 12px",
                              fontWeight: 700,
                              borderBottom: "1px solid var(--glass-border)",
                              color: "var(--text-main)",
                              width: h === "Text" ? undefined : h === "Speaker" ? 100 : 70,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {segments.map((seg, i) => (
                        <tr
                          key={i}
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.22)" }}
                        >
                          <td style={{ padding: "9px 12px", fontFamily: "monospace", fontSize: 12 }}>
                            {seg.speaker || "—"}
                          </td>
                          <td style={{ padding: "9px 12px", fontFamily: "monospace", fontSize: 12 }}>
                            {seg.start}s
                          </td>
                          <td style={{ padding: "9px 12px", fontFamily: "monospace", fontSize: 12 }}>
                            {seg.end}s
                          </td>
                          <td style={{ padding: "9px 12px" }}>{seg.text}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </GlassPanel>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
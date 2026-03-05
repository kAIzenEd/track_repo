import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassPanel from "./ui/GlassPanel";
import GlassButton from "./ui/GlassButton";
import { fetchMeetingById, updateMeeting } from "../api/backend";

// ─────────────────────────────────────────────────────────────────────────────
// EditableTranscriptRow
// Renders a plain read row OR an editable row with inputs.
// Only speaker and text are editable (start/end are timestamps from the model).
// ─────────────────────────────────────────────────────────────────────────────
function EditableTranscriptRow({ seg, isEditing, onChange }) {
  const cellBase = { padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.18)" };

  if (!isEditing) {
    return (
      <tr>
        <td style={{ ...cellBase, fontFamily: "monospace", fontSize: 12 }}>{seg.speaker || "—"}</td>
        <td style={{ ...cellBase, fontFamily: "monospace", fontSize: 12 }}>{seg.start}s</td>
        <td style={{ ...cellBase, fontFamily: "monospace", fontSize: 12 }}>{seg.end}s</td>
        <td style={{ ...cellBase }}>{seg.text}</td>
      </tr>
    );
  }

  const inputStyle = {
    background: "rgba(255,255,255,0.65)",
    border: "1px solid var(--glass-border)",
    borderRadius: 7,
    padding: "5px 9px",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    color: "var(--text-main)",
    transition: "border-color 0.15s",
  };

  return (
    <tr style={{ background: "rgba(99,102,241,0.04)" }}>
      <td style={{ ...cellBase }}>
        <input
          value={seg.speaker || ""}
          onChange={(e) => onChange({ ...seg, speaker: e.target.value })}
          placeholder="Speaker"
          style={{ ...inputStyle, width: 90 }}
        />
      </td>
      <td style={{ ...cellBase, fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)" }}>
        {seg.start}s
      </td>
      <td style={{ ...cellBase, fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)" }}>
        {seg.end}s
      </td>
      <td style={{ ...cellBase }}>
        <textarea
          value={seg.text || ""}
          onChange={(e) => onChange({ ...seg, text: e.target.value })}
          rows={2}
          style={{ ...inputStyle, width: "100%", resize: "vertical", lineHeight: 1.5 }}
        />
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MeetingRow
// Single row in the history list. Click to expand inline below.
// ─────────────────────────────────────────────────────────────────────────────
function MeetingRow({ meeting, onSnackbar }) {
  const [expanded, setExpanded] = useState(false);
  const [segments, setSegments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSegments, setEditedSegments] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleToggle() {
    if (expanded) {
      setExpanded(false);
      setIsEditing(false);
      return;
    }
    setExpanded(true);
    // Only fetch once — cache in local state
    if (!segments) {
      setLoading(true);
      try {
        const data = await fetchMeetingById(meeting.id);
        const t = data.transcript || [];
        setSegments(t);
        setEditedSegments(JSON.parse(JSON.stringify(t)));
      } catch (e) {
        console.error("fetchMeetingById error", e);
        onSnackbar("❌ Failed to load transcript.");
      } finally {
        setLoading(false);
      }
    }
  }

  function startEditing() {
    // Deep-clone current segments into edit buffer
    setEditedSegments(JSON.parse(JSON.stringify(segments)));
    setIsEditing(true);
  }

  function cancelEditing() {
    setEditedSegments(JSON.parse(JSON.stringify(segments)));
    setIsEditing(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateMeeting(meeting.id, editedSegments);
      // Commit edits to displayed (read) state
      setSegments(JSON.parse(JSON.stringify(editedSegments)));
      setIsEditing(false);
      onSnackbar("✅ Transcript saved successfully!");
    } catch (e) {
      console.error("updateMeeting error", e);
      onSnackbar("❌ Save failed: " + (e?.message || "unknown error"));
    } finally {
      setSaving(false);
    }
  }

  function handleRowChange(i, updated) {
    const next = [...editedSegments];
    next[i] = updated;
    setEditedSegments(next);
  }

  const displaySegments = isEditing ? editedSegments : segments;

  return (
    <div style={{ marginBottom: 6 }}>
      {/* ── Clickable header row ──────────────────────────────── */}
      <button
        onClick={handleToggle}
        style={{
          width: "100%",
          textAlign: "left",
          background: expanded ? "rgba(99,102,241,0.14)" : "rgba(255,255,255,0.38)",
          border: expanded
            ? "1px solid rgba(99,102,241,0.4)"
            : "1px solid rgba(255,255,255,0.38)",
          borderRadius: expanded ? "12px 12px 0 0" : 12,
          padding: "12px 16px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "background 0.18s ease, border-color 0.18s ease",
          fontFamily: "inherit",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: 14,
              color: expanded ? "var(--liquid-primary)" : "var(--text-main)",
              minWidth: 32,
              transition: "color 0.18s",
            }}
          >
            #{meeting.id}
          </span>
          <span style={{ fontSize: 13, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "40vw" }}>
            {meeting.audio_file}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {new Date(meeting.created_at).toLocaleString()}
          </span>
          <span
            style={{
              fontSize: 13,
              display: "inline-block",
              transition: "transform 0.22s ease",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              color: "var(--text-muted)",
            }}
          >
            ▾
          </span>
        </div>
      </button>

      {/* ── Inline expand panel ───────────────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.22)",
                border: "1px solid rgba(99,102,241,0.3)",
                borderTop: "none",
                borderRadius: "0 0 12px 12px",
                padding: "16px 20px 20px",
              }}
            >
              {loading && (
                <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
                  Loading transcript...
                </p>
              )}

              {!loading && displaySegments && (
                <>
                  {/* Action buttons — explicit width/height required for glassSize */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 14 }}>
                    {!isEditing ? (
                      <GlassButton onClick={startEditing} width={80} height={34}>
                        ✏️ Edit
                      </GlassButton>
                    ) : (
                      <>
                        <GlassButton onClick={cancelEditing} width={80} height={34}>
                          Cancel
                        </GlassButton>
                        <GlassButton onClick={handleSave} disabled={saving} width={90} height={34}>
                          {saving ? "Saving…" : "💾 Save"}
                        </GlassButton>
                      </>
                    )}
                  </div>

                  {/* Transcript table */}
                  {displaySegments.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                      No transcript data for this meeting.
                    </p>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
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
                                  fontSize: 13,
                                  borderBottom: "2px solid var(--glass-border)",
                                  color: "var(--text-main)",
                                  width: h === "Text" ? undefined : h === "Speaker" ? (isEditing ? 120 : 100) : 72,
                                }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {displaySegments.map((seg, i) => (
                            <EditableTranscriptRow
                              key={i}
                              seg={seg}
                              isEditing={isEditing}
                              onChange={(updated) => handleRowChange(i, updated)}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MeetingHistoryPage
// Full-screen overlay. ESC or × closes it.
// ─────────────────────────────────────────────────────────────────────────────
export default function MeetingHistoryPage({ meetings, onClose, onSnackbar }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.42)",
          backdropFilter: "blur(7px)",
          zIndex: 600,
        }}
      />

      {/* Scrollable page container */}
      <motion.div
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 48 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()} // prevent backdrop close on inner click
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 601,
          overflowY: "auto",
          display: "flex",
          justifyContent: "center",
          padding: "40px 20px 60px",
          pointerEvents: "none", // let backdrop capture clicks outside panel
        }}
      >
        <div style={{ width: "100%", maxWidth: 920, pointerEvents: "all" }}>
          <GlassPanel variant="panel" animate={false} style={{ padding: "32px" }}>
            {/* Page header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 28,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 26,
                    fontWeight: 800,
                    background:
                      "linear-gradient(45deg, var(--liquid-primary), var(--liquid-secondary))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Meeting History
                </h2>
                <p style={{ margin: "5px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
                  {meetings.length} meeting{meetings.length !== 1 ? "s" : ""} · Click any row to expand · Press Esc to close
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.55)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  cursor: "pointer",
                  fontSize: 20,
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

            {/* Meeting list */}
            {meetings.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>No meetings recorded yet.</p>
            ) : (
              meetings.map((m) => (
                <MeetingRow key={m.id} meeting={m} onSnackbar={onSnackbar} />
              ))
            )}
          </GlassPanel>
        </div>
      </motion.div>
    </>
  );
}
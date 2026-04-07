import { useState, useEffect } from "react";
import GlassButton from "./ui/GlassButton";
import { updateMeeting } from "../api/backend";

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
      <td style={{ ...cellBase, fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)" }}>{seg.start}s</td>
      <td style={{ ...cellBase, fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)" }}>{seg.end}s</td>
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

export default function MeetingDetailPanel({ meeting, segments, onUpdateSegments, onSnackbar }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSegments, setEditedSegments] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEditedSegments(JSON.parse(JSON.stringify(segments || [])));
    setIsEditing(false);
  }, [segments, meeting]);

  function startEditing() {
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
      onUpdateSegments(JSON.parse(JSON.stringify(editedSegments)));
      setIsEditing(false);
      onSnackbar("✅ Transcript saved successfully!");
    } catch (e) {
      console.error(e);
      onSnackbar("❌ Save failed.");
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
    <div style={{ padding: "0 12px", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text-main)" }}>Meeting #{meeting.id}</h2>
          <p style={{ margin: "5px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
            {meeting.audio_file} · {new Date(meeting.created_at).toLocaleString()}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {!isEditing ? (
            <GlassButton onClick={startEditing} width={80} height={34}>✏️ Edit</GlassButton>
          ) : (
            <>
              <GlassButton onClick={cancelEditing} width={80} height={34}>Cancel</GlassButton>
              <GlassButton onClick={handleSave} disabled={saving} width={90} height={34}>
                {saving ? "Saving…" : "💾 Save"}
              </GlassButton>
            </>
          )}
        </div>
      </div>

      <div style={{ overflowY: "auto", flex: 1, paddingRight: 8 }}>
        {!displaySegments || displaySegments.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No transcript data available.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr>
                {["Speaker", "Start", "End", "Text"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 12px", borderBottom: "2px solid var(--glass-border)", color: "var(--text-main)", width: h === "Text" ? undefined : (isEditing && h === "Speaker" ? 120 : 70) }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displaySegments.map((seg, i) => (
                <EditableTranscriptRow key={i} seg={seg} isEditing={isEditing} onChange={(u) => handleRowChange(i, u)} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

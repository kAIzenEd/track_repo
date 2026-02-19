import React from "react";

export default function MeetingSidebar({ meetings = [], selectedMeeting, onSelect }) {
  return (
    <>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>📂 Meeting History</h2>
      {meetings.length === 0 && <p style={{ color: "#555" }}>No meetings yet...</p>}

      {meetings.map((m) => (
        <button
          key={m.id}
          className={`meeting-btn ${selectedMeeting === m.id ? "active" : ""}`}
          onClick={() => onSelect(m.id)}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>#{m.id}</div>
              <div style={{ fontSize: 12, color: "#444", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {m.audio_file}
              </div>
            </div>
            <div style={{ color: "#777", fontSize: 12 }}>{new Date(m.created_at).toLocaleString()}</div>
          </div>
        </button>
      ))}
    </>
  );
}

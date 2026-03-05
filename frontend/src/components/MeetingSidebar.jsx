import React from "react";
import GlassPanel from "./ui/GlassPanel";
import GlassButton from "./ui/GlassButton";

export default function MeetingSidebar({
  meetings = [],
  selectedMeeting,
  onSelect,
  onViewAll,
}) {
  return (
    <GlassPanel style={{ height: "85vh", padding: "18px", display: "flex", flexDirection: "column" }}>
      {/* Header: title left, button right — button wrapper is inline-block in flow */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
        flexShrink: 0,
        minHeight: 36, // matches GlassButton height so row doesn't collapse
      }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
          📂 History
        </h2>
        {/* width/height explicitly sized — LiquidGlass needs to know its glassSize */}
        <GlassButton onClick={onViewAll} width={100} height={34}>
          View All →
        </GlassButton>
      </div>

      {/* Scrollable list */}
      <div style={{ overflowY: "auto", flex: 1, paddingRight: 4 }}>
        {meetings.length === 0 && (
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No meetings yet...</p>
        )}
        {meetings.map((m) => {
          const isActive = selectedMeeting === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              style={{
                width: "100%",
                marginBottom: 8,
                textAlign: "left",
                background: isActive ? "rgba(29,78,216,0.16)" : "rgba(255,255,255,0.38)",
                border: isActive ? "1px solid rgba(29,78,216,0.4)" : "1px solid rgba(255,255,255,0.4)",
                borderRadius: 12,
                padding: "10px 12px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "all 0.18s ease",
                fontFamily: "inherit",
              }}
            >
              <div style={{ minWidth: 0, overflow: "hidden" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-main)" }}>#{m.id}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {m.audio_file}
                </div>
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 10, flexShrink: 0, marginLeft: 8 }}>
                {new Date(m.created_at).toLocaleDateString()}
              </div>
            </button>
          );
        })}
      </div>
    </GlassPanel>
  );
}
import React from "react";
import GlassPanel from "./ui/GlassPanel";

export default function TranscriptTable({ segments = [] }) {
  if (!segments || segments.length === 0) return null;

  return (
    <GlassPanel className="glass-table-container" style={{ marginTop: "20px" }}>
      <table className="glass-table">
        <thead>
          <tr>
            <th style={{ width: "80px" }}>Speaker</th>
            <th style={{ width: "80px" }}>Start</th>
            <th style={{ width: "80px" }}>End</th>
            <th>Text</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((seg, i) => (
            <tr key={i}>
              <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{seg.speaker || "—"}</td>
              <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{seg.start}s</td>
              <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{seg.end}s</td>
              <td>{seg.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassPanel>
  );
}
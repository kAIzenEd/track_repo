import React from "react";

export default function TranscriptTable({ segments = [] }) {
  if (!segments || segments.length === 0) return null;

  return (
    <div className="transcript-table">
      <table>
        <thead>
          <tr>
            <th>Start</th>
            <th>End</th>
            <th>Text</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((seg, i) => (
            <tr key={i}>
              <td>{seg.start}</td>
              <td>{seg.end}</td>
              <td>{seg.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

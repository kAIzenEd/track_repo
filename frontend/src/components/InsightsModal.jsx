import React from "react";

export default function InsightsModal({ open, insights, onClose }) {

  if (!open) return null;

  return (
    <div className="overlay">
      <div className="overlay-content">

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, color: "var(--text-main)" }}>AI Insights</h2>
          <button className="glass-button" style={{ padding: "4px 10px", fontSize: 13 }} onClick={onClose}>Close</button>
        </div>

        <div style={{ marginTop: "16px", color: "var(--text-main)" }}>
          <h3 style={{ margin: "0 0 8px 0" }}>Summary</h3>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>{insights?.summary || "No summary available"}</p>

          <h3 style={{ margin: "20px 0 8px 0" }}>Action Items</h3>
          <ul style={{ paddingLeft: "16px", margin: 0, fontSize: 14 }}>
            {insights?.action_items?.length > 0 ? (
              insights.action_items.map((a, i) => (
                <li key={i} style={{ marginBottom: "6px" }}>
                  <strong>{a.assignee}</strong> → {a.task}
                </li>
              ))
            ) : (
              <li style={{ color: "var(--text-muted)", listStyle: "none", marginLeft: "-16px" }}>No action items found</li>
            )}
          </ul>
        </div>

      </div>
    </div>
  );
}

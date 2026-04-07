import React from "react";

export default function InsightsPanel({ insights }) {

  if (!insights) return null;

  const { summary, action_items } = insights;

  return (
    <div className="glass-panel" style={{ marginBottom: "16px", padding: "16px" }}>
      
      <h3 style={{ marginBottom: "8px", marginTop: 0 }}>🧠 AI Summary</h3>
      <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: 0 }}>
        {summary || "No summary available"}
      </p>

      <h3 style={{ marginTop: "16px", marginBottom: "8px" }}>✅ Action Items</h3>

      {action_items && action_items.length > 0 ? (
        <ul style={{ paddingLeft: "16px", margin: 0 }}>
          {action_items.map((item, i) => (
            <li key={i} style={{ marginBottom: "6px" }}>
              <strong>{item.assignee}</strong>: {item.task}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
          No action items found
        </p>
      )}

    </div>
  );
}

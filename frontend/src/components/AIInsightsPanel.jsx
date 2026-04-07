import GlassButton from "./ui/GlassButton";

export default function AIInsightsPanel({ meeting, insights, loading, onGenerate }) {
  if (!meeting) {
    return (
      <div style={{ textAlign: "center", color: "var(--text-muted)", marginTop: "40px", fontSize: 14 }}>
        Select a meeting to view AI Insights.
      </div>
    );
  }

  const hasInsights = insights && (insights.summary || (insights.action_items && insights.action_items.length > 0) || (insights.improvements && insights.improvements.length > 0));

  return (
    <div className="ai-panel">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 12px 0", fontSize: 20 }}>AI Insights</h2>
        <GlassButton onClick={onGenerate} disabled={loading} width="100%" height={40}>
          {loading ? "Generating..." : "Generate AI Insights"}
        </GlassButton>
      </div>

      {loading && (
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Agents are analyzing the transcript... please wait.
        </p>
      )}

      {!loading && !hasInsights && (
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          No insights generated yet. Click the button above to run the AI pipeline.
        </p>
      )}

      {!loading && hasInsights && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 16 }}>🧠 Summary</h3>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{insights.summary || "No summary available."}</p>
          </div>

          <div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 16 }}>📌 Action Items</h3>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6 }}>
              {insights.action_items?.length > 0 ? insights.action_items.map((a, i) => (
                <li key={i}><strong>{a.assignee}</strong>: {a.task}</li>
              )) : <li>No action items found.</li>}
            </ul>
          </div>

          <div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 16 }}>⚡ Improvements</h3>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6 }}>
              {insights.improvements?.length > 0 ? insights.improvements.map((i, idx) => (
                <li key={idx}>{i.text}</li>
              )) : <li>No improvement suggestions.</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import GlassButton from "./ui/GlassButton";
import { getMeetingActionItemsState, generateActionItemsRaw, finalizeActionItems } from "../api/backend";

export default function ActionItemsPanel({ meetingId }) {
  const [loading, setLoading] = useState(false);
  const [rawTasks, setRawTasks] = useState("");
  const [finalTasks, setFinalTasks] = useState([]);
  const [userInput, setUserInput] = useState("");

  // Fetch true state on mount
  useEffect(() => {
    if (!meetingId) return;
    
    async function loadState() {
      try {
        const state = await getMeetingActionItemsState(meetingId);
        setRawTasks(state.extracted_tasks_raw || "");
        setFinalTasks(state.final_assigned_tasks || []);
      } catch (e) {
        console.error("Failed to fetch action items state", e);
      }
    }
    loadState();
  }, [meetingId]);

  const handleGenerateRaw = async () => {
    setLoading(true);
    try {
      const data = await generateActionItemsRaw(meetingId);
      setRawTasks(data.extracted_tasks_raw);
      setFinalTasks([]); 
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!userInput.trim()) return;
    setLoading(true);
    try {
      const data = await finalizeActionItems(meetingId, userInput);
      setFinalTasks(data.final_assigned_tasks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!meetingId) {
    return <div style={{ textAlign: "center", color: "var(--text-muted)" }}>Select a meeting.</div>;
  }

  const hasRawTasks = rawTasks && rawTasks.trim().length > 0;
  const hasFinalTasks = finalTasks && finalTasks.length > 0;

  return (
    <div className="ai-panel">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 12px 0", fontSize: 20 }}>Action Items</h2>
      </div>

      {!hasRawTasks && !loading && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 12 }}>
            Extract tasks directly from the transcript.
          </p>
          <GlassButton onClick={handleGenerateRaw} disabled={loading} width="100%" height={36}>
            Generate Action Items
          </GlassButton>
        </div>
      )}

      {loading && (
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Agents are analyzing... Please wait.
        </p>
      )}

      {hasRawTasks && !hasFinalTasks && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 14, color: "var(--text-muted)" }}>Extracted Tasks (Unassigned)</h3>
            <pre style={{ 
              whiteSpace: "pre-wrap", 
              fontSize: 13, 
              background: "rgba(0,0,0,0.1)", 
              padding: "10px", 
              borderRadius: "8px",
              margin: 0
            }}>
              {rawTasks}
            </pre>
          </div>

          <div style={{ background: "rgba(99,102,241,0.1)", padding: "12px", borderRadius: "8px" }}>
            <p style={{ fontSize: 13, margin: "0 0 10px 0" }}>
              Now tell me all the people to assign tasks to with names and job roles:
            </p>
            <input 
              type="text" 
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFinalize()}
              placeholder="e.g. Gordon is a developer, Hannah is QA"
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.8)",
                marginBottom: "10px",
                outline: "none"
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <GlassButton onClick={handleFinalize} disabled={!userInput.trim() || loading} height={32} width={100}>
                Assign Tasks
              </GlassButton>
            </div>
          </div>
        </div>
      )}

      {hasFinalTasks && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {finalTasks.map((item, idx) => (
            <div key={idx} style={{ 
              display: "flex", 
              gap: "8px", 
              padding: "8px", 
              background: item.assignee === "Unassigned" ? "rgba(255,0,0,0.05)" : "rgba(255,255,255,0.4)",
              borderRadius: "6px"
            }}>
              <span style={{ 
                fontWeight: 700, 
                fontSize: 13, 
                color: item.assignee === "Unassigned" ? "var(--text-muted)" : "var(--liquid-primary)",
                minWidth: "80px"
              }}>
                {item.assignee}:
              </span>
              <span style={{ fontSize: 13 }}>{item.task}</span>
            </div>
          ))}
          
          <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
            <button 
              onClick={handleGenerateRaw} 
              style={{ 
                background: "none", 
                border: "none", 
                color: "var(--text-muted)", 
                textDecoration: "underline", 
                cursor: "pointer",
                fontSize: 12 
              }}>
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import requests
import os

def transcript_to_text(segments):
    lines = []
    for seg in segments:
        speaker = seg.get("speaker", "UNKNOWN")
        text = seg.get("text", "").strip()
        lines.append(f"{speaker}: {text}")
    return "\n".join(lines)

def run_agent(prompt: str, model="nemotron-3-nano:4b"):
    ollama_url = os.environ.get("OLLAMA_URL", "http://localhost:11434")
    try:
        response = requests.post(
            f"{ollama_url}/api/generate",
            json={"model": model, "prompt": prompt, "stream": False},
            timeout=300
        )
        text = response.json().get("response", "").strip()
        
        # DeepSeek and Nemotron models sometimes output internal "scratchpad" thoughts.
        # We MUST strip them out so they don't corrupt the final output.
        if "</think>" in text:
            text = text.split("</think>")[-1].strip()
            
        return text
    except Exception as e:
        print(f"[AGENT ERROR] {model} | {e}")
        return ""

def generate_insights(transcript_text: str):
    ollama_url = os.environ.get("OLLAMA_URL", "http://localhost:11434")
    print(f"[AI INSIGHTS] Checking local AI server at {ollama_url}...")
    try:
        requests.get(ollama_url, timeout=5)
    except Exception:
        print(f"[ERROR] Local AI server not running at {ollama_url}")
        return {"summary": "Error: Local AI server (Ollama) is not running.", "action_items": [], "improvements": []}

    # 1. SUMMARY
    print("[AI INSIGHTS] Generating Summary...")
    summary_prompt = f"Transcript:\n{transcript_text}\n\nTask: Provide a concise summary of the decisions and main points from this meeting. You MUST use black filled dot bullet points (•) and each bullet point MUST start on a new line. Do not write paragraphs. Do not use JSON. Write plain text only."
    summary_text = run_agent(summary_prompt)

    # 2. ACTION ITEMS
    print("[AI INSIGHTS] Generating Action Items...")
    actions_prompt = f"Transcript:\n{transcript_text}\n\nTask: Extract all action items and tasks assigned to people in this meeting. You MUST extract AT LEAST 5 action items (you can extract more if available). If there are fewer than 5 explicit tasks, deduce implied tasks or general next steps to meet the minimum of 5. Use EXACTLY this bullet format and nothing else:\n- Assignee Name: Task description\n\nExample:\n- Kevin: Research the server costs.\n- Unassigned: Update Terms of Service.\n\nDo NOT write anything else."
    actions_raw = run_agent(actions_prompt)
    
    action_items = []
    for line in actions_raw.split("\n"):
        line = line.strip()
        if line.startswith("-") or line.startswith("*"):
            line = line[1:].strip()
            if ":" in line:
                assignee, task = line.split(":", 1)
                action_items.append({"assignee": assignee.strip("[]* "), "task": task.strip()})
            elif len(line) > 5:
                action_items.append({"assignee": "Unassigned", "task": line})

    # 3. IMPROVEMENTS
    print("[AI INSIGHTS] Generating Improvements...")
    improve_prompt = f"Transcript:\n{transcript_text}\n\nTask: Identify any communication issues, missed opportunities, or suggestions for better process. You MUST provide AT LEAST 2 improvements (you can provide more if available). If the meeting was perfect, suggest general best practices to meet the minimum of 2. Use EXACTLY this bullet format and nothing else:\n- Improvement suggestion\n\nExample:\n- Need a pre-meeting agenda to avoid rambling.\n\nDo NOT write anything else."
    improve_raw = run_agent(improve_prompt)
    
    improvements = []
    for line in improve_raw.split("\n"):
        line = line.strip()
        if (line.startswith("-") or line.startswith("*")) and len(line) > 5:
            improvements.append({"type": "improvement", "text": line[1:].strip()})

    print("[AI INSIGHTS] Pipeline Complete.")
    
    if not summary_text:
        summary_text = "No summary could be generated."

    return {
        "summary": summary_text,
        "action_items": action_items,
        "improvements": improvements
    }

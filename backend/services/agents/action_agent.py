import json
from .base_agent import BaseAgent

class ActionAgent(BaseAgent):
    def __init__(self, model: str = "nemotron-3-nano:4b"):
        # Explicit fallback to nemotron if not provided, for consistent hardware limits
        super().__init__(model=model)

    def extract_raw_tasks(self, transcript_text: str) -> str:
        """
        Pass 1: Simply extract explicit tasks from the transcript.
        Includes speaker context but does not attempt complex role mapping yet.
        """
        prompt = f"""Transcript:
{transcript_text}

Task: Find all action items and tasks mentioned in this meeting. Do NOT try to assign them to roles yet.

CRITICAL RULES:
1. You MUST extract a MINIMUM of 5 tasks and can be much more. Break larger tasks down into actionable sub-steps if necessary to reach at least 5 absolute distinct items.
2. DO NOT quote directly from the transcript (e.g., do not say "Look at the Mediterranean place"). Instead, INTERPRET the task and explain clearly what needs to be done (e.g., "Review the menu options for the Mediterranean restaurant to finalize the catering order").
3. Output exactly as a bulleted list starting with a dash (-).
4. If a person explicitly commits to it in the transcript, prefix the bullet with their name (e.g., "SPEAKER_00: " or "Jordan: "). If nobody commits, leave it as simply the task.

Example Output:
- Gordon: Set up the remote database schema for the new client.
- Draft an email to the client explaining the current timeline delay.
- Hannah: Review the UI mockups for the dashboard tab.
- Call the vendor to confirm dessert platters.
- SPEAKER_01: Verify the attendee headcount by Friday.

Do not write paragraphs. Output ONLY the bullets.
"""
        return self.run(prompt).strip()

    def assign_tasks_by_role(self, transcript_text: str, raw_tasks: str, user_input: str) -> list:
        """
        Pass 2: Map raw tasks to specific people based on the transcript AND user role input.
        Returns a JSON list cleanly formatted for the UI.
        """
        prompt = f"""Analyze these tasks and assign them to people.
You have two pieces of context:
1. The original meeting transcript, which contains exact speaker names (e.g. SPEAKER_00, Jordan, Sam).
2. The user's manually defined role definitions.

Your goal is to output a clean JSON array of task objects.

Context 1 (Transcript):
{transcript_text}

Context 2 (Raw Tasks to be assigned):
{raw_tasks}

Context 3 (User's role definitions):
{user_input}

Rule 1: If a task was explicitly agreed to by a specific speaker in the Transcript or Raw Tasks, assign it to that exact speaker name (including diarized names like SPEAKER_01).
Rule 2: If a task has no clear owner in the transcript, infer the owner using Context 3 (Roles). You SHOULD use names from Context 3 even if that person did not speak in the transcript, as long as the task logically matches their job role!
Rule 3: If a task STILL fits nobody, assign it exactly to "Unassigned".
Rule 4: Output ONLY valid JSON. Absolutely no markdown wrappers like ```json, no preface text, and no explanations.
Rule 5: When writing the "task" value, DO NOT include the person's name at the beginning of the sentence. Strip out any prefixes like "Jordan: " or "SPEAKER_00: " from the task description itself. The task text should only contain the action.

Expected JSON schema:
[
  {{ "assignee": "Gordon", "task": "Set up remote database schema for the new client" }},
  {{ "assignee": "Unassigned", "task": "Email the client about timeline delays" }},
  {{ "assignee": "SPEAKER_00", "task": "Verify the attendee headcount" }}
]
"""
        raw_output = self.run(prompt).strip()
        
        # Clean potential markdown wrappers often added by LLMs
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:]
        if raw_output.startswith("```"):
            raw_output = raw_output[3:]
        if raw_output.endswith("```"):
            raw_output = raw_output[:-3]
            
        try:
            return json.loads(raw_output.strip())
        except Exception as e:
            print(f"[ACTION AGENT ERROR] Failed to parse JSON: {e}")
            # Fallback format to prevent app crash
            return [{"assignee": "System", "task": "Failed to parse final assignments. Please try again."}]

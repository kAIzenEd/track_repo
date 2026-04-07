from .base_agent import BaseAgent
from .utils import extract_json_object

class UnifiedAgent(BaseAgent):

    def __init__(self):
        super().__init__(model="mistral:7b")

    def execute(self, transcript):

        prompt = f"""
Respond ONLY with valid JSON. Do not include any text outside the JSON.

Rules for Summary:
- Retain ALL context and important details.
- Use bullet points. Do not omit anything.

Rules for Action Items:
- Extract any actionable tasks or unresolved issues.
- If no assignee name is clear -> use "Unassigned".

Rules for Improvements:
- Extract any insight, friction point, unclear communication, or suggestion.

Return EXACTLY this JSON structure:
{{
  "summary": "Full summary text here with bullet points...",
  "action_items": [
    {{
      "task": "...",
      "assignee": "..."
    }}
  ],
  "improvements": [
    {{
      "type": "improvement",
      "text": "..."
    }}
  ]
}}

Transcript:
{transcript}
"""

        raw = self.run(prompt)
        return extract_json_object(raw)

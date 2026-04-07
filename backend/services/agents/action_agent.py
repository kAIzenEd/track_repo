from .base_agent import BaseAgent
from .utils import extract_json_array

class ActionAgent(BaseAgent):

    def __init__(self):
        super().__init__(model="gemma:2b")

    def execute(self, transcript):

        prompt = f"""
Respond ONLY with valid JSON.

Rules:
- No explanations or extra text
- You MUST extract any actionable tasks, unresolved issues, or future plans mentioned.
- Be hyper-sensitive: if there is even a hint of a task, extract it.

Return:

[
  {{
    "task": "...",
    "assignee": "..."
  }}
]

Meeting Summary Context:
{transcript}
"""

        raw = self.run(prompt)

        return extract_json_array(raw)

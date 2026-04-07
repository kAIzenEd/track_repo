from .base_agent import BaseAgent
from .utils import extract_json_array

class ImprovementAgent(BaseAgent):

    def __init__(self):
        super().__init__(model="gemma:2b")

    def execute(self, transcript):

        prompt = f"""
Respond ONLY with valid JSON.

Rules:
- No explanations or extra text
- You MUST extract any insight, improvement, friction point, or suggestion.
- Be hyper-sensitive: look deeply for unclear communication, inefficiencies, or better alternatives.
- If the meeting is absolutely flawless with zero friction, return [].

Return:

[
  {{
    "type": "improvement",
    "text": "what could be improved"
  }},
  {{
    "type": "suggestion",
    "text": "what could be done differently"
  }}
]

Meeting Summary Context:
{transcript}
"""

        raw = self.run(prompt)

        return extract_json_array(raw)

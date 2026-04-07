from .base_agent import BaseAgent

class SummaryAgent(BaseAgent):

    def __init__(self):
        super().__init__(model="gemma:2b")

    def execute(self, transcript):

        prompt = f"""
Respond ONLY with the summary.

Rules:
- No introductions or phrases like "Here is the summary"
- Do not decide what is important and what is not; your job is strictly to condense the entire meeting.
- Retain ALL context, ALL speaker names, and ALL mentioned tasks or problems.
- Be exhaustive and thorough. Do not omit any details.
- Use structured bullet points for readability.

Detailed Transcript:
{transcript}
"""

        return self.run(prompt).strip()

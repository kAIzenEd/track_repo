import requests
from backend.services.agents.utils import extract_json_array

transcript = '''Okay, thanks for jumping on the quick sync. We need to figure out the catering for the Friday workshop. Sam, did you look at that Italian place? I did. I think it was called Mama's. But they don't deliver past 11 a.m. on Fridays, which is kind of a problem. Wait, 11 a.m.? That's way too early. We aren't even starting the breakout sessions until noon. Exactly. We need something that can arrive at 12.30.'''

prompt = f"""
Respond ONLY with valid JSON.

Rules:
- No explanations
- No extra text
- Compulsory some action items
- Start directly with JSON
- Do not repeat transcript

Extract actionable tasks.

If no name -> use "Unassigned"

Return:

[
  {{
    "task": "...",
    "assignee": "..."
  }}
]

Transcript:
{transcript}
"""

res = requests.post('http://localhost:11434/api/generate', json={'model': 'phi3', 'prompt': prompt, 'stream': False})
print('=== RAW RESPONSE ===')
print(res.json())
print('=== EXTRACTED JSON ===')
print(extract_json_array(res.json().get('response')))

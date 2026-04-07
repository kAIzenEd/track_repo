import requests

OLLAMA_URL = "http://localhost:11434/api/generate"

class BaseAgent:
    def __init__(self, model: str):
        self.model = model

    def run(self, prompt: str):

        print(f"[AGENT START] Model: {self.model}")
        try:
            response = requests.post(
                OLLAMA_URL,
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=800
            )

            data = response.json()
            out_text = data.get("response", "")
            print(f"[AGENT OUTPUT] {out_text[:200]}")
            return out_text

        except Exception as e:
            print(f"[AGENT ERROR] Model: {self.model} | Error: {e}")
            return ""

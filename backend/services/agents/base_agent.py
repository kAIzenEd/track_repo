import os
import requests

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
OLLAMA_GENERATE_ENDPOINT = f"{OLLAMA_URL}/api/generate"

class BaseAgent:
    def __init__(self, model: str):
        self.model = model

    def run(self, prompt: str):

        print(f"[AGENT START] Model: {self.model}")
        try:
            response = requests.post(
                OLLAMA_GENERATE_ENDPOINT,
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=800
            )

            data = response.json()
            out_text = data.get("response", "")
            
            # Remove any internal reasoning scratchpads from models like DeepSeek
            if "</think>" in out_text:
                out_text = out_text.split("</think>")[-1]
            
            out_text = out_text.strip()
            
            print(f"[AGENT OUTPUT] {out_text[:200]}")
            return out_text

        except Exception as e:
            print(f"[AGENT ERROR] Model: {self.model} | Error: {e}")
            return ""

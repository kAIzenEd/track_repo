from .unified_agent import UnifiedAgent
from .validator import validate_action_items, validate_improvements

class InsightsOrchestrator:

    def __init__(self):
        self.unified_agent = UnifiedAgent()

    def run(self, transcript_text):
        print("[AGENTS] Running unified pipeline with mistral:7b...")
        
        result = self.unified_agent.execute(transcript_text)
        
        summary = result.get("summary", "No summary generated.")
        actions = validate_action_items(result.get("action_items", []))
        improvements = validate_improvements(result.get("improvements", []))
        
        print("[SUMMARY RAW]", summary[:200])
        print("[ACTIONS RAW]", actions[:2])
        print("[IMPROVEMENTS RAW]", improvements[:2])

        return {
            "summary": summary,
            "action_items": actions,
            "improvements": improvements
        }

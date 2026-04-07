import re
import json

def extract_json_array(text: str):
    """
    Extract first JSON array from model output safely.
    """
    if not text:
        return []

    try:
        # Find all array brackets and check if they parse
        matches = re.findall(r"\[.*?\]", text, re.DOTALL)
        for m in matches:
            try:
                # Often handles valid inner JSON if not greedy
                parsed = json.loads(m)
                if isinstance(parsed, list):
                    return parsed
            except:
                continue
        
        # Absolute fallback greedy search to capture entire blocks ending in bracket
        start = text.find('[')
        end = text.rfind(']')
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start:end+1])
            
        return []

    except Exception as e:
        print("[JSON EXTRACT ERROR]", e)
        return []

def extract_json_object(text: str):
    """
    Extract first valid JSON object containing expected keys from model output safely.
    """
    if not text:
        return {}

    try:
        # Find all brackets and check if they parse and look like what we want
        matches = re.findall(r"\{.*?\}", text, re.DOTALL)
        for m in matches:
            try:
                parsed = json.loads(m)
                if isinstance(parsed, dict) and ('summary' in parsed or 'action_items' in parsed or 'improvements' in parsed):
                    return parsed
            except:
                continue
        
        # Absolute fallback greedy search
        start = text.find('{')
        end = text.rfind('}')
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start:end+1])
            
        return {}

    except Exception as e:
        print("[JSON EXTRACT ERROR]", e)
        return {}

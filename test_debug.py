import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from backend.main import debug_ai
print("Testing /debug/ai...")
res = debug_ai()
print("Result:", res)

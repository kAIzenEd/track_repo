import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from backend.services.agents.action_agent import ActionAgent
from backend.services.agents.improvement_agent import ImprovementAgent

transcript = 'Alice: We need to figure out catering for Friday. Bob: I will handle it.'
print('--- ACTION ---')
print(ActionAgent().execute(transcript))
print('--- IMPROVEMENT ---')
print(ImprovementAgent().execute(transcript))

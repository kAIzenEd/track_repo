from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime
from zoneinfo import ZoneInfo
from backend.db import Base

class Meeting(Base):
    #Stores a single meeting audio + transcript

    __tablename__ = "meetings"
    id = Column(Integer, primary_key = True, index = True)

    #uploaded audio file
    audio_file = Column(String, index = True)

    #transcript segment with timestamps
    transcript = Column(JSON, index = True)

    #Timestamp of save
    created_at = Column(DateTime, default = datetime.now(ZoneInfo("Asia/Kolkata")))
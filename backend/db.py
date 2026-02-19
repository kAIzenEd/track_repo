from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker 

DATABASE_DIR = "sqlite:///backend/storage/kai_track.db"

engine = create_engine(DATABASE_DIR, connect_args = {"check_same_thread": False})

#Session factory used for DB queries
SessionLocal = sessionmaker(autocommit = False, 
                            autoflush = False, bind = engine)

#Base Class for all DB models
Base  = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
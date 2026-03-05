from backend.db import engine
from backend.models import Base

def init_db():
    print("Wooooooow the Database is being made, sickkk!!!!")
    Base.metadata.create_all(bind = engine)
    print("Yessssss the Database is initilalized, dopee XD!!!!!")

if __name__ == "__main__":
    init_db()
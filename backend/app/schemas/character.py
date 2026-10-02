from pydantic import BaseModel

class CharacterCreate(BaseModel):
    name: str
    class_name: str
    race: str
    level: int
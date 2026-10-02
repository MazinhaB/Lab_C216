from pydantic import BaseModel


class CharacterCreate(BaseModel):
    name: str
    class_name: str
    race: str
    level: int


class CharacterPatch(BaseModel):
    name: str | None = None
    class_name: str | None = None
    race: str | None = None
    level: int | None = None

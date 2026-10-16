from pydantic import BaseModel, ConfigDict, Field

class CharacterCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    class_name: str = Field(min_length=1, max_length=100)
    race: str = Field(min_length=1, max_length=100)
    level: int

class CharacterUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    class_name: str = Field(min_length=1, max_length=100)
    race: str = Field(min_length=1, max_length=100)
    level: int

class CharacterRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    class_name: str
    race: str
    level: int

class CharacterPatch(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    class_name: str | None = Field(default=None, min_length=1, max_length=100)
    race: str | None = Field(default=None, min_length=1, max_length=100)
    level: int | None = None  
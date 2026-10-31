from pydantic import BaseModel, ConfigDict, Field, model_validator


class CharacterCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    class_name: str = Field(min_length=1, max_length=100)
    race: str = Field(min_length=1, max_length=100)
    level: int = Field(ge=1, le=20)


class CharacterUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    class_name: str = Field(min_length=1, max_length=100)
    race: str = Field(min_length=1, max_length=100)
    level: int = Field(ge=1, le=20)


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
    level: int | None = Field(default=None, ge=1, le=20)

    @model_validator(mode="after")
    def reject_null_values(self):
        for field_name in self.model_fields_set:
            if getattr(self, field_name) is None:
                raise ValueError(f"{field_name} não pode ser null")
        return self

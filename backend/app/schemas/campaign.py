from datetime import datetime
from typing import Self

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)


class CampaignCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = None

    @field_validator("name", mode="before")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        if isinstance(value, str):
            return value.strip()
        return value


class CampaignResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    created_at: datetime
    updated_at: datetime


class CampaignUpdate(CampaignCreate):
    """Dados exigidos para atualização completa (PUT)."""


class CampaignPatch(BaseModel):
    """Dados opcionais para atualização parcial (PATCH)."""

    name: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = None

    @field_validator("name", mode="before")
    @classmethod
    def normalize_name(cls, value: str | None) -> str | None:
        if isinstance(value, str):
            return value.strip()
        return value

    @model_validator(mode="after")
    def validate_changes(self) -> Self:
        if not self.model_fields_set:
            raise ValueError("Informe pelo menos um campo para atualização.")

        if "name" in self.model_fields_set and self.name is None:
            raise ValueError("O nome da campanha não pode ser nulo.")

        return self

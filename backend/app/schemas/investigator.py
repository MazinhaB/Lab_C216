from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

AttributeValue = Annotated[int, Field(ge=0, le=100)]
SanityValue = Annotated[int, Field(ge=0, le=99)]
NonNegativeValue = Annotated[int, Field(ge=0)]


class InvestigatorCreate(BaseModel):
    # Identificação
    name: str = Field(min_length=1, max_length=100)
    age: int | None = Field(default=None, gt=0)
    gender: str | None = Field(default=None, max_length=30)
    residence: str | None = Field(default=None, max_length=150)
    birthplace: str | None = Field(default=None, max_length=150)

    # Características
    strength: AttributeValue
    constitution: AttributeValue
    dexterity: AttributeValue
    appearance: AttributeValue
    size: AttributeValue
    intelligence: AttributeValue
    power: AttributeValue
    education: AttributeValue
    luck: AttributeValue

    # Vida, magia e sanidade
    max_hit_points: NonNegativeValue | None = None
    current_hit_points: NonNegativeValue | None = None

    max_magic_points: NonNegativeValue | None = None
    current_magic_points: NonNegativeValue | None = None

    initial_sanity: SanityValue | None = None
    max_sanity: SanityValue | None = None
    current_sanity: SanityValue | None = None

    # Combate
    movement_rate: NonNegativeValue | None = None
    build: int | None = None
    damage_bonus: str | None = Field(default=None, max_length=20)
    dodge: AttributeValue | None = None

    # Condições
    temporary_insanity: bool = False
    indefinite_insanity: bool = False
    major_wound: bool = False
    unconscious: bool = False
    dying: bool = False

    # História e antecedentes
    story: str | None = None
    personal_description: str | None = None
    ideology_beliefs: str | None = None
    significant_people: str | None = None
    meaningful_locations: str | None = None
    treasured_possessions: str | None = None
    traits: str | None = None
    injuries_scars: str | None = None
    phobias_manias: str | None = None
    arcane_tomes_spells: str | None = None
    strange_encounters: str | None = None

    # Inventário e patrimônio
    gear_possessions: str | None = None
    spending_level: str | None = None
    cash: str | None = None
    assets: str | None = None

    @field_validator("name", mode="before")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        if isinstance(value, str):
            return value.strip()
        return value


class InvestigatorResponse(InvestigatorCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    campaign_id: int

    # Valores já calculados ou personalizados e salvos
    max_hit_points: NonNegativeValue
    current_hit_points: NonNegativeValue
    max_magic_points: NonNegativeValue
    current_magic_points: NonNegativeValue

    initial_sanity: SanityValue
    max_sanity: SanityValue
    current_sanity: SanityValue

    movement_rate: NonNegativeValue
    build: int
    damage_bonus: str
    dodge: AttributeValue

    created_at: datetime
    updated_at: datetime


class InvestigatorPatch(BaseModel):
    # Identificação
    name: str | None = Field(default=None, min_length=1, max_length=100)
    age: int | None = Field(default=None, gt=0)
    gender: str | None = Field(default=None, max_length=30)
    residence: str | None = Field(default=None, max_length=150)
    birthplace: str | None = Field(default=None, max_length=150)

    # Características
    strength: AttributeValue | None = None
    constitution: AttributeValue | None = None
    dexterity: AttributeValue | None = None
    appearance: AttributeValue | None = None
    size: AttributeValue | None = None
    intelligence: AttributeValue | None = None
    power: AttributeValue | None = None
    education: AttributeValue | None = None
    luck: AttributeValue | None = None

    # Vida, magia e sanidade
    max_hit_points: NonNegativeValue | None = None
    current_hit_points: NonNegativeValue | None = None
    max_magic_points: NonNegativeValue | None = None
    current_magic_points: NonNegativeValue | None = None
    initial_sanity: SanityValue | None = None
    max_sanity: SanityValue | None = None
    current_sanity: SanityValue | None = None

    # Combate
    movement_rate: NonNegativeValue | None = None
    build: int | None = None
    damage_bonus: str | None = Field(default=None, max_length=20)
    dodge: AttributeValue | None = None

    # Condições
    temporary_insanity: bool | None = None
    indefinite_insanity: bool | None = None
    major_wound: bool | None = None
    unconscious: bool | None = None
    dying: bool | None = None

    # História e antecedentes
    story: str | None = None
    personal_description: str | None = None
    ideology_beliefs: str | None = None
    significant_people: str | None = None
    meaningful_locations: str | None = None
    treasured_possessions: str | None = None
    traits: str | None = None
    injuries_scars: str | None = None
    phobias_manias: str | None = None
    arcane_tomes_spells: str | None = None
    strange_encounters: str | None = None

    # Inventário e patrimônio
    gear_possessions: str | None = None
    spending_level: str | None = None
    cash: str | None = None
    assets: str | None = None

    @field_validator("name", mode="before")
    @classmethod
    def normalize_name(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value

    @model_validator(mode="after")
    def reject_null_for_required_fields(self):
        required_fields = {
            "name",
            "strength",
            "constitution",
            "dexterity",
            "appearance",
            "size",
            "intelligence",
            "power",
            "education",
            "luck",
            "max_hit_points",
            "current_hit_points",
            "max_magic_points",
            "current_magic_points",
            "initial_sanity",
            "max_sanity",
            "current_sanity",
            "movement_rate",
            "build",
            "damage_bonus",
            "dodge",
            "temporary_insanity",
            "indefinite_insanity",
            "major_wound",
            "unconscious",
            "dying",
        }

        for field in required_fields & self.model_fields_set:
            if getattr(self, field) is None:
                raise ValueError(f"O campo '{field}' não pode receber null.")

        return self


class InvestigatorUpdate(InvestigatorCreate):
    """Substituição completa dos dados editáveis da ficha."""

    max_hit_points: NonNegativeValue
    current_hit_points: NonNegativeValue
    max_magic_points: NonNegativeValue
    current_magic_points: NonNegativeValue

    initial_sanity: SanityValue
    max_sanity: SanityValue
    current_sanity: SanityValue

    movement_rate: NonNegativeValue
    build: int
    damage_bonus: str = Field(min_length=1, max_length=20)
    dodge: AttributeValue

    temporary_insanity: bool
    indefinite_insanity: bool
    major_wound: bool
    unconscious: bool
    dying: bool

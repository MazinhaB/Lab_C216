from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    String,
    Text,
    false,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base

if TYPE_CHECKING:
    from app.models.campaign import Campaign


class Investigator(Base):
    __tablename__ = "investigators"

    __table_args__ = (
        CheckConstraint("strength BETWEEN 0 AND 100"),
        CheckConstraint("constitution BETWEEN 0 AND 100"),
        CheckConstraint("dexterity BETWEEN 0 AND 100"),
        CheckConstraint("appearance BETWEEN 0 AND 100"),
        CheckConstraint("size BETWEEN 0 AND 100"),
        CheckConstraint("intelligence BETWEEN 0 AND 100"),
        CheckConstraint("power BETWEEN 0 AND 100"),
        CheckConstraint("education BETWEEN 0 AND 100"),
        CheckConstraint("luck BETWEEN 0 AND 100"),
        CheckConstraint("initial_sanity BETWEEN 0 AND 99"),
        CheckConstraint("max_sanity BETWEEN 0 AND 99"),
        CheckConstraint("current_sanity BETWEEN 0 AND 99"),
        CheckConstraint("dodge BETWEEN 0 AND 100"),
        CheckConstraint("max_hit_points >= 0"),
        CheckConstraint("current_hit_points >= 0"),
        CheckConstraint("max_magic_points >= 0"),
        CheckConstraint("current_magic_points >= 0"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    campaign_id: Mapped[int] = mapped_column(
        ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Informações do investigador
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    age: Mapped[int | None] = mapped_column(nullable=True)
    gender: Mapped[str | None] = mapped_column(String(30), nullable=True)
    residence: Mapped[str | None] = mapped_column(String(150), nullable=True)
    birthplace: Mapped[str | None] = mapped_column(String(150), nullable=True)

    # Vida, Sanidade e Combate
    max_hit_points: Mapped[int] = mapped_column(nullable=False)
    current_hit_points: Mapped[int] = mapped_column(nullable=False)
    max_magic_points: Mapped[int] = mapped_column(nullable=False)
    current_magic_points: Mapped[int] = mapped_column(nullable=False)
    initial_sanity: Mapped[int] = mapped_column(nullable=False)
    max_sanity: Mapped[int] = mapped_column(nullable=False)
    current_sanity: Mapped[int] = mapped_column(nullable=False)
    movement_rate: Mapped[int] = mapped_column(nullable=False)
    build: Mapped[int] = mapped_column(nullable=False)
    damage_bonus: Mapped[str] = mapped_column(String(20), nullable=False)
    dodge: Mapped[int] = mapped_column(nullable=False)

    # Pontos de habilidades
    strength: Mapped[int] = mapped_column(nullable=False)
    constitution: Mapped[int] = mapped_column(nullable=False)
    dexterity: Mapped[int] = mapped_column(nullable=False)
    appearance: Mapped[int] = mapped_column(nullable=False)
    size: Mapped[int] = mapped_column(nullable=False)
    intelligence: Mapped[int] = mapped_column(nullable=False)
    power: Mapped[int] = mapped_column(nullable=False)
    education: Mapped[int] = mapped_column(nullable=False)
    luck: Mapped[int] = mapped_column(nullable=False)

    # Condições
    temporary_insanity: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default=false(), nullable=False
    )

    indefinite_insanity: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default=false(), nullable=False
    )

    major_wound: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default=false(), nullable=False
    )

    unconscious: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default=false(), nullable=False
    )

    dying: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default=false(), nullable=False
    )

    # História e antecedentes
    story: Mapped[str | None] = mapped_column(Text, nullable=True)
    personal_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    ideology_beliefs: Mapped[str | None] = mapped_column(Text, nullable=True)
    significant_people: Mapped[str | None] = mapped_column(Text, nullable=True)
    meaningful_locations: Mapped[str | None] = mapped_column(Text, nullable=True)
    treasured_possessions: Mapped[str | None] = mapped_column(Text, nullable=True)
    traits: Mapped[str | None] = mapped_column(Text, nullable=True)
    injuries_scars: Mapped[str | None] = mapped_column(Text, nullable=True)
    phobias_manias: Mapped[str | None] = mapped_column(Text, nullable=True)
    arcane_tomes_spells: Mapped[str | None] = mapped_column(Text, nullable=True)
    strange_encounters: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Inventário e patrimônio
    gear_possessions: Mapped[str | None] = mapped_column(Text, nullable=True)
    spending_level: Mapped[str | None] = mapped_column(Text, nullable=True)
    cash: Mapped[str | None] = mapped_column(Text, nullable=True)
    assets: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    campaign: Mapped[Campaign] = relationship(
        back_populates="investigators",
    )

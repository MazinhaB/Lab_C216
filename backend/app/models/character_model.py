from sqlalchemy import CheckConstraint, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Character(Base):
    __tablename__ = "characters"
    __table_args__ = (
        CheckConstraint("level >= 1 AND level <= 20", name="check_character_level"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    class_name: Mapped[str] = mapped_column(String(100))
    race: Mapped[str] = mapped_column(String(100))
    level: Mapped[int] = mapped_column()

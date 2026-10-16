from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.character_model import Character

class CharacterRepository:
    """Responsável pelo acesso ao banco de dados de personagens"""

    def __init__(self, db: Session):
        self.db = db

    def create(self, name: str, class_name: str, race: str, level: int) -> Character:
        character = Character(name=name, class_name=class_name, race=race, level=level)
        self.db.add(character)
        self.db.commit()
        self.db.refresh(character)
        return character

    def get_by_id(self, character_id: int) -> Character | None:
        return self.db.get(Character, character_id)

    def get_by_name(self, name: str) -> Character | None:
        return self.db.scalar(select(Character).where(Character.name == name))

    def get_all(self, skip: int = 0, limit: int = 100) -> list[Character]:
        statement = select(Character).order_by(Character.id).offset(skip).limit(limit)
        return list(self.db.scalars(statement))

    def update(self, character: Character, changes: dict) -> Character:
        for field, value in changes.items():
            setattr(character, field, value)
        self.db.commit()
        self.db.refresh(character)
        return character

    def delete(self, character: Character) -> None:
        self.db.delete(character)
        self.db.commit()

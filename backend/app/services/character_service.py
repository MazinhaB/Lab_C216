from sqlalchemy.orm import Session

from app.models.character_model import Character
from app.repositories.character_repository import CharacterRepository

def validate_character_name(name):
    if not name:
        raise ValueError("Nome de personagem não pode ser vazio")

    return name


def create_character(db: Session, name: str, class_name: str, race: str, level: int) -> Character:
    repository = CharacterRepository(db)

    name = validate_character_name(name)
    return repository.create(name, class_name, race, level)


def get_character_by_id(db: Session, character_id: int) -> Character | None:
    repository = CharacterRepository(db)

    return repository.get_by_id(character_id)
    


def get_all_characters(db: Session, skip: int = 0, limit: int = 100) -> list[Character]:
    repository = CharacterRepository(db)

    return repository.get_all(skip, limit)


def update_character(db: Session, character_id: int, name: str, class_name: str, race: str, level: int) -> Character | None:
    repository = CharacterRepository(db)

    character = repository.get_by_id(character_id)

    if character is None:
        return None

    name = validate_character_name(name)
    changes = {
        "name": name,
        "class_name": class_name,
        "race": race,
        "level": level,
    }

    return repository.update(character, changes)
    


def patch_character(db: Session, character_id: int, changes: dict) -> Character | None:
    repository = CharacterRepository(db)
    character = repository.get_by_id(character_id)

    if character is None:
        return None

    if "name" in changes:
        changes["name"] = validate_character_name(changes["name"])

    return repository.update(character, changes)
    


def delete_character(db: Session, character_id: int) -> Character | None:
    repository = CharacterRepository(db)
    character = repository.get_by_id(character_id)

    if character is None:
        return None

    repository.delete(character)

    return character
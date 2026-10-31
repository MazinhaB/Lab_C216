from sqlalchemy.orm import Session

from app.models.character_model import Character
from app.repositories.character_repository import CharacterRepository


def validate_required_text(value: str, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field_name} não pode ser vazio")

    value = value.strip()

    if len(value) > 100:
        raise ValueError(f"{field_name} deve ter no máximo 100 caracteres")

    return value


def validate_character_level(level: int) -> int:
    if not isinstance(level, int) or isinstance(level, bool) or not 1 <= level <= 20:
        raise ValueError("Nível do personagem deve ser um inteiro entre 1 e 20")

    return level


def create_character(
    db: Session, name: str, class_name: str, race: str, level: int
) -> Character:
    repository = CharacterRepository(db)

    name = validate_required_text(name, "Nome")
    class_name = validate_required_text(class_name, "Classe")
    race = validate_required_text(race, "Raça")
    level = validate_character_level(level)
    return repository.create(name, class_name, race, level)


def get_character_by_id(db: Session, character_id: int) -> Character | None:
    repository = CharacterRepository(db)

    return repository.get_by_id(character_id)


def get_all_characters(db: Session, skip: int = 0, limit: int = 100) -> list[Character]:
    repository = CharacterRepository(db)

    return repository.get_all(skip, limit)


def update_character(
    db: Session, character_id: int, name: str, class_name: str, race: str, level: int
) -> Character | None:
    repository = CharacterRepository(db)

    character = repository.get_by_id(character_id)

    if character is None:
        return None

    name = validate_required_text(name, "Nome")
    class_name = validate_required_text(class_name, "Classe")
    race = validate_required_text(race, "Raça")
    level = validate_character_level(level)
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
        changes["name"] = validate_required_text(changes["name"], "Nome")

    if "class_name" in changes:
        changes["class_name"] = validate_required_text(changes["class_name"], "Classe")

    if "race" in changes:
        changes["race"] = validate_required_text(changes["race"], "Raça")

    if "level" in changes:
        changes["level"] = validate_character_level(changes["level"])

    return repository.update(character, changes)


def delete_character(db: Session, character_id: int) -> Character | None:
    repository = CharacterRepository(db)
    character = repository.get_by_id(character_id)

    if character is None:
        return None

    repository.delete(character)

    return character

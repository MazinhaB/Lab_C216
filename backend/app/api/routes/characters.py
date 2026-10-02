from fastapi import APIRouter

from app.schemas.character import CharacterCreate
from app.services.character import create_character, get_character_by_id, get_all_characters, update_character

router = APIRouter(prefix="/characters", tags=["Characters"])


@router.get("/")
def list_characters():
    return get_all_characters()

@router.post("/")
def create_character_endpoint(character: CharacterCreate):
    return create_character(
        character.name, 
        character.class_name,
        character.race,
        character.level,
    )

@router.get("/{character_id}")
def get_character(character_id: int):
    character = get_character_by_id(character_id)
    if character is None:
        return {"error": "Character not found"}
    return character

@router.put("/{character_id}")
def update_character_endpoint(character_id: int, character: CharacterCreate):
    updated_character = update_character(
        character_id,
        character.name,
        character.class_name,
        character.race,
        character.level,
    )

    if updated_character is None:
        return {"error": "Character not found"}

    return updated_character

from fastapi import APIRouter

from app.schemas.character import CharacterCreate
from app.services.character import create_character

router = APIRouter(prefix="/characters", tags=["Characters"])


@router.get("/")
def list_characters():
    return [
        {
            "id": 1, 
            "name": "Chloe",
            "race": "Meio-Elfo",
            "class_name": "Bruxo",
            "level": 5,
        },
        {
            "id": 2,
            "name": "Shump",
            "race": "Meio-Orc",
            "class_name": "Bárbaro",
            "level": 5,
        },
        {
            "id": 3,
            "name": "Beekama",
            "race": "Tiefling",
            "class_name": "Bardo",
            "level": 2,
        },
        {
            "id": 4,
            "name": "Alton",
            "race": "Halfling",
            "class_name": "Patrulheiro",
            "level": 17,

        },
    ]

@router.post("/")
def create_character_endpoint(character: CharacterCreate):
    return create_character(
        character.name, 
        character.class_name,
        character.race,
        character.level,
    )
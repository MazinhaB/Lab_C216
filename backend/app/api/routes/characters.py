from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.character_schema import CharacterCreate, CharacterPatch, CharacterRead, CharacterUpdate
from app.services.character_service import (
    create_character,
    delete_character,
    get_all_characters,
    get_character_by_id,
    patch_character,
    update_character,
)

router = APIRouter(prefix="/characters", tags=["Characters"])


@router.get("/", response_model=list[CharacterRead])
def list_characters(db: Session = Depends(get_db)):
    return get_all_characters(db)


@router.post("/", response_model=CharacterRead)
def create_character_endpoint(character: CharacterCreate, db: Session = Depends(get_db)):
    return create_character(
        db,
        character.name,
        character.class_name,
        character.race,
        character.level,
    )


@router.get("/{character_id}", response_model=CharacterRead)
def get_character(character_id: int, db: Session = Depends(get_db)):
    character = get_character_by_id(db, character_id)
    if character is None:
        raise HTTPException(status_code=404, detail="Character not found")
    return character


@router.put("/{character_id}", response_model=CharacterRead)
def update_character_endpoint(character_id: int, character: CharacterUpdate, db: Session = Depends(get_db)):
    updated_character = update_character(
        db,
        character_id,
        character.name,
        character.class_name,
        character.race,
        character.level,
    )

    if updated_character is None:
        raise HTTPException(status_code=404, detail="Character not found")

    return updated_character


@router.patch("/{character_id}", response_model=CharacterRead)
def patch_character_endpoint(character_id: int, character: CharacterPatch, db: Session = Depends(get_db)):
    updated_character = patch_character(
        db,
        character_id,
        character.model_dump(exclude_unset=True),
    )

    if updated_character is None:
        raise HTTPException(status_code=404, detail="Character not found")

    return updated_character


@router.delete("/{character_id}", response_model=CharacterRead)
def delete_character_endpoint(character_id: int, db: Session = Depends(get_db)):
    deleted_character = delete_character(db, character_id)

    if deleted_character is None:
        raise HTTPException(status_code=404, detail="Character not found")

    return deleted_character

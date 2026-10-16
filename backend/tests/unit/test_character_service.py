from unittest.mock import MagicMock

import pytest

from app.models.character_model import Character
from app.services.character_service import (
    create_character,
    delete_character,
    get_all_characters,
    get_character_by_id,
    patch_character,
    update_character,
    validate_character_name,
)


@pytest.fixture()
def db():
    return MagicMock()


def test_character_name_empty():
    with pytest.raises(ValueError):
        validate_character_name("")


def test_character_name():
    name = validate_character_name("Chloe")

    assert name == "Chloe"


def test_create_character(db):
    character = Character(
        id=5, name="Gandalf", class_name="Mago", race="Humano", level=20
    )

    with pytest.MonkeyPatch.context() as monkeypatch:
        repository = MagicMock()
        repository.create.return_value = character

        monkeypatch.setattr(
            "app.services.character_service.CharacterRepository", lambda _: repository
        )

        result = create_character(db, "Gandalf", "Mago", "Humano", 20)

    repository.create.assert_called_once_with("Gandalf", "Mago", "Humano", 20)
    assert result.name == "Gandalf"
    assert result.id == 5


@pytest.mark.parametrize(
    "name",
    ["Chloe", "Gandalf", "Aragorn", "Beekama"],
)
def test_valid_character_names(name):
    assert validate_character_name(name) == name


def test_get_character_by_id(db):
    character = Character(
        id=1,
        name="Chloe",
        class_name="Bruxo",
        race="Meio-Elfo",
        level=5,
    )

    with pytest.MonkeyPatch.context() as monkeypatch:
        repository = MagicMock()
        repository.get_by_id.return_value = character

        monkeypatch.setattr(
            "app.services.character_service.CharacterRepository",
            lambda _: repository,
        )

        result = get_character_by_id(db, 1)

    assert result == character
    repository.get_by_id.assert_called_once_with(1)


def test_get_all_characters(db):
    characters = [
        Character(
            id=1,
            name="Chloe",
            class_name="Bruxo",
            race="Meio-Elfo",
            level=5,
        )
    ]

    with pytest.MonkeyPatch.context() as monkeypatch:
        repository = MagicMock()
        repository.get_all.return_value = characters

        monkeypatch.setattr(
            "app.services.character_service.CharacterRepository",
            lambda _: repository,
        )

        result = get_all_characters(db)

    assert result == characters
    repository.get_all.assert_called_once_with(0, 100)


def test_update_character(db):
    character = Character(
        id=1,
        name="Chloe Upada",
        class_name="Bruxo",
        race="Meio-Elfo",
        level=6,
    )

    with pytest.MonkeyPatch.context() as monkeypatch:
        repository = MagicMock()
        repository.get_by_id.return_value = character
        repository.update.return_value = character

        monkeypatch.setattr(
            "app.services.character_service.CharacterRepository",
            lambda _: repository,
        )

        result = update_character(db, 1, "Chloe Upada", "Bruxo", "Meio-Elfo", 6)

    assert result == character
    repository.update.assert_called_once()


def test_update_character_not_found(db):
    with pytest.MonkeyPatch.context() as monkeypatch:
        repository = MagicMock()
        repository.get_by_id.return_value = None

        monkeypatch.setattr(
            "app.services.character_service.CharacterRepository",
            lambda _: repository,
        )

        result = update_character(db, 99, "Stark", "Mago", "Humano", 1)

    assert result is None
    repository.update.assert_not_called()


def test_patch_character(db):
    character = Character(
        id=1,
        name="Chloe",
        class_name="Bruxo",
        race="Meio-Elfo",
        level=7,
    )

    with pytest.MonkeyPatch.context() as monkeypatch:
        repository = MagicMock()
        repository.get_by_id.return_value = character
        repository.update.return_value = character
        monkeypatch.setattr(
            "app.services.character_service.CharacterRepository",
            lambda _: repository,
        )

        result = patch_character(db, 1, {"level": 7})

    assert result == character
    repository.update.assert_called_once_with(character, {"level": 7})


def test_delete_character(db):
    character = Character(
        id=1,
        name="Chloe",
        class_name="Bruxo",
        race="Meio-Elfo",
        level=5,
    )

    with pytest.MonkeyPatch.context() as monkeypatch:
        repository = MagicMock()
        repository.get_by_id.return_value = character
        monkeypatch.setattr(
            "app.services.character_service.CharacterRepository",
            lambda _: repository,
        )

        result = delete_character(db, 1)

    assert result == character
    repository.delete.assert_called_once_with(character)

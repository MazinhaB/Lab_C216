import pytest

from app.services.character import validate_character_name

def test_character_name_empty():
    with pytest.raises(ValueError):
        validate_character_name("")

def test_character_name():
    name = validate_character_name("Chloe")

    assert name == "Chloe"
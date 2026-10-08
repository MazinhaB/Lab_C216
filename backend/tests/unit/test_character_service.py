import pytest

from app.services.character import characters, create_character, validate_character_name


@pytest.fixture(autouse=True)
def reset_characters():
    characters.clear()
    characters.extend(
        [
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
    )


def test_character_name_empty():
    with pytest.raises(ValueError):
        validate_character_name("")


def test_character_name():
    name = validate_character_name("Chloe")

    assert name == "Chloe"


def test_create_character():
    character = create_character(
        "Gandalf",
        "Mago",
        "Humano",
        20,
    )

    assert character["id"] == 5
    assert character["name"] == "Gandalf"
    assert character["class_name"] == "Mago"
    assert character["race"] == "Humano"
    assert character["level"] == 20


@pytest.mark.parametrize(
    "name",
    ["Chloe", "Gandalf", "Aragorn", "Beekama"],
)
def test_valid_character_names(name):
    assert validate_character_name(name) == name

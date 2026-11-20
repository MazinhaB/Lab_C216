import pytest
from pydantic import ValidationError

from app.schemas.investigator import InvestigatorUpdate


@pytest.fixture
def full_data():
    return {
        "name": "Miguel",
        "strength": 40,
        "constitution": 60,
        "dexterity": 65,
        "appearance": 55,
        "size": 55,
        "intelligence": 80,
        "power": 65,
        "education": 70,
        "luck": 35,
        "max_hit_points": 20,
        "current_hit_points": 18,
        "max_magic_points": 13,
        "current_magic_points": 10,
        "initial_sanity": 65,
        "max_sanity": 99,
        "current_sanity": 60,
        "movement_rate": 8,
        "build": 0,
        "damage_bonus": "0",
        "dodge": 32,
        "temporary_insanity": False,
        "indefinite_insanity": False,
        "major_wound": False,
        "unconscious": False,
        "dying": False,
    }


def test_update_accepts_custom_values(full_data):
    data = InvestigatorUpdate(**full_data)

    assert data.name == "Miguel"
    assert data.max_hit_points == 20
    assert data.current_hit_points == 18
    assert data.current_sanity == 60


def test_update_requires_derived_values(full_data):
    del full_data["max_hit_points"]

    with pytest.raises(ValidationError):
        InvestigatorUpdate(**full_data)


def test_update_rejects_null_required_condition(full_data):
    full_data["major_wound"] = None

    with pytest.raises(ValidationError):
        InvestigatorUpdate(**full_data)

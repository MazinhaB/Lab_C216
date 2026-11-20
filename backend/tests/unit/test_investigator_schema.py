import pytest
from pydantic import ValidationError

from app.schemas.investigator import InvestigatorCreate


@pytest.fixture
def investigator_data():
    return {
        "name": "Arthur Morgan",
        "strength": 60,
        "constitution": 65,
        "dexterity": 70,
        "appearance": 50,
        "size": 55,
        "intelligence": 80,
        "power": 60,
        "education": 75,
        "luck": 45,
    }


def test_create_investigator_valid(investigator_data):
    investigator = InvestigatorCreate(**investigator_data)

    assert investigator.name == "Arthur Morgan"
    assert investigator.strength == 60
    assert investigator.max_hit_points is None
    assert investigator.temporary_insanity is False


def test_create_investigator_with_house_rules(investigator_data):
    investigator = InvestigatorCreate(
        **investigator_data,
        max_hit_points=20,
        current_hit_points=20,
        max_sanity=90,
        current_sanity=75,
        build=2,
        damage_bonus="+1D6",
    )

    assert investigator.max_hit_points == 20
    assert investigator.current_sanity == 75
    assert investigator.build == 2
    assert investigator.damage_bonus == "+1D6"


def test_create_investigator_trims_name(investigator_data):
    investigator_data["name"] = "  Arthur Morgan  "

    investigator = InvestigatorCreate(**investigator_data)

    assert investigator.name == "Arthur Morgan"


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("strength", -1),
        ("constitution", 101),
        ("dexterity", 50.5),
        ("luck", 150),
    ],
)
def test_create_investigator_invalid_attribute(investigator_data, field, value):
    investigator_data[field] = value

    with pytest.raises(ValidationError):
        InvestigatorCreate(**investigator_data)


def test_create_investigator_rejects_sanity_100(investigator_data):
    investigator_data["max_sanity"] = 100

    with pytest.raises(ValidationError):
        InvestigatorCreate(**investigator_data)


def test_create_investigator_rejects_negative_hp(investigator_data):
    investigator_data["max_hit_points"] = -5

    with pytest.raises(ValidationError):
        InvestigatorCreate(**investigator_data)


def test_create_investigator_rejects_blank_name(investigator_data):
    investigator_data["name"] = "   "

    with pytest.raises(ValidationError):
        InvestigatorCreate(**investigator_data)

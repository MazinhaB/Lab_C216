import pytest

from app.core.investigator_rules import (
    calculate_damage_bonus_and_build,
    calculate_investigator_defaults,
    calculate_movement_rate,
)


@pytest.mark.parametrize(
    ("strength", "size", "expected"),
    [
        (30, 34, ("-2", -2)),
        (40, 25, ("-1", -1)),
        (50, 50, ("0", 0)),
        (80, 65, ("+1D4", 1)),
        (90, 90, ("+1D6", 2)),
    ],
)
def test_damage_bonus_and_build(strength, size, expected):
    assert calculate_damage_bonus_and_build(strength, size) == expected


@pytest.mark.parametrize(
    ("strength", "dexterity", "size", "expected"),
    [
        (40, 45, 60, 7),
        (60, 40, 60, 8),
        (70, 80, 60, 9),
    ],
)
def test_movement_rate(strength, dexterity, size, expected):
    assert calculate_movement_rate(strength, dexterity, size) == expected


def test_movement_rate_with_age():
    assert calculate_movement_rate(70, 80, 60, age=45) == 8
    assert calculate_movement_rate(70, 80, 60, age=65) == 6


def test_investigator_default_values():
    result = calculate_investigator_defaults(
        strength=60,
        constitution=65,
        dexterity=70,
        size=55,
        power=60,
        age=35,
    )

    assert result["max_hit_points"] == 12
    assert result["current_hit_points"] == 12
    assert result["max_magic_points"] == 12
    assert result["initial_sanity"] == 60
    assert result["max_sanity"] == 99
    assert result["current_sanity"] == 60
    assert result["movement_rate"] == 9
    assert result["build"] == 0
    assert result["damage_bonus"] == "0"
    assert result["dodge"] == 35


def test_sanity_maximum_with_cthulhu_mythos():
    result = calculate_investigator_defaults(
        strength=50,
        constitution=50,
        dexterity=50,
        size=50,
        power=90,
        cthulhu_mythos=20,
    )

    assert result["max_sanity"] == 79
    assert result["initial_sanity"] == 90
    assert result["current_sanity"] == 79


def test_sanity_never_exceeds_99():
    result = calculate_investigator_defaults(
        strength=50,
        constitution=50,
        dexterity=50,
        size=50,
        power=100,
    )

    assert result["initial_sanity"] == 99
    assert result["current_sanity"] == 99


def test_invalid_cthulhu_mythos():
    with pytest.raises(ValueError):
        calculate_investigator_defaults(
            strength=50,
            constitution=50,
            dexterity=50,
            size=50,
            power=60,
            cthulhu_mythos=100,
        )

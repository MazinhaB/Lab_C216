def calculate_damage_bonus_and_build(
    strength: int,
    size: int,
) -> tuple[str, int]:
    total = strength + size

    if total <= 64:
        return "-2", -2
    if total <= 84:
        return "-1", -1
    if total <= 124:
        return "0", 0
    if total <= 164:
        return "+1D4", 1

    return "+1D6", 2


def calculate_movement_rate(
    strength: int,
    dexterity: int,
    size: int,
    age: int | None = None,
) -> int:
    if strength > size and dexterity > size:
        movement = 9
    elif strength < size and dexterity < size:
        movement = 7
    else:
        movement = 8

    if age is not None and age >= 40:
        # Ajustes padrão das décadas de 40 a 80 anos.
        # Para 90+, mantém-se o último ajuste tabelado.
        age_penalty = min(age // 10 - 3, 5)
        movement -= age_penalty

    return max(0, movement)


def calculate_investigator_defaults(
    strength: int,
    constitution: int,
    dexterity: int,
    size: int,
    power: int,
    age: int | None = None,
    cthulhu_mythos: int = 0,
) -> dict[str, int | str]:
    if not 0 <= cthulhu_mythos <= 99:
        raise ValueError("O conhecimento de Cthulhu Mythos deve estar entre 0 e 99.")

    hit_points = (constitution + size) // 10
    magic_points = power // 5

    max_sanity = 99 - cthulhu_mythos
    initial_sanity = min(power, 99)

    damage_bonus, build = calculate_damage_bonus_and_build(
        strength,
        size,
    )

    movement_rate = calculate_movement_rate(
        strength,
        dexterity,
        size,
        age,
    )

    return {
        "max_hit_points": hit_points,
        "current_hit_points": hit_points,
        "max_magic_points": magic_points,
        "current_magic_points": magic_points,
        "initial_sanity": initial_sanity,
        "max_sanity": max_sanity,
        "current_sanity": min(initial_sanity, max_sanity),
        "movement_rate": movement_rate,
        "build": build,
        "damage_bonus": damage_bonus,
        "dodge": dexterity // 2,
    }

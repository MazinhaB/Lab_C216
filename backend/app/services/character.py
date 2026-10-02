characters = [
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
def validate_character_name(name):
    if not name:
        raise ValueError("Nome de personagem não pode ser vazio")
    
    return name

def create_character(name, class_name, race, level):
    name = validate_character_name(name)

    character = {
        "id": len(characters) + 1,
        "name": name,
        "class_name": class_name,
        "race": race,
        "level": level,
    }

    characters.append(character)

    return character

def get_character_by_id(character_id):
    for character in characters:
        if character["id"] == character_id:
            return character
    return None

def get_all_characters():
    return characters

def update_character(character_id, name, class_name, race, level):
    character = get_character_by_id(character_id)

    if character is None:
        return None

    character["name"] = validate_character_name(name)
    character["class_name"] = class_name
    character["race"] = race
    character["level"] = level

    return character
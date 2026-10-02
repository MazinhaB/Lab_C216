characters = []

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

import pytest

from fastapi.testclient import TestClient
from app.services.character import characters

from app.main import app

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

client = TestClient(app)

def test_list_characters():
    response = client.get("/characters/")

    assert response.status_code == 200
    assert len(response.json()) == 4

def test_create_character():
    response = client.post(
        "/characters/",
        json={
            "name": "Gandalf",
            "class_name": "Mago",
            "race": "Humano",
            "level": 20,
        },
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Gandalf"
    assert response.json()["class_name"] == "Mago"
    assert response.json()["race"] == "Humano"
    assert response.json()["level"] == 20

def test_get_character_by_id():
    response = client.get("/characters/1")

    assert response.status_code == 200
    assert response.json()["id"] == 1
    assert response.json()["name"] == "Chloe"


def test_get_character_not_found():
    response = client.get("/characters/99")

    assert response.status_code == 200
    assert response.json() == {"error": "Character not found"}

def test_update_character():
    response = client.put(
        "/characters/1",
        json={
            "name": "Chloe Upada",
            "class_name": "Bruxo",
            "race": "Meio-Elfo",
            "level": 6,
        },
    )

    assert response.status_code == 200
    assert response.json()["id"] == 1
    assert response.json()["name"] == "Chloe Upada"
    assert response.json()["class_name"] == "Bruxo"
    assert response.json()["race"] == "Meio-Elfo"
    assert response.json()["level"] == 6

def test_update_character_not_found():
    response = client.put(
        "/characters/99",
        json={
            "name": "Stark",
            "class_name": "Mago",
            "race": "Humano",
            "level": 1,
        },
    )

    assert response.status_code == 200
    assert response.json() == {"error": "Character not found"}

def test_patch_character():
    response = client.patch(
        "/characters/1",
        json={"level": 7},
    )

    assert response.status_code == 200
    assert response.json()["id"] == 1
    assert response.json()["name"] == "Chloe"
    assert response.json()["class_name"] == "Bruxo"
    assert response.json()["race"] == "Meio-Elfo"
    assert response.json()["level"] == 7

def test_patch_character_not_found():
    response = client.patch(
        "/characters/99",
        json={"level": 7},
    )

    assert response.status_code == 200
    assert response.json() == {"error": "Character not found"}

def test_delete_character():
    response = client.delete("/characters/1")

    assert response.status_code == 200
    assert response.json()["id"] == 1
    assert response.json()["name"] == "Chloe"

    response = client.get("/characters/1")
    assert response.json() == {"error": "Character not found"}


def test_delete_character_not_found():
    response = client.delete("/characters/99")

    assert response.status_code == 200
    assert response.json() == {"error": "Character not found"}
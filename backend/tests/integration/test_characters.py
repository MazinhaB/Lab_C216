from fastapi.testclient import TestClient

from app.main import app

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
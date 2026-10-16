import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.base import Base
from app.database.session import get_db
from app.main import app
from app.models.character_model import Character


@pytest.fixture()
def client():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    TestingSessionLocal = sessionmaker(
        bind=engine, autoflush=False, expire_on_commit=False
    )
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    db.add_all(
        [
            Character(name="Chloe", class_name="Bruxo", race="Meio-Elfo", level=5),
            Character(
                name="Shump",
                race="Meio-Orc",
                class_name="Bárbaro",
                level=5,
            ),
            Character(
                name="Beekama",
                race="Tiefling",
                class_name="Bardo",
                level=2,
            ),
            Character(
                name="Alton",
                race="Halfling",
                class_name="Patrulheiro",
                level=17,
            ),
        ]
    )
    db.commit()
    db.close()

    def override_get_db():
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db

    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_list_characters(client):
    response = client.get("/characters/")

    assert response.status_code == 200
    assert len(response.json()) == 4


def test_create_character(client):
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


def test_get_character_by_id(client):
    response = client.get("/characters/1")

    assert response.status_code == 200
    assert response.json()["id"] == 1
    assert response.json()["name"] == "Chloe"


def test_get_character_not_found(client):
    response = client.get("/characters/99")

    assert response.status_code == 404
    assert response.json() == {"detail": "Character not found"}


def test_update_character(client):
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


def test_update_character_not_found(client):
    response = client.put(
        "/characters/99",
        json={
            "name": "Stark",
            "class_name": "Mago",
            "race": "Humano",
            "level": 1,
        },
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Character not found"}


def test_patch_character(client):
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


def test_patch_character_not_found(client):
    response = client.patch(
        "/characters/99",
        json={"level": 7},
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Character not found"}


def test_delete_character(client):
    response = client.delete("/characters/1")

    assert response.status_code == 200
    assert response.json()["id"] == 1
    assert response.json()["name"] == "Chloe"

    response = client.get("/characters/1")
    assert response.status_code == 404
    assert response.json() == {"detail": "Character not found"}


def test_delete_character_not_found(client):
    response = client.delete("/characters/99")

    assert response.status_code == 404
    assert response.json() == {"detail": "Character not found"}

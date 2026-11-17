import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.database.connection import engine, get_db
from app.main import app


@pytest.fixture
def cliente():
    with engine.connect() as connection:
        transaction = connection.begin()

        def override_get_db():
            with Session(
                bind=connection,
                join_transaction_mode="create_savepoint",
            ) as session:
                yield session

        app.dependency_overrides[get_db] = override_get_db

        try:
            with TestClient(app) as test_client:
                yield test_client
        finally:
            app.dependency_overrides.pop(get_db, None)
            transaction.rollback()


def test_create_and_get_campaign(cliente):
    payload = {
        "name": "Mistérios de Arkham",
        "description": "Investigação em Arkham, 1925.",
    }

    response = cliente.post("/campaigns/", json=payload)

    assert response.status_code == 201

    created = response.json()

    assert created["id"] > 0
    assert created["name"] == payload["name"]
    assert created["description"] == payload["description"]
    assert created["created_at"] is not None

    response = cliente.get(f"/campaigns/{created['id']}")

    assert response.status_code == 200
    assert response.json()["name"] == payload["name"]


def test_list_campaigns(cliente):
    response = cliente.post(
        "/campaigns/",
        json={"name": "O Horror de Dunwich"},
    )

    assert response.status_code == 201

    campaign_id = response.json()["id"]

    response = cliente.get("/campaigns/")

    assert response.status_code == 200
    assert any(campaign["id"] == campaign_id for campaign in response.json())


def test_create_campaign_with_invalid_name(cliente):
    response = cliente.post(
        "/campaigns/",
        json={"name": "   "},
    )

    assert response.status_code == 422


def test_get_nonexistent_campaign(cliente):
    response = cliente.get("/campaigns/-1")

    assert response.status_code == 404


def test_update_campaign(cliente):
    created = cliente.post(
        "/campaigns/",
        json={
            "name": "Campanha Original",
            "description": "Descrição original.",
        },
    ).json()

    campaign_id = created["id"]

    response = cliente.put(
        f"/campaigns/{campaign_id}",
        json={
            "name": "Campanha Atualizada",
            "description": "Nova descrição.",
        },
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Campanha Atualizada"
    assert response.json()["description"] == "Nova descrição."

    saved = cliente.get(f"/campaigns/{campaign_id}")

    assert saved.status_code == 200
    assert saved.json()["name"] == "Campanha Atualizada"


def test_patch_campaign_preserves_name(cliente):
    created = cliente.post(
        "/campaigns/",
        json={
            "name": "Mistérios de Arkham",
            "description": "Descrição original.",
        },
    ).json()

    campaign_id = created["id"]

    response = cliente.patch(
        f"/campaigns/{campaign_id}",
        json={"description": "Descrição modificada."},
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Mistérios de Arkham"
    assert response.json()["description"] == "Descrição modificada."


def test_patch_campaign_clears_description(cliente):
    created = cliente.post(
        "/campaigns/",
        json={
            "name": "Campanha sem descrição",
            "description": "Descrição temporária.",
        },
    ).json()

    campaign_id = created["id"]

    response = cliente.patch(
        f"/campaigns/{campaign_id}",
        json={"description": None},
    )

    assert response.status_code == 200
    assert response.json()["description"] is None

    saved = cliente.get(f"/campaigns/{campaign_id}")

    assert saved.json()["description"] is None


def test_delete_campaign(cliente):
    created = cliente.post(
        "/campaigns/",
        json={"name": "Campanha para excluir"},
    ).json()

    campaign_id = created["id"]

    response = cliente.delete(f"/campaigns/{campaign_id}")

    assert response.status_code == 204

    response = cliente.get(f"/campaigns/{campaign_id}")

    assert response.status_code == 404


def test_update_nonexistent_campaign(cliente):
    response = cliente.put(
        "/campaigns/-1",
        json={"name": "Campanha Inexistente"},
    )

    assert response.status_code == 404


def test_patch_nonexistent_campaign(cliente):
    response = cliente.patch(
        "/campaigns/-1",
        json={"description": "Descrição atualizada."},
    )

    assert response.status_code == 404


def test_delete_nonexistent_campaign(cliente):
    response = cliente.delete("/campaigns/-1")

    assert response.status_code == 404

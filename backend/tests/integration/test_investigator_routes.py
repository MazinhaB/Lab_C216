import pytest
from fastapi.testclient import TestClient
from sqlalchemy.engine import Connection
from sqlalchemy.orm import Session

from app.models.investigator import Investigator


@pytest.fixture
def investigator_data():
    return {
        "name": "Miguel",
        "age": 26,
        "strength": 40,
        "constitution": 60,
        "dexterity": 65,
        "appearance": 55,
        "size": 55,
        "intelligence": 80,
        "power": 65,
        "education": 70,
        "luck": 35,
    }


def create_campaign(cliente: TestClient, name: str) -> int:
    response = cliente.post("/campaigns/", json={"name": name})

    assert response.status_code == 201, response.text

    return response.json()["id"]


def create_investigator(
    cliente: TestClient,
    campaign_id: int,
    data: dict,
) -> dict:
    response = cliente.post(
        f"/campaigns/{campaign_id}/investigators",
        json=data,
    )

    assert response.status_code == 201, response.text

    return response.json()


def put_payload(investigator: dict) -> dict:
    excluded = {
        "id",
        "campaign_id",
        "created_at",
        "updated_at",
    }

    return {
        field: value for field, value in investigator.items() if field not in excluded
    }


def test_create_and_get_investigator_with_house_rules(
    cliente,
    investigator_data,
):
    campaign_id = create_campaign(cliente, "Mistério em Arkham")

    data = {
        **investigator_data,
        "max_hit_points": 20,
    }

    created = create_investigator(cliente, campaign_id, data)

    assert created["campaign_id"] == campaign_id
    assert created["max_hit_points"] == 20
    assert created["current_hit_points"] == 20

    assert created["max_magic_points"] == 13
    assert created["current_magic_points"] == 13

    assert created["initial_sanity"] == 65
    assert created["max_sanity"] == 99
    assert created["current_sanity"] == 65

    response = cliente.get(f"/campaigns/{campaign_id}/investigators/{created['id']}")

    assert response.status_code == 200
    assert response.json()["max_hit_points"] == 20

    response = cliente.get(f"/campaigns/{campaign_id}/investigators")

    assert response.status_code == 200
    assert any(item["id"] == created["id"] for item in response.json())


def test_patch_preserves_other_values(
    cliente,
    investigator_data,
):
    campaign_id = create_campaign(cliente, "Campanha PATCH")

    created = create_investigator(
        cliente,
        campaign_id,
        {
            **investigator_data,
            "max_hit_points": 20,
            "story": "História original",
        },
    )

    url = f"/campaigns/{campaign_id}/investigators/{created['id']}"

    response = cliente.patch(
        url,
        json={
            "power": 80,
            "current_sanity": 40,
            "story": None,
        },
    )

    assert response.status_code == 200
    assert response.json()["power"] == 80
    assert response.json()["current_sanity"] == 40
    assert response.json()["story"] is None

    saved = cliente.get(url).json()

    assert saved["max_hit_points"] == 20
    assert saved["initial_sanity"] == 65
    assert saved["max_sanity"] == 99
    assert saved["current_sanity"] == 40

    # PATCH não recalcula valores já armazenados.
    assert saved["max_magic_points"] == 13


def test_put_replaces_investigator_data(
    cliente,
    investigator_data,
):
    campaign_id = create_campaign(cliente, "Campanha PUT")

    created = create_investigator(
        cliente,
        campaign_id,
        {
            **investigator_data,
            "story": "História antiga",
        },
    )

    payload = put_payload(created)
    payload["name"] = "Miguel Atualizado"
    payload["max_hit_points"] = 25
    payload["current_hit_points"] = 18
    payload["current_sanity"] = 50
    payload.pop("story")

    url = f"/campaigns/{campaign_id}/investigators/{created['id']}"

    response = cliente.put(url, json=payload)

    assert response.status_code == 200, response.text

    saved = cliente.get(url).json()

    assert saved["name"] == "Miguel Atualizado"
    assert saved["max_hit_points"] == 25
    assert saved["current_hit_points"] == 18
    assert saved["current_sanity"] == 50
    assert saved["story"] is None


def test_delete_only_selected_investigator(
    cliente,
    investigator_data,
):
    campaign_id = create_campaign(cliente, "Campanha DELETE")

    first = create_investigator(
        cliente,
        campaign_id,
        investigator_data,
    )

    second = create_investigator(
        cliente,
        campaign_id,
        {
            **investigator_data,
            "name": "Elizabeth",
        },
    )

    url = f"/campaigns/{campaign_id}/investigators/{first['id']}"

    response = cliente.delete(url)

    assert response.status_code == 204
    assert cliente.get(url).status_code == 404

    response = cliente.get(f"/campaigns/{campaign_id}/investigators")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == second["id"]


def test_cannot_access_investigator_from_other_campaign(
    cliente,
    investigator_data,
):
    campaign_a = create_campaign(cliente, "Campanha A")
    campaign_b = create_campaign(cliente, "Campanha B")

    investigator = create_investigator(
        cliente,
        campaign_a,
        investigator_data,
    )

    wrong_url = f"/campaigns/{campaign_b}/investigators/{investigator['id']}"

    assert cliente.get(wrong_url).status_code == 404

    response = cliente.patch(
        wrong_url,
        json={"current_sanity": 10},
    )
    assert response.status_code == 404

    response = cliente.put(
        wrong_url,
        json=put_payload(investigator),
    )
    assert response.status_code == 404

    response = cliente.delete(wrong_url)
    assert response.status_code == 404

    correct_url = f"/campaigns/{campaign_a}/investigators/{investigator['id']}"

    saved = cliente.get(correct_url)

    assert saved.status_code == 200
    assert saved.json()["current_sanity"] == 65

    response = cliente.get(f"/campaigns/{campaign_b}/investigators")

    assert response.status_code == 200
    assert response.json() == []


def test_delete_campaign_cascades_to_investigators(
    cliente,
    conexao_teste: Connection,
    investigator_data,
):
    campaign_a = create_campaign(cliente, "Campanha A")
    campaign_b = create_campaign(cliente, "Campanha B")

    first = create_investigator(
        cliente,
        campaign_a,
        investigator_data,
    )

    second = create_investigator(
        cliente,
        campaign_b,
        {
            **investigator_data,
            "name": "Elizabeth",
        },
    )

    response = cliente.delete(f"/campaigns/{campaign_a}")

    assert response.status_code == 204

    # Verifica a remoção física no banco, não apenas o HTTP 404.
    with Session(
        bind=conexao_teste,
        join_transaction_mode="create_savepoint",
    ) as session:
        assert session.get(Investigator, first["id"]) is None
        assert session.get(Investigator, second["id"]) is not None

    response = cliente.get(f"/campaigns/{campaign_b}/investigators")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == second["id"]


def test_create_investigator_invalid_campaign(
    cliente,
    investigator_data,
):
    response = cliente.post(
        "/campaigns/-1/investigators",
        json=investigator_data,
    )

    assert response.status_code == 404

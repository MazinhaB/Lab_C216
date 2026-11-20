from datetime import UTC, datetime
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.routes.investigator import get_investigator_service
from app.schemas.investigator import InvestigatorResponse
from app.services.campaign import CampaignNotFoundError
from app.services.investigator import InvestigatorNotFoundError


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


@pytest.fixture
def investigator_response(investigator_data):
    return InvestigatorResponse(
        id=5,
        campaign_id=1,
        **investigator_data,
        max_hit_points=12,
        current_hit_points=12,
        max_magic_points=12,
        current_magic_points=12,
        initial_sanity=60,
        max_sanity=99,
        current_sanity=60,
        movement_rate=9,
        build=0,
        damage_bonus="0",
        dodge=35,
        created_at=datetime(2026, 11, 20, tzinfo=UTC),
        updated_at=datetime(2026, 11, 20, tzinfo=UTC),
    )


@pytest.fixture
def api():
    service = MagicMock()

    app.dependency_overrides[get_investigator_service] = lambda: service

    try:
        with TestClient(app) as client:
            yield client, service
    finally:
        app.dependency_overrides.pop(get_investigator_service, None)


def test_create_investigator(api, investigator_data, investigator_response):
    client, service = api
    service.create.return_value = investigator_response

    response = client.post(
        "/campaigns/1/investigators",
        json=investigator_data,
    )

    assert response.status_code == 201
    assert response.json()["id"] == 5
    assert response.json()["name"] == "Arthur Morgan"
    service.create.assert_called_once()

    campaign_id, data = service.create.call_args.args
    assert campaign_id == 1
    assert data.name == "Arthur Morgan"


def test_create_investigator_invalid_campaign(api, investigator_data):
    client, service = api
    service.create.side_effect = CampaignNotFoundError("Campanha não encontrada.")

    response = client.post(
        "/campaigns/999/investigators",
        json=investigator_data,
    )

    assert response.status_code == 404


def test_get_investigator(api, investigator_response):
    client, service = api
    service.get_by_id.return_value = investigator_response

    response = client.get("/campaigns/1/investigators/5")

    assert response.status_code == 200
    assert response.json()["id"] == 5
    assert response.json()["campaign_id"] == 1
    service.get_by_id.assert_called_once_with(1, 5)


def test_get_investigator_not_found(api):
    client, service = api
    service.get_by_id.side_effect = InvestigatorNotFoundError(
        "Investigador não encontrado."
    )

    response = client.get("/campaigns/1/investigators/999")

    assert response.status_code == 404


def test_get_investigator_invalid_campaign(api):
    client, service = api
    service.get_by_id.side_effect = CampaignNotFoundError("Campanha não encontrada.")

    response = client.get("/campaigns/999/investigators/5")

    assert response.status_code == 404


def test_list_investigators(api, investigator_response):
    client, service = api
    service.list_by_campaign.return_value = [investigator_response]

    response = client.get("/campaigns/1/investigators")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Arthur Morgan"
    service.list_by_campaign.assert_called_once_with(1)


def test_list_investigators_empty(api):
    client, service = api
    service.list_by_campaign.return_value = []

    response = client.get("/campaigns/1/investigators")

    assert response.status_code == 200
    assert response.json() == []


def test_list_investigators_invalid_campaign(api):
    client, service = api
    service.list_by_campaign.side_effect = CampaignNotFoundError(
        "Campanha não encontrada."
    )

    response = client.get("/campaigns/999/investigators")

    assert response.status_code == 404


def test_patch_investigator(api, investigator_response):
    client, service = api

    updated = investigator_response.model_copy(update={"current_sanity": 65})
    service.patch.return_value = updated

    response = client.patch(
        "/campaigns/1/investigators/5",
        json={"current_sanity": 65},
    )

    assert response.status_code == 200
    assert response.json()["current_sanity"] == 65

    campaign_id, investigator_id, data = service.patch.call_args.args
    assert campaign_id == 1
    assert investigator_id == 5
    assert data.current_sanity == 65


def test_patch_investigator_not_found(api):
    client, service = api
    service.patch.side_effect = InvestigatorNotFoundError(
        "Investigador não encontrado."
    )

    response = client.patch(
        "/campaigns/1/investigators/999",
        json={"current_sanity": 65},
    )

    assert response.status_code == 404


def test_update_investigator(api, investigator_response):
    client, service = api

    updated = investigator_response.model_copy(update={"current_sanity": 55})
    service.update.return_value = updated

    payload = investigator_response.model_dump(
        exclude={"id", "campaign_id", "created_at", "updated_at"}
    )
    payload["current_sanity"] = 55

    response = client.put(
        "/campaigns/1/investigators/5",
        json=payload,
    )

    assert response.status_code == 200
    assert response.json()["current_sanity"] == 55

    campaign_id, investigator_id, data = service.update.call_args.args
    assert campaign_id == 1
    assert investigator_id == 5
    assert data.current_sanity == 55


def test_update_investigator_not_found(api, investigator_response):
    client, service = api
    service.update.side_effect = InvestigatorNotFoundError(
        "Investigador não encontrado."
    )

    payload = investigator_response.model_dump(
        exclude={"id", "campaign_id", "created_at", "updated_at"}
    )

    response = client.put(
        "/campaigns/1/investigators/999",
        json=payload,
    )

    assert response.status_code == 404


def test_delete_investigator(api):
    client, service = api

    response = client.delete("/campaigns/1/investigators/5")

    assert response.status_code == 204
    assert response.content == b""
    service.delete.assert_called_once_with(1, 5)


def test_delete_investigator_not_found(api):
    client, service = api
    service.delete.side_effect = InvestigatorNotFoundError(
        "Investigador não encontrado."
    )

    response = client.delete("/campaigns/1/investigators/999")

    assert response.status_code == 404

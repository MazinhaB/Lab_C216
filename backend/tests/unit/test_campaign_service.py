from unittest.mock import MagicMock

import pytest
from sqlalchemy.exc import SQLAlchemyError

from app.models.campaign import Campaign
from app.schemas.campaign import CampaignCreate, CampaignPatch, CampaignUpdate
from app.services.campaign import CampaignNotFoundError, CampaignService


@pytest.fixture
def service():
    db = MagicMock()
    campaign_service = CampaignService(db)
    campaign_service.repository = MagicMock()
    return campaign_service


def test_create_campaign(service):
    data = CampaignCreate(
        name="Mistérios de Arkham",
        description="Uma campanha investigativa.",
    )

    campaign = service.create(data)

    assert isinstance(campaign, Campaign)
    assert campaign.name == "Mistérios de Arkham"
    assert campaign.description == "Uma campanha investigativa."

    service.repository.create.assert_called_once_with(campaign)
    service.db.commit.assert_called_once()
    service.db.refresh.assert_called_once_with(campaign)


def test_get_campaign_by_id(service):
    campaign = Campaign(id=1, name="O Horror de Dunwich")
    service.repository.get_by_id.return_value = campaign

    result = service.get_by_id(1)

    assert result is campaign
    service.repository.get_by_id.assert_called_once_with(1)


def test_get_campaign_not_found(service):
    service.repository.get_by_id.return_value = None

    with pytest.raises(CampaignNotFoundError):
        service.get_by_id(999)


def test_list_campaigns(service):
    campaigns = [
        Campaign(id=1, name="Campanha A"),
        Campaign(id=2, name="Campanha B"),
    ]
    service.repository.list_all.return_value = campaigns

    result = service.list_all()

    assert result == campaigns
    service.repository.list_all.assert_called_once()


def test_create_campaign_rolls_back_on_database_error(service):
    data = CampaignCreate(name="Campanha com erro")
    service.repository.create.side_effect = SQLAlchemyError("Falha no banco de dados")

    with pytest.raises(SQLAlchemyError):
        service.create(data)

    service.db.rollback.assert_called_once()
    service.db.commit.assert_not_called()


def test_update_campaign(service):
    campaign = Campaign(id=1, name="Campanha Original")
    service.repository.get_by_id.return_value = campaign

    data = CampaignUpdate(name="Campanha Atualizada", description="Nova descrição.")

    result = service.update(1, data)

    assert result is campaign
    service.repository.update.assert_called_once_with(
        campaign,
        {
            "name": "Campanha Atualizada",
            "description": "Nova descrição.",
        },
    )
    service.db.commit.assert_called_once()
    service.db.refresh.assert_called_once_with(campaign)


def test_patch_campaign(service):
    campaign = Campaign(id=1, name="Campanha Original")
    service.repository.get_by_id.return_value = campaign

    data = CampaignPatch(description="Descrição modificada.")

    service.update(1, data)

    service.repository.update.assert_called_once_with(
        campaign,
        {"description": "Descrição modificada."},
    )


def test_update_campaign_not_found(service):
    service.repository.get_by_id.return_value = None

    data = CampaignUpdate(name="Campanha Inexistente")

    with pytest.raises(CampaignNotFoundError):
        service.update(999, data)

    service.repository.update.assert_not_called()
    service.db.commit.assert_not_called()


def test_delete_campaign(service):
    campaign = Campaign(id=1, name="Campanha para excluir")
    service.repository.get_by_id.return_value = campaign

    service.delete(1)

    service.repository.delete.assert_called_once_with(campaign)
    service.db.commit.assert_called_once()


def test_delete_campaign_not_found(service):
    service.repository.get_by_id.return_value = None

    with pytest.raises(CampaignNotFoundError):
        service.delete(999)

    service.repository.delete.assert_not_called()
    service.db.commit.assert_not_called()

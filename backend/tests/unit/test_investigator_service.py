from unittest.mock import MagicMock

import pytest
from sqlalchemy.exc import SQLAlchemyError

from app.models.investigator import Investigator
from app.schemas.investigator import (
    InvestigatorCreate,
    InvestigatorPatch,
    InvestigatorUpdate,
)
from app.services.campaign import CampaignNotFoundError
from app.services.investigator import (
    InvestigatorNotFoundError,
    InvestigatorService,
)


@pytest.fixture
def service():
    db = MagicMock()
    investigator_service = InvestigatorService(db)

    investigator_service.repository = MagicMock()
    investigator_service.campaign_service = MagicMock()

    return investigator_service


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


def test_create_investigator_with_default_values(service, investigator_data):
    data = InvestigatorCreate(**investigator_data)

    investigator = service.create(1, data)

    assert isinstance(investigator, Investigator)
    assert investigator.campaign_id == 1
    assert investigator.name == "Arthur Morgan"

    assert investigator.max_hit_points == 12
    assert investigator.current_hit_points == 12
    assert investigator.max_magic_points == 12
    assert investigator.current_magic_points == 12

    assert investigator.initial_sanity == 60
    assert investigator.max_sanity == 99
    assert investigator.current_sanity == 60

    assert investigator.movement_rate == 9
    assert investigator.build == 0
    assert investigator.damage_bonus == "0"
    assert investigator.dodge == 35

    service.campaign_service.get_by_id.assert_called_once_with(1)
    service.repository.create.assert_called_once_with(investigator)
    service.db.commit.assert_called_once()
    service.db.refresh.assert_called_once_with(investigator)


def test_create_investigator_with_house_rules(service, investigator_data):
    data = InvestigatorCreate(
        **investigator_data,
        max_hit_points=20,
        max_magic_points=15,
        initial_sanity=80,
        max_sanity=70,
        build=2,
        damage_bonus="+1D6",
        dodge=45,
    )

    investigator = service.create(1, data)

    assert investigator.max_hit_points == 20
    assert investigator.current_hit_points == 20

    assert investigator.max_magic_points == 15
    assert investigator.current_magic_points == 15

    assert investigator.initial_sanity == 80
    assert investigator.max_sanity == 70
    assert investigator.current_sanity == 70

    assert investigator.build == 2
    assert investigator.damage_bonus == "+1D6"
    assert investigator.dodge == 45


def test_create_investigator_preserves_zero(service, investigator_data):
    data = InvestigatorCreate(
        **investigator_data,
        max_hit_points=0,
        current_hit_points=0,
        max_magic_points=0,
        current_magic_points=0,
        dodge=0,
    )

    investigator = service.create(1, data)

    assert investigator.max_hit_points == 0
    assert investigator.current_hit_points == 0
    assert investigator.max_magic_points == 0
    assert investigator.current_magic_points == 0
    assert investigator.dodge == 0


def test_create_investigator_invalid_campaign(service, investigator_data):
    service.campaign_service.get_by_id.side_effect = CampaignNotFoundError(
        "Campanha não encontrada."
    )

    data = InvestigatorCreate(**investigator_data)

    with pytest.raises(CampaignNotFoundError):
        service.create(999, data)

    service.repository.create.assert_not_called()
    service.db.commit.assert_not_called()


def test_create_investigator_rolls_back_on_error(service, investigator_data):
    service.repository.create.side_effect = SQLAlchemyError("Falha no banco de dados.")

    data = InvestigatorCreate(**investigator_data)

    with pytest.raises(SQLAlchemyError):
        service.create(1, data)

    service.db.rollback.assert_called_once()
    service.db.commit.assert_not_called()


def test_get_investigator_by_campaign(service):
    investigator = Investigator(
        id=5,
        name="Arthur Morgan",
        campaign_id=1,
    )

    service.repository.get_by_id.return_value = investigator

    result = service.get_by_id(1, 5)

    assert result is investigator

    service.repository.get_by_id.assert_called_once_with(1, 5)


def test_get_investigator_not_found(service):
    service.repository.get_by_id.return_value = None

    with pytest.raises(InvestigatorNotFoundError):
        service.get_by_id(2, 5)


def test_list_investigators_by_campaign(service):
    investigators = [
        Investigator(id=1, campaign_id=2),
        Investigator(id=3, campaign_id=2),
    ]

    service.repository.list_by_campaign.return_value = investigators

    result = service.list_by_campaign(2)

    assert result == investigators
    service.repository.list_by_campaign.assert_called_once_with(2)


def test_list_investigators_invalid_campaign(service):
    service.campaign_service.get_by_id.side_effect = CampaignNotFoundError(
        "Campanha não encontrada."
    )

    with pytest.raises(CampaignNotFoundError):
        service.list_by_campaign(999)

    service.repository.list_by_campaign.assert_not_called()


def test_patch_investigator(service):
    investigator = Investigator(
        id=5,
        campaign_id=1,
        current_sanity=99,
    )
    service.repository.get_by_id.return_value = investigator

    data = InvestigatorPatch(current_sanity=65)

    result = service.patch(1, 5, data)

    assert result is investigator
    service.repository.update.assert_called_once_with(
        investigator,
        {"current_sanity": 65},
    )
    service.db.commit.assert_called_once()
    service.db.refresh.assert_called_once_with(investigator)


def test_patch_investigator_with_empty_data(service):
    investigator = Investigator(id=5, campaign_id=1)
    service.repository.get_by_id.return_value = investigator

    result = service.patch(1, 5, InvestigatorPatch())

    assert result is investigator
    service.repository.update.assert_not_called()
    service.db.commit.assert_not_called()


def test_patch_investigator_rolls_back_on_error(service):
    investigator = Investigator(id=5, campaign_id=1)
    service.repository.get_by_id.return_value = investigator
    service.repository.update.side_effect = SQLAlchemyError("Falha no banco de dados.")

    with pytest.raises(SQLAlchemyError):
        service.patch(
            1,
            5,
            InvestigatorPatch(current_sanity=65),
        )

    service.db.rollback.assert_called_once()
    service.db.commit.assert_not_called()


def test_update_investigator(service, investigator_data):
    investigator = Investigator(id=5, campaign_id=1)
    service.repository.get_by_id.return_value = investigator

    data = InvestigatorUpdate(
        **investigator_data,
        max_hit_points=20,
        current_hit_points=15,
        max_magic_points=12,
        current_magic_points=10,
        initial_sanity=60,
        max_sanity=99,
        current_sanity=55,
        movement_rate=9,
        build=0,
        damage_bonus="0",
        dodge=35,
        temporary_insanity=False,
        indefinite_insanity=False,
        major_wound=False,
        unconscious=False,
        dying=False,
    )

    result = service.update(1, 5, data)

    assert result is investigator

    service.repository.update.assert_called_once_with(
        investigator,
        data.model_dump(),
    )
    service.db.commit.assert_called_once()
    service.db.refresh.assert_called_once_with(investigator)


def test_update_investigator_rolls_back(service, investigator_data):
    investigator = Investigator(id=5, campaign_id=1)
    service.repository.get_by_id.return_value = investigator
    service.repository.update.side_effect = SQLAlchemyError("Falha no banco.")

    data = InvestigatorUpdate(
        **investigator_data,
        max_hit_points=20,
        current_hit_points=20,
        max_magic_points=12,
        current_magic_points=12,
        initial_sanity=60,
        max_sanity=99,
        current_sanity=60,
        movement_rate=9,
        build=0,
        damage_bonus="0",
        dodge=35,
        temporary_insanity=False,
        indefinite_insanity=False,
        major_wound=False,
        unconscious=False,
        dying=False,
    )

    with pytest.raises(SQLAlchemyError):
        service.update(1, 5, data)

    service.db.rollback.assert_called_once()
    service.db.commit.assert_not_called()


def test_delete_investigator(service):
    investigator = Investigator(id=5, campaign_id=1)
    service.repository.get_by_id.return_value = investigator

    service.delete(1, 5)

    service.repository.delete.assert_called_once_with(investigator)
    service.db.commit.assert_called_once()


def test_delete_investigator_rolls_back(service):
    investigator = Investigator(id=5, campaign_id=1)
    service.repository.get_by_id.return_value = investigator
    service.repository.delete.side_effect = SQLAlchemyError("Falha no banco.")

    with pytest.raises(SQLAlchemyError):
        service.delete(1, 5)

    service.db.rollback.assert_called_once()
    service.db.commit.assert_not_called()

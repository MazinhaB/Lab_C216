from unittest.mock import MagicMock

from app.models.investigator import Investigator
from app.repositories.investigator import InvestigatorRepository


def test_create_investigator():
    db = MagicMock()
    repository = InvestigatorRepository(db)

    investigator = Investigator(
        name="Arthur Morgan",
        campaign_id=1,
    )

    result = repository.create(investigator)

    assert result is investigator
    db.add.assert_called_once_with(investigator)
    db.flush.assert_called_once()
    db.commit.assert_not_called()


def test_get_investigator_by_id_and_campaign():
    db = MagicMock()
    repository = InvestigatorRepository(db)

    investigator = Investigator(id=5, campaign_id=1)
    db.scalar.return_value = investigator

    result = repository.get_by_id(
        campaign_id=1,
        investigator_id=5,
    )

    assert result is investigator

    statement = db.scalar.call_args.args[0]
    sql = str(statement.compile(compile_kwargs={"literal_binds": True}))

    assert "investigators.id = 5" in sql
    assert "investigators.campaign_id = 1" in sql


def test_list_investigators_by_campaign():
    db = MagicMock()
    repository = InvestigatorRepository(db)

    investigators = [
        Investigator(id=1, campaign_id=2),
        Investigator(id=3, campaign_id=2),
    ]

    db.scalars.return_value.all.return_value = investigators

    result = repository.list_by_campaign(2)

    assert result == investigators

    statement = db.scalars.call_args.args[0]
    sql = str(statement.compile(compile_kwargs={"literal_binds": True}))

    assert "investigators.campaign_id = 2" in sql


def test_update_investigator():
    db = MagicMock()
    repository = InvestigatorRepository(db)

    investigator = Investigator(
        id=1,
        name="Nome Original",
        campaign_id=1,
    )

    result = repository.update(
        investigator,
        {"name": "Nome Atualizado"},
    )

    assert result is investigator
    assert investigator.name == "Nome Atualizado"
    db.flush.assert_called_once()
    db.commit.assert_not_called()


def test_delete_investigator():
    db = MagicMock()
    repository = InvestigatorRepository(db)

    investigator = Investigator(id=1, campaign_id=1)

    repository.delete(investigator)

    db.delete.assert_called_once_with(investigator)
    db.commit.assert_not_called()

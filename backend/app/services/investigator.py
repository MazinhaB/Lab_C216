from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.investigator_rules import calculate_investigator_defaults
from app.models.investigator import Investigator
from app.repositories.investigator import InvestigatorRepository
from app.schemas.investigator import (
    InvestigatorCreate,
    InvestigatorPatch,
    InvestigatorUpdate,
)
from app.services.campaign import CampaignService


class InvestigatorNotFoundError(Exception):
    pass


class InvestigatorService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = InvestigatorRepository(db)
        self.campaign_service = CampaignService(db)

    def create(
        self,
        campaign_id: int,
        data: InvestigatorCreate,
    ) -> Investigator:
        # Verifica se a campanha existe.
        self.campaign_service.get_by_id(campaign_id)

        values = data.model_dump()

        defaults = calculate_investigator_defaults(
            strength=data.strength,
            constitution=data.constitution,
            dexterity=data.dexterity,
            size=data.size,
            power=data.power,
            age=data.age,
        )

        # Aplica os valores padrão somente aos campos não preenchidos.
        for field in (
            "max_hit_points",
            "max_magic_points",
            "initial_sanity",
            "max_sanity",
            "movement_rate",
            "build",
            "damage_bonus",
            "dodge",
        ):
            if values[field] is None:
                values[field] = defaults[field]

        # Valores atuais começam pelos máximos efetivamente escolhidos.
        if values["current_hit_points"] is None:
            values["current_hit_points"] = values["max_hit_points"]

        if values["current_magic_points"] is None:
            values["current_magic_points"] = values["max_magic_points"]

        if values["current_sanity"] is None:
            values["current_sanity"] = min(
                values["initial_sanity"],
                values["max_sanity"],
            )

        investigator = Investigator(
            campaign_id=campaign_id,
            **values,
        )

        try:
            self.repository.create(investigator)
            self.db.commit()
            self.db.refresh(investigator)
        except SQLAlchemyError:
            self.db.rollback()
            raise

        return investigator

    def get_by_id(
        self,
        campaign_id: int,
        investigator_id: int,
    ) -> Investigator:
        self.campaign_service.get_by_id(campaign_id)

        investigator = self.repository.get_by_id(
            campaign_id,
            investigator_id,
        )

        if investigator is None:
            raise InvestigatorNotFoundError(
                f"Investigador com ID {investigator_id} não encontrado "
                f"na campanha {campaign_id}."
            )

        return investigator

    def list_by_campaign(
        self,
        campaign_id: int,
    ) -> list[Investigator]:
        self.campaign_service.get_by_id(campaign_id)

        return self.repository.list_by_campaign(campaign_id)

    def patch(
        self,
        campaign_id: int,
        investigator_id: int,
        data: InvestigatorPatch,
    ) -> Investigator:
        investigator = self.get_by_id(campaign_id, investigator_id)

        changes = data.model_dump(exclude_unset=True)

        if not changes:
            return investigator

        try:
            self.repository.update(investigator, changes)
            self.db.commit()
            self.db.refresh(investigator)
        except SQLAlchemyError:
            self.db.rollback()
            raise

        return investigator

    def update(
        self,
        campaign_id: int,
        investigator_id: int,
        data: InvestigatorUpdate,
    ) -> Investigator:
        investigator = self.get_by_id(campaign_id, investigator_id)

        changes = data.model_dump()

        try:
            self.repository.update(investigator, changes)
            self.db.commit()
            self.db.refresh(investigator)
        except SQLAlchemyError:
            self.db.rollback()
            raise

        return investigator

    def delete(
        self,
        campaign_id: int,
        investigator_id: int,
    ) -> None:
        investigator = self.get_by_id(campaign_id, investigator_id)

        try:
            self.repository.delete(investigator)
            self.db.commit()
        except SQLAlchemyError:
            self.db.rollback()
            raise

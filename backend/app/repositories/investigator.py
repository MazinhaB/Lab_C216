from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.investigator import Investigator


class InvestigatorRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, investigator: Investigator) -> Investigator:
        self.db.add(investigator)
        self.db.flush()
        return investigator

    def get_by_id(
        self,
        campaign_id: int,
        investigator_id: int,
    ) -> Investigator | None:
        statement = select(Investigator).where(
            Investigator.id == investigator_id,
            Investigator.campaign_id == campaign_id,
        )

        return self.db.scalar(statement)

    def list_by_campaign(self, campaign_id: int) -> list[Investigator]:
        statement = (
            select(Investigator)
            .where(Investigator.campaign_id == campaign_id)
            .order_by(Investigator.id)
        )

        return list(self.db.scalars(statement).all())

    def update(
        self,
        investigator: Investigator,
        changes: dict[str, object],
    ) -> Investigator:
        for field, value in changes.items():
            setattr(investigator, field, value)

        self.db.flush()
        return investigator

    def delete(self, investigator: Investigator) -> None:
        self.db.delete(investigator)

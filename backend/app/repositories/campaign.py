from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.campaign import Campaign


class CampaignRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, campaign: Campaign) -> Campaign:
        self.db.add(campaign)
        self.db.flush()
        return campaign

    def get_by_id(self, campaign_id: int) -> Campaign | None:
        return self.db.get(Campaign, campaign_id)

    def list_all(self) -> list[Campaign]:
        statement = select(Campaign).order_by(Campaign.id)
        return list(self.db.scalars(statement).all())

    def update(
        self,
        campaign: Campaign,
        changes: dict[str, object],
    ) -> Campaign:
        for field, value in changes.items():
            setattr(campaign, field, value)

        self.db.flush()
        return campaign

    def delete(self, campaign: Campaign) -> None:
        self.db.delete(campaign)

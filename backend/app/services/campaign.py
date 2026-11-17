from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.campaign import Campaign
from app.repositories.campaign import CampaignRepository
from app.schemas.campaign import CampaignCreate, CampaignPatch, CampaignUpdate


class CampaignNotFoundError(Exception):
    pass


class CampaignService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = CampaignRepository(db)

    def create(self, data: CampaignCreate) -> Campaign:
        campaign = Campaign(**data.model_dump())

        try:
            self.repository.create(campaign)
            self.db.commit()
            self.db.refresh(campaign)
        except SQLAlchemyError:
            self.db.rollback()
            raise

        return campaign

    def get_by_id(self, campaign_id: int) -> Campaign:
        campaign = self.repository.get_by_id(campaign_id)

        if campaign is None:
            raise CampaignNotFoundError(
                f"Campanha com ID {campaign_id} não encontrada."
            )
        return campaign

    def list_all(self) -> list[Campaign]:
        return self.repository.list_all()

    def update(
        self,
        campaign_id: int,
        data: CampaignUpdate | CampaignPatch,
    ) -> Campaign:
        campaign = self.get_by_id(campaign_id)

        changes = data.model_dump(exclude_unset=isinstance(data, CampaignPatch))

        try:
            self.repository.update(campaign, changes)
            self.db.commit()
            self.db.refresh(campaign)
        except SQLAlchemyError:
            self.db.rollback()
            raise

        return campaign

    def delete(self, campaign_id: int) -> None:
        campaign = self.get_by_id(campaign_id)

        try:
            self.repository.delete(campaign)
            self.db.commit()
        except SQLAlchemyError:
            self.db.rollback()
            raise

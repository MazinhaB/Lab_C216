from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.campaign import (
    CampaignCreate,
    CampaignPatch,
    CampaignResponse,
    CampaignUpdate,
)
from app.services.campaign import CampaignNotFoundError, CampaignService

router = APIRouter(prefix="/campaigns", tags=["Campanhas"])

DatabaseSession = Annotated[Session, Depends(get_db)]


@router.post("/", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
def create_campaign(data: CampaignCreate, db: DatabaseSession):
    service = CampaignService(db)
    return service.create(data)


@router.get("/", response_model=list[CampaignResponse])
def list_campaigns(db: DatabaseSession):
    service = CampaignService(db)
    return service.list_all()


@router.get("/{campaign_id}", response_model=CampaignResponse)
def get_campaign(campaign_id: int, db: DatabaseSession):
    service = CampaignService(db)

    try:
        return service.get_by_id(campaign_id)
    except CampaignNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.put("/{campaign_id}", response_model=CampaignResponse)
def update_campaign(campaign_id: int, data: CampaignUpdate, db: DatabaseSession):
    service = CampaignService(db)

    try:
        return service.update(campaign_id, data)
    except CampaignNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc


@router.patch("/{campaign_id}", response_model=CampaignResponse)
def patch_campaign(campaign_id: int, data: CampaignPatch, db: DatabaseSession):
    service = CampaignService(db)

    try:
        return service.update(campaign_id, data)
    except CampaignNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc


@router.delete(
    "/{campaign_id}", response_model=None, status_code=status.HTTP_204_NO_CONTENT
)
def delete_campaign(campaign_id: int, db: DatabaseSession) -> None:
    service = CampaignService(db)

    try:
        return service.delete(campaign_id)
    except CampaignNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc

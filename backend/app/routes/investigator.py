from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.investigator import Investigator
from app.schemas.investigator import (
    InvestigatorCreate,
    InvestigatorPatch,
    InvestigatorResponse,
    InvestigatorUpdate,
)
from app.services.campaign import CampaignNotFoundError
from app.services.investigator import InvestigatorNotFoundError, InvestigatorService

router = APIRouter(
    prefix="/campaigns/{campaign_id}/investigators", tags=["Investigadores"]
)


def get_investigator_service(
    db: Annotated[Session, Depends(get_db)],
) -> InvestigatorService:
    return InvestigatorService(db)


InvestigatorServiceDependency = Annotated[
    InvestigatorService, Depends(get_investigator_service)
]


@router.post(
    "", response_model=InvestigatorResponse, status_code=status.HTTP_201_CREATED
)
def create_investigator(
    campaign_id: int, data: InvestigatorCreate, service: InvestigatorServiceDependency
) -> Investigator:
    try:
        return service.create(campaign_id, data)
    except CampaignNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc


@router.get(
    "",
    response_model=list[InvestigatorResponse],
)
def list_investigators(
    campaign_id: int,
    service: InvestigatorServiceDependency,
) -> list[Investigator]:
    try:
        return service.list_by_campaign(campaign_id)
    except CampaignNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.get(
    "/{investigator_id}",
    response_model=InvestigatorResponse,
)
def get_investigator(
    campaign_id: int,
    investigator_id: int,
    service: InvestigatorServiceDependency,
) -> Investigator:
    try:
        return service.get_by_id(campaign_id, investigator_id)
    except (CampaignNotFoundError, InvestigatorNotFoundError) as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.patch(
    "/{investigator_id}",
    response_model=InvestigatorResponse,
)
def patch_investigator(
    campaign_id: int,
    investigator_id: int,
    data: InvestigatorPatch,
    service: InvestigatorServiceDependency,
) -> Investigator:
    try:
        return service.patch(campaign_id, investigator_id, data)
    except (CampaignNotFoundError, InvestigatorNotFoundError) as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.put(
    "/{investigator_id}",
    response_model=InvestigatorResponse,
)
def update_investigator(
    campaign_id: int,
    investigator_id: int,
    data: InvestigatorUpdate,
    service: InvestigatorServiceDependency,
) -> Investigator:
    try:
        return service.update(campaign_id, investigator_id, data)
    except (CampaignNotFoundError, InvestigatorNotFoundError) as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.delete(
    "/{investigator_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
)
def delete_investigator(
    campaign_id: int,
    investigator_id: int,
    service: InvestigatorServiceDependency,
) -> None:
    try:
        service.delete(campaign_id, investigator_id)
    except (CampaignNotFoundError, InvestigatorNotFoundError) as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

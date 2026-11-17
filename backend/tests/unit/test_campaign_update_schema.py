import pytest
from pydantic import ValidationError

from app.schemas.campaign import CampaignPatch, CampaignUpdate


def test_update_campaign_valid():
    campaign = CampaignUpdate(
        name="  Mistérios de Arkham  ",
        description="Nova descrição.",
    )

    assert campaign.name == "Mistérios de Arkham"
    assert campaign.description == "Nova descrição."


def test_update_campaign_requires_name():
    with pytest.raises(ValidationError):
        CampaignUpdate(description="Sem nome.")


def test_patch_campaign_partial_data():
    campaign = CampaignPatch(description="Nova descrição.")

    assert campaign.model_dump(exclude_unset=True) == {"description": "Nova descrição."}


def test_patch_campaign_can_clear_description():
    campaign = CampaignPatch(description=None)

    assert campaign.model_dump(exclude_unset=True) == {"description": None}


@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"name": None},
        {"name": "   "},
        {"name": "A" * 101},
    ],
)
def test_patch_campaign_invalid_data(payload):
    with pytest.raises(ValidationError):
        CampaignPatch(**payload)

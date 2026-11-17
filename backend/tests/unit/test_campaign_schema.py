import pytest
from pydantic import ValidationError

from app.schemas.campaign import CampaignCreate


def test_create_campaign_valid():
    campaign = CampaignCreate(
        name="O Chamado de Cthulhu",
        description="Investigação em Arkham, 1925.",
    )

    assert campaign.name == "O Chamado de Cthulhu"
    assert campaign.description == "Investigação em Arkham, 1925."


def test_create_campaign_without_description():
    campaign = CampaignCreate(name="Máscaras de Nyarlathotep")

    assert campaign.description is None


def test_create_campaign_trims_name():
    campaign = CampaignCreate(name="  Horror no Expresso do Oriente  ")

    assert campaign.name == "Horror no Expresso do Oriente"


@pytest.mark.parametrize(
    "name",
    ["", "   ", "A" * 101],
)
def test_create_campaign_invalid_name(name):
    with pytest.raises(ValidationError):
        CampaignCreate(name=name)

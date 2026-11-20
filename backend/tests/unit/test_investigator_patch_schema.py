import pytest
from pydantic import ValidationError

from app.schemas.investigator import InvestigatorPatch


def test_patch_accepts_partial_data():
    data = InvestigatorPatch(current_sanity=65)

    assert data.model_dump(exclude_unset=True) == {"current_sanity": 65}


def test_patch_allows_clearing_optional_field():
    data = InvestigatorPatch(story=None)

    assert data.model_dump(exclude_unset=True) == {"story": None}


def test_patch_rejects_null_for_required_field():
    with pytest.raises(ValidationError):
        InvestigatorPatch(max_hit_points=None)


def test_patch_rejects_sanity_above_99():
    with pytest.raises(ValidationError):
        InvestigatorPatch(current_sanity=100)

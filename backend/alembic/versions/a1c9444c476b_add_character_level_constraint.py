"""add character level constraint

Revision ID: a1c9444c476b
Revises: cf9044a96366
Create Date: 2026-10-31 09:17:20.261006

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a1c9444c476b"
down_revision: str | Sequence[str] | None = "cf9044a96366"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_check_constraint(
        "check_character_level",
        "characters",
        "level >= 1 AND level <= 20",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(
        "check_character_level",
        "characters",
        type_="check",
    )

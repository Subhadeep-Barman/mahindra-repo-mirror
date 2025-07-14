"""add fuel_type column to TestOrder

Revision ID: 17784555affa
Revises: 332896d803bc
Create Date: 2025-07-14 10:36:51.272672

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '17784555affa'
down_revision: Union[str, Sequence[str], None] = '332896d803bc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('TestOrders',
                 sa.Column('fuel_type', sa.String(length=255), nullable=True)
    )


def downgrade() -> None:
    """Downgrade schema."""
    pass

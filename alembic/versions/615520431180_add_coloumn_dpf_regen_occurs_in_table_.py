"""add coloumn dpf_regen_occurs in table TestOrders

Revision ID: 615520431180
Revises: 693c3cf8aaa8
Create Date: 2025-07-22 12:05:55.284637

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '615520431180'
down_revision: Union[str, Sequence[str], None] = '693c3cf8aaa8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('TestOrders',
                 sa.Column('dpf_regen_occurs', sa.String(length=255), nullable=True)
    )


def downgrade() -> None:
    """Downgrade schema."""
    pass

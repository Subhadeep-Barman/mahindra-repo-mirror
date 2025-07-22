"""add project_code column in RDEJobOrders table

Revision ID: b61849fc7c8c
Revises: 37705d007c23
Create Date: 2025-07-22 11:35:43.401926

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b61849fc7c8c'
down_revision: Union[str, Sequence[str], None] = '37705d007c23'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('RDEJobOrders', sa.Column('project_code', sa.String(length=255), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('RDEJobOrders', 'project_code')

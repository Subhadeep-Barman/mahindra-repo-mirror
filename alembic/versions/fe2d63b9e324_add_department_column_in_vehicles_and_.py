"""add department column in Vehicles and Engines tables

Revision ID: fe2d63b9e324
Revises: 588da8931722
Create Date: 2025-07-22 13:02:22.287531

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fe2d63b9e324'
down_revision: Union[str, Sequence[str], None] = '588da8931722'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('Vehicles', sa.Column('department', sa.String(), nullable=True))
    op.add_column('Engines', sa.Column('department', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('Vehicles', 'department')
    op.drop_column('Engines', 'department')

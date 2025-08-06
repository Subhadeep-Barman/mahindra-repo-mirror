"""add new column of complete_remarks in TestOrders

Revision ID: f72f3b09568d
Revises: 32e00ad17289
Create Date: 2025-08-06 16:50:12.680113

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f72f3b09568d'
down_revision: Union[str, Sequence[str], None] = '32e00ad17289'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # add new column of complete_remarks in TestOrders
    op.add_column('TestOrders', sa.Column('complete_remarks', sa.String(), nullable=True))
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

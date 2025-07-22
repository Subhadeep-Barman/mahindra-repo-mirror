"""alter column name form engine_id to engine_serial_number  in RDEJobOrders table

Revision ID: 588da8931722
Revises: b61849fc7c8c
Create Date: 2025-07-22 11:37:33.537105

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '588da8931722'
down_revision: Union[str, Sequence[str], None] = 'b61849fc7c8c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('RDEJobOrders', 'engine_id', new_column_name='engine_serial_number')


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('RDEJobOrders', 'engine_serial_number', new_column_name='engine_id')

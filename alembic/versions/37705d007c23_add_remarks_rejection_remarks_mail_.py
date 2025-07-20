"""add remarks,rejection_remarks,mail_remarks columns to TestOrders and remove these three from JobOrders

Revision ID: 37705d007c23
Revises: 6f7519413f14
Create Date: 2025-07-20 21:21:47.699216

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '37705d007c23'
down_revision: Union[str, Sequence[str], None] = '6f7519413f14'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add columns to TestOrders
    op.add_column('TestOrders', sa.Column('remarks', sa.String(), nullable=True))
    op.add_column('TestOrders', sa.Column('rejection_remarks', sa.String(), nullable=True))
    op.add_column('TestOrders', sa.Column('mail_remarks', sa.String(), nullable=True))
    # Remove columns from JobOrders
    op.drop_column('JobOrders', 'remarks')
    op.drop_column('JobOrders', 'rejection_remarks')
    op.drop_column('JobOrders', 'mail_remarks')



def downgrade() -> None:
    """Downgrade schema."""
    pass

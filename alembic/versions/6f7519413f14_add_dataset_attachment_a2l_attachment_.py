"""add dataset_attachment,a2l_attachment,experiment_attachment,dbc_attachment,wltp_attachment,pdf_report,excel_report,dat_file_attachment,others_attachement columns of dataype JSON to TestOrders

Revision ID: 6f7519413f14
Revises: 17784555affa
Create Date: 2025-07-15 17:47:29.939263

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6f7519413f14'
down_revision: Union[str, Sequence[str], None] = '17784555affa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('TestOrders', sa.Column('dataset_attachment', sa.JSON(), nullable=True))
    op.add_column('TestOrders', sa.Column('a2l_attachment', sa.JSON(), nullable=True))
    op.add_column('TestOrders', sa.Column('experiment_attachment', sa.JSON(), nullable=True))
    op.add_column('TestOrders', sa.Column('dbc_attachment', sa.JSON(), nullable=True))
    op.add_column('TestOrders', sa.Column('wltp_attachment', sa.JSON(), nullable=True))
    op.add_column('TestOrders', sa.Column('pdf_report', sa.JSON(), nullable=True))
    op.add_column('TestOrders', sa.Column('excel_report', sa.JSON(), nullable=True))
    op.add_column('TestOrders', sa.Column('dat_file_attachment', sa.JSON(), nullable=True))
    op.add_column('TestOrders', sa.Column('others_attachement', sa.JSON(), nullable=True))
    op.add_column('RDEJobOrders', sa.Column('requested_payload', sa.String(), nullable=True))
    op.add_column('RDEJobOrders', sa.Column('cft_members', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    pass

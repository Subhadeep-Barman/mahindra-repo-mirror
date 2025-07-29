from logging.config import fileConfig
import sys
import os

from sqlalchemy import engine_from_config, pool
from alembic import context


# Determine DB environment
db_env = os.getenv("DB_ENV", "local")  # default is 'local'

if db_env == "local":
    db_url = os.getenv("SQLALCHEMY_DATABASE_URI")
    if not db_url:
        raise RuntimeError("SQLALCHEMY_DATABASE_URI environment variable is not set.")
else:
    db_url = os.getenv("STAGING_URI")
    if not db_url:
        raise RuntimeError("STAGING_URI environment variable is not set.")

print(f"[Alembic] Using '{db_env}' environment -> {db_url}")

# Alembic Config object (contains .ini settings)
config = context.config
config.set_main_option("sqlalchemy.url", db_url)

# Set up logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ✅ Add your project root to sys.path
# So Python can import modules outside Alembic folder
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# ✅ Import Base from your SQLAlchemy model file
# Adjust this import based on your actual folder structure
from backend.storage.models.models import Base

# ✅ Set target_metadata to your Base.metadata
# This enables autogeneration
target_metadata = Base.metadata

# Optional: If you use env vars or need any additional settings, define them here

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True  # 👈 helps track column type changes
        )

        with context.begin_transaction():
            context.run_migrations()


# Determine mode
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

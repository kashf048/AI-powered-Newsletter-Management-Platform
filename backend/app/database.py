import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import event, text
from sqlalchemy.types import Enum
from backend.app.config import settings
from backend.app.models import Base

logger = logging.getLogger(__name__)

# Build engine kwargs based on database type
_engine_kwargs: dict = {
    "echo": False,
}

if settings.is_postgresql:
    # PostgreSQL / Neon connection pool settings
    _engine_kwargs.update({
        "pool_size": 5,
        "max_overflow": 10,
        "pool_pre_ping": True,          # Detect stale connections before use
        "pool_recycle": 1800,           # Recycle connections every 30 min
        "pool_timeout": 30,             # Wait up to 30s for a connection slot
        "connect_args": {
            "ssl": "require",           # Enforce TLS for Neon / cloud PostgreSQL
            "command_timeout": 60,
            "server_settings": {
                "application_name": "nexusai-digest",
            },
        },
    })
    logger.info("Configuring PostgreSQL engine with connection pool (size=5, max_overflow=10)")
else:
    # SQLite — single-file, no pooling needed
    _engine_kwargs["connect_args"] = {"check_same_thread": False}
    logger.info("Configuring SQLite engine (development mode)")

engine = create_async_engine(settings.DATABASE_URL, **_engine_kwargs)

# Use async_sessionmaker (preferred over legacy sessionmaker in SQLAlchemy 2.x)
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# ─── Safe Enum Creation for PostgreSQL ───────────────────────────────────────
# Set create_type=False on all Enum types to prevent SQLAlchemy from creating them automatically.
# Instead, we will check and create them safely in the before_create metadata event.
for table in Base.metadata.tables.values():
    for col in table.columns:
        if isinstance(col.type, Enum):
            col.type.create_type = False


@event.listens_for(Base.metadata, "before_create")
def _safe_create_enums(target, connection, **kw):
    if connection.dialect.name == "postgresql":
        # Scan metadata for all Enum columns
        enum_types = {}
        for table in target.tables.values():
            for col in table.columns:
                if isinstance(col.type, Enum) and col.type.name:
                    enum_types[col.type.name] = col.type.enums
        
        # Create each enum type safely via PL/pgSQL
        for name, values in enum_types.items():
            vals_str = ", ".join(f"'{v}'" for v in values)
            ddl = f"""
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '{name}') THEN
                    CREATE TYPE {name} AS ENUM ({vals_str});
                END IF;
            END $$;
            """
            connection.execute(text(ddl))


async def get_db():
    """FastAPI dependency that provides a database session per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Create all tables if they do not exist.
    
    In production with proper migrations, call Alembic instead.
    This function is safe to call on every startup (idempotent via CREATE IF NOT EXISTS).
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables verified / created successfully.")

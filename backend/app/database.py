import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import event
from backend.app.config import settings

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
    from backend.app.models import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables verified / created successfully.")

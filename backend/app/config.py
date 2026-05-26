import os
import secrets
import logging
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

logger = logging.getLogger(__name__)

# Resolve .env path relative to this file's directory (backend/app/config.py)
# so it works regardless of where uvicorn is launched from.
#   - backend/app/config.py  → .parent = backend/app  → .parent = backend
_BACKEND_DIR = Path(__file__).resolve().parent.parent
_ENV_FILE = _BACKEND_DIR / ".env"


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./database.db"
    JWT_SECRET: str = ""
    OWNER_NAME: str = "Admin"
    GROQ_API_KEY: Optional[str] = None
    GROQ_API_URL: str = "https://api.groq.com/openai/v1/chat/completions"
    PORT: int = 8000
    RESEND_API: Optional[str] = None
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/auth/google/callback"
    ADMIN_EMAILS: str = ""
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = SettingsConfigDict(
        # Absolute path — works whether launched from project root or backend/
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("JWT_SECRET", mode="before")
    @classmethod
    def validate_jwt_secret(cls, v: str) -> str:
        if not v or len(v) < 32:
            generated = secrets.token_hex(48)
            # Only warn once: suppress the message in uvicorn's reloader watchdog
            # process (identified by the RUN_MAIN env var being absent).
            # This avoids the warning printing twice on --reload startup.
            _in_reloader = os.environ.get("WEB_CONCURRENCY") == "1" or \
                           os.environ.get("_UVICORN_RELOAD_PROCESS") == "1"
            if not _in_reloader:
                logger.warning(
                    "\n"
                    "  ┌─────────────────────────────────────────────────────────┐\n"
                    "  │  ⚠  JWT_SECRET not configured in backend/.env           │\n"
                    "  │                                                         │\n"
                    "  │  A temporary secret has been generated for this         │\n"
                    "  │  session only. All active sessions will be              │\n"
                    "  │  invalidated on server restart.                         │\n"
                    "  │                                                         │\n"
                    "  │  Fix: add JWT_SECRET to backend/.env                   │\n"
                    "  │  Run:  python -c \"import secrets; print(secrets.token_hex(48))\"  │\n"
                    "  └─────────────────────────────────────────────────────────┘"
                )
            return generated
        return v

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_url(cls, v: str) -> str:
        if not v:
            return "sqlite+aiosqlite:///./database.db"

        # Remove sslmode query parameter if present since asyncpg doesn't support it
        if "sslmode=" in v:
            import urllib.parse
            parsed = urllib.parse.urlparse(v)
            query_params = urllib.parse.parse_qsl(parsed.query)
            filtered_params = [(k, val) for k, val in query_params if k != "sslmode"]
            new_query = urllib.parse.urlencode(filtered_params)
            parsed = parsed._replace(query=new_query)
            v = urllib.parse.urlunparse(parsed)

        # Rewrite postgresql/postgres URLs to use asyncpg driver
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql+asyncpg://", 1)
        elif v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        # Rewrite plain sqlite:// to use aiosqlite
        elif v.startswith("sqlite://") and "sqlite+aiosqlite://" not in v:
            return v.replace("sqlite://", "sqlite+aiosqlite://", 1)
        return v

    @property
    def is_production(self) -> bool:
        """True when FRONTEND_URL points to a non-localhost origin."""
        return (
            "localhost" not in self.FRONTEND_URL
            and "127.0.0.1" not in self.FRONTEND_URL
        )

    @property
    def is_postgresql(self) -> bool:
        return "postgresql" in self.DATABASE_URL or "postgres" in self.DATABASE_URL


settings = Settings()

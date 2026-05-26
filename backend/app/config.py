import os
import secrets
import logging
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

logger = logging.getLogger(__name__)


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
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @field_validator("JWT_SECRET", mode="before")
    @classmethod
    def validate_jwt_secret(cls, v: str) -> str:
        if not v or len(v) < 32:
            # Generate a secure random secret for the current session only
            # This means sessions invalidate on restart — acceptable for dev,
            # but JWT_SECRET MUST be set in production .env
            generated = secrets.token_hex(48)
            logger.warning(
                "JWT_SECRET is not set or too short in environment. "
                "A temporary secret has been generated for this session. "
                "All sessions will be invalidated on server restart. "
                "Set JWT_SECRET in your .env file for production use."
            )
            return generated
        return v

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_url(cls, v: str) -> str:
        if not v:
            return "sqlite+aiosqlite:///./database.db"

        # Rewrite postgresql URLs to use asyncpg
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql+asyncpg://", 1)
        elif v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        # Rewrite sqlite URLs to use aiosqlite
        elif v.startswith("sqlite://"):
            if "sqlite+aiosqlite://" not in v:
                return v.replace("sqlite://", "sqlite+aiosqlite://", 1)
        return v

    @property
    def is_production(self) -> bool:
        """Returns True when running against a non-localhost frontend URL."""
        return (
            "localhost" not in self.FRONTEND_URL
            and "127.0.0.1" not in self.FRONTEND_URL
        )

    @property
    def is_postgresql(self) -> bool:
        return "postgresql" in self.DATABASE_URL or "postgres" in self.DATABASE_URL


settings = Settings()

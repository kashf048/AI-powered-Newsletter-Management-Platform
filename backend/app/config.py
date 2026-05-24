import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./database.db"
    JWT_SECRET: str = "kj2hwgedfyv78f9ro43kjherfyg7g89fr4okjrhfugyvb78g9r4iwt4w0it"
    OWNER_NAME: str = "Mansoor Ali"
    GROQ_API_KEY: Optional[str] = None
    GROQ_API_URL: str = "https://api.groq.com/openai/v1/chat/completions"
    PORT: int = 8000
    RESEND_API: Optional[str] = None
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/auth/google/callback"
    ADMIN_EMAILS: str = "admin@nexusdigest.pk,mansoor.ali@example.com"
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

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

settings = Settings()

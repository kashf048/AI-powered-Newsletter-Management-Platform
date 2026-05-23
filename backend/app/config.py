import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./database.db"
    JWT_SECRET: str = "kj2hwgedfyv78f9ro43kjherfyg7g89fr4okjrhfugyvb78g9r4iwt4w0it"
    VITE_APP_ID: str = "PbWNmmJLvG7EgPvn48QQw6"
    OWNER_NAME: str = "Mansoor Ali"
    OWNER_OPEN_ID: str = "G3bMnM4qoUt6FDoRBYAXab"
    BUILT_IN_FORGE_API_KEY: str = "your_manus_forge_api_key_here"
    BUILT_IN_FORGE_API_URL: str = "https://forge.manus.ai"
    OAUTH_SERVER_URL: str = "https://api.manus.im"
    PORT: int = 3000
    NODE_ENV: str = "development"
    RESEND_API: Optional[str] = None

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

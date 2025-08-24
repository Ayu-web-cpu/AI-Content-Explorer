from pydantic_settings import BaseSettings
   # ✅ not from pydantic
from functools import lru_cache

class Settings(BaseSettings):
    APP_ENV: str = "dev"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:ayush@localhost:5432/ai_explorer"

    JWT_SECRET: str = "supersecret"
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    class Config:
        env_file = ".env"

@lru_cache
def get_settings() -> Settings:
    return Settings()


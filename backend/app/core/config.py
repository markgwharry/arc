from typing import Optional
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "Arc Raiders Companion"
    app_version: str = "0.1.0"
    debug: bool = False

    # External API endpoints
    metaforge_api_url: str = "https://metaforge.app/api/arc-raiders"
    ardb_api_url: str = "https://ardb.app/api"
    raidtheory_github_url: str = "https://raw.githubusercontent.com/RaidTheory/arcraiders-data/main"

    # Cache settings (in seconds)
    cache_ttl_items: int = 3600  # 1 hour
    cache_ttl_events: int = 300  # 5 minutes
    cache_ttl_traders: int = 600  # 10 minutes

    # Redis (optional, falls back to in-memory cache)
    redis_url: Optional[str] = None

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()

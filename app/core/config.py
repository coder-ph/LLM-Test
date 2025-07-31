import os
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
import logging

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra='ignore')
    GEMINI_API_KEY : str = Field(..., description='Gemini LLM api key')
    
    POSTGRES_USER: str = Field('user')
    POSTGRES_PASSWORD: str = Field("password")
    POSGRES_DB : str = Field('qna_db')
    POSTGRES_HOST: str = Field('db')
    POSTGRES_PORT: str = Field('5432')
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSGRES_DB}"
    
settings = Settings()

if not settings.GEMINI_API_KEY:
    logger.error("GEMINI_API_KEY env isn't set!!")
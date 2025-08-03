
import os
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
import logging

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    model_config = SettingsConfigDict(env_file=".env", extra='ignore')
    GEMINI_API_KEY : str = Field(..., description='Gemini LLM api key')
    
    DATABASE_URL: str =os.getenv("DATABASE_URL")
    
settings = Settings()

if not settings.GEMINI_API_KEY:
    logger.error("GEMINI_API_KEY env isn't set!!")


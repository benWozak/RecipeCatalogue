from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union
import os

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost/recipecatalogue"
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    CLERK_SECRET_KEY: str = ""
    CLERK_PUBLISHABLE_KEY: str = ""
    CLERK_WEBHOOK_SECRET: str = ""
    
    ALLOWED_ORIGINS: Union[List[str], str] = ["http://localhost:3000", "http://localhost:5173"]
    
    GOOGLE_CLOUD_VISION_CREDENTIALS: str = ""
    OPENAI_API_KEY: str = ""
    
    @field_validator('ALLOWED_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    class Config:
        env_file = ".env"

settings = Settings()
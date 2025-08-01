from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union
import os
import secrets

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost/recipecatalogue"
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    CLERK_SECRET_KEY: str = ""
    CLERK_PUBLISHABLE_KEY: str = ""
    CLERK_WEBHOOK_SECRET: str = ""
    CLERK_ISSUER: str = ""
    
    ALLOWED_ORIGINS: Union[List[str], str] = ["http://localhost:3000", "http://localhost:5173"]
    
    GOOGLE_CLOUD_VISION_CREDENTIALS: str = ""
    OPENAI_API_KEY: str = ""
    
    # JWT Validation Settings
    JWT_CLOCK_SKEW_TOLERANCE_SECONDS: int = 5  # 5 seconds to match Clerk's setting
    
    @field_validator('ALLOWED_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    class Config:
        env_file = ".env"

settings = Settings()
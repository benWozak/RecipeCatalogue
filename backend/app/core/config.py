from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union

class Settings(BaseSettings):
    # Database Configuration - must be set via environment variable
    DATABASE_URL: str = ""
    
    # Clerk Authentication Settings - must be set via environment variables
    CLERK_SECRET_KEY: str = ""
    CLERK_PUBLISHABLE_KEY: str = ""
    CLERK_WEBHOOK_SECRET: str = ""
    CLERK_ISSUER: str = ""
    
    # CORS Configuration - must be set via environment variable
    ALLOWED_ORIGINS: Union[List[str], str] = []
    
    # External API Keys
    GOOGLE_CLOUD_VISION_CREDENTIALS: str = ""
    OPENAI_API_KEY: str = ""
    
    # JWT Validation Settings
    JWT_CLOCK_SKEW_TOLERANCE_SECONDS: int = 5
    
    @field_validator('ALLOWED_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # Ignore extra environment variables

settings = Settings()
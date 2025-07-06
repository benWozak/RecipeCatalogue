from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine
from app.core.startup import startup_event
from app.models import Base
from app.api.auth import auth_router
from app.api.recipes import recipes_router
from app.api.meal_plans import meal_plans_router
from app.api.users import users_router
from app.api.parsing import parsing_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Recipe Catalogue API",
    description="Backend API for Recipe Management PWA",
    version="1.0.0"
)

# Add startup event handler
app.add_event_handler("startup", startup_event)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(recipes_router, prefix="/api/recipes", tags=["recipes"])
app.include_router(meal_plans_router, prefix="/api/meal-plans", tags=["meal-plans"])
app.include_router(users_router, prefix="/api/users", tags=["users"])
app.include_router(parsing_router, prefix="/api/parse", tags=["parsing"])

# Mount static files for media serving
import os
media_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "media")
if os.path.exists(media_dir):
    app.mount("/media", StaticFiles(directory=media_dir), name="media")

@app.get("/")
async def root():
    return {"message": "Recipe Catalogue API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
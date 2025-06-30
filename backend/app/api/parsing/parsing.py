from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth.auth import get_current_user
from app.models.user import User
from app.schemas.recipe import RecipeCreate
from app.services.parsing_service import ParsingService
from pydantic import BaseModel

router = APIRouter()

class URLParseRequest(BaseModel):
    url: str

class InstagramParseRequest(BaseModel):
    url: str

@router.post("/url")
async def parse_recipe_from_url(
    request: URLParseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    parsing_service = ParsingService(db)
    try:
        recipe_data = await parsing_service.parse_from_url(request.url)
        return recipe_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse recipe from URL: {str(e)}"
        )

@router.post("/instagram")
async def parse_recipe_from_instagram(
    request: InstagramParseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    parsing_service = ParsingService(db)
    try:
        recipe_data = await parsing_service.parse_from_instagram(request.url)
        return recipe_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse recipe from Instagram: {str(e)}"
        )

@router.post("/image")
async def parse_recipe_from_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    parsing_service = ParsingService(db)
    try:
        image_data = await file.read()
        recipe_data = await parsing_service.parse_from_image(image_data)
        return recipe_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse recipe from image: {str(e)}"
        )
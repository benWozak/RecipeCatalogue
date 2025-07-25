from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import uuid
import asyncio
import json
from app.core.database import get_db
from app.api.auth.auth import get_current_user
from app.models.user import User
from app.schemas.recipe import RecipeCreate
from app.services.parsing_service import ParsingService
from app.services.parsers import ValidationPipeline, ValidationStatus
from app.services.parsers.url_parser import WebsiteProtectionError
from app.services.parsers.progress_events import progress_stream, ProgressPhase, ProgressStatus
from pydantic import BaseModel

router = APIRouter()

class URLParseRequest(BaseModel):
    url: str
    collection_id: Optional[str] = None

class InstagramParseRequest(BaseModel):
    url: str
    collection_id: Optional[str] = None

class BatchInstagramRequest(BaseModel):
    urls: List[str]
    max_results: Optional[int] = 20
    collection_id: Optional[str] = None

class ProfileParseRequest(BaseModel):
    username: str
    max_posts: Optional[int] = 10

class HashtagSearchRequest(BaseModel):
    hashtag: str
    max_posts: Optional[int] = 20

class ValidationApprovalRequest(BaseModel):
    validation_id: str
    user_edits: Optional[Dict[str, Any]] = None

class ValidationRejectionRequest(BaseModel):
    validation_id: str
    reason: str

class URLParseStreamRequest(BaseModel):
    url: str
    collection_id: Optional[str] = None

@router.post("/url")
async def parse_recipe_from_url(
    request: URLParseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    parsing_service = ParsingService(db)
    try:
        recipe_data = await parsing_service.parse_from_url(request.url, current_user.id, request.collection_id)
        return recipe_data
    except WebsiteProtectionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error_type": "website_protection",
                "message": str(e),
                "suggestions": [
                    "Try copying and pasting the recipe text manually",
                    "Take a screenshot and use image parsing instead",
                    "Look for the same recipe on a different website",
                    "Some websites block automated access to protect their content"
                ]
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse recipe from URL: {str(e)}"
        )

@router.post("/url/stream")
async def parse_recipe_from_url_stream(
    request: URLParseStreamRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Stream real-time progress updates while parsing recipe from URL"""
    session_id = str(uuid.uuid4())
    
    async def event_stream():
        try:
            # Create progress tracking session
            progress_emitter = progress_stream.create_session(request.url, session_id)
            
            # Start parsing in background task
            parsing_task = asyncio.create_task(
                parse_recipe_with_progress(request, current_user, db, progress_emitter)
            )
            
            # Stream progress events
            async for event in progress_stream.subscribe_to_session(session_id):
                yield event.to_sse_format()
                
                # Stop streaming if completed or failed
                if event.phase in [ProgressPhase.COMPLETED, ProgressPhase.FAILED]:
                    break
            
            # Wait for parsing to complete and get result
            try:
                result = await parsing_task
                
                # Send final result as data event
                final_event = {
                    "event": "result",
                    "data": result
                }
                yield f"data: {json.dumps(final_event)}\n\n"
                
            except Exception as e:
                # Send error as final event
                error_event = {
                    "event": "error",
                    "data": {
                        "error_type": "parsing_failed",
                        "message": str(e)
                    }
                }
                yield f"data: {json.dumps(error_event)}\n\n"
                
        except asyncio.CancelledError:
            # Client disconnected
            pass
        except Exception as e:
            # Send error event
            error_event = {
                "event": "error", 
                "data": {
                    "error_type": "stream_error",
                    "message": str(e)
                }
            }
            yield f"data: {json.dumps(error_event)}\n\n"
        finally:
            # Cleanup session
            progress_stream.cleanup_session(session_id)
    
    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Session-ID": session_id
        }
    )

async def parse_recipe_with_progress(
    request: URLParseStreamRequest,
    current_user: User,
    db: Session,
    progress_emitter
):
    """Parse recipe with progress tracking"""
    
    parsing_service = ParsingService(db)
    try:
        # Parse using URL parser with progress tracking
        recipe_data = await parsing_service.parse_from_url_with_progress(
            request.url, 
            current_user.id, 
            request.collection_id,
            progress_emitter
        )
        return recipe_data
    except WebsiteProtectionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error_type": "website_protection",
                "message": str(e),
                "suggestions": [
                    "Try copying and pasting the recipe text manually",
                    "Take a screenshot and use image parsing instead",
                    "Look for the same recipe on a different website",
                    "Some websites block automated access to protect their content"
                ]
            }
        )
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
        recipe_data = await parsing_service.parse_from_instagram(request.url, current_user.id, request.collection_id)
        return recipe_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse recipe from Instagram: {str(e)}"
        )

@router.post("/instagram/batch")
async def parse_batch_instagram_urls(
    request: BatchInstagramRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Parse multiple Instagram URLs in batch"""
    parsing_service = ParsingService(db)
    results = []
    errors = []
    
    for url in request.urls[:request.max_results]:
        try:
            recipe_data = await parsing_service.parse_from_instagram(url, current_user.id, request.collection_id)
            results.append({"url": url, "status": "success", "data": recipe_data})
        except Exception as e:
            errors.append({"url": url, "status": "error", "error": str(e)})
    
    return {
        "total_processed": len(request.urls[:request.max_results]),
        "successful": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors
    }

@router.post("/instagram/profile")
async def parse_instagram_profile(
    request: ProfileParseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Parse recipes from an Instagram profile"""
    parsing_service = ParsingService(db)
    try:
        recipes = parsing_service.instagram_parser.parse_instagram_profile(
            request.username, 
            request.max_posts
        )
        
        # Convert to legacy format
        recipe_data = []
        for recipe in recipes:
            data = parsing_service._convert_to_legacy_format(recipe)
            recipe_data.append(data)
        
        return {
            "username": request.username,
            "recipes_found": len(recipe_data),
            "recipes": recipe_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse Instagram profile: {str(e)}"
        )

@router.post("/instagram/hashtag")
async def search_recipes_by_hashtag(
    request: HashtagSearchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search for recipes using Instagram hashtags"""
    parsing_service = ParsingService(db)
    try:
        recipes = parsing_service.instagram_parser.search_recipe_hashtags(
            request.hashtag, 
            request.max_posts
        )
        
        # Convert to legacy format
        recipe_data = []
        for recipe in recipes:
            data = parsing_service._convert_to_legacy_format(recipe)
            recipe_data.append(data)
        
        return {
            "hashtag": request.hashtag,
            "recipes_found": len(recipe_data),
            "recipes": recipe_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to search hashtag: {str(e)}"
        )

@router.post("/image")
async def parse_recipe_from_image(
    file: UploadFile = File(...),
    collection_id: Optional[str] = Query(None),
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
        recipe_data = await parsing_service.parse_from_image(image_data, current_user.id, collection_id)
        return recipe_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse recipe from image: {str(e)}"
        )

# Validation and Preview Endpoints

@router.get("/validation/pending")
async def get_pending_validations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(default=50, le=100)
):
    """Get list of recipes pending validation"""
    validation_pipeline = ValidationPipeline()
    try:
        pending_recipes = validation_pipeline.list_pending_recipes(limit)
        
        # Filter by user if needed (for now, return all)
        return {
            "total": len(pending_recipes),
            "recipes": [
                {
                    "id": recipe.id,
                    "title": recipe.parsed_recipe.title,
                    "source_url": recipe.original_source,
                    "confidence_score": recipe.parsed_recipe.confidence_score,
                    "status": recipe.validation_status,
                    "created_at": recipe.created_at,
                    "issues": [{"type": issue.type, "severity": issue.severity, "message": issue.message} 
                              for issue in recipe.issues]
                }
                for recipe in pending_recipes
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get pending validations: {str(e)}"
        )

@router.get("/validation/{validation_id}")
async def get_validation_detail(
    validation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed validation information for a specific recipe"""
    validation_pipeline = ValidationPipeline()
    try:
        validation_result = validation_pipeline.get_pending_recipe(validation_id)
        if not validation_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Validation record not found"
            )
        
        return {
            "validation_id": validation_result.id,
            "recipe": {
                "title": validation_result.parsed_recipe.title,
                "description": validation_result.parsed_recipe.description,
                "source_type": validation_result.parsed_recipe.source_type,
                "source_url": validation_result.parsed_recipe.source_url,
                "ingredients": validation_result.parsed_recipe.ingredients,
                "instructions": validation_result.parsed_recipe.instructions,
                "prep_time": validation_result.parsed_recipe.prep_time,
                "cook_time": validation_result.parsed_recipe.cook_time,
                "total_time": validation_result.parsed_recipe.total_time,
                "servings": validation_result.parsed_recipe.servings,
                "confidence_score": validation_result.parsed_recipe.confidence_score,
                "media": validation_result.parsed_recipe.media
            },
            "validation": {
                "status": validation_result.validation_status,
                "created_at": validation_result.created_at,
                "issues": [
                    {
                        "type": issue.type,
                        "severity": issue.severity,
                        "message": issue.message,
                        "field": issue.field,
                        "suggestion": issue.suggestion
                    }
                    for issue in validation_result.issues
                ]
            },
            "metadata": validation_result.parsing_metadata
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get validation details: {str(e)}"
        )

@router.post("/validation/{validation_id}/approve")
async def approve_validation(
    validation_id: str,
    request: ValidationApprovalRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve a validated recipe, optionally with user edits"""
    validation_pipeline = ValidationPipeline()
    try:
        validation_result = validation_pipeline.approve_recipe(
            validation_id, 
            request.user_edits
        )
        
        return {
            "status": "approved",
            "validation_id": validation_id,
            "message": "Recipe approved successfully",
            "final_recipe": {
                "title": validation_result.parsed_recipe.title,
                "description": validation_result.parsed_recipe.description,
                "confidence_score": validation_result.parsed_recipe.confidence_score
            }
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve recipe: {str(e)}"
        )

@router.post("/validation/{validation_id}/reject")
async def reject_validation(
    validation_id: str,
    request: ValidationRejectionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reject a validated recipe"""
    validation_pipeline = ValidationPipeline()
    try:
        validation_result = validation_pipeline.reject_recipe(
            validation_id, 
            request.reason
        )
        
        return {
            "status": "rejected",
            "validation_id": validation_id,
            "reason": request.reason,
            "message": "Recipe rejected successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reject recipe: {str(e)}"
        )

@router.get("/validation/summary")
async def get_validation_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get summary of validation pipeline status"""
    validation_pipeline = ValidationPipeline()
    try:
        summary = validation_pipeline.get_validation_summary()
        return summary
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get validation summary: {str(e)}"
        )

@router.get("/progress/sessions")
async def get_active_progress_sessions(
    current_user: User = Depends(get_current_user)
):
    """Get information about active parsing sessions"""
    try:
        active_sessions = progress_stream.get_active_sessions()
        return {
            "active_sessions": len(active_sessions),
            "sessions": active_sessions
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get progress sessions: {str(e)}"
        )

@router.get("/progress/session/{session_id}")
async def get_progress_session_details(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get detailed information about a specific parsing session"""
    try:
        session = progress_stream.get_session(session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        return session.get_summary()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get session details: {str(e)}"
        )
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_clerk_token
from app.models.user import User
from app.schemas.user import User as UserSchema, UserCreate
import json

router = APIRouter()

async def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    authorization: str = request.headers.get("Authorization")
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing"
        )
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme"
            )
        
        # Verify token with Clerk
        clerk_data = await verify_clerk_token(token)
        clerk_user_id = clerk_data.get("user_id")
        
        if not clerk_user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        # Get or create user
        user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()
        if not user:
            # Auto-create user if they don't exist
            payload = clerk_data.get("payload", {})
            email = payload.get("email") or f"{clerk_user_id}@clerk.local"
            name = payload.get("name") or "Unknown User"
            
            user = User(
                clerk_user_id=clerk_user_id,
                email=email,
                name=name
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        return user
    
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )

@router.post("/webhook")
async def clerk_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    
    try:
        data = json.loads(payload)
        event_type = data.get("type")
        
        if event_type == "user.created":
            user_data = data.get("data")
            email = user_data.get("email_addresses", [{}])[0].get("email_address")
            name = f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip()
            
            user = User(
                clerk_user_id=user_data.get("id"),
                email=email,
                name=name or None
            )
            db.add(user)
            db.commit()
            
        elif event_type == "user.updated":
            user_data = data.get("data")
            user = db.query(User).filter(User.clerk_user_id == user_data.get("id")).first()
            if user:
                email = user_data.get("email_addresses", [{}])[0].get("email_address")
                name = f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip()
                
                user.email = email
                user.name = name or None
                db.commit()
        
        return {"status": "success"}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Webhook processing failed: {str(e)}"
        )

@router.get("/me", response_model=UserSchema)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
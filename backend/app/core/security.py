from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings
import httpx
from fastapi import HTTPException, status

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def verify_clerk_token(token: str) -> dict:
    try:
        # Use Clerk's verify endpoint
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.clerk.com/v1/sessions/verify",
                headers={
                    "Authorization": f"Bearer {settings.CLERK_SECRET_KEY}",
                    "Content-Type": "application/json"
                },
                json={"token": token}
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                # Try alternative method - decode without verification to get user info
                try:
                    payload = jwt.get_unverified_claims(token)
                    # Extract user ID from standard Clerk JWT claims
                    user_id = payload.get('sub')  # subject is usually the user ID
                    if user_id:
                        return {"user_id": user_id, "payload": payload}
                except:
                    pass
                
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication credentials"
                )
                
    except HTTPException:
        raise
    except Exception as e:
        # As fallback, try to extract user info from unverified token
        try:
            payload = jwt.get_unverified_claims(token)
            user_id = payload.get('sub')
            if user_id:
                return {"user_id": user_id, "payload": payload}
        except:
            pass
            
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
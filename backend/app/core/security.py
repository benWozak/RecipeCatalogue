from datetime import datetime, timedelta, timezone
from typing import Dict, Any
from jose import JWTError, jwt, jwk
from app.core.config import settings
import httpx
import logging
import time
import base64
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

# Cache for Clerk's public keys
_clerk_jwks_cache = {"keys": None, "expires_at": None}

async def get_clerk_public_keys() -> Dict[str, Any]:
    """
    Fetch and cache Clerk's public keys from JWKS endpoint.
    
    Returns:
        Dict containing the JWKS data with public keys
        
    Raises:
        HTTPException: If Clerk configuration is missing or JWKS fetch fails
    """
    current_time = datetime.now(timezone.utc)
    
    # Return cached keys if still valid (cache for 1 hour)
    if (_clerk_jwks_cache["keys"] and 
        _clerk_jwks_cache["expires_at"] and 
        current_time < _clerk_jwks_cache["expires_at"]):
        return _clerk_jwks_cache["keys"]
    
    try:
        # Extract publishable key to get instance domain
        if not settings.CLERK_PUBLISHABLE_KEY:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Clerk configuration missing"
            )
        
        # Decode the publishable key to extract the instance domain
        # Clerk publishable keys are base64 encoded and contain the instance domain
        # Format: pk_test_<base64_encoded_domain> or pk_live_<base64_encoded_domain>
        key_parts = settings.CLERK_PUBLISHABLE_KEY.split('_')
        if len(key_parts) < 3:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Invalid Clerk publishable key format"
            )
        
        try:
            encoded_domain = key_parts[2]
            # Decode the domain (add proper padding)
            padding_needed = 4 - (len(encoded_domain) % 4)
            if padding_needed != 4:
                encoded_domain += '=' * padding_needed
            decoded_bytes = base64.b64decode(encoded_domain)
            domain = decoded_bytes.decode('utf-8').rstrip('$')  # Remove trailing $
            jwks_url = f"https://{domain}/.well-known/jwks.json"
            logger.info(f"Using Clerk JWKS URL: {jwks_url}")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to decode Clerk publishable key: {str(e)}"
            )
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(jwks_url)
            response.raise_for_status()
            
            jwks_data = response.json()
            
            # Cache the keys for 1 hour
            _clerk_jwks_cache["keys"] = jwks_data
            _clerk_jwks_cache["expires_at"] = current_time + timedelta(hours=1)
            
            return jwks_data
    
    except Exception as e:
        logger.error(f"Failed to fetch Clerk JWKS: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service unavailable"
        )

async def verify_clerk_token(token: str) -> Dict[str, Any]:
    """
    Verify Clerk JWT token using proper cryptographic validation.
    
    Args:
        token: The JWT token to verify
        
    Returns:
        Dict containing user_id and full payload
        
    Raises:
        HTTPException: If token is invalid, expired, or verification fails
    """
    try:
        # Decode JWT header to get key ID
        unverified_header = jwt.get_unverified_header(token)
        if not unverified_header:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token format"
            )
        
        kid = unverified_header.get('kid')
        alg = unverified_header.get('alg')
        
        if not kid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token format"
            )
        
        # Validate algorithm
        if alg not in ['RS256', 'RS512', 'ES256', 'ES512']:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unsupported token algorithm"
            )
        
        # Get Clerk's public keys
        jwks_data = await get_clerk_public_keys()
        
        # Find the matching public key
        public_key = None
        for key_data in jwks_data.get('keys', []):
            if key_data.get('kid') == kid:
                public_key = jwk.construct(key_data)
                break
        
        if not public_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token key not found"
            )
        
        # Verify and decode the token
        payload = jwt.decode(
            token,
            public_key,
            algorithms=[alg],
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_nbf": True,
                "verify_iat": True,
                "verify_aud": False,  # Clerk doesn't always set audience
            }
        )
        
        # Validate required claims - use system time to match token timestamps
        current_time = time.time()
        
        # Check expiration with configurable tolerance
        exp = payload.get('exp')
        if not exp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing expiration claim"
            )
        
        # Add clock skew tolerance
        tolerance = settings.JWT_CLOCK_SKEW_TOLERANCE_SECONDS
        exp_with_tolerance = exp + tolerance
        
        if exp_with_tolerance < current_time:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired"
            )
        
        # Check not before - using same system time for consistency
        nbf = payload.get('nbf')
        if nbf and nbf > current_time:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token not yet valid"
            )
        
        # Validate issuer
        iss = payload.get('iss')
        expected_issuer = settings.CLERK_ISSUER
        if not iss or iss != expected_issuer:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token issuer"
            )
        
        # Validate authorized parties if present
        azp = payload.get('azp')
        if azp:
            # Check against allowed origins
            allowed_origins = settings.ALLOWED_ORIGINS if isinstance(settings.ALLOWED_ORIGINS, list) else [settings.ALLOWED_ORIGINS]
            if azp not in allowed_origins:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token not authorized for this origin"
                )
        
        # Extract user ID
        user_id = payload.get('sub')
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token claims"
            )
        
        return {"user_id": user_id, "payload": payload}
        
    except HTTPException:
        raise
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except Exception as e:
        logger.error(f"Token validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )
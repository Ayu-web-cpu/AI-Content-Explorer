# app/deps/auth.py
from fastapi import Depends, HTTPException, status
from app.core import security

def get_current_user(token: str = Depends(security.oauth2_scheme)):
    payload = security.decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    return payload  # {sub: user_id, role: "user"|"admin"}

def require_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins only!"
        )
    return user

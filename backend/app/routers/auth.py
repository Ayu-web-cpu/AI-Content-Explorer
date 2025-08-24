from fastapi import APIRouter, Depends, HTTPException, Form, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_session
from app.schemas.auth import UserCreate, Token
from app.models.user import User
from app.core import security


router = APIRouter(prefix="/auth", tags=["auth"])



@router.post("/register", response_model=Token)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = security.hash_password(user_in.password)
    user = User(email=user_in.email, hashed_password=hashed, role="user")
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access = security.create_access_token(str(user.id), user.role)
    refresh = security.create_refresh_token(str(user.id), user.role)
    return Token(access_token=access, refresh_token=refresh)


@router.post("/login", response_model=Token)
async def login(
    request: Request,
    db: AsyncSession = Depends(get_session),
    username: str = Form(None),
    password: str = Form(None),
):
    email, passwd = None, None

    if request.headers.get("content-type", "").startswith("application/json"):
        body = await request.json()
        email, passwd = body.get("email"), body.get("password")

    
    elif username and password:
        email, passwd = username, password

    if not email or not passwd:
        raise HTTPException(status_code=400, detail="Missing credentials")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not security.verify_password(passwd, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access = security.create_access_token(str(user.id), user.role)
    refresh = security.create_refresh_token(str(user.id), user.role)

    return Token(access_token=access, refresh_token=refresh)


@router.post("/refresh", response_model=Token)
async def refresh(token: str):
    try:
        payload = security.decode_token(token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Not a refresh token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id, role = payload.get("sub"), payload.get("role", "user")
    access = security.create_access_token(user_id, role)
    refresh = security.create_refresh_token(user_id, role)
    return Token(access_token=access, refresh_token=refresh)


__all__ = ["router"]

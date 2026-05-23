from fastapi import Request, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional
from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models import User, Admin
from backend.app.utils.security import decode_jwt_token

COOKIE_NAME = "app_session_id"

async def get_current_user_optional(request: Request, db: AsyncSession = Depends(get_db)) -> Optional[dict]:
    # Extract token from cookies or authorization header
    token = request.cookies.get(COOKIE_NAME)
    if not token and request.headers.get("Authorization"):
        auth_header = request.headers.get("Authorization")
        if auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "", 1)

    user_info = None

    if token:
        payload = decode_jwt_token(token)
        if payload and "openId" in payload:
            open_id = payload["openId"]
            # Fetch fresh user info from DB
            result = await db.execute(select(User).where(User.open_id == open_id))
            db_user = result.scalars().first()
            
            user_info = {
                "openId": open_id,
                "email": db_user.email if db_user else payload.get("email"),
                "name": db_user.name if db_user else payload.get("name"),
                "role": db_user.role if db_user else payload.get("role", "user"),
            }

    # Fallback in local development
    if not user_info and settings.NODE_ENV == "development":
        user_info = {
            "openId": settings.OWNER_OPEN_ID,
            "email": "admin@nexusdigest.pk",
            "name": settings.OWNER_NAME,
            "role": "admin",
        }

    return user_info

async def get_current_user(user: Optional[dict] = Depends(get_current_user_optional)) -> dict:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You must be logged in to access this resource"
        )
    return user

async def get_current_admin(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Admin role required"
        )
        
    # Check if admin entry exists, if not create or verify it
    open_id = user["openId"]
    result = await db.execute(select(Admin).where(Admin.open_id == open_id))
    admin_entry = result.scalars().first()
    
    if not admin_entry:
        # Create admin entry on the fly matching Node.js createOrUpdateAdmin behavior
        new_admin = Admin(
            open_id=open_id,
            email=user["email"] or "admin@nexusdigest.pk",
            name=user["name"] or "Admin User",
            is_superadmin=(open_id == settings.OWNER_OPEN_ID)
        )
        db.add(new_admin)
        await db.commit()
        await db.refresh(new_admin)
        user["adminId"] = new_admin.id
    else:
        user["adminId"] = admin_entry.id

    return user

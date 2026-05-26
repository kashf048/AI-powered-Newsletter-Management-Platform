import logging
from fastapi import Request, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional
from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models import User, Admin
from backend.app.utils.security import decode_jwt_token

logger = logging.getLogger(__name__)

COOKIE_NAME = "app_session_id"


async def get_current_user_optional(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> Optional[dict]:
    """Extract and validate the session token; return user dict or None."""
    # Prefer HttpOnly cookie; fall back to Authorization header
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]

    if not token:
        return None

    payload = decode_jwt_token(token)
    if not payload or "openId" not in payload:
        return None

    open_id: str = payload["openId"]

    # Always fetch fresh user data from DB — never trust role from JWT alone
    result = await db.execute(select(User).where(User.open_id == open_id))
    db_user = result.scalars().first()

    if not db_user:
        # Token is valid but user no longer exists
        return None

    return {
        "openId": open_id,
        "email": db_user.email,
        "name": db_user.name,
        "role": db_user.role,
    }


async def get_current_user(
    user: Optional[dict] = Depends(get_current_user_optional),
) -> dict:
    """Require an authenticated user; raise 401 otherwise."""
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
        )
    return user


async def get_current_admin(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Require admin role. Verifies both the DB role and the ADMIN_EMAILS allowlist."""
    allowed_emails = [
        e.strip().lower()
        for e in settings.ADMIN_EMAILS.split(",")
        if e.strip()
    ]

    is_admin_role = user.get("role") == "admin"
    is_allowed_email = user.get("email", "").lower() in allowed_emails

    if not (is_admin_role or is_allowed_email):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: admin privileges required.",
        )

    # Fetch or lazily provision Admin record
    open_id = user["openId"]
    result = await db.execute(select(Admin).where(Admin.open_id == open_id))
    admin_entry = result.scalars().first()

    if not admin_entry:
        email_val = user.get("email") or ""
        is_super = bool(allowed_emails and email_val.lower() == allowed_emails[0])
        admin_entry = Admin(
            open_id=open_id,
            email=email_val,
            name=user.get("name") or "Admin",
            is_superadmin=is_super,
        )
        db.add(admin_entry)
        await db.commit()
        await db.refresh(admin_entry)
        logger.info("Provisioned new Admin record for open_id=%s", open_id)

    user["adminId"] = admin_entry.id
    return user

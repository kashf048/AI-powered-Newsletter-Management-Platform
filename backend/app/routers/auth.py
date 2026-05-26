import secrets
import logging
import datetime
from fastapi import APIRouter, Depends, Response, Request, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional

from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models import User, Admin
from backend.app.utils.security import (
    create_jwt_token, hash_password, verify_password, utcnow
)
from backend.app.dependencies import get_current_user_optional, get_current_user, COOKIE_NAME
from backend.app.utils.rate_limiter import login_rate_limit, password_reset_rate_limit
from backend.app.services.email_service import EmailService
from backend.app.schemas import (
    UserRegisterRequest, UserLoginRequest, ForgotPasswordRequest,
    ResetPasswordConfirm, ChangePasswordRequest,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

# Cookie lifetime: 7 days (matches JWT expiry)
_COOKIE_MAX_AGE = 7 * 24 * 60 * 60


def _set_session_cookie(response: Response, token: str, is_production: bool) -> None:
    """Set the session cookie with environment-appropriate security flags."""
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        path="/",
        domain=None,
        # secure=True in production (HTTPS), False in local dev (HTTP)
        secure=is_production,
        httponly=True,
        samesite="lax",
        max_age=_COOKIE_MAX_AGE,
    )


def _clear_session_cookie(response: Response, is_production: bool) -> None:
    """Delete the session cookie with matching security flags."""
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        domain=None,
        secure=is_production,
        httponly=True,
        samesite="lax",
    )


@router.get("/me", summary="Get current authenticated user")
async def get_me(user: Optional[dict] = Depends(get_current_user_optional)):
    return user


@router.post("/logout", summary="Log out current user")
async def logout(response: Response):
    _clear_session_cookie(response, settings.is_production)
    return {"success": True}


@router.post("/register", summary="Register a new user account")
async def register(
    payload: UserRegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    # Check email uniqueness
    email_check = await db.execute(
        select(User).where(User.email == payload.email.lower())
    )
    if email_check.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered",
        )

    # Check username uniqueness
    username_check = await db.execute(
        select(User).where(User.username == payload.username.lower())
    )
    if username_check.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already taken",
        )

    hashed = hash_password(payload.password)

    # Assign admin role if email is in ADMIN_EMAILS
    allowed_emails = [
        e.strip().lower() for e in settings.ADMIN_EMAILS.split(",") if e.strip()
    ]
    role = "admin" if payload.email.lower() in allowed_emails else "user"

    import uuid
    open_id = uuid.uuid4().hex
    now_dt = utcnow()

    db_user = User(
        open_id=open_id,
        username=payload.username.lower(),
        hashed_password=hashed,
        name=payload.name or payload.username,
        email=payload.email.lower(),
        login_method="credentials",
        role=role,
        created_at=now_dt,
        updated_at=now_dt,
        last_signed_in=now_dt,
    )
    db.add(db_user)

    # Provision Admin record if this is an admin user
    if role == "admin":
        admin_check = await db.execute(
            select(Admin).where(Admin.email == payload.email.lower())
        )
        db_admin = admin_check.scalars().first()
        if not db_admin:
            db_admin = Admin(
                open_id=open_id,
                email=payload.email.lower(),
                name=payload.name or payload.username,
                avatar_url=None,
                is_superadmin=bool(allowed_emails and payload.email.lower() == allowed_emails[0]),
                created_at=now_dt,
                updated_at=now_dt,
            )
            db.add(db_admin)
        else:
            db_admin.open_id = open_id
            db_admin.name = payload.name or payload.username
            db_admin.updated_at = now_dt

    await db.commit()
    logger.info("New user registered: %s (role=%s)", payload.email.lower(), role)

    token_payload = {
        "openId": open_id,
        "email": payload.email.lower(),
        "name": payload.name or payload.username,
        "role": role,
    }
    jwt_token = create_jwt_token(token_payload)
    _set_session_cookie(response, jwt_token, settings.is_production)

    return {"success": True, "user": token_payload}


@router.post("/login", dependencies=[Depends(login_rate_limit)], summary="Log in with credentials")
async def login(
    payload: UserLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    identifier = payload.emailOrUsername.lower()
    user_query = await db.execute(
        select(User).where(
            (User.email == identifier) | (User.username == identifier)
        )
    )
    db_user = user_query.scalars().first()

    # Use constant-time comparison to prevent timing attacks
    if not db_user or not db_user.hashed_password:
        # Still call verify_password with a dummy hash to prevent timing attacks
        verify_password(payload.password, "$2b$12$dummyhashfortimingprotection00000000000000000000")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if not verify_password(payload.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    # Sync admin role if email is in ADMIN_EMAILS allowlist
    allowed_emails = [
        e.strip().lower() for e in settings.ADMIN_EMAILS.split(",") if e.strip()
    ]
    if db_user.email and db_user.email.lower() in allowed_emails:
        if db_user.role != "admin":
            db_user.role = "admin"
            admin_check = await db.execute(
                select(Admin).where(Admin.email == db_user.email.lower())
            )
            if not admin_check.scalars().first():
                db.add(Admin(
                    open_id=db_user.open_id,
                    email=db_user.email.lower(),
                    name=db_user.name,
                    is_superadmin=bool(
                        allowed_emails and db_user.email.lower() == allowed_emails[0]
                    ),
                    created_at=utcnow(),
                    updated_at=utcnow(),
                ))

    db_user.last_signed_in = utcnow()
    db_user.updated_at = utcnow()
    await db.commit()

    token_payload = {
        "openId": db_user.open_id,
        "email": db_user.email,
        "name": db_user.name,
        "role": db_user.role,
    }
    jwt_token = create_jwt_token(token_payload)
    _set_session_cookie(response, jwt_token, settings.is_production)
    logger.info("User logged in: %s", db_user.email)

    return {"success": True, "user": token_payload}


@router.post(
    "/reset-password/request",
    dependencies=[Depends(password_reset_rate_limit)],
    summary="Request a password reset email",
)
async def reset_password_request(
    payload: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    user_query = await db.execute(
        select(User).where(User.email == payload.email.lower())
    )
    db_user = user_query.scalars().first()

    if db_user:
        reset_token = secrets.token_urlsafe(48)
        expiry = utcnow() + datetime.timedelta(hours=1)
        db_user.reset_token = reset_token
        db_user.reset_token_expires = expiry
        await db.commit()

        EmailService.send_password_reset_email(
            email=db_user.email,
            name=db_user.name or db_user.username,
            token=reset_token,
        )
        logger.info("Password reset email sent to: %s", db_user.email)

    # Always return success to prevent user enumeration
    return {
        "success": True,
        "message": "If that email is registered, a password reset link has been sent.",
    }


@router.post("/reset-password/confirm", summary="Confirm password reset with token")
async def reset_password_confirm(
    payload: ResetPasswordConfirm,
    db: AsyncSession = Depends(get_db),
):
    user_query = await db.execute(
        select(User).where(
            User.reset_token == payload.token,
            User.reset_token_expires > utcnow(),
        )
    )
    db_user = user_query.scalars().first()

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token",
        )

    db_user.hashed_password = hash_password(payload.newPassword)
    db_user.reset_token = None
    db_user.reset_token_expires = None
    db_user.updated_at = utcnow()
    await db.commit()

    return {"success": True, "message": "Password has been reset successfully."}


@router.post("/change-password", summary="Change password for authenticated user")
async def change_password(
    payload: ChangePasswordRequest,
    user_context: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_query = await db.execute(
        select(User).where(User.open_id == user_context["openId"])
    )
    db_user = user_query.scalars().first()

    if not db_user or not db_user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password",
        )

    if not verify_password(payload.oldPassword, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password",
        )

    db_user.hashed_password = hash_password(payload.newPassword)
    db_user.updated_at = utcnow()
    await db.commit()

    return {"success": True, "message": "Password changed successfully."}

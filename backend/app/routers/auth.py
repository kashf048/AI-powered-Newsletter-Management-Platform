import httpx
import urllib.parse
from fastapi import APIRouter, Depends, Response, Request, HTTPException, status
from fastapi.responses import RedirectResponse, HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional
from datetime import datetime, timezone

from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models import User, Admin
from backend.app.utils.security import create_jwt_token
from backend.app.dependencies import get_current_user_optional, COOKIE_NAME

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/me")
async def get_me(user: Optional[dict] = Depends(get_current_user_optional)):
    return user

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        domain=None,
        secure=False,
        httponly=True,
        samesite="lax"
    )
    return {"success": True}

@router.get("/google/login")
async def google_login():
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        # Return a helpful HTML guide if OAuth is not configured
        html_content = """
        <html>
            <head>
                <title>OAuth Configuration Required</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                    .card { background: #1e293b; padding: 2.5rem; border-radius: 12px; max-width: 500px; text-align: center; border: 1px solid #334155; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
                    h2 { color: #f43f5e; margin-top: 0; }
                    p { color: #94a3b8; line-height: 1.6; font-size: 0.95rem; }
                    code { background: #0f172a; padding: 0.2rem 0.4rem; border-radius: 4px; color: #38bdf8; font-family: monospace; }
                    .btn { display: inline-block; background: #0284c7; color: white; padding: 0.75rem 1.5rem; border-radius: 6px; text-decoration: none; font-weight: 650; margin-top: 1.5rem; border: none; cursor: pointer; transition: background 0.2s; }
                    .btn:hover { background: #0369a1; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h2>Google OAuth Not Configured</h2>
                    <p>To sign in, you must configure Google OAuth credentials in your <code>.env</code> file:</p>
                    <p style="text-align: left;">
                        <code>GOOGLE_CLIENT_ID="your_google_client_id"</code><br/>
                        <code>GOOGLE_CLIENT_SECRET="your_google_client_secret"</code><br/>
                        <code>GOOGLE_REDIRECT_URI="http://localhost:8000/api/auth/google/callback"</code><br/>
                        <code>ADMIN_EMAILS="your-email@gmail.com"</code>
                    </p>
                    <form action="/api/auth/dev-bypass" method="POST">
                        <button type="submit" class="btn">Use Dev Mode Auto-Bypass</button>
                    </form>
                </div>
            </body>
        </html>
        """
        return HTMLResponse(content=html_content, status_code=200)

    # Build OAuth authorization URL
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    return RedirectResponse(auth_url)

@router.get("/google/callback")
async def google_callback(code: str, response: Response, db: AsyncSession = Depends(get_db)):
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=400, detail="OAuth credentials not configured")

    # Exchange authorization code for token
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code"
    }

    async with httpx.AsyncClient() as client:
        try:
            token_resp = await client.post(token_url, data=token_data)
            if token_resp.status_code != 200:
                return HTMLResponse(content=f"<h3>Google token exchange failed</h3><pre>{token_resp.text}</pre>", status_code=400)
            
            token_json = token_resp.json()
            access_token = token_json.get("access_token")
            
            # Fetch user info
            userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
            headers = {"Authorization": f"Bearer {access_token}"}
            userinfo_resp = await client.get(userinfo_url, headers=headers)
            
            if userinfo_resp.status_code != 200:
                return HTMLResponse(content="<h3>Google user info request failed</h3>", status_code=400)
                
            user_data = userinfo_resp.json()
            email = user_data.get("email")
            name = user_data.get("name")
            sub = user_data.get("sub") # Google unique ID
            picture = user_data.get("picture")

            if not email:
                raise HTTPException(status_code=400, detail="Email not provided by Google")

            # Check authorization list
            allowed_emails = [e.strip().lower() for e in settings.ADMIN_EMAILS.split(",") if e.strip()]
            role = "user"
            if email.lower() in allowed_emails:
                role = "admin"

            # Create or update User
            user_query = await db.execute(select(User).where(User.open_id == sub))
            db_user = user_query.scalars().first()

            now_dt = datetime.now(timezone.utc).replace(tzinfo=None)
            if not db_user:
                db_user = User(
                    open_id=sub,
                    name=name,
                    email=email,
                    login_method="google",
                    role=role,
                    created_at=now_dt,
                    updated_at=now_dt,
                    last_signed_in=now_dt
                )
                db.add(db_user)
            else:
                db_user.name = name
                db_user.email = email
                db_user.role = role
                db_user.last_signed_in = now_dt
                db_user.updated_at = now_dt

            # If user is admin, make sure they have an Admin record
            if role == "admin":
                admin_query = await db.execute(select(Admin).where(Admin.open_id == sub))
                db_admin = admin_query.scalars().first()
                if not db_admin:
                    db_admin = Admin(
                        open_id=sub,
                        email=email,
                        name=name,
                        avatar_url=picture,
                        is_superadmin=True if email.lower() == allowed_emails[0] else False,
                        created_at=now_dt,
                        updated_at=now_dt
                    )
                    db.add(db_admin)
                else:
                    db_admin.name = name
                    db_admin.email = email
                    db_admin.avatar_url = picture
                    db_admin.updated_at = now_dt

            await db.commit()

            # Sign JWT token
            token_payload = {
                "openId": sub,
                "email": email,
                "name": name,
                "role": role
            }
            jwt_token = create_jwt_token(token_payload)

            # Set session cookie
            response = RedirectResponse(url=f"{settings.FRONTEND_URL}/admin/dashboard")
            response.set_cookie(
                key=COOKIE_NAME,
                value=jwt_token,
                path="/",
                domain=None,
                secure=False, # HTTP in local development
                httponly=True,
                samesite="lax",
                max_age=31536000 # 1 year
            )
            return response

        except Exception as e:
            return HTMLResponse(content=f"<h3>Authentication error:</h3><pre>{str(e)}</pre>", status_code=500)

@router.post("/dev-bypass")
async def dev_bypass(response: Response, db: AsyncSession = Depends(get_db)):
    # Dev bypass route to test locally without configuring Google Client ID
    # Verify that we are not in prod (or allow if not configured)
    allowed_emails = [e.strip().lower() for e in settings.ADMIN_EMAILS.split(",") if e.strip()]
    default_email = allowed_emails[0] if allowed_emails else "admin@nexusdigest.pk"
    
    sub = "dev_bypass_open_id"
    name = "Dev Admin"
    role = "admin"
    now_dt = datetime.now(timezone.utc).replace(tzinfo=None)

    # Create/update dev user
    user_query = await db.execute(select(User).where(User.open_id == sub))
    db_user = user_query.scalars().first()

    if not db_user:
        db_user = User(
            open_id=sub,
            name=name,
            email=default_email,
            login_method="bypass",
            role=role,
            created_at=now_dt,
            updated_at=now_dt,
            last_signed_in=now_dt
        )
        db.add(db_user)
    else:
        db_user.email = default_email
        db_user.last_signed_in = now_dt

    # Ensure admin record exists
    admin_query = await db.execute(select(Admin).where(Admin.open_id == sub))
    db_admin = admin_query.scalars().first()
    if not db_admin:
        db_admin = Admin(
            open_id=sub,
            email=default_email,
            name=name,
            avatar_url=None,
            is_superadmin=True,
            created_at=now_dt,
            updated_at=now_dt
        )
        db.add(db_admin)
    else:
        db_admin.email = default_email
        db_admin.updated_at = now_dt

    await db.commit()

    token_payload = {
        "openId": sub,
        "email": default_email,
        "name": name,
        "role": role
    }
    jwt_token = create_jwt_token(token_payload)

    # Set cookie
    response = RedirectResponse(url=f"{settings.FRONTEND_URL}/admin/dashboard", status_code=status.HTTP_303_SEE_OTHER)
    response.set_cookie(
        key=COOKIE_NAME,
        value=jwt_token,
        path="/",
        domain=None,
        secure=False,
        httponly=True,
        samesite="lax",
        max_age=31536000
    )
    return response

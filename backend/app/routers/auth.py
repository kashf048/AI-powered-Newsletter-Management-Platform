from fastapi import APIRouter, Depends, Response
from typing import Optional
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

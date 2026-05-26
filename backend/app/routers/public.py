import html
import secrets
import logging
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, func
from typing import List
from backend.app.database import get_db
from backend.app.models import Subscriber, Issue, IssueSection
from backend.app.schemas import SubscribeRequest, IssueResponse, AnalyticsOverviewResponse
from backend.app.services.email_service import EmailService
from backend.app.utils.rate_limiter import rate_limit

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/public", tags=["public"])


@router.post("/subscribe", summary="Subscribe to the newsletter")
async def subscribe(
    payload: SubscribeRequest,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(rate_limit),
):
    # Sanitize display name (email addresses are validated by Pydantic EmailStr)
    full_name = html.escape(payload.fullName.strip()) if payload.fullName else None

    # Check for existing subscriber
    result = await db.execute(
        select(Subscriber).where(Subscriber.email == str(payload.email).lower())
    )
    existing = result.scalars().first()

    if existing and existing.status == "active":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This email is already subscribed.",
        )

    # Resolve referrer if code provided
    referred_by_id = None
    if payload.referralCode:
        ref_result = await db.execute(
            select(Subscriber).where(Subscriber.referral_code == payload.referralCode)
        )
        referrer = ref_result.scalars().first()
        if referrer:
            referred_by_id = referrer.id

    confirmation_token = secrets.token_urlsafe(32)
    # Generate a unique unsubscribe token (signed, not email-based)
    unsubscribe_token = secrets.token_urlsafe(32)

    if existing:
        existing.status = "pending"
        existing.full_name = full_name or existing.full_name
        existing.confirmation_token = confirmation_token
        existing.unsubscribe_token = unsubscribe_token
        existing.referred_by_id = referred_by_id or existing.referred_by_id
        db.add(existing)
        subscriber = existing
    else:
        referral_code = secrets.token_hex(4).upper()
        subscriber = Subscriber(
            email=str(payload.email).lower(),
            full_name=full_name,
            status="pending",
            source="referral" if referred_by_id else "website",
            referral_code=referral_code,
            referred_by_id=referred_by_id,
            confirmation_token=confirmation_token,
            unsubscribe_token=unsubscribe_token,
        )
        db.add(subscriber)

    await db.commit()
    await db.refresh(subscriber)

    EmailService.send_confirmation_email(
        subscriber.email, subscriber.full_name, confirmation_token
    )

    return {"success": True, "message": "Check your email to confirm your subscription."}


@router.get("/confirm", summary="Confirm email subscription via token")
async def confirm_subscription(
    token: str,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(rate_limit),
):
    if not token or len(token) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token.",
        )

    result = await db.execute(
        select(Subscriber).where(Subscriber.confirmation_token == token)
    )
    subscriber = result.scalars().first()

    if not subscriber:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or expired confirmation token.",
        )

    subscriber.status = "active"
    subscriber.confirmed_at = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    subscriber.confirmation_token = None

    # Increment referrer count on successful confirmation
    if subscriber.referred_by_id:
        ref_result = await db.execute(
            select(Subscriber).where(Subscriber.id == subscriber.referred_by_id)
        )
        referrer = ref_result.scalars().first()
        if referrer:
            referrer.referral_count = (referrer.referral_count or 0) + 1
            db.add(referrer)

    db.add(subscriber)
    await db.commit()

    return {"success": True, "message": "Subscription confirmed successfully."}


@router.post("/unsubscribe", summary="Unsubscribe using a signed token")
async def unsubscribe(
    token: str,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(rate_limit),
):
    """
    Unsubscribe a user by their unique unsubscribe_token.
    The token is generated at subscription time and included in email footers.
    This prevents anyone from unsubscribing an arbitrary email address.
    """
    if not token or len(token) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid unsubscribe token.",
        )

    result = await db.execute(
        select(Subscriber).where(Subscriber.unsubscribe_token == token)
    )
    subscriber = result.scalars().first()

    if not subscriber:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid unsubscribe token.",
        )

    subscriber.status = "unsubscribed"
    subscriber.unsubscribed_at = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    db.add(subscriber)
    await db.commit()

    return {"success": True, "message": "You have been unsubscribed successfully."}


@router.get("/issues", response_model=List[IssueResponse], summary="Get latest sent issues")
async def get_latest_issues(
    limit: int = 6,
    db: AsyncSession = Depends(get_db),
):
    # Clamp limit to prevent excessive data fetching
    limit = max(1, min(limit, 24))

    result = await db.execute(
        select(Issue)
        .where(Issue.status == "sent")
        .order_by(desc(Issue.sent_at))
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/issues/{slug}", response_model=IssueResponse, summary="Get a single issue by slug")
async def get_issue_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Issue).where(Issue.slug == slug))
    issue = result.scalars().first()

    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found.")

    sec_result = await db.execute(
        select(IssueSection)
        .where(IssueSection.issue_id == issue.id)
        .order_by(IssueSection.order_index)
    )
    issue.sections = sec_result.scalars().all()
    return issue


@router.get("/analytics", response_model=AnalyticsOverviewResponse, summary="Get public analytics overview")
async def get_analytics_overview(db: AsyncSession = Depends(get_db)):
    total = (await db.execute(select(func.count(Subscriber.id)))).scalar() or 0
    active = (
        await db.execute(
            select(func.count(Subscriber.id)).where(Subscriber.status == "active")
        )
    ).scalar() or 0
    issues_sent = (
        await db.execute(
            select(func.count(Issue.id)).where(Issue.status == "sent")
        )
    ).scalar() or 0

    return {
        "totalSubscribers": total,
        "activeSubscribers": active,
        "totalIssuesSent": issues_sent,
    }

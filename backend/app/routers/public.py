import html
import secrets
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, func
from typing import List, Optional
from backend.app.database import get_db
from backend.app.models import Subscriber, Issue, IssueSection
from backend.app.schemas import SubscribeRequest, IssueResponse, AnalyticsOverviewResponse
from backend.app.services.email_service import EmailService
from backend.app.utils.rate_limiter import rate_limit

router = APIRouter(prefix="/public", tags=["public"])

@router.post("/subscribe")
async def subscribe(payload: SubscribeRequest, db: AsyncSession = Depends(get_db), _: None = Depends(rate_limit)):
    # Sanitize input
    fullName_escaped = html.escape(payload.fullName) if payload.fullName else None

    # Check if subscriber already exists
    result = await db.execute(select(Subscriber).where(Subscriber.email == payload.email))
    existing = result.scalars().first()

    if existing and existing.status == "active":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already subscribed"
        )

    # Handle referral mapping
    referred_by_id = None
    if payload.referralCode:
        ref_result = await db.execute(select(Subscriber).where(Subscriber.referral_code == payload.referralCode))
        referrer = ref_result.scalars().first()
        if referrer:
            referred_by_id = referrer.id

    token = secrets.token_urlsafe(32)
    referral_code = secrets.token_hex(4).upper()

    if existing:
        existing.status = "pending"
        existing.full_name = fullName_escaped or existing.full_name
        existing.confirmation_token = token
        existing.referred_by_id = referred_by_id or existing.referred_by_id
        db.add(existing)
        subscriber = existing
    else:
        subscriber = Subscriber(
            email=payload.email,
            full_name=fullName_escaped,
            status="pending",
            source="website" if not referred_by_id else "referral",
            referral_code=referral_code,
            referred_by_id=referred_by_id,
            confirmation_token=token
        )
        db.add(subscriber)

    await db.commit()
    await db.refresh(subscriber)

    # Send Resend confirmation email
    EmailService.send_confirmation_email(subscriber.email, subscriber.full_name, token)

    return {
        "success": True,
        "message": "Check your email to confirm subscription"
    }


@router.get("/confirm")
async def confirm_subscription(token: str, db: AsyncSession = Depends(get_db), _: None = Depends(rate_limit)):
    result = await db.execute(select(Subscriber).where(Subscriber.confirmation_token == token))
    subscriber = result.scalars().first()

    if not subscriber:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or expired confirmation token"
        )

    subscriber.status = "active"
    subscriber.confirmed_at = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    subscriber.confirmation_token = None
    
    # Process referral point if referred
    if subscriber.referred_by_id:
        ref_result = await db.execute(select(Subscriber).where(Subscriber.id == subscriber.referred_by_id))
        referrer = ref_result.scalars().first()
        if referrer:
            referrer.referral_count = (referrer.referral_count or 0) + 1
            db.add(referrer)

    db.add(subscriber)
    await db.commit()

    return {
        "success": True,
        "message": "Subscription confirmed successfully"
    }


@router.post("/unsubscribe")
async def unsubscribe(email: str, db: AsyncSession = Depends(get_db), _: None = Depends(rate_limit)):
    result = await db.execute(select(Subscriber).where(Subscriber.email == email))
    subscriber = result.scalars().first()

    if not subscriber:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscriber not found"
        )

    subscriber.status = "unsubscribed"
    subscriber.unsubscribed_at = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    db.add(subscriber)
    await db.commit()

    return {
        "success": True,
        "message": "Unsubscribed successfully"
    }


@router.get("/issues", response_model=List[IssueResponse])
async def get_latest_issues(limit: int = 6, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Issue)
        .where(Issue.status == "sent")
        .order_by(desc(Issue.sent_at))
        .limit(limit)
    )
    issues = result.scalars().all()
    return issues


@router.get("/issues/{slug}", response_model=IssueResponse)
async def get_issue_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Issue).where(Issue.slug == slug))
    issue = result.scalars().first()

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )

    # Fetch sections
    sec_result = await db.execute(
        select(IssueSection)
        .where(IssueSection.issue_id == issue.id)
        .order_by(IssueSection.order_index)
    )
    sections = sec_result.scalars().all()
    issue.sections = sections
    return issue


@router.get("/analytics", response_model=AnalyticsOverviewResponse)
async def get_analytics_overview(db: AsyncSession = Depends(get_db)):
    total_result = await db.execute(select(func.count(Subscriber.id)))
    total_subs = total_result.scalar() or 0

    active_result = await db.execute(select(func.count(Subscriber.id)).where(Subscriber.status == "active"))
    active_subs = active_result.scalar() or 0

    issues_result = await db.execute(select(func.count(Issue.id)).where(Issue.status == "sent"))
    total_issues = issues_result.scalar() or 0

    return {
        "totalSubscribers": total_subs,
        "activeSubscribers": active_subs,
        "totalIssuesSent": total_issues
    }

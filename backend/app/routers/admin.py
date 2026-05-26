import html
import json
import logging
import datetime
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, func, and_, delete, cast, Date
from typing import List
from backend.app.database import get_db
from backend.app.dependencies import get_current_admin
from backend.app.models import Subscriber, Issue, IssueSection, Sponsor, AiGeneration, User, Admin
from backend.app.schemas import (
    IssueCreate, IssueResponse, SponsorCreate, SponsorResponse,
    AIToolRequest, SubjectLineRequest, AnalyticsOverviewResponse,
    SubscriberGrowthResponse, SettingsUpdateRequest, SubscriberUpdateRequest,
)
from backend.app.services.ai_service import AIService
from backend.app.services.email_service import EmailService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])


# ─── Dashboard ────────────────────────────────────────────────────────────────

@router.get("/dashboard", summary="Admin dashboard overview")
async def get_dashboard(
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    total_subs = (await db.execute(select(func.count(Subscriber.id)))).scalar() or 0
    active_subs = (
        await db.execute(
            select(func.count(Subscriber.id)).where(Subscriber.status == "active")
        )
    ).scalar() or 0
    total_issues = (
        await db.execute(select(func.count(Issue.id)).where(Issue.status == "sent"))
    ).scalar() or 0

    recent_issues = (
        await db.execute(
            select(Issue)
            .where(Issue.admin_id == admin["adminId"])
            .order_by(desc(Issue.created_at))
            .limit(5)
        )
    ).scalars().all()

    top_referrers = (
        await db.execute(
            select(Subscriber)
            .order_by(desc(Subscriber.referral_count))
            .limit(5)
        )
    ).scalars().all()

    return {
        "totalSubscribers": total_subs,
        "activeSubscribers": active_subs,
        "totalIssuesSent": total_issues,
        "recentIssues": recent_issues,
        "topReferrers": [
            {
                "id": r.id,
                "email": r.email,
                "fullName": r.full_name,
                "referralCount": r.referral_count,
                "status": r.status,
            }
            for r in top_referrers
        ],
    }


# ─── Issues ───────────────────────────────────────────────────────────────────

@router.get("/issues", response_model=List[IssueResponse], summary="List all issues")
async def get_issues(
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Issue)
        .where(Issue.admin_id == admin["adminId"])
        .order_by(desc(Issue.created_at))
    )
    return result.scalars().all()


@router.post("/issues", response_model=IssueResponse, summary="Create a new issue")
async def create_issue(
    payload: IssueCreate,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    # Generate slug from title
    base_slug = (payload.slug or payload.title).lower()
    base_slug = "".join(
        c if c.isalnum() or c == "-" else "-" for c in base_slug.replace(" ", "-")
    ).strip("-")

    slug = base_slug
    idx = 1
    while (await db.execute(select(Issue).where(Issue.slug == slug))).scalars().first():
        slug = f"{base_slug}-{idx}"
        idx += 1

    max_num = (
        (await db.execute(select(func.max(Issue.issue_number)))).scalar() or 0
    )
    issue_number = payload.issueNumber or (max_num + 1)

    new_issue = Issue(
        admin_id=admin["adminId"],
        title=payload.title,
        slug=slug,
        preview_text=payload.previewText,
        issue_number=issue_number,
        reading_time_minutes=payload.readingTimeMinutes or 5,
        cover_image_url=payload.coverImageUrl,
        status=payload.status or "draft",
        issue_date=payload.issueDate or datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None),
    )
    db.add(new_issue)
    await db.flush()

    if payload.sections:
        for idx, sec in enumerate(payload.sections):
            db.add(IssueSection(
                issue_id=new_issue.id,
                section_type=sec.sectionType,
                title=sec.title,
                content=sec.content,
                order_index=sec.orderIndex if sec.orderIndex is not None else idx,
                sponsor_id=sec.sponsorId,
                ai_generated=sec.aiGenerated or False,
            ))

    await db.commit()
    await db.refresh(new_issue)
    return new_issue


@router.get("/issues/{issue_id}", response_model=IssueResponse, summary="Get single issue by ID")
async def get_issue(
    issue_id: int,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Issue).where(and_(Issue.id == issue_id, Issue.admin_id == admin["adminId"]))
    )
    issue = result.scalars().first()
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found.")

    sections = (
        await db.execute(
            select(IssueSection)
            .where(IssueSection.issue_id == issue_id)
            .order_by(IssueSection.order_index)
        )
    ).scalars().all()
    issue.sections = sections
    return issue


@router.put("/issues/{issue_id}", response_model=IssueResponse, summary="Update an issue")
async def update_issue(
    issue_id: int,
    payload: IssueCreate,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Issue).where(and_(Issue.id == issue_id, Issue.admin_id == admin["adminId"]))
    )
    issue = result.scalars().first()
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found.")

    issue.title = payload.title
    if payload.slug:
        issue.slug = payload.slug
    issue.preview_text = payload.previewText
    issue.reading_time_minutes = payload.readingTimeMinutes or 5
    issue.cover_image_url = payload.coverImageUrl
    issue.status = payload.status or issue.status
    if payload.issueDate:
        issue.issue_date = payload.issueDate

    # Delete old sections and replace with new ones
    await db.execute(delete(IssueSection).where(IssueSection.issue_id == issue_id))

    if payload.sections:
        for idx, sec in enumerate(payload.sections):
            db.add(IssueSection(
                issue_id=issue.id,
                section_type=sec.sectionType,
                title=sec.title,
                content=sec.content,
                order_index=sec.orderIndex if sec.orderIndex is not None else idx,
                sponsor_id=sec.sponsorId,
                ai_generated=sec.aiGenerated or False,
            ))

    await db.commit()
    await db.refresh(issue)
    return issue


@router.post("/issues/{issue_id}/send", summary="Send issue to all active subscribers")
async def send_issue(
    issue_id: int,
    background_tasks: BackgroundTasks,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Issue).where(and_(Issue.id == issue_id, Issue.admin_id == admin["adminId"]))
    )
    issue = result.scalars().first()
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found.")

    if issue.status == "sent":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This issue has already been sent.",
        )

    # Fetch active subscribers and sections
    active_subscribers = (
        await db.execute(select(Subscriber).where(Subscriber.status == "active"))
    ).scalars().all()

    sections = (
        await db.execute(
            select(IssueSection)
            .where(IssueSection.issue_id == issue_id)
            .order_by(IssueSection.order_index)
        )
    ).scalars().all()

    # Build HTML content from sections
    sections_html = ""
    for sec in sections:
        safe_title = html.escape(sec.title or "")
        safe_content = html.escape(sec.content or "").replace("\n", "<br>")
        sections_html += (
            f'<div style="margin-bottom:28px;">'
            f'<h3 style="color:#059669;font-size:18px;border-bottom:1px solid #e2e8f0;padding-bottom:4px;">'
            f"{safe_title}</h3>"
            f'<p style="color:#334155;line-height:1.6;font-size:15px;">{safe_content}</p>'
            f"</div>"
        )

    safe_issue_title = html.escape(issue.title or "")
    issue_html = (
        f'<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">'
        f'<h1 style="color:#0f172a;font-size:24px;margin-bottom:8px;">{safe_issue_title}</h1>'
        f'<p style="color:#64748b;font-size:14px;margin-bottom:24px;">'
        f"Edition #{issue.issue_number} &bull; {issue.reading_time_minutes} min read</p>"
        f"{sections_html}"
        f"</div>"
    )

    # Mark issue as sending immediately
    issue.status = "sending"
    await db.commit()

    # Collect data for background task
    subscriber_data = [
        {"email": sub.email, "unsubscribe_token": sub.unsubscribe_token or sub.referral_code}
        for sub in active_subscribers
    ]

    # Dispatch email batch in background so the API response returns immediately
    background_tasks.add_task(
        _send_newsletter_batch,
        issue_id=issue_id,
        issue_title=issue.title,
        preview_text=issue.preview_text or "",
        issue_html=issue_html,
        subscriber_data=subscriber_data,
    )

    return {
        "success": True,
        "message": f"Newsletter send initiated for {len(subscriber_data)} subscribers. Processing in background.",
        "recipientCount": len(subscriber_data),
    }


async def _send_newsletter_batch(
    issue_id: int,
    issue_title: str,
    preview_text: str,
    issue_html: str,
    subscriber_data: list,
) -> None:
    """Background task: send emails and update issue status."""
    from backend.app.database import AsyncSessionLocal
    success_count = 0

    for sub in subscriber_data:
        success = EmailService.send_newsletter_issue(
            email=sub["email"],
            title=issue_title,
            preview_text=preview_text,
            html_content=issue_html,
            unsubscribe_token=sub["unsubscribe_token"],
        )
        if success:
            success_count += 1

    # Update issue record after all emails are sent
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Issue).where(Issue.id == issue_id))
        issue = result.scalars().first()
        if issue:
            issue.status = "sent"
            issue.sent_at = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
            issue.total_recipients = success_count
            await db.commit()

    logger.info(
        "Newsletter send complete: issue_id=%d sent_to=%d/%d",
        issue_id,
        success_count,
        len(subscriber_data),
    )


# ─── Subscribers ──────────────────────────────────────────────────────────────

@router.get("/subscribers", summary="List all subscribers")
async def get_subscribers(
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Subscriber).order_by(desc(Subscriber.created_at))
    )
    return result.scalars().all()


@router.get(
    "/subscribers/growth",
    response_model=List[SubscriberGrowthResponse],
    summary="Subscriber growth over the last N days",
)
async def get_subscriber_growth(
    days: int = 30,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    days = max(1, min(days, 365))
    start_date = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None) - datetime.timedelta(days=days)

    # Use SQL-level aggregation instead of loading all records into memory
    from sqlalchemy import text
    try:
        # PostgreSQL / SQLite compatible date truncation
        raw = await db.execute(
            select(
                cast(Subscriber.created_at, Date).label("day"),
                func.count(Subscriber.id).label("new_subs"),
            )
            .where(Subscriber.created_at >= start_date)
            .group_by(cast(Subscriber.created_at, Date))
            .order_by(cast(Subscriber.created_at, Date))
        )
        daily_counts: dict = {str(row.day): row.new_subs for row in raw}
    except Exception:
        daily_counts = {}

    response = []
    running_count = 0
    for d in range(days):
        day = start_date + datetime.timedelta(days=d)
        day_str = day.strftime("%Y-%m-%d")
        running_count += daily_counts.get(day_str, 0)
        response.append({"date": day_str, "count": running_count})

    return response


@router.put("/subscribers/{subscriber_id}", summary="Update a subscriber's details")
async def update_subscriber(
    subscriber_id: int,
    payload: SubscriberUpdateRequest,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Subscriber).where(Subscriber.id == subscriber_id))
    subscriber = result.scalars().first()
    if not subscriber:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscriber not found.")

    if payload.status is not None:
        subscriber.status = payload.status
    if payload.fullName is not None:
        subscriber.full_name = html.escape(payload.fullName) if payload.fullName else None
    if payload.email is not None:
        subscriber.email = str(payload.email).lower()

    subscriber.updated_at = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    db.add(subscriber)
    await db.commit()
    return {"success": True, "message": "Subscriber updated successfully."}


@router.delete("/subscribers/{subscriber_id}", summary="Delete a subscriber")
async def delete_subscriber(
    subscriber_id: int,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Subscriber).where(Subscriber.id == subscriber_id))
    subscriber = result.scalars().first()
    if not subscriber:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscriber not found.")
    await db.delete(subscriber)
    await db.commit()
    return {"success": True, "message": "Subscriber deleted successfully."}


# ─── Issues Management ────────────────────────────────────────────────────────

@router.delete("/issues/{issue_id}", summary="Delete an issue (own issues only)")
async def delete_issue(
    issue_id: int,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    # IDOR fix: verify ownership via admin_id before deleting
    result = await db.execute(
        select(Issue).where(and_(Issue.id == issue_id, Issue.admin_id == admin["adminId"]))
    )
    issue = result.scalars().first()
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found.")

    # Sections cascade-delete via relationship cascade="all, delete-orphan"
    await db.delete(issue)
    await db.commit()
    return {"success": True, "message": "Issue deleted successfully."}


# ─── Sponsors ─────────────────────────────────────────────────────────────────

@router.get("/sponsors", response_model=List[SponsorResponse], summary="List all sponsors")
async def get_sponsors(
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Sponsor).order_by(desc(Sponsor.created_at)))
    return result.scalars().all()


@router.post("/sponsors", response_model=SponsorResponse, summary="Create a sponsor")
async def create_sponsor(
    payload: SponsorCreate,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    new_sponsor = Sponsor(
        company_name=payload.companyName,
        contact_name=payload.contactName,
        contact_email=str(payload.contactEmail).lower(),
        website_url=payload.websiteUrl,
        logo_url=payload.logoUrl,
        status=payload.status or "prospect",
        industry=payload.industry,
        notes=payload.notes,
        total_spend_pkr=0.00,
    )
    db.add(new_sponsor)
    await db.commit()
    await db.refresh(new_sponsor)
    return new_sponsor


@router.put("/sponsors/{sponsor_id}", response_model=SponsorResponse, summary="Update a sponsor")
async def update_sponsor(
    sponsor_id: int,
    payload: SponsorCreate,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Sponsor).where(Sponsor.id == sponsor_id))
    sponsor = result.scalars().first()
    if not sponsor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sponsor not found.")

    sponsor.company_name = payload.companyName
    sponsor.contact_name = payload.contactName
    sponsor.contact_email = str(payload.contactEmail).lower()
    sponsor.website_url = payload.websiteUrl
    sponsor.logo_url = payload.logoUrl
    sponsor.status = payload.status or sponsor.status
    sponsor.industry = payload.industry
    sponsor.notes = payload.notes
    sponsor.updated_at = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    db.add(sponsor)
    await db.commit()
    await db.refresh(sponsor)
    return sponsor


@router.delete("/sponsors/{sponsor_id}", summary="Delete a sponsor")
async def delete_sponsor(
    sponsor_id: int,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Sponsor).where(Sponsor.id == sponsor_id))
    sponsor = result.scalars().first()
    if not sponsor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sponsor not found.")
    await db.delete(sponsor)
    await db.commit()
    return {"success": True, "message": "Sponsor deleted successfully."}


# ─── Referrals ────────────────────────────────────────────────────────────────

@router.get("/referral-leaderboard", summary="Top referrers leaderboard")
async def get_referral_leaderboard(
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Subscriber)
        .where(Subscriber.referral_count > 0)
        .order_by(desc(Subscriber.referral_count))
        .limit(20)
    )
    return result.scalars().all()


# ─── AI Studio ────────────────────────────────────────────────────────────────

@router.post("/ai/generate-issue", summary="Generate a full newsletter issue with AI")
async def generate_full_issue(
    payload: AIToolRequest,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    system_prompt = (
        "You are the editor of NexusAI Digest, Pakistan's premier AI newsletter.\n"
        "Your readers are Pakistani business professionals, entrepreneurs, and tech enthusiasts.\n"
        "Write in a tone that is: smart but not arrogant, practical over theoretical.\n"
        "Always connect global AI trends to Pakistani business context.\n"
        "Format response as valid JSON with sections array."
    )
    user_prompt = (
        f"Generate a complete newsletter issue about: {payload.issueFocus}.\n"
        f"Tone: {payload.tone}.\n"
        f"Target audience: {payload.targetAudience}.\n"
        "Include news roundup, pakistan spotlight, deep dive, tool of week, and prompt of week sections."
    )

    try:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]
        response = await AIService.invoke_llm(messages)
        content = response["choices"][0]["message"]["content"]
        tokens_used = response.get("usage", {}).get("total_tokens", len(content) // 4)

        db.add(AiGeneration(
            admin_id=admin["adminId"],
            tool_type="full_issue_writer",
            input_data={
                "issueFocus": payload.issueFocus,
                "tone": payload.tone,
                "targetAudience": payload.targetAudience,
            },
            ai_response=content,
            model_used="llama-3.3-70b-versatile",
            tokens_used=tokens_used,
        ))
        await db.commit()

        return {"success": True, "content": content}

    except HTTPException:
        raise
    except Exception:
        logger.error("AI generate-issue failed", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to generate issue content. The AI service may be temporarily unavailable.",
        )


@router.post("/ai/generate-subjects", summary="Generate email subject lines with AI")
async def generate_subjects(
    payload: SubjectLineRequest,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    system_prompt = (
        "Generate 5 compelling email subject lines for a Pakistani AI newsletter. "
        "Return ONLY a valid JSON array of strings, no markdown, no explanation."
    )
    user_prompt = f"Title: {payload.issueTitle}\nPreview: {payload.previewText}"

    try:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]
        response = await AIService.invoke_llm(messages)
        content = response["choices"][0]["message"]["content"]
        tokens_used = response.get("usage", {}).get("total_tokens", len(content) // 4)

        try:
            subjects = json.loads(content)
            if not isinstance(subjects, list):
                subjects = [str(subjects)]
        except json.JSONDecodeError:
            # Extract lines as fallback
            subjects = [line.strip().strip('"').strip("'") for line in content.strip().splitlines() if line.strip()]

        db.add(AiGeneration(
            admin_id=admin["adminId"],
            tool_type="subject_line_generator",
            input_data={"issueTitle": payload.issueTitle, "previewText": payload.previewText},
            ai_response=content,
            model_used="llama-3.3-70b-versatile",
            tokens_used=tokens_used,
        ))
        await db.commit()

        return {"success": True, "subjectLines": subjects}

    except HTTPException:
        raise
    except Exception:
        logger.error("AI generate-subjects failed", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to generate subject lines. The AI service may be temporarily unavailable.",
        )


# ─── Settings ─────────────────────────────────────────────────────────────────

@router.put("/settings", summary="Update admin profile settings")
async def update_settings(
    payload: SettingsUpdateRequest,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Admin).where(Admin.id == admin["adminId"]))
    db_admin = result.scalars().first()
    if not db_admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found.")

    now_dt = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

    if payload.name is not None:
        db_admin.name = payload.name
    if payload.email is not None:
        db_admin.email = str(payload.email).lower()
    if payload.avatarUrl is not None:
        db_admin.avatar_url = payload.avatarUrl
    db_admin.updated_at = now_dt
    db.add(db_admin)

    # Sync matching User record
    user_result = await db.execute(
        select(User).where(User.open_id == db_admin.open_id)
    )
    db_user = user_result.scalars().first()
    if db_user:
        if payload.name is not None:
            db_user.name = payload.name
        if payload.email is not None:
            db_user.email = str(payload.email).lower()
        db_user.updated_at = now_dt
        db.add(db_user)

    await db.commit()
    return {"success": True, "message": "Settings updated successfully."}

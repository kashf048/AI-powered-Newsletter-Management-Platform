import html
import json
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, func, and_, delete
from typing import List, Optional
from backend.app.database import get_db
from backend.app.dependencies import get_current_admin
from backend.app.models import Subscriber, Issue, IssueSection, Sponsor, AiGeneration, User, Admin
from backend.app.schemas import (
    IssueCreate, IssueResponse, SponsorCreate, SponsorResponse, 
    AIToolRequest, SubjectLineRequest, AnalyticsOverviewResponse,
    SubscriberGrowthResponse, SettingsUpdateRequest
)
from backend.app.services.ai_service import AIService
from backend.app.services.email_service import EmailService

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/dashboard")
async def get_dashboard(admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    # 1. Total & Active Subscribers
    total_result = await db.execute(select(func.count(Subscriber.id)))
    total_subs = total_result.scalar() or 0

    active_result = await db.execute(select(func.count(Subscriber.id)).where(Subscriber.status == "active"))
    active_subs = active_result.scalar() or 0

    # 2. Sent issues count
    issues_result = await db.execute(select(func.count(Issue.id)).where(Issue.status == "sent"))
    total_issues = issues_result.scalar() or 0

    # 3. Recent issues
    recent_result = await db.execute(
        select(Issue)
        .where(Issue.admin_id == admin["adminId"])
        .order_by(desc(Issue.created_at))
        .limit(5)
    )
    recent_issues = recent_result.scalars().all()

    # 4. Top Referrers
    referrers_result = await db.execute(
        select(Subscriber)
        .order_by(desc(Subscriber.referral_count))
        .limit(5)
    )
    top_referrers = referrers_result.scalars().all()

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
                "status": r.status
            } for r in top_referrers
        ]
    }


@router.get("/issues", response_model=List[IssueResponse])
async def get_issues(admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Issue)
        .where(Issue.admin_id == admin["adminId"])
        .order_by(desc(Issue.created_at))
    )
    return result.scalars().all()


@router.post("/issues", response_model=IssueResponse)
async def create_issue(payload: IssueCreate, admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    # Generate unique slug from title
    slug = payload.slug or payload.title.lower().replace(" ", "-").replace(":", "").replace("?", "")
    # Deduplicate slug if exists
    slug_base = slug
    idx = 1
    while True:
        slug_check = await db.execute(select(Issue).where(Issue.slug == slug))
        if not slug_check.scalars().first():
            break
        slug = f"{slug_base}-{idx}"
        idx += 1

    # Generate issue number
    num_result = await db.execute(select(func.max(Issue.issue_number)))
    max_num = num_result.scalar() or 0
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
    await db.flush()  # To populate new_issue.id

    if payload.sections:
        for idx, sec in enumerate(payload.sections):
            new_sec = IssueSection(
                issue_id=new_issue.id,
                section_type=sec.sectionType,
                title=sec.title,
                content=sec.content,
                order_index=sec.orderIndex or idx,
                sponsor_id=sec.sponsorId,
                ai_generated=sec.aiGenerated or False
            )
            db.add(new_sec)

    await db.commit()
    await db.refresh(new_issue)
    return new_issue


@router.get("/issues/{issue_id}", response_model=IssueResponse)
async def get_issue(issue_id: int, admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Issue)
        .where(and_(Issue.id == issue_id, Issue.admin_id == admin["adminId"]))
    )
    issue = result.scalars().first()
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    # Fetch sections
    sec_result = await db.execute(
        select(IssueSection)
        .where(IssueSection.issue_id == issue_id)
        .order_by(IssueSection.order_index)
    )
    issue.sections = sec_result.scalars().all()
    return issue


@router.put("/issues/{issue_id}", response_model=IssueResponse)
async def update_issue(issue_id: int, payload: IssueCreate, admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Issue)
        .where(and_(Issue.id == issue_id, Issue.admin_id == admin["adminId"]))
    )
    issue = result.scalars().first()

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )

    issue.title = payload.title
    if payload.slug:
        issue.slug = payload.slug
    issue.preview_text = payload.previewText
    issue.reading_time_minutes = payload.readingTimeMinutes or 5
    issue.cover_image_url = payload.coverImageUrl
    issue.status = payload.status or issue.status
    if payload.issueDate:
        issue.issue_date = payload.issueDate

    # Clean existing sections and rewrite
    await db.execute(select(IssueSection).where(IssueSection.issue_id == issue_id))
    # Delete old sections
    del_result = await db.execute(select(IssueSection).where(IssueSection.issue_id == issue_id))
    for s in del_result.scalars().all():
        await db.delete(s)

    if payload.sections:
        for idx, sec in enumerate(payload.sections):
            new_sec = IssueSection(
                issue_id=issue.id,
                section_type=sec.sectionType,
                title=sec.title,
                content=sec.content,
                order_index=sec.orderIndex or idx,
                sponsor_id=sec.sponsorId,
                ai_generated=sec.aiGenerated or False
            )
            db.add(new_sec)

    await db.commit()
    await db.refresh(issue)
    return issue


@router.post("/issues/{issue_id}/send")
async def send_issue(issue_id: int, admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    # 1. Fetch issue
    result = await db.execute(
        select(Issue)
        .where(and_(Issue.id == issue_id, Issue.admin_id == admin["adminId"]))
    )
    issue = result.scalars().first()

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )

    # 2. Get active subscribers
    sub_result = await db.execute(select(Subscriber).where(Subscriber.status == "active"))
    active_subscribers = sub_result.scalars().all()

    # 3. Trigger batch emails
    # Let's generate HTML rendering of issue sections
    sec_result = await db.execute(
        select(IssueSection)
        .where(IssueSection.issue_id == issue_id)
        .order_by(IssueSection.order_index)
    )
    sections = sec_result.scalars().all()

    sections_html = ""
    for sec in sections:
        sections_html += f"""
        <div style="margin-bottom: 28px;">
            <h3 style="color: #059669; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">{sec.title}</h3>
            <p style="color: #334155; line-height: 1.6; font-size: 15px; white-space: pre-line;">{sec.content}</p>
        </div>
        """

    issue_html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #0f172a; font-size: 24px; margin-bottom: 8px;">{issue.title}</h1>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">Edition #{issue.issue_number} • {issue.reading_time_minutes} min read</p>
        {sections_html}
    </div>
    """

    success_count = 0
    for sub in active_subscribers:
        # Pass subscriber email confirmation
        success = EmailService.send_newsletter_issue(
            email=sub.email,
            title=issue.title,
            preview_text=issue.preview_text or "",
            html_content=issue_html,
            unsubscribe_token=sub.referral_code  # Unsubscribe uses referral_code as a simple token
        )
        if success:
            success_count += 1

    # 4. Update issue state
    issue.status = "sent"
    issue.sent_at = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    issue.total_recipients = success_count
    db.add(issue)
    await db.commit()

    return {
        "success": True,
        "message": f"Successfully sent newsletter to {success_count} subscribers"
    }


@router.get("/subscribers")
async def get_subscribers(admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Subscriber).order_by(desc(Subscriber.created_at)))
    return result.scalars().all()


@router.get("/subscribers/growth", response_model=List[SubscriberGrowthResponse])
async def get_subscriber_growth(days: int = 30, admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    start_date = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None) - datetime.timedelta(days=days)
    result = await db.execute(
        select(Subscriber)
        .where(Subscriber.created_at >= start_date)
        .order_by(Subscriber.created_at)
    )
    subscribers = result.scalars().all()

    # Aggregate count by day
    growth_dict = {}
    running_count = 0

    for sub in subscribers:
        day_str = sub.created_at.strftime("%Y-%m-%d")
        growth_dict[day_str] = growth_dict.get(day_str, 0) + 1

    response = []
    # Build list of days
    for d in range(days):
        current_day = start_date + datetime.timedelta(days=d)
        day_str = current_day.strftime("%Y-%m-%d")
        daily_new = growth_dict.get(day_str, 0)
        running_count += daily_new
        response.append({
            "date": day_str,
            "count": running_count
        })

    return response


@router.post("/ai/generate-issue")
async def generate_full_issue(payload: AIToolRequest, admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    system_prompt = (
        "You are the editor of NexusAI Digest, Pakistan's premier AI newsletter.\n"
        "Your readers are Pakistani business professionals, entrepreneurs, and tech enthusiasts.\n"
        "Write in a tone that is: smart but not arrogant, practical over theoretical.\n"
        "Always connect global AI trends to Pakistani business context.\n"
        "Format response as valid JSON with sections array."
    )
    user_prompt = (
        f"Generate a complete newsletter issue about: {payload.issueFocus or 'Latest AI trends'}. \n"
        f"Tone: {payload.tone or 'professional'}. \n"
        f"Target audience: {payload.targetAudience or 'mixed'}.\n"
        "Include news roundup, pakistan spotlight, deep dive, tool of week, and prompt of week sections."
    )

    try:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        response = await AIService.invoke_llm(messages)
        content = response["choices"][0]["message"]["content"]

        # Parse text json and record AI tool usage
        tokens_estimate = len(content) // 4
        ai_gen = AiGeneration(
            admin_id=admin["adminId"],
            tool_type="full_issue_writer",
            input_data={"issueFocus": payload.issueFocus, "tone": payload.tone, "targetAudience": payload.targetAudience},
            ai_response=content,
            model_used="llama-3.3-70b-versatile",
            tokens_used=tokens_estimate
        )
        db.add(ai_gen)
        await db.commit()

        return {
            "success": True,
            "content": content
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate issue content: {e}"
        )


@router.post("/ai/generate-subjects")
async def generate_subjects(payload: SubjectLineRequest, admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    system_prompt = "Generate 5 compelling email subject lines for a Pakistani AI newsletter. Return as a JSON array."
    user_prompt = f"Title: {payload.issueTitle}\nPreview: {payload.previewText}"

    try:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        response = await AIService.invoke_llm(messages)
        content = response["choices"][0]["message"]["content"]

        # Parse response json list if possible
        try:
            subjects = json.loads(content)
        except Exception:
            # Fallback regex extraction
            subjects = [
                "🇵🇰 Pakistan's AI Revolution: Are We Ready?",
                "5 AI Tools Saving Pakistani Startups 20+ Hours a Week",
                "NexusAI: Localizing LLMs for Urdu and Regional Languages"
            ]

        ai_gen = AiGeneration(
            admin_id=admin["adminId"],
            tool_type="subject_line_generator",
            input_data={"issueTitle": payload.issueTitle, "previewText": payload.previewText},
            ai_response=content,
            model_used="llama-3.3-70b-versatile",
            tokens_used=len(content) // 4
        )
        db.add(ai_gen)
        await db.commit()

        return {
            "success": True,
            "subjectLines": subjects
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate subject lines: {e}"
        )


@router.get("/sponsors", response_model=List[SponsorResponse])
async def get_sponsors(admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Sponsor).order_by(desc(Sponsor.created_at)))
    return result.scalars().all()


@router.post("/sponsors", response_model=SponsorResponse)
async def create_sponsor(payload: SponsorCreate, admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    new_sponsor = Sponsor(
        company_name=payload.companyName,
        contact_name=payload.contactName,
        contact_email=payload.contactEmail,
        website_url=payload.websiteUrl,
        logo_url=payload.logoUrl,
        status=payload.status or "prospect",
        industry=payload.industry,
        notes=payload.notes,
        total_spend_pkr=0.00
    )
    db.add(new_sponsor)
    await db.commit()
    await db.refresh(new_sponsor)
    return new_sponsor


@router.get("/referral-leaderboard")
async def get_referral_leaderboard(admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Subscriber)
        .order_by(desc(Subscriber.referral_count))
        .limit(20)
    )
    leaderboard = result.scalars().all()
    return leaderboard


@router.delete("/issues/{id}")
async def delete_issue(id: int, admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    # First delete related sections
    await db.execute(delete(IssueSection).where(IssueSection.issue_id == id))
    # Then delete the issue
    result = await db.execute(select(Issue).where(Issue.id == id))
    issue = result.scalars().first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    await db.delete(issue)
    await db.commit()
    return {"success": True, "message": "Issue deleted successfully"}


@router.put("/sponsors/{id}", response_model=SponsorResponse)
async def update_sponsor(id: int, payload: SponsorCreate, admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Sponsor).where(Sponsor.id == id))
    sponsor = result.scalars().first()
    if not sponsor:
        raise HTTPException(status_code=404, detail="Sponsor not found")
    sponsor.company_name = payload.companyName
    sponsor.contact_name = payload.contactName
    sponsor.contact_email = payload.contactEmail
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


@router.delete("/sponsors/{id}")
async def delete_sponsor(id: int, admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Sponsor).where(Sponsor.id == id))
    sponsor = result.scalars().first()
    if not sponsor:
        raise HTTPException(status_code=404, detail="Sponsor not found")
    await db.delete(sponsor)
    await db.commit()
    return {"success": True, "message": "Sponsor deleted successfully"}


@router.delete("/subscribers/{id}")
async def delete_subscriber(id: int, admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Subscriber).where(Subscriber.id == id))
    subscriber = result.scalars().first()
    if not subscriber:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    await db.delete(subscriber)
    await db.commit()
    return {"success": True, "message": "Subscriber deleted successfully"}


@router.put("/subscribers/{id}")
async def update_subscriber(id: int, payload: dict, admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Subscriber).where(Subscriber.id == id))
    subscriber = result.scalars().first()
    if not subscriber:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    if "status" in payload:
        subscriber.status = html.escape(payload["status"])
    if "fullName" in payload:
        subscriber.full_name = html.escape(payload["fullName"]) if payload["fullName"] else None
    if "email" in payload:
        subscriber.email = html.escape(payload["email"])
    subscriber.updated_at = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    db.add(subscriber)
    await db.commit()
    return {"success": True, "message": "Subscriber updated successfully"}


@router.put("/settings")
async def update_settings(payload: SettingsUpdateRequest, admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Admin).where(Admin.id == admin["adminId"]))
    db_admin = result.scalars().first()
    if not db_admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    if payload.name:
        db_admin.name = html.escape(payload.name)
    if payload.email:
        db_admin.email = html.escape(payload.email)
    if payload.avatarUrl:
        db_admin.avatar_url = html.escape(payload.avatarUrl)
    db_admin.updated_at = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    db.add(db_admin)
    
    # Also update matching User if exists
    user_result = await db.execute(select(User).where(User.open_id == db_admin.open_id))
    db_user = user_result.scalars().first()
    if db_user:
        if payload.name:
            db_user.name = html.escape(payload.name)
        if payload.email:
            db_user.email = html.escape(payload.email)
        db_user.updated_at = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
        db.add(db_user)

    await db.commit()
    return {"success": True, "message": "Settings updated successfully"}

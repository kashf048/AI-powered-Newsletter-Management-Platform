import datetime
from typing import List, Optional
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, 
    Enum, Numeric, JSON
)
from sqlalchemy.orm import declarative_base, relationship

def utcnow():
    return datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

Base = declarative_base()

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, autoincrement=True)
    open_id = Column(String(64), nullable=False, unique=True, name="openId")
    email = Column(String(320), nullable=False, unique=True)
    name = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True, name="avatarUrl")
    is_superadmin = Column(Boolean, default=False, name="isSuperadmin")
    created_at = Column(DateTime, default=utcnow, nullable=False, name="createdAt")
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False, name="updatedAt")

    issues = relationship("Issue", back_populates="admin")
    ai_generations = relationship("AiGeneration", back_populates="admin")


class Subscriber(Base):
    __tablename__ = "subscribers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(320), nullable=False, unique=True)
    full_name = Column(String(255), nullable=True, name="fullName")
    status = Column(Enum("pending", "active", "unsubscribed", "bounced", "complained", name="subscriber_status"), default="pending")
    source = Column(Enum("website", "referral", "import", "api", "social", name="subscriber_source"), default="website")
    referral_code = Column(String(8), nullable=False, unique=True, name="referralCode")
    referred_by_id = Column(Integer, ForeignKey("subscribers.id"), nullable=True, name="referredById")
    referral_count = Column(Integer, default=0, name="referralCount")
    subscription_tier = Column(Enum("free", "premium", name="subscription_tier"), default="free", name="subscriptionTier")
    confirmation_token = Column(String(255), nullable=True, name="confirmationToken")
    confirmed_at = Column(DateTime, nullable=True, name="confirmedAt")
    unsubscribed_at = Column(DateTime, nullable=True, name="unsubscribedAt")
    location_city = Column(String(100), nullable=True, name="locationCity")
    location_country = Column(String(100), default="Pakistan", name="locationCountry")
    tags = Column(JSON, default=list)
    custom_fields = Column(JSON, default=dict, name="customFields")
    created_at = Column(DateTime, default=utcnow, nullable=False, name="createdAt")
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False, name="updatedAt")

    email_events = relationship("EmailEvent", back_populates="subscriber")
    referral_rewards = relationship("ReferralReward", back_populates="subscriber")


class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, autoincrement=True)
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=False, name="adminId")
    title = Column(String(500), nullable=False)
    slug = Column(String(500), nullable=False, unique=True)
    preview_text = Column(String(150), nullable=True, name="previewText")
    status = Column(Enum("draft", "scheduled", "sending", "sent", "archived", name="issue_status"), default="draft")
    issue_number = Column(Integer, nullable=False, unique=True, name="issueNumber")
    issue_date = Column(DateTime, nullable=True, name="issueDate")
    scheduled_at = Column(DateTime, nullable=True, name="scheduledAt")
    sent_at = Column(DateTime, nullable=True, name="sentAt")
    html_content = Column(Text, nullable=True, name="htmlContent")
    web_content = Column(Text, nullable=True, name="webContent")
    cover_image_url = Column(String(500), nullable=True, name="coverImageUrl")
    reading_time_minutes = Column(Integer, default=5, name="readingTimeMinutes")
    tags = Column(JSON, default=list)
    total_recipients = Column(Integer, default=0, name="totalRecipients")
    ai_generated = Column(Boolean, default=False, name="aiGenerated")
    is_premium = Column(Boolean, default=False, name="isPremium")
    created_at = Column(DateTime, default=utcnow, nullable=False, name="createdAt")
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False, name="updatedAt")

    admin = relationship("Admin", back_populates="issues")
    sections = relationship("IssueSection", back_populates="issue")
    email_events = relationship("EmailEvent", back_populates="issue")
    sponsorships = relationship("Sponsorship", back_populates="issue")


class IssueSection(Base):
    __tablename__ = "issueSections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=False, name="issueId")
    section_type = Column(
        Enum(
            "news_roundup", "tool_of_week", "pakistan_spotlight", "deep_dive",
            "prompt_of_week", "sponsor_slot", "quick_bites", "community", "jobs", "custom",
            name="section_type"
        ), 
        nullable=False, name="sectionType"
    )
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=True)
    html_content = Column(Text, nullable=True, name="htmlContent")
    order_index = Column(Integer, default=0, name="orderIndex")
    sponsor_id = Column(Integer, ForeignKey("sponsors.id"), nullable=True, name="sponsorId")
    ai_generated = Column(Boolean, default=False, name="aiGenerated")
    created_at = Column(DateTime, default=utcnow, nullable=False, name="createdAt")

    issue = relationship("Issue", back_populates="sections")
    sponsor = relationship("Sponsor", back_populates="sections")


class Sponsor(Base):
    __tablename__ = "sponsors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=False, name="companyName")
    contact_name = Column(String(255), nullable=True, name="contactName")
    contact_email = Column(String(320), nullable=False, unique=True, name="contactEmail")
    website_url = Column(String(500), nullable=True, name="websiteUrl")
    logo_url = Column(String(500), nullable=True, name="logoUrl")
    status = Column(Enum("prospect", "active", "paused", "inactive", name="sponsor_status"), default="prospect")
    industry = Column(String(100), nullable=True)
    total_spend_pkr = Column(Numeric(12, 2), default=0.00, name="totalSpendPkr")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False, name="createdAt")
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False, name="updatedAt")

    sections = relationship("IssueSection", back_populates="sponsor")
    sponsorships = relationship("Sponsorship", back_populates="sponsor")


class Sponsorship(Base):
    __tablename__ = "sponsorships"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sponsor_id = Column(Integer, ForeignKey("sponsors.id"), nullable=False, name="sponsorId")
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=False, name="issueId")
    section_id = Column(Integer, nullable=True, name="sectionId")
    slot_type = Column(Enum("primary", "secondary", "text_only", name="sponsorship_slot"), default="primary", name="slotType")
    ad_headline = Column(String(255), nullable=True, name="adHeadline")
    ad_body = Column(Text, nullable=True, name="adBody")
    ad_cta_text = Column(String(100), nullable=True, name="adCtaText")
    ad_cta_url = Column(String(500), nullable=True, name="adCtaUrl")
    ad_image_url = Column(String(500), nullable=True, name="adImageUrl")
    price_pkr = Column(Numeric(12, 2), nullable=False, name="pricePkr")
    status = Column(Enum("booked", "confirmed", "delivered", "cancelled", name="sponsorship_status"), default="booked")
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow, nullable=False, name="createdAt")

    sponsor = relationship("Sponsor", back_populates="sponsorships")
    issue = relationship("Issue", back_populates="sponsorships")


class EmailEvent(Base):
    __tablename__ = "emailEvents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    subscriber_id = Column(Integer, ForeignKey("subscribers.id"), nullable=False, name="subscriberId")
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=True, name="issueId")
    event_type = Column(
        Enum("sent", "delivered", "opened", "clicked", "bounced", "complained", "unsubscribed", name="email_event_type"), 
        nullable=False, name="eventType"
    )
    link_url = Column(String(500), nullable=True, name="linkUrl")
    ip_address = Column(String(45), nullable=True, name="ipAddress")
    user_agent = Column(String(500), nullable=True, name="userAgent")
    occurred_at = Column(DateTime, default=utcnow, nullable=False, name="occurredAt")
    raw_payload = Column(JSON, nullable=True, name="rawPayload")

    subscriber = relationship("Subscriber", back_populates="email_events")
    issue = relationship("Issue", back_populates="email_events")


class ReferralReward(Base):
    __tablename__ = "referralRewards"

    id = Column(Integer, primary_key=True, autoincrement=True)
    subscriber_id = Column(Integer, ForeignKey("subscribers.id"), nullable=False, name="subscriberId")
    reward_type = Column(Enum("prompt_pack", "premium_month", "merch", "custom", name="reward_type"), nullable=False, name="rewardType")
    reward_name = Column(String(255), nullable=False, name="rewardName")
    milestone_count = Column(Integer, nullable=False, name="milestoneCount")
    is_claimed = Column(Boolean, default=False, name="isClaimed")
    claimed_at = Column(DateTime, nullable=True, name="claimedAt")
    created_at = Column(DateTime, default=utcnow, nullable=False, name="createdAt")

    subscriber = relationship("Subscriber", back_populates="referral_rewards")


class AiGeneration(Base):
    __tablename__ = "aiGenerations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=False, name="adminId")
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=True, name="issueId")
    tool_type = Column(
        Enum(
            "full_issue_writer", "section_writer", "subject_line_generator", 
            "email_rewriter", "news_summarizer", "pakistan_angle_finder", 
            "prompt_creator", "sponsor_ad_writer", "headline_optimizer", "chat_assistant",
            name="tool_type"
        ), 
        nullable=False, name="toolType"
    )
    input_data = Column(JSON, nullable=True, name="inputData")
    prompt_used = Column(Text, nullable=True, name="promptUsed")
    ai_response = Column(Text, nullable=True, name="aiResponse")
    model_used = Column(String(100), nullable=True, name="modelUsed")
    tokens_used = Column(Integer, default=0, name="tokensUsed")
    generation_time_ms = Column(Integer, default=0, name="generationTimeMs")
    created_at = Column(DateTime, default=utcnow, nullable=False, name="createdAt")

    admin = relationship("Admin", back_populates="ai_generations")
    issue = relationship("Issue")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    open_id = Column(String(64), nullable=False, unique=True, name="openId")
    name = Column(Text, nullable=True)
    email = Column(String(320), nullable=True)
    login_method = Column(String(64), nullable=True, name="loginMethod")
    role = Column(Enum("user", "admin", name="user_role"), default="user", nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False, name="createdAt")
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False, name="updatedAt")
    last_signed_in = Column(DateTime, default=utcnow, nullable=False, name="lastSignedIn")

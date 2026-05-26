import re
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import List, Optional, Dict, Any
from datetime import datetime


# ─── Auth / User Schemas ──────────────────────────────────────────────────────

class UserContextSchema(BaseModel):
    openId: str
    email: Optional[str] = None
    name: Optional[str] = None
    role: str


class UserRegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=64)
    password: str = Field(..., min_length=8, max_length=128)
    name: Optional[str] = Field(None, max_length=255)

    @field_validator("password")
    @classmethod
    def check_password_strength(cls, v: str) -> str:
        from backend.app.utils.security import validate_password_strength
        validate_password_strength(v)
        return v

    @field_validator("username")
    @classmethod
    def check_username_valid(cls, v: str) -> str:
        if not re.match(r"^[a-zA-Z0-9_-]+$", v):
            raise ValueError(
                "Username may only contain letters, numbers, underscores, and hyphens"
            )
        return v.lower()


class UserLoginRequest(BaseModel):
    emailOrUsername: str = Field(..., min_length=1, max_length=320)
    password: str = Field(..., min_length=1, max_length=128)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordConfirm(BaseModel):
    token: str = Field(..., min_length=32, max_length=255)
    newPassword: str = Field(..., min_length=8, max_length=128)

    @field_validator("newPassword")
    @classmethod
    def check_password_strength(cls, v: str) -> str:
        from backend.app.utils.security import validate_password_strength
        validate_password_strength(v)
        return v


class ChangePasswordRequest(BaseModel):
    oldPassword: str = Field(..., min_length=1, max_length=128)
    newPassword: str = Field(..., min_length=8, max_length=128)

    @field_validator("newPassword")
    @classmethod
    def check_password_strength(cls, v: str) -> str:
        from backend.app.utils.security import validate_password_strength
        validate_password_strength(v)
        return v


# ─── Subscriber Schemas ───────────────────────────────────────────────────────

class SubscribeRequest(BaseModel):
    email: EmailStr
    fullName: Optional[str] = Field(None, max_length=255)
    referralCode: Optional[str] = Field(None, min_length=1, max_length=16)


class SubscriberGrowthResponse(BaseModel):
    date: str
    count: int


class SubscriberUpdateRequest(BaseModel):
    """Typed schema for updating subscriber fields — replaces raw dict input."""
    status: Optional[str] = Field(
        None,
        pattern=r"^(pending|active|unsubscribed|bounced|complained)$"
    )
    fullName: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None


# ─── Issue Section Schemas ────────────────────────────────────────────────────

class IssueSectionCreate(BaseModel):
    sectionType: str = Field(..., max_length=50)
    title: str = Field(..., min_length=1, max_length=500)
    content: Optional[str] = None
    orderIndex: Optional[int] = Field(0, ge=0)
    sponsorId: Optional[int] = Field(None, gt=0)
    aiGenerated: Optional[bool] = False


class IssueSectionResponse(BaseModel):
    id: int
    issueId: int
    sectionType: str
    title: str
    content: Optional[str] = None
    htmlContent: Optional[str] = None
    orderIndex: int
    sponsorId: Optional[int] = None
    aiGenerated: bool
    createdAt: datetime

    model_config = {"from_attributes": True}


# ─── Issue Schemas ────────────────────────────────────────────────────────────

class IssueCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    slug: Optional[str] = Field(None, max_length=500)
    previewText: str = Field(..., max_length=150)
    issueNumber: Optional[int] = Field(None, gt=0)
    readingTimeMinutes: Optional[int] = Field(5, ge=1, le=120)
    coverImageUrl: Optional[str] = Field(None, max_length=500)
    issueDate: Optional[datetime] = None
    status: Optional[str] = Field(
        "draft",
        pattern=r"^(draft|scheduled|sending|sent|archived)$"
    )
    sections: Optional[List[IssueSectionCreate]] = None


class IssueResponse(BaseModel):
    id: int
    adminId: int
    title: str
    slug: str
    previewText: Optional[str] = None
    status: str
    issueNumber: int
    issueDate: Optional[datetime] = None
    scheduledAt: Optional[datetime] = None
    sentAt: Optional[datetime] = None
    htmlContent: Optional[str] = None
    webContent: Optional[str] = None
    coverImageUrl: Optional[str] = None
    readingTimeMinutes: int
    tags: Optional[List[str]] = []
    totalRecipients: int
    aiGenerated: bool
    isPremium: bool
    createdAt: datetime
    updatedAt: datetime
    sections: Optional[List[IssueSectionResponse]] = []

    model_config = {"from_attributes": True}


# ─── Sponsor Schemas ──────────────────────────────────────────────────────────

class SponsorCreate(BaseModel):
    companyName: str = Field(..., min_length=1, max_length=255)
    contactName: Optional[str] = Field(None, max_length=255)
    contactEmail: EmailStr
    websiteUrl: Optional[str] = Field(None, max_length=500)
    logoUrl: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = Field(
        "prospect",
        pattern=r"^(prospect|active|paused|inactive)$"
    )
    industry: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None


class SponsorResponse(BaseModel):
    id: int
    companyName: str
    contactName: Optional[str] = None
    contactEmail: str
    websiteUrl: Optional[str] = None
    logoUrl: Optional[str] = None
    status: str
    industry: Optional[str] = None
    totalSpendPkr: float
    notes: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

    model_config = {"from_attributes": True}


# ─── AI Studio Schemas ────────────────────────────────────────────────────────

class AIToolRequest(BaseModel):
    issueFocus: Optional[str] = Field("Latest AI trends", max_length=500)
    tone: Optional[str] = Field("professional", max_length=100)
    targetAudience: Optional[str] = Field("mixed", max_length=100)


class SubjectLineRequest(BaseModel):
    issueTitle: str = Field(..., min_length=1, max_length=500)
    previewText: str = Field(..., max_length=150)


# ─── Analytics Schemas ────────────────────────────────────────────────────────

class AnalyticsOverviewResponse(BaseModel):
    totalSubscribers: int
    activeSubscribers: int
    totalIssuesSent: int


# ─── Settings Schemas ─────────────────────────────────────────────────────────

class SettingsUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    avatarUrl: Optional[str] = Field(None, max_length=500)

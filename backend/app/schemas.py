from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Auth / User Schemas
class UserContextSchema(BaseModel):
    openId: str
    email: Optional[str] = None
    name: Optional[str] = None
    role: str

class LoginRequest(BaseModel):
    email: str
    name: Optional[str] = None

# Subscriber Schemas
class SubscribeRequest(BaseModel):
    email: EmailStr
    fullName: Optional[str] = None
    referralCode: Optional[str] = None

class SubscriberGrowthResponse(BaseModel):
    date: str
    count: int

# Issue Section Schemas
class IssueSectionCreate(BaseModel):
    sectionType: str
    title: str
    content: Optional[str] = None
    orderIndex: Optional[int] = 0
    sponsorId: Optional[int] = None
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

    class Config:
        from_attributes = True

# Issue Schemas
class IssueCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    previewText: str = Field(..., max_length=150)
    issueNumber: Optional[int] = None
    readingTimeMinutes: Optional[int] = 5
    coverImageUrl: Optional[str] = None
    issueDate: Optional[datetime] = None
    status: Optional[str] = "draft"
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

    class Config:
        from_attributes = True

# Sponsor Schemas
class SponsorCreate(BaseModel):
    companyName: str
    contactName: Optional[str] = None
    contactEmail: EmailStr
    websiteUrl: Optional[str] = None
    logoUrl: Optional[str] = None
    status: Optional[str] = "prospect"
    industry: Optional[str] = None
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

    class Config:
        from_attributes = True

# AI Studio Schemas
class AIToolRequest(BaseModel):
    issueFocus: Optional[str] = "Latest AI trends"
    tone: Optional[str] = "professional"
    targetAudience: Optional[str] = "mixed"

# Subject Line Schema
class SubjectLineRequest(BaseModel):
    issueTitle: str
    previewText: str

# Analytics
class AnalyticsOverviewResponse(BaseModel):
    totalSubscribers: int
    activeSubscribers: int
    totalIssuesSent: int

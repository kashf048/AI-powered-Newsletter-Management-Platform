# NexusAI Digest Python Backend

This is the Python FastAPI backend server for the NexusAI Digest platform. It handles authentication, administration operations, public subscription/unsubscription/confirm actions, database CRUD, and AI content generation.

---

## 📂 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py           # Settings and configuration loader (pydantic-settings)
│   ├── database.py         # SQLAlchemy async session and engine init
│   ├── dependencies.py     # FastAPI path dependencies (e.g. get_db, get_current_admin)
│   ├── main.py             # Server lifespan, logging middleware, routing mount
│   ├── models.py           # SQLAlchemy declarative database schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── admin.py        # /api/admin/* endpoints
│   │   ├── auth.py         # /api/auth/* endpoints (Google OAuth & local bypass)
│   │   └── public.py       # /api/public/* endpoints
│   │   └── schemas.py      # Pydantic data validation schemas
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ai_service.py   # AI text generator client interfacing with Groq API
│   │   └── email_service.py# Resend email dispatcher
│   └── utils/
│       ├── __init__.py
│       ├── rate_limiter.py # In-memory sliding rate limiter dependency
│       └── security.py     # Password hashing, JWT token issuer, UTC helper
└── requirements.txt        # Backend dependencies
```

---

## 🛠️ Key Abstractions & Configurations

### 1. Database & ORM
* **SQLAlchemy Async**: We use SQLAlchemy 2.0's async capabilities with `aiosqlite` (for local sqlite development) or other async drivers in production.
* **Auto-Schema creation**: Lifespan initialization in `app/main.py` automatically checks and initializes schema structures upon start.
* **Naive UTC Datetime**: Datetime values are stored timezone-naive in UTC, managed through the timezone-aware `utcnow` utility wrapper in `utils/security.py`.

### 2. Authentication Flow
* Admin authorization is verified via `get_current_admin` injected as a FastAPI `Depends`.
* It inspects request cookie headers for `app_session_id`, decodes the local JWT, and verifies that the email address is authorized under `ADMIN_EMAILS`.
* Bypasses can be used locally by clicking the dev-bypass button on the login screen if Google OAuth client credentials are not configured.

### 3. AI Generation Service
* Interfacing with the Groq Cloud Completion endpoint (`https://api.groq.com/openai/v1/chat/completions`), `AIService` allows admins to prompt for regional content summaries, newsletters, deep-dives, and subject lines.
* Includes intelligent local fallback parsing logic to guarantee graceful degradation.

### 4. Input Sanitization & Hardening
* Input string parameters (such as Subscriber's full name, admin settings, and metadata) are escaped using Python's standard `html.escape` library before persisting to block HTML and XSS injection vectors.
* Rate limits are applied to public-facing operations using the custom `rate_limit` utility to mitigate bot subscription spam.

# 🚀 NexusAI Digest Backend Server

Welcome to the backend engine of **NexusAI Digest**—Pakistan's premier newsletter and content curation platform powered by Agentic AI.

This backend is built on **FastAPI** using asynchronous programming models, SQLAlchemy (Async ORM), and integrates with **Groq Cloud API** for text generation and **Resend** for scalable email delivery.

---

## 🛠️ Tech Stack & Technologies

The backend uses a modern, high-performance Python stack:

*   **Core Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Asynchronous HTTP web API development)
*   **Web Server**: [Uvicorn](https://www.uvicorn.org/) (ASGI web server implementation)
*   **Database & ORM**: [SQLAlchemy 2.0 Async](https://www.sqlalchemy.org/) (Asynchronous SQL Toolkit and Object-Relational Mapper)
*   **DB Drivers**: [aiosqlite](https://github.com/nbraud/aiosqlite) (Async SQLite wrapper for local development) & [asyncpg](https://github.com/MagicStack/asyncpg) (Async PostgreSQL client library for production)
*   **Data Validation & Config**: [Pydantic v2](https://docs.pydantic.dev/) & [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/) (Type validation and environment settings loading)
*   **Security & JWT**: [python-jose](https://github.com/mpdavis/python-jose) (JSON Web Token signing/decoding) & [passlib[bcrypt]](https://passlib.readthedocs.io/) (Secure password hashing)
*   **AI Integration**: [Groq Cloud completions API](https://console.groq.com/) (interfaced using `httpx` async client)
*   **Email Engine**: [Resend Python SDK](https://resend.com/docs/sdks/python) (for high-deliverability transactional & marketing emails)
*   **Testing Suite**: [pytest](https://docs.pytest.org/) & [pytest-asyncio](https://github.com/pytest-dev/pytest-asyncio) (Asynchronous testing framework)

---

## 📂 Project Architecture

```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py           # Settings and configuration loader (pydantic-settings)
│   ├── database.py         # SQLAlchemy async session and engine initialization
│   ├── dependencies.py     # FastAPI path dependencies (get_db, get_current_admin, COOKIE_NAME)
│   ├── main.py             # Server lifespan, security middlewares, routing mount, SPA hosting
│   ├── models.py           # Declarative SQLAlchemy ORM database models (10 relational tables)
│   ├── schemas.py          # Pydantic schemas for request/response serialization & validation
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── admin.py        # /api/admin/* endpoints (stats, issues management, sponsors, AI tools)
│   │   ├── auth.py         # /api/auth/* endpoints (registration, credentials login, password reset)
│   │   └── public.py       # /api/public/* endpoints (subscriptions, issues display, analytics)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ai_service.py   # AI writer/generator interfacing with Groq API (Llama 3.3 70B)
│   │   └── email_service.py# Resend email dispatcher (templates for verification, newsletters, reset)
│   └── utils/
│       ├── __init__.py
│       ├── rate_limiter.py # Sliding-window rate limiter utilizing in-memory dictionaries
│       └── security.py     # Passwords, JWT operations, UTC datetime wrappers
├── .env                    # Active local environment configuration file
├── .gitignore              # Files excluded from Git version control
├── requirements.txt        # Full Python backend package list
└── README.md               # Main backend documentation file
```

---

## ⚙️ Environment Variables & Configuration

The application loads settings from `.env` in the `backend/` directory using Pydantic settings. If a variable is missing, it falls back to default values specified in `app/config.py`.

### Configuration Options

| Variable Name | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | `str` | `sqlite+aiosqlite:///./database.db` | Async database connection string. PostgreSQL URLs automatically append `+asyncpg`. |
| `JWT_SECRET` | `str` | `kj2hwge...` (default string) | Secret key used to sign and verify JSON Web Tokens for cookie authentication. |
| `OWNER_NAME` | `str` | `"Mansoor Ali"` | Platform owner name used in notifications and emails. |
| `GROQ_API_KEY` | `Optional[str]` | `None` | API key from Groq Cloud. If missing, the backend triggers offline AI mocks. |
| `GROQ_API_URL` | `str` | `https://api.groq.com/openai/v1/chat/completions` | Completions endpoint of the Groq inference service. |
| `PORT` | `int` | `8000` | The network port the Uvicorn web server listens on. |
| `RESEND_API` | `Optional[str]` | `None` | API key from Resend. If missing, emails are logged in terminal instead of sent. |
| `GOOGLE_CLIENT_ID` | `Optional[str]` | `None` | Client ID for Google OAuth (if configured). |
| `GOOGLE_CLIENT_SECRET`| `Optional[str]` | `None` | Client Secret for Google OAuth (if configured). |
| `GOOGLE_REDIRECT_URI` | `str` | `http://localhost:8000/api/auth/google/callback` | Callback URL registered in Google Cloud Console. |
| `ADMIN_EMAILS` | `str` | `"admin@nexusdigest.pk"` | Authorized admin emails (comma-separated). Registration matching these is assigned the `admin` role. |
| `FRONTEND_URL` | `str` | `http://localhost:3000` | URL of the frontend client, used for CORS policies and links in sent emails. |

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   Python 3.10 or higher
*   pip (Python package manager)

### 2. Virtual Environment Setup & Dependencies
Create a virtual environment inside the `backend` directory, activate it, and install dependencies:

**On Windows (PowerShell):**
```powershell
python -m venv backend/venv
.\backend\venv\Scripts\Activate
pip install -r backend/requirements.txt
```

**On macOS/Linux:**
```bash
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
```

### 3. Configure Environment
Create a `.env` file inside the `backend/` directory by copying the configuration variables:
```bash
cp backend/.env.example backend/.env
```
Fill in the API keys for **Groq** and **Resend** inside `backend/.env` to enable full functional workflows.

### 4. Running the Backend Server
Because the codebase uses absolute package references (e.g., `from backend.app...`), Python needs to locate the `backend` package directory. You can run the server in two ways:

#### Option A: Run from the Project Root Directory (Recommended)
Stay in the root workspace directory, ensure the virtual environment is active, and start Uvicorn:
```powershell
# Windows PowerShell:
python -m uvicorn backend.app.main:app --reload --port 8000

# macOS/Linux:
python3 -m uvicorn backend.app.main:app --reload --port 8000
```

#### Option B: Run from the `backend/` Directory
If you navigated into the `backend/` folder (`cd backend`), you must set the `PYTHONPATH` environment variable pointing to the parent folder so Python can resolve the `backend` package:

**On Windows (PowerShell):**
```powershell
$env:PYTHONPATH=".."
python -m uvicorn backend.app.main:app --reload --port 8000
```

**On Windows (CMD):**
```cmd
set PYTHONPATH=..
python -m uvicorn backend.app.main:app --reload --port 8000
```

**On macOS/Linux:**
```bash
PYTHONPATH=.. python3 -m uvicorn backend.app.main:app --reload --port 8000
```

---

## ⚡ Core Abstractions & Design

### 1. Database & ORM Async Core
*   **Database Initializer**: The lifespan context manager in `app/main.py` triggers `init_db()` upon startup, creating database tables using SQLAlchemy's `Base.metadata.create_all` dynamically.
*   **Timezones**: To avoid timezone offset issues, all dates are stored as naive datetime objects in UTC. Datetime entries are retrieved and processed using utility wrappers in `app/utils/security.py`.

### 2. Authentication & Authorization
*   **JWT Cookie Auth**: Sessions are managed using HttpOnly cookies with the name `app_session_id`. This prevents XSS access to tokens. The backend also supports `Authorization: Bearer <token>` fallback headers.
*   **Admin Promotion**: When a new user registers at `/api/auth/register`, their email is verified against `ADMIN_EMAILS`. If there is a match, the user is assigned the `"admin"` role, and a row is created in the `admins` table.

### 3. AI Service (Groq Integration)
*   **Model**: Interfaces with `llama-3.3-70b-versatile` on Groq Cloud to provide fast, high-quality newsletter text.
*   **Offline Fallback**: If `GROQ_API_KEY` is not present in `.env`, the service automatically degrades gracefully to a local mock generator, outputting predefined local news roundups, tools, and subject lines. This allows fully offline development.
*   **Input Sanitization**: Content generation logs input prompts, tokens, and response details in the `aiGenerations` audit table.

### 4. Delivery Engine (Resend Email Service)
*   **HTML Templates**: Rich emails are styled using inline CSS for layout preservation across email clients (e.g. Gmail, Outlook). Includes transactional templates for double-opt-in confirmation, password resets, and issue distribution.
*   **Unsubscribe Hook**: Automatically appends a secure unsubscribe link to the footer of every newsletter edition using the subscriber's referral code as a token.
*   **Sandbox Fallback**: If the Resend API key is omitted, the service switches to standard logging, outputting full message targets, subjects, and previews to the console.

### 5. Rate Limiting
*   Public-facing endpoints (`/api/public/subscribe`, `/api/public/confirm`, `/api/public/unsubscribe`) and authentication routes (`/api/auth/login`, `/api/auth/reset-password/request`) are guarded by in-memory rate limiters in `app/utils/rate_limiter.py` to prevent brute force or spam attempts.

---

## 📋 API Endpoint Directory

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Authentication | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | None | Register a new account. Automatically promotes to admin if email matches configuration. |
| `POST` | `/auth/login` | None | Login using credentials (email or username + password). Sets JWT session cookie. |
| `POST` | `/auth/logout` | None | Delete the session cookie and log out. |
| `GET` | `/auth/me` | Optional Cookie/Bearer | Get the logged-in user profile payload. |
| `POST` | `/auth/reset-password/request` | None | Request password reset. Generates a token and emails it via Resend. |
| `POST` | `/auth/reset-password/confirm` | None | Confirm password reset using the token. |
| `POST` | `/auth/change-password` | Required Cookie/Bearer | Change password for the active logged-in session. |

### Public Endpoints (`/api/public`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/public/subscribe` | Register an email to the newsletter. Sends confirmation email (supports referrals). |
| `GET` | `/public/confirm` | Confirm subscriber activation via token. Awards referral points if applicable. |
| `POST` | `/public/unsubscribe`| Unsubscribe a user using their email address. |
| `GET` | `/public/issues` | Retrieve the last 6 sent issues. |
| `GET` | `/public/issues/{slug}`| Get specific issue metadata and section details by slug. |
| `GET` | `/public/analytics` | Public stats overview (total subscribers, active subscribers, sent issues). |

### Admin Endpoints (`/api/admin`)
*All admin endpoints require an active session containing the `admin` role.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/admin/dashboard` | Main metrics dashboard. Fetches active counts, recent issues, and top referrers. |
| `GET` | `/admin/issues` | Retrieve all issues written by this admin. |
| `POST` | `/admin/issues` | Create a new issue draft with nested sections (e.g. news roundup, spotlight). |
| `GET` | `/admin/issues/{id}`| Get full issue metadata and section contents. |
| `PUT` | `/admin/issues/{id}`| Update issue metadata and overwrite sections. |
| `DELETE`| `/admin/issues/{id}`| Delete an issue draft or record along with its section details. |
| `POST` | `/admin/issues/{id}/send`| Deliver the issue to all active subscribers using Resend templates. |
| `GET` | `/admin/subscribers` | List all subscribers. |
| `PUT` | `/admin/subscribers/{id}`| Update subscriber profile details or status (e.g. active, pending, unsubscribed). |
| `DELETE`| `/admin/subscribers/{id}`| Delete a subscriber. |
| `GET` | `/admin/subscribers/growth`| Retrieve subscriber growth metrics over a time period (default 30 days). |
| `POST` | `/admin/ai/generate-issue`| Auto-generate newsletter content based on topic, tone, and audience. |
| `POST` | `/admin/ai/generate-subjects`| Generate 5 high-CTR subject options from draft content. |
| `GET` | `/admin/sponsors` | List all sponsors. |
| `POST` | `/admin/sponsors` | Create a new newsletter sponsor record. |
| `PUT` | `/admin/sponsors/{id}`| Update sponsor details (website, company details, status, notes). |
| `DELETE`| `/admin/sponsors/{id}`| Delete a sponsor. |
| `GET` | `/admin/referral-leaderboard`| Top 20 referrers ranking. |
| `PUT` | `/admin/settings` | Update active admin's profile name, email, or avatar. |

---

## 🧪 Testing

The backend includes test dependencies (`pytest` and `pytest-asyncio`). Tests can be run from the backend root using:
```bash
pytest
```
*Note: Write unit and integration test scripts under test directories using standard pytest conventions.*

---

## 📦 Production SPA Integration

The backend is configured to host both the REST API and compile static files from the React frontend SPA in production.

1.  Build the frontend client inside the workspace root:
    ```bash
    pnpm build
    ```
    This builds the frontend code into the `dist/public` folder.
2.  Start the FastAPI backend server:
    ```bash
    python -m uvicorn backend.app.main:app --port 8000
    ```
3.  The backend's SPA handler will automatically:
    *   Serve static assets (JS, CSS, images) from the `dist/public/assets` path.
    *   Serve `index.html` on any route not matching `/api` to support frontend client-side routing.

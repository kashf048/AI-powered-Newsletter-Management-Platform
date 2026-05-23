# NexusAI Digest — Pakistan's Premier AI Newsletter Platform

NexusAI Digest is a high-end, production-ready, AI-driven newsletter management platform built to compose, translate, edit, send, and optimize weekly briefings for Pakistani business leaders and developers. It features a modern dark-mode user experience, deep tRPC API integrations, automated AI writing companions, and a localized referral reward system.

---

## 🚀 Key Features

### Public Portal
* **Animated Multi-Step Subscriptions**: Modern interactive subscription flow with validation checks, referral codes tracking, and verification status loops.
* **Token Verification Check**: Dedicated validation views welcoming users, showing referral statistics, and reward milestones.
* **Exit Surveys**: Detailed exit reviews capturing user feedback during unsubscribing, with one-click resubscribe recovery.
* **Referrals Invitation Landing**: Custom invitation pages displaying milestone progress to incentivize signups.
* **Issue Archive & Reader**: Fully search-filtered archives and reader with complete DOMPurify HTML sanitization and Twitter/LinkedIn social share modules.

### Admin Operations Control Center
* **Metrics Dashboard**: Quick-view widgets tracking growth rates, CTRs, and open rates, coupled with interactive Recharts graphics.
* **Issue Editor & Compiler**: Dual-pane layout featuring text markdown editing on the left and a live-updating compiled html preview (via Streamdown) on the right.
* **AI Writing Companion**: Instantly draft Pakistan spotlights, deep dives, news roundups, Urdu localized briefs, and Compelling email subject lines using local or Forge APIs.
* **Audience Management**: Table with inline filters, detailed status flags (Active, Pending, Unsubscribed), and CSV export actions.
* **Sponsors Booking**: Schedule and track sponsorship slots across issues, calculate CTR impressions, and manage payment statuses.
* **Referrals Tracker**: View advocate leaderboards, referral counts, and milestones claims.

---

## 🛠️ Tech Stack & Architecture

### Frontend
* **Core**: React 19 (Vite), TypeScript, Wouter Client Routing
* **Style & Theming**: Tailwind CSS, Shadcn UI Primitives, Lucide Icons, Framer Motion transitions
* **Charts**: Recharts Area and Bar representations
* **Compiler**: Streamdown markdown parser, DOMPurify HTML sanitizer
* **API Client**: tRPC Client + TanStack React Query v5

### Backend & Database
* **Core Server**: Node.js, Express, Cookie-Parser, Helmet, CORS
* **API Framework**: tRPC Server (type-safe RPC router)
* **ORM & Database**: Drizzle ORM configured with `mysql2` MySQL driver (fully tested with TiDB Cloud serverless MySQL schemas)
* **AI Orchestrator**: Forge LLM integration with dynamic fallback mock models

---

## 📋 Database Schema

```mermaid
erDiagram
    users {
        varchar openId PK
        varchar email
        varchar name
        varchar role
        datetime lastSignedIn
    }
    admins {
        int id PK
        varchar openId
        varchar email
        varchar name
        boolean isSuperadmin
    }
    subscribers {
        int id PK
        varchar email
        varchar fullName
        varchar referralCode
        int referredById
        varchar status
        varchar source
        datetime createdAt
    }
    issues {
        int id PK
        int adminId
        varchar title
        varchar slug
        int issueNumber
        text previewText
        text webContent
        varchar coverImageUrl
        varchar status
        datetime sentAt
        datetime createdAt
    }
    issueSections {
        int id PK
        int issueId
        varchar sectionType
        varchar title
        text content
        int orderIndex
    }
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory based on the template:

```bash
# Database Configuration
DATABASE_URL="mysql://username:password@host:3306/db_name"

# Authentication Settings
JWT_SECRET="your_long_random_jwt_signing_secret"
VITE_APP_ID="your_manus_app_id"

# Local testing fallbacks
OWNER_NAME="Mansoor Ali"
OWNER_OPEN_ID="your_owner_openid"

# AI LLM Settings
BUILT_IN_FORGE_API_KEY="your_forge_key"
BUILT_IN_FORGE_API_URL="https://forge.manus.ai"
```

---

## 💻 Local Development

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Database Migrations
Deploy schema definitions:
```bash
# Create local migration files
npx drizzle-kit generate

# Run migrations on database
npx drizzle-kit migrate
```

### 3. Execution
Start the local server & client dev loop:
```bash
npm run dev
```
The client dashboard runs on `http://localhost:5173` and backend services run on `http://localhost:3000`.

---

## 🚀 Production Deployment

1. Build static production assets and compile Node server:
   ```bash
   npm run build
   ```
2. Launch the Express server application:
   ```bash
   npm start
   ```

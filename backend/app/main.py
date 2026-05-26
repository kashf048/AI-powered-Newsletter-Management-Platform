import os
import sys
import time
import logging
import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from backend.app.config import settings
from backend.app.database import init_db
from backend.app.routers import auth, public, admin

GREEN = "\033[32m"
BOLD_GREEN = "\033[1;32m"
CYAN = "\033[36m"
WHITE = "\033[37m"
RESET = "\033[0m"

_BANNER = (
    f"\n"
    f"{GREEN}  +--------------------------------------------------+{RESET}\n"
    f"{BOLD_GREEN}  |        NexusAI Digest  -  API Server             |{RESET}\n"
    f"{GREEN}  +--------------------------------------------------+{RESET}\n"
    f"{GREEN}  |  Docs  : {CYAN}http://127.0.0.1:8000/docs{RESET}{GREEN}             |{RESET}\n"
    f"{GREEN}  |  Health: {CYAN}http://127.0.0.1:8000/api/health{RESET}{GREEN}       |{RESET}\n"
    f"{GREEN}  +--------------------------------------------------+{RESET}\n"
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    sys.stdout.write(_BANNER)
    sys.stdout.write(f"{GREEN}[*] Initializing database schema...{RESET}\n")
    sys.stdout.flush()
    await init_db()
    sys.stdout.write(f"{GREEN}[✓] Database ready{RESET}\n")
    mode = "PRODUCTION (secure cookies + HSTS)" if settings.is_production else "DEVELOPMENT (localhost)"
    db_type = "PostgreSQL" if settings.is_postgresql else "SQLite"
    sys.stdout.write(f"{GREEN}[•] Environment : {WHITE}{mode}{RESET}\n")
    sys.stdout.write(f"{GREEN}[•] Database    : {WHITE}{db_type}{RESET}\n")
    sys.stdout.write(f"{BOLD_GREEN}[✓] Server successfully started and listening.{RESET}\n\n")
    sys.stdout.flush()
    yield
    sys.stdout.write(f"\n{GREEN}[*] Shutting down NexusAI Digest API...{RESET}\n")
    sys.stdout.flush()


app = FastAPI(
    title="NexusAI Digest API",
    description="FastAPI Backend for NexusAI Digest Newsletter Management Platform",
    version="1.0.0",
    lifespan=lifespan,
    # Disable docs in production to reduce attack surface
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
)


# ─── Exception Handlers ──────────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception on %s %s", request.method, request.url.path, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected server error occurred. Please try again later."},
    )


# ─── CORS ────────────────────────────────────────────────────────────────────

_allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if settings.FRONTEND_URL:
    _origin = settings.FRONTEND_URL.rstrip("/")
    if _origin not in _allowed_origins:
        _allowed_origins.append(_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
    expose_headers=["X-Request-ID"],
    max_age=600,  # Cache preflight for 10 minutes
)


# ─── Security Headers Middleware ──────────────────────────────────────────────

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https:; "
        "connect-src 'self';"
    )
    if settings.is_production:
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains; preload"
        )
    return response


# ─── Request Logging Middleware ───────────────────────────────────────────────

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(
        "[%s] %s → %d (%.4fs)",
        request.method,
        request.url.path,
        response.status_code,
        duration,
    )
    return response


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/api/health", tags=["system"])
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "message": "System is running smoothly",
    }


app.include_router(auth.router, prefix="/api")
app.include_router(public.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


# ─── SPA / Static Asset Serving ──────────────────────────────────────────────

_static_dir = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "dist",
    "public",
)

if os.path.exists(_static_dir):
    _assets_dir = os.path.join(_static_dir, "assets")
    if os.path.exists(_assets_dir):
        app.mount("/assets", StaticFiles(directory=_assets_dir), name="assets")

    @app.get("/{catchall:path}", include_in_schema=False)
    async def serve_spa(request: Request, catchall: str):
        # Never intercept API routes
        if catchall.startswith("api/") or catchall == "api":
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        index_file = os.path.join(_static_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return JSONResponse(
            status_code=503,
            content={"detail": "Frontend not built. Run `pnpm run build`."},
        )
else:
    @app.get("/", tags=["system"])
    async def root():
        return {
            "name": "NexusAI Digest API",
            "status": "online",
            "docs": "/docs",
            "message": "Start the client in development mode or build it to serve files.",
        }

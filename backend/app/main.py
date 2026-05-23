import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.app.config import settings
from backend.app.database import init_db
from backend.app.routers import auth, public, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-initialize database schema on startup for easy installation
    await init_db()
    yield

app = FastAPI(
    title="NexusAI Digest API",
    description="FastAPI Backend for NexusAI Digest Newsletter Management Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(public.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

# Serve client assets in production/SPA mode
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "dist", "public")

if os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")
    
    # Catch-all endpoint to serve the frontend SPA application
    @app.get("/{catchall:path}")
    async def serve_spa(request: Request, catchall: str):
        # Prevent intercepting /api endpoints
        if catchall.startswith("api"):
            return None
        index_file = os.path.join(static_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"detail": "Frontend SPA index.html not found. Please build the frontend."}
else:
    @app.get("/")
    async def root():
        return {
            "name": "NexusAI Digest API",
            "status": "online",
            "docs": "/docs",
            "message": "Start the client in development mode or build it to serve files."
        }

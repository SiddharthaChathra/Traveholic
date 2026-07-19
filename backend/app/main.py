# FastAPI Application Factory
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.session import init_db, close_db
from app.db.init_db import init_db as seed_db
from app.api.routes import (
    transects, sensors, crowdsource, alerts, ml, dashboard
)
from app.api.deps import get_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    
    # Initialize database
    await init_db()
    
    # Seed with sample data
    async for db in get_db():
        await seed_db(db)
        break
    
    # Initialize ML pipeline
    try:
        from app.ml.pipeline import initialize_pipeline
        await initialize_pipeline()
        print("ML pipeline initialized")
    except Exception as e:
        print(f"ML pipeline initialization warning: {e}")
    
    # Start background tasks
    # from app.tasks.scheduler import start_scheduler
    # start_scheduler()
    
    yield
    
    # Shutdown
    print("Shutting down...")
    await close_db()


def create_app() -> FastAPI:
    """Create FastAPI application."""
    
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="Coastal Erosion Intelligence Platform API",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )
    
    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Static files for uploads
    try:
        app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
    except:
        pass
    
    # API routes
    app.include_router(
        transects.router,
        prefix=settings.API_V1_PREFIX,
        tags=["transects"],
    )
    app.include_router(
        sensors.router,
        prefix=settings.API_V1_PREFIX,
        tags=["sensors"],
    )
    app.include_router(
        crowdsource.router,
        prefix=settings.API_V1_PREFIX,
        tags=["crowdsource"],
    )
    app.include_router(
        alerts.router,
        prefix=settings.API_V1_PREFIX,
        tags=["alerts"],
    )
    app.include_router(
        ml.router,
        prefix=settings.API_V1_PREFIX,
        tags=["ml"],
    )
    app.include_router(
        dashboard.router,
        prefix=settings.API_V1_PREFIX,
        tags=["dashboard"],
    )
    
    # Health check
    @app.get("/health")
    async def health_check():
        return {
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
        }
    
    @app.get("/")
    async def root():
        return {
            "message": f"Welcome to {settings.APP_NAME}",
            "version": settings.APP_VERSION,
            "docs": "/docs",
        }
    
    return app


app = create_app()
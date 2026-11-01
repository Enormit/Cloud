import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import admin, auth, courses, emails, registrations

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("course_registration")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.PROJECT_NAME} in {settings.ENVIRONMENT} mode")
    logger.info(f"Email Provider: {settings.EMAIL_PROVIDER.upper()}")
    logger.info(f"DynamoDB Region: {settings.DYNAMODB_REGION}")
    logger.info(f"AWS Secrets Manager Enabled: {settings.USE_AWS_SECRETS}")
    yield
    logger.info("Application shutting down...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="REST API cho Hệ Thống Đăng Ký Môn Học Sinh Viên - Hỗ trợ DynamoDB, AWS SES, AWS Secrets Manager",
    version="2.0.1",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(registrations.router)
app.include_router(emails.router)
app.include_router(admin.router)


@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "healthy",
        "version": "2.0.1",
        "environment": settings.ENVIRONMENT,
        "email_provider": settings.EMAIL_PROVIDER,
        "docs_url": "/api/docs",
    }


@app.get("/health")
@app.get("/api/health")
async def health_check():
    """Health check endpoint used by ALB Target Group."""
    return {"status": "ok", "service": "backend", "version": "2.0.1"}

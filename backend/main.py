from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from scheduler import start_scheduler, shutdown_scheduler
from config import settings
from routers import (
    auth_router,
    dashboard_router,
    scanner_router,
    history_router,
    compliance_router,
    monitoring_router,
    defense_router
)
import logging

# Initialize logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    start_scheduler()
    logger.info("Application started")

@app.on_event("shutdown")
async def shutdown_event():
    shutdown_scheduler()
    logger.info("Application shutdown")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Zombie API Discovery Platform Backend"}

@app.get("/health")
def health_check():
    """Health probe — frontend polls this to know when backend is ready after reload."""
    return {"status": "ok"}

app.include_router(auth_router.router)
app.include_router(dashboard_router.router)
app.include_router(scanner_router.router)
app.include_router(history_router.router)
app.include_router(compliance_router.router)
app.include_router(monitoring_router.router)
app.include_router(defense_router.router)

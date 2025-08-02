# your_project_name/app/main.py
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import init_db
from app.core.config import settings
import logging

# Import the API router for our Q&A endpoints
from app.api.v1.endpoints import qna

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- FastAPI Application Instance ---
app = FastAPI(
    title="Interactive Q&A System Backend",
    description="""
    This is the backend for an interactive Q&A system, built with FastAPI and integrated with a Large Language Model (LLM).
    """,
    version="1.0.0",
    redoc_url="/redoc",
    docs_url="/docs"
)

# --- CORS Middleware Configuration ---
# This is crucial for allowing the frontend to communicate with the backend.
# The 'http://localhost:3000' origin must be explicitly allowed.
origins = [
     "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://frontend:3000",  
    "http://app:8000",
]

app.add_middleware(
      CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"] 
)

# --- Include API Routers ---
app.include_router(qna.router, tags=["Q&A"], prefix="/api/v1")

# --- Database Connection Events ---
@app.on_event("startup")
async def startup_event():
    """
    Event handler to initialize the database connection pool on application startup.
    """
    logger.info("Application startup: Initializing database...")
    await init_db()
    logger.info("Database initialized.")

# --- API Endpoints (Core) ---

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """
    Health check endpoint to verify the backend service is running.
    """
    return {"status": "ok", "message": "Backend is healthy and running."}

@app.get("/")
async def read_root():
    """
    Root endpoint for basic access.
    """
    return {"message": "Welcome to the Interactive Q&A System Backend! Visit /docs for API documentation."}


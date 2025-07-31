from fastapi import FastAPI, HTTPException, status, Depends
from app.db.database import init_db
from app.core.config import settings
import logging
from app.api.v1.endpoints import qna

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger()

app = FastAPI(
    title= "Interctive Q&A Backedn",
    description= '''backend for an interactive Q&A system, built with FastAPI and integrated with a Large Language Model (LLM)''',
    version='1.0.0',
    redoc_url='/redoc',
    docs_url = '/docs'
)

app.include_router(qna.router, tags=['Q&A'], prefix='/api/v1')

@app.on_event('startup')
async def startup_event():
    """initialize db conn pool"""
    logger.info("App startup")
    await init_db()
    logger.info("Database Initialized")
    
@app.get('/health', status_code=status.HTTP_200_OK)
async def health_check():
    return {'status': 'ok', 'message': 'backend healthy and running'}

@app.get('/')
async def read_root():
    return {'message': 'Welcome to our Interactive Q&A System Backend. For API documentation, visit /docs'}
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.pool import NullPool
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

Base = declarative_base()

engine = create_async_engine(
    settings.DATABASE_URL + "?sslmode=require",
    echo=False,
    poolclass=NullPool,
    future=True
)
AsyncSessionLocal = async_sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False 
)

async def init_db():
    async with engine.begin() as conn:
        logger.info("Database initialization skipped, alembic should be used for migration")
        
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            logger.error(f'Database session error: {e}')
            await session.rollback()
            raise
        finally:
            await session.close()
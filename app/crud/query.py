from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime
from app.db.models import QueryHistory

async def create_query_history(
    db_session: AsyncSession,
    user_id: str,
    query_text: str,
    response_text: str,
    query_id: str,
    timestamp: datetime
):
    
    db_query = QueryHistory(
        user_id= user_id,
        query_text = query_text,
        response_text = response_text,
        query_id = query_id,
        timestamp = timestamp
    )
    db_session.add(db_query)
    await db_session.commit()
    await db_session.refresh(db_query)
    return db_query

async def get_query_history_by_user_id(
    db_session: AsyncSession,
    user_id: str,
    limit: int = 100
):
    result = await db_session.execute(
        select(QueryHistory).filter(QueryHistory.user_id==user_id).
        order_by(QueryHistory.timestamp.desc()).limit(limit)
        
    )
    
    return result.scalars().all()

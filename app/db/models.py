from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.database import Base

class QueryHistory(Base):
    __tablename__ = 'query_hist'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default= uuid.uuid4, index=True)
    user_id = Column(String, index=True, nullable=False)
    query_id = Column(String, Unique=True, nullable=False)
    query_text = Column(Text, nullable=False)
    response_text = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    def __repr__(self):
        return f'[QueryHistory(user_id={self.user_id}, query_id={self.query_id}, timestamp={self.timestamp})]'
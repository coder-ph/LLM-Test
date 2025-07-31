from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.database import Base

class QueryHistory(Base):
    __table
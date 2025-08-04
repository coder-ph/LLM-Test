import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import AsyncSessionLocal
from app.db.models import QueryHistory
from uuid import uuid4
from datetime import datetime, timezone

async def test_db_operations():
    # Create a test record
    test_data = {
        "id": uuid4(),
        "user_id": "test_user_123",
        "session_id": "test_session_456", 
        "query_text": "Test query",
        "response_text": "Test response",
        "timestamp": datetime.now(timezone.utc)
    }
    
    # Test INSERT
    async with AsyncSessionLocal() as session:
        try:
            # Insert test record
            new_query = QueryHistory(**test_data)
            session.add(new_query)
            await session.commit()
            print("✅ Insert successful")
            
            # Test SELECT
            result = await session.execute(
                select(QueryHistory).where(QueryHistory.user_id == "test_user_123")
            )
            record = result.scalars().first()
            
            if record:
                print(f"✅ Query successful - found record: {record.id}")
                print(f"Full record: {vars(record)}")
            else:
                print("❌ Query failed - no records found")
                
        except Exception as e:
            print(f"❌ Database operation failed: {e}")
            await session.rollback()
        finally:
            await session.close()

# Run the test
if __name__ == "__main__":
    asyncio.run(test_db_operations())
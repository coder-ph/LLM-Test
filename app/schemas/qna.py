from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class QueryRequest(BaseModel):
    query: str = Field(..., min_length=5, max_length=500)
    user_id :str = Field(None)
    
class LLMResponseContent(BaseModel):
    required_visa_documentation: Optional[List[str]] = Field(None)
    passport_requirements: Optional[List[str]] = Field(None)
    additional_necessary_documents: Optional[List[str]] = Field(None)
    relevant_travel_advisories: Optional[list[str]] = Field(None)
    general_response: Optional[str] = Field(None)
    
class QueryResponse(BaseModel):
    ai_response: str = Field(...,description="AI generated response")
    structured_data: Optional[LLMResponseContent] = Field(None)
    query_id: str = Field(...,description='unique id fore query-response pair')
    user_id : str = Field(..., description='User id associated with the query')
    timestamp: datetime = Field(..., description='query timestamp')
    
class HistoryItem(BaseModel):
    query: str = Field(..., description='original query')
    ai_response: str = Field(...,description="AI generated response")
    query_id: str = Field(...,description='unique id fore query-response pair')
    user_id : str = Field(..., description='User id associated with the query')
    timestamp: datetime = Field(..., description='query timestamp')

class QueryHistoryResponse(BaseModel):
    history : List[HistoryItem] = Field(..., description='list of previous queries & their responses')
    user_id: str = Field(..., decription='user id associated with history')
    
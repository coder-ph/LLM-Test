
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class QueryRequest(BaseModel):
    """
    Schema for a user's query.
    """
    query: str = Field(..., min_length=5, max_length=500,
                       example="What documents do I need to travel from Kenya to Ireland?",
                       description="The user's question to be answered by the LLM.")
    user_id: Optional[str] = Field(None,
                                   example="unique-user-id-123",
                                   description="Optional unique identifier for the user to retrieve query history. If not provided, a new one will be generated.")
    session_id: Optional[str] = Field(None,
                                      description="The ID for the current conversation session.")

class LLMResponseContent(BaseModel):
    """
    Schema for the structured content of the LLM's response.
    """
    required_visa_documentation: Optional[List[str]] = Field(None, description="List of visa documents.")
    passport_requirements: Optional[List[str]] = Field(None, description="List of passport requirements.")
    additional_necessary_documents: Optional[List[str]] = Field(None, description="List of other necessary documents.")
    relevant_travel_advisories: Optional[List[str]] = Field(None, description="List of travel advisories.")
    general_response: Optional[str] = Field(None, description="A general, unstructured response if specific categories are not applicable.")

class QueryResponse(BaseModel):
    """
    Schema for the API's response to a user query.
    """
    ai_response: str = Field(..., description="The AI-generated response, formatted as Markdown.")
    structured_data: Optional[LLMResponseContent] = Field(None, description="Optional structured data from the AI response.")
    session_id: str = Field(..., description="The ID for the current conversation session.")
    user_id: str = Field(..., description="The user ID associated with this query.")
    timestamp: datetime = Field(..., description="Timestamp of the query.")


class HistoryItem(BaseModel):
    """
    Schema for a single item in the query history.
    """
    query: str = Field(..., description="The original query.")
    ai_response: str = Field(..., description="The AI-generated response.")
    session_id: str = Field(..., description="The session ID for this conversation.")
    user_id: str = Field(..., description="The user ID associated with this query.")
    timestamp: datetime = Field(..., description="Timestamp of the query.")

class QueryHistoryResponse(BaseModel):
    """
    Schema for the response containing a user's query history.
    """
    history: List[HistoryItem] = Field(..., description="List of previous queries and their responses.")
    user_id: str = Field(..., description="The user ID for which the history is retrieved.")



from fastapi import APIRouter, Depends, status, HTTPException
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import uuid
import logging

from app.schemas.qna import QueryRequest, QueryResponse, HistoryItem, QueryHistoryResponse, LLMResponseContent
from app.crud.query import create_query_history, get_query_history_by_user_id
from app.db.database import get_db
from app.api.services.llm import call_gemini_llm, construct_llm_prompt
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/query", response_model=QueryResponse, status_code=status.HTTP_200_OK)
async def handle_query(request_data: QueryRequest, db_session: AsyncSession = Depends(get_db)):
    """
    Handles a user's question, sends it to the LLM, and returns the AI-generated response.
    Stores the query and response for history in the database.
    """
    logger.info(f"Received query: '{request_data.query}' from user_id: '{request_data.user_id}'")

    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                            detail="LLM service is not configured. Please set GEMINI_API_KEY.")

    current_user_id = request_data.user_id if request_data.user_id else str(uuid.uuid4())
    session_id = request_data.session_id if request_data.session_id else str(uuid.uuid4())
    timestamp = datetime.now()

    try:
        llm_prompt = construct_llm_prompt(request_data.query)
        llm_raw_response = await call_gemini_llm(llm_prompt)

        structured_data: Optional[LLMResponseContent] = None
        ai_response_text: str = ""

        if llm_raw_response:
            try:
                structured_data = LLMResponseContent(**llm_raw_response)
                response_parts = []
                if structured_data.required_visa_documentation:
                    response_parts.append("**Required Visa Documentation:**\n" + "\n".join(f"- {doc}" for doc in structured_data.required_visa_documentation))
                if structured_data.passport_requirements:
                    response_parts.append("**Passport Requirements:**\n" + "\n".join(f"- {req}" for req in structured_data.passport_requirements))
                if structured_data.additional_necessary_documents:
                    response_parts.append("**Additional Necessary Documents:**\n" + "\n".join(f"- {doc}" for doc in structured_data.additional_necessary_documents))
                if structured_data.relevant_travel_advisories:
                    response_parts.append("**Relevant Travel Advisories:**\n" + "\n".join(f"- {adv}" for adv in structured_data.relevant_travel_advisories))
                if structured_data.general_response:
                    response_parts.append(structured_data.general_response)

                ai_response_text = "\n\n".join(response_parts) if response_parts else structured_data.general_response or "No specific information found."

            except Exception as e:
                logger.warning(f"Failed to parse LLM raw response into structured data model: {e}. Raw response: {llm_raw_response}")
                ai_response_text = llm_raw_response.get("general_response", "The AI provided an unstructured or unparseable response.")
                structured_data = None

        else:
            ai_response_text = "The AI did not provide a response."

        await create_query_history(
            db_session,
            user_id=current_user_id,
            session_id=session_id, # New
            query_text=request_data.query,
            response_text=ai_response_text,
            timestamp=timestamp
        )
        logger.info(f"Query stored in DB for user_id: {current_user_id}, session_id: {session_id}")

        return QueryResponse(
            ai_response=ai_response_text,
            structured_data=structured_data,
            session_id=session_id, # New
            user_id=current_user_id,
            timestamp=timestamp
        )

    except HTTPException as e:
        logger.error(f"HTTPException during query handling: {e.detail}")
        raise e
    except Exception as e:
        logger.exception(f"An unexpected error occurred during query handling: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="An internal server error occurred while processing your request.")

@router.get("/history/{user_id}", response_model=QueryHistoryResponse, status_code=status.HTTP_200_OK)
async def get_query_history_endpoint(user_id: str, db_session: AsyncSession = Depends(get_db)):
    """
    Retrieves the history of queries for a given user ID from the database.
    """
    logger.info(f"Retrieving history for user_id: {user_id}")
    db_history_items = await get_query_history_by_user_id(db_session, user_id)

    formatted_history = [
        HistoryItem(
            query=item.query_text,
            ai_response=item.response_text,
            session_id=item.session_id, # New
            user_id=item.user_id,
            timestamp=item.timestamp
        ) for item in db_history_items
    ]

    return QueryHistoryResponse(history=formatted_history, user_id=user_id)

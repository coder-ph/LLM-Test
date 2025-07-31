# your_project_name/app/services/llm.py
from fastapi import HTTPException, status
from typing import Dict, Any
import httpx
import asyncio
import json
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

async def call_gemini_llm(prompt: str) -> Dict[str, Any]:
   
    if not settings.GEMINI_API_KEY:
        logger.error("Attempted to call LLM without API key.")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="LLM API key is not configured.")

    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key={settings.GEMINI_API_KEY}"
    chat_history = []
    chat_history.append({ "role": "user", "parts": [{ "text": prompt }] })

    response_schema = {
        "type": "OBJECT",
        "properties": {
            "required_visa_documentation": {
                "type": "ARRAY",
                "items": {"type": "STRING"}
            },
            "passport_requirements": {
                "type": "ARRAY",
                "items": {"type": "STRING"}
            },
            "additional_necessary_documents": {
                "type": "ARRAY",
                "items": {"type": "STRING"}
            },
            "relevant_travel_advisories": {
                "type": "ARRAY",
                "items": {"type": "STRING"}
            },
            "general_response": {
                "type": "STRING"
            }
        }
    }

    payload = {
        "contents": chat_history,
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": response_schema
        }
    }

    headers = {
        "Content-Type": "application/json"
    }

    max_retries = 5
    base_delay = 1

    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(api_url, headers=headers, json=payload)
                response.raise_for_status()

            result = response.json()
            if result.get("candidates") and result["candidates"][0].get("content") and result["candidates"][0]["content"].get("parts"):
                llm_text_response = result["candidates"][0]["content"]["parts"][0].get("text")
                if llm_text_response:
                    try:
                        parsed_json = json.loads(llm_text_response)
                        return parsed_json
                    except json.JSONDecodeError:
                        logger.warning(f"LLM response was not valid JSON: {llm_text_response}")
                        return {"general_response": llm_text_response}
                else:
                    logger.warning("LLM response content part is empty.")
                    return {"general_response": "The AI did not provide a clear response."}
            else:
                logger.warning(f"Unexpected LLM response structure: {result}")
                return {"general_response": "The AI provided an unexpected response format."}

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error calling Gemini API (status: {e.response.status_code}): {e.response.text}")
            if e.response.status_code == 429:
                delay = base_delay * (2 ** attempt)
                logger.info(f"Rate limited. Retrying in {delay:.2f} seconds...")
                await asyncio.sleep(delay)
            else:
                raise HTTPException(status_code=e.response.status_code, detail=f"LLM API error: {e.response.text}")
        except httpx.RequestError as e:
            logger.error(f"Network error calling Gemini API: {e}")
            if attempt < max_retries - 1:
                delay = base_delay * (2 ** attempt)
                logger.info(f"Network error. Retrying in {delay:.2f} seconds...")
                await asyncio.sleep(delay)
            else:
                raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Could not connect to LLM service.")
        except Exception as e:
            logger.error(f"An unexpected error occurred during LLM call: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An internal server error occurred.")

    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get response from LLM after multiple retries.")


def construct_llm_prompt(query: str) -> str:
    """
    Constructs the prompt for the LLM based on the user's query.
    """
    if "travel" in query.lower() and ("documents" in query.lower() or "visa" in query.lower()):
        return f"""
        You are a concise and expert travel assistant. The user is asking about travel documentation.
        Please provide a comprehensive and well-formatted response for the query: "{query}".
        Answer directly and avoid lengthy paragraphs or redundant information. Use bullet points for lists.
        Structure your response as a JSON object with the following keys. If a category is not applicable or you cannot find specific information, provide an empty array or an empty string.

        {{
            "required_visa_documentation": ["List of documents needed for visa application"],
            "passport_requirements": ["Details about passport validity, pages, etc."],
            "additional_necessary_documents": ["Other documents like flight tickets, accommodation proof, yellow fever certificate, etc."],
            "relevant_travel_advisories": ["Any official warnings, health advisories, or entry restrictions"],
            "general_response": "A brief summary or additional helpful information in a single paragraph."
        }}
        """
    else:
        # General prompt for other types of queries
        return f"""
        You are a concise and helpful AI assistant.
        Please answer the following query: "{query}" with brevity and clarity.
        Provide a detailed and well-formatted response and do not be redudant on the points or repeat same points.
        If the query can be structured into categories like 'required_visa_documentation', 'passport_requirements', 'additional_necessary_documents', 'relevant_travel_advisories', please use those categories in a JSON object.
        Otherwise, provide a concise answer in the 'general_response' field. if the question is something that will need you to seperate into paragraphs and subheadings then do so but always adhere to prompt instructions, remember 
        you are concise and helpful AI assistant with vast knowledge of information also be concise and avoid lengthy responses when necessary.
        Ensure your response is a valid JSON object.

        Example JSON structure (if applicable):
        {{
            "required_visa_documentation": ["..."],
            "passport_requirements": ["..."],
            "additional_necessary_documents": ["..."],
            "relevant_travel_advisories": ["..."],
            "general_response": "Your detailed answer here."
        }}
        """
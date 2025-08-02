
export interface QueryResponse {
    ai_response: string;
    structured_data: {
        required_visa_documentation?: string[];
        passport_requirements?: string[];
        additional_necessary_documents?: string[];
        relevant_travel_advisories?: string[];
        general_response?: string;
    };
    session_id: string;
    user_id: string;
    timestamp: string;
}

export interface HistoryItem {
    query: string;
    ai_response: string;
    session_id: string;
    user_id: string;
    timestamp: string;
}


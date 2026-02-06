/**
 * Lead Data Types
 * Synchronized with backend_python/src/models/lead.py
 */

export interface LeadData {
    name: string;
    email: string;
    phone?: string;
    project_details: string; // Mapped from quote_summary in the UI
    session_id: string;      // Required for context tracking
    room_type?: string;      // Optional enrichment
    style?: string;          // Optional enrichment
}

export interface LeadSubmissionResponse {
    status: 'success' | 'error';
    message: string;
    request_id?: string;
}

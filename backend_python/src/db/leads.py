import logging
from typing import Dict, Any
from src.db.firebase_client import get_firestore_client
from src.models.lead import LeadData, LeadDocument

logger = logging.getLogger(__name__)

async def save_lead(
    lead_data: LeadData,
    uid: str,
    session_id: str
) -> Dict[str, Any]:
    """
    Save a customer lead to Firestore.
    
    Args:
        lead_data: Customer contact and project information
        uid: User's Firebase UID
        session_id: Current chat session ID
        
    Returns:
        Dictionary with lead_id and success status
        
    Raises:
        Exception: If Firestore write fails
    """
    try:
        db = get_firestore_client()
        
        # Create complete document with metadata
        lead_doc = LeadDocument(
            **lead_data.model_dump(),
            uid=uid,
            session_id=session_id
        )
        
        # Convert to dict for Firestore
        lead_dict = lead_doc.model_dump()
        lead_dict['created_at'] = lead_doc.created_at  # Firestore handles datetime
        
        # Write to Firestore
        doc_ref = db.collection('leads').add(lead_dict)
        lead_id = doc_ref[1].id
        
        logger.info(f"Lead saved successfully: {lead_id} for user {uid}")
        
        return {
            "success": True,
            "lead_id": lead_id,
            "message": "Lead saved successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to save lead: {str(e)}", exc_info=True)
        raise Exception(f"Database error: {str(e)}")

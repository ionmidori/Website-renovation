import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from firebase_admin import firestore
from src.db.firebase_client import get_firestore_client

logger = logging.getLogger(__name__)

async def save_message(
    session_id: str,
    role: str,  # 'user', 'assistant', or 'tool'
    content: str,
    metadata: Optional[Dict[str, Any]] = None,
    tool_calls: Optional[List[Dict[str, Any]]] = None,
    tool_call_id: Optional[str] = None,
    attachments: Optional[List[Dict[str, Any]]] = None # 🔥 New: Structured Media
) -> None:
    """Save a message to Firestore with tool support and media attachments."""
    try:
        db = get_firestore_client()
        
        message_data = {
            'role': role,
            'content': content,
            'timestamp': firestore.SERVER_TIMESTAMP,
        }
        
        if metadata:
            message_data['metadata'] = metadata
            
        if tool_calls:
            message_data['tool_calls'] = tool_calls
            
        if tool_call_id:
            message_data['tool_call_id'] = tool_call_id

        if attachments:
            message_data['attachments'] = attachments
        
        # Add to messages subcollection
        db.collection('sessions').document(session_id).collection('messages').add(message_data)
        
        # Update session metadata
        session_ref = db.collection('sessions').document(session_id)
        session_doc = session_ref.get()
        
        session_update = {
            'updatedAt': firestore.SERVER_TIMESTAMP,
            'sessionId': session_id,
            'messageCount': firestore.Increment(1)
        }
        
        if not session_doc.exists:
            session_update['createdAt'] = firestore.SERVER_TIMESTAMP
            
        session_ref.set(session_update, merge=True)
        
        logger.info(f"[Firestore] Saved {role} message to session {session_id}")
        
    except Exception as e:
        logger.error(f"[Firestore] Error saving message: {str(e)}", exc_info=True)
        pass


async def get_conversation_context(
    session_id: str,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """Retrieve conversation history including tool data and attachments."""
    try:
        db = get_firestore_client()
        
        messages_ref = (
            db.collection('sessions')
            .document(session_id)
            .collection('messages')
            .order_by('timestamp', direction=firestore.Query.ASCENDING)
            .limit(limit)
        )
        
        docs = messages_ref.stream()
        
        messages = []
        for doc in docs:
            data = doc.to_dict()
            msg = {
                'role': data.get('role', 'user'),
                'content': data.get('content', '')
            }
            if 'tool_calls' in data:
                msg['tool_calls'] = data['tool_calls']
            if 'tool_call_id' in data:
                msg['tool_call_id'] = data['tool_call_id']
            if 'attachments' in data:
                msg['attachments'] = data['attachments']
                
            messages.append(msg)
        
        logger.info(f"[Firestore] Retrieved {len(messages)} messages for session {session_id}")
        return messages
        
    except Exception as e:
        logger.error(f"[Firestore] Error retrieving messages: {str(e)}", exc_info=True)
        return []


def get_messages(session_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    """
    SYNCHRONOUS version of get_conversation_context.
    Used by sync_wrappers.py for fallback image URL recovery.
    """
    try:
        db = get_firestore_client()
        
        messages_ref = (
            db.collection('sessions')
            .document(session_id)
            .collection('messages')
            .order_by('timestamp', direction=firestore.Query.ASCENDING)
            .limit(limit)
        )
        
        docs = messages_ref.stream()
        
        messages = []
        for doc in docs:
            data = doc.to_dict()
            messages.append({
                'role': data.get('role', 'user'),
                'content': data.get('content', '')
            })
        
        logger.info(f"[Firestore] (sync) Retrieved {len(messages)} messages for session {session_id}")
        return messages
        
    except Exception as e:
        logger.error(f"[Firestore] (sync) Error retrieving messages: {str(e)}", exc_info=True)
        return []


async def ensure_session(session_id: str, user_id: Optional[str] = None) -> None:
    """
    Ensure session document exists in Firestore.
    
    If user_id is provided and the session doesn't exist, it's created with that owner.
    If user_id is None, a guest_ prefix is used.
    
    Args:
        session_id: Session identifier
        user_id: Optional Firebase UID of the owner
    """
    try:
        db = get_firestore_client()
        
        session_ref = db.collection('sessions').document(session_id)
        doc = session_ref.get()
        
        if not doc.exists:
            # Determine owner: use provided user_id or generate guest ID
            owner_id = user_id if user_id else f"guest_{session_id[:8]}"
            
            session_ref.set({
                'sessionId': session_id,
                'userId': owner_id,  # 🆕 Project owner
                'title': 'Nuovo Progetto',  # 🆕 Default title
                'status': 'draft',  # 🆕 Project status (replaces 'active')
                'thumbnailUrl': None,  # 🆕 First uploaded image
                'createdAt': firestore.SERVER_TIMESTAMP,
                'updatedAt': firestore.SERVER_TIMESTAMP,
                'messageCount': 0
            })
            logger.info(f"[Firestore] Created new session {session_id} for user {owner_id}")
        else:
            logger.debug(f"[Firestore] Session {session_id} already exists")
            
    except Exception as e:
        logger.error(f"[Firestore] Error ensuring session: {str(e)}", exc_info=True)
        pass

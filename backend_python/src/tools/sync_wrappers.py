"""
Sync tool wrappers for LangGraph/LangChain integration.
LangChain tools don't support async directly, so we create sync wrappers.
"""

import asyncio
import logging
from typing import Optional
from src.db.leads import save_lead
from src.models.lead import LeadData
from src.api.perplexity import fetch_market_prices
from src.tools.generate_render import generate_render_wrapper
from src.tools.quota import check_quota, increment_quota, QuotaExceededError
from src.tools.quota import check_quota, increment_quota, QuotaExceededError
from src.utils.context import get_current_user_id, get_current_media_metadata  # ✅ Context-based tracking
from src.utils.download import download_image_smart

logger = logging.getLogger(__name__)

def submit_lead_sync(
    name: str,
    email: str,
    phone: str,
    project_details: str,
    session_id: str
) -> str:
    """Sync wrapper for submit_lead tool."""
    logger.info(f"[Tool] 🚀 submit_lead called for session {session_id}")
    try:
        lead_data = LeadData(
            name=name,
            email=email,
            phone=phone,
            project_details=project_details
        )
        
        # Run async function in sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(save_lead(session_id, lead_data))
            logger.info(f"[Tool] ✅ submit_lead success: {result['id']}")
            return f"✅ Lead salvato con successo! ID: {result['id']}"
        finally:
            loop.close()
    except Exception as e:
        logger.error(f"[Tool] ❌ submit_lead failed: {e}")
        return f"❌ Errore nel salvare il lead: {str(e)}"

def get_market_prices_sync(query: str, user_id: str = "default") -> str:
    """Sync wrapper for get_market_prices tool."""
    logger.info(f"[Tool] 🔎 get_market_prices called: {query}")
    effective_user_id = user_id if user_id != "default" else get_current_user_id()
    
    try:
        allowed, remaining, reset_at = check_quota(effective_user_id, "get_market_prices")
        if not allowed:
            logger.warning(f"[Tool] Quota exceeded for user {effective_user_id}")
            reset_time = reset_at.strftime("%H:%M")
            return f"⏳ Hai raggiunto il limite giornaliero. Riprova alle {reset_time}."
    except Exception as e:
        logger.error(f"[Quota] Error checking quota: {e}")

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(fetch_market_prices(query))
            content = result.get("content", "Informazione non disponibile")
            
            try:
                increment_quota(effective_user_id, "get_market_prices")
            except Exception as e:
                logger.error(f"[Quota] Error incrementing quota: {e}")
            
            logger.info("[Tool] ✅ get_market_prices success")
            return content
        finally:
            loop.close()
    except Exception as e:
        logger.error(f"[Tool] ❌ get_market_prices failed: {e}")
        return f"❌ Errore nel recuperare i prezzi: {str(e)}"

# def generate_render_sync(...):
#     """
#     DEPRECATED: Replaced by native async tool in src/graph/agent.py
#     to prevent event loop crashes. Kept for reference only.
#     """
#     raise NotImplementedError("Use async generate_render in agent.py")

# 🆕 New Tool Wrappers (Migration Complete)

def save_quote_sync(user_id: str, image_url: Optional[str], ai_data: dict) -> str:
    """Sync wrapper for save_quote tool."""
    logger.info(f"[Tool] 📝 save_quote called for user {user_id}")
    
    try:
        from src.db.quotes import save_quote_draft
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            quote_id = loop.run_until_complete(
                save_quote_draft(user_id, image_url, ai_data)
            )
            logger.info(f"[Tool] ✅ Quote saved: {quote_id}")
            return f"✅ Preventivo salvato in bozza! ID: {quote_id}"
        finally:
            loop.close()
            
    except Exception as e:
        logger.error(f"[Tool] ❌ save_quote failed: {e}")
        return f"❌ Errore nel salvare il preventivo: {str(e)}"



# ... imports ...
from src.utils.download import download_image_smart

# ... (previous code unchanged) ...

def analyze_room_sync(image_url: str) -> str:
    """Sync wrapper for analyze_room tool."""
    logger.info(f"[Tool]  analyze_room called for {image_url}")
    
    try:
        from src.vision.analyze import analyze_room_structure
        from src.vision.triage import analyze_media_triage
        import json
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            # 1. Download
            async def download_and_analyze():
                media_bytes, content_type = await download_image_smart(image_url)
                
                logger.info(f"[Tool] Detected MIME type: {content_type}")
                
                # Check for Video
                if content_type and content_type.startswith("video/"):
                    # Retrieve metadata (Trim Range)
                    all_metadata = get_current_media_metadata()
                    media_meta = None
                    if all_metadata:
                         # Try exacting match first
                         media_meta = all_metadata.get(image_url)
                         if not media_meta:
                             # Try matching by filename if signed URL differs
                             # (Simple heuristic)
                             for k, v in all_metadata.items():
                                 if k in image_url or image_url in k:
                                     media_meta = v
                                     break
                    
                    if media_meta:
                        logger.info(f"[Tool] Found metadata for video: {media_meta}")
                    
                    # Call Video Triage
                    result = await analyze_media_triage(media_bytes, content_type, metadata=media_meta)
                    return json.dumps(result, indent=2)

                # 2. Analyze (Image)
                analysis = await analyze_room_structure(media_bytes)
                return analysis.model_dump_json(indent=2)

            result_json = loop.run_until_complete(download_and_analyze())
            
            logger.info(f"[Tool] ✅ analyze_room success")
            return result_json
            
        finally:
            loop.close()
            
    except Exception as e:
        logger.error(f"[Tool] ❌ analyze_room failed: {e}")
        return f"❌ Errore nell'analisi della stanza: {str(e)}"

def plan_renovation_sync(image_url: str, style: str, keep_elements: list = None) -> str:
    """Sync wrapper for plan_renovation tool (Architect)."""
    logger.info(f"[Tool] 🏛️ plan_renovation called for style {style}")
    
    try:
        from src.vision.architect import generate_architectural_prompt
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            # 1. Download
            async def download_and_plan():
                image_bytes, mime_type = await download_image_smart(image_url)
                
                # 2. Plan
                return await generate_architectural_prompt(image_bytes, style, keep_elements, user_instructions="")

            plan = loop.run_until_complete(download_and_plan())
            
            # Format output as friendly markdown
            return f"""
# 🏛️ Piano di Ristrutturazione ({style})

**Scheletro:** {plan.structural_skeleton[:100]}...
**Materiali:** {plan.material_plan[:100]}...
**Arredo:** {plan.furnishing_strategy[:100]}...

(Usa `generate_render` per visualizzarlo!)
"""
            
        finally:
            loop.close()
            
    except Exception as e:
        logger.error(f"[Tool] ❌ plan_renovation failed: {e}")
        return f"❌ Errore nel piano architettonico: {str(e)}"


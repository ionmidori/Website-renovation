import asyncio
import os
import sys
import logging
from dotenv import load_dotenv

# Load env
load_dotenv()

# Ensure we can import from src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.db.firebase_client import get_async_firestore_client
from src.db.projects import _delete_collection_batch

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def cleanup_zombie_projects():
    logger.info("🧟 Starting cleanup of zombie 'projects' documents...")
    
    db = get_async_firestore_client()
    
    # 1. Scan 'projects' collection
    projects_ref = db.collection("projects")
    projects_stream = projects_ref.stream()
    
    zombies_found = 0
    total_scanned = 0
    
    async for proj_doc in projects_stream:
        total_scanned += 1
        session_id = proj_doc.id
        
        # 2. Check if corresponding 'sessions' doc exists
        session_ref = db.collection("sessions").document(session_id)
        session_doc = await session_ref.get()
        
        if not session_doc.exists:
            # IT IS A ZOMBIE
            zombies_found += 1
            logger.warning(f"🧟 Zombie Project Found: {session_id} (No matching Session)")
            
            # 3. Deep Delete the Zombie
            # Delete 'files' subcollection first
            files_ref = proj_doc.reference.collection("files")
            await _delete_collection_batch(db, files_ref)
            
            # Delete the project doc
            await proj_doc.reference.delete()
            logger.info(f"   💀 Killed Zombie: {session_id}")
            
    summary = f"""
    🎉 Zombie Cleanup Complete!
    -----------------------------------
    Total Projects Scanned:    {total_scanned}
    Zombies Killed:            {zombies_found}
    -----------------------------------
    """
    logger.info(summary)

if __name__ == "__main__":
    asyncio.run(cleanup_zombie_projects())

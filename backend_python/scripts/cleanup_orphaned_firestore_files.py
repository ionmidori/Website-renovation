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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def cleanup_orphaned_firestore_files():
    logger.info("🧹 Starting cleanup of orphaned Firestore 'files' documents...")
    
    db = get_async_firestore_client()
    
    # 1. Get all documents in 'files' collection group
    # Note: Scanning ALL files in the database. 
    # If the DB is huge, this should be partitioned, but for now strict scanning is fine.
    logger.info("🔍 Scanning all 'files' collections...")
    
    files_query = db.collection_group("files")
    # Stream all docs
    files_stream = files_query.stream()
    
    orphans_found = 0
    total_scanned = 0
    deleted_count = 0
    
    # Cache valid project IDs to avoid repetitive lookups
    valid_project_ids = set()
    invalid_project_ids = set()
    
    async for file_doc in files_stream:
        total_scanned += 1
        
        # Parent path: sessions/{session_id}/files/{file_id}
        # Parent of doc is 'files' collection. Parent of 'files' collection is 'sessions/{session_id}' doc.
        # file_doc.reference.parent -> CollectionReference
        # file_doc.reference.parent.parent -> DocumentReference (The Session/Project)
        
        project_ref = file_doc.reference.parent.parent
        
        if not project_ref:
            # Should not happen for a subcollection, but safety check
            logger.warning(f"⚠️ File {file_doc.id} has no grandparent (Project). Path: {file_doc.reference.path}")
            continue
            
        project_id = project_ref.id
        
        # Check cache first
        is_valid = False
        if project_id in valid_project_ids:
            is_valid = True
        elif project_id in invalid_project_ids:
            is_valid = False
        else:
            # Check DB
            project_snap = await project_ref.get()
            if project_snap.exists:
                valid_project_ids.add(project_id)
                is_valid = True
            else:
                invalid_project_ids.add(project_id)
                is_valid = False
        
        if not is_valid:
            # IT IS AN ORPHAN
            orphans_found += 1
            logger.warning(f"⚠️ Found Orphan File Metadata: {file_doc.id} (Project {project_id} missing)")
            
            try:
                await file_doc.reference.delete()
                deleted_count += 1
                logger.info(f"   🗑️ Deleted orphan: {file_doc.id}")
            except Exception as e:
                logger.error(f"   ❌ Failed or delete {file_doc.id}: {e}")

    summary = f"""
    🎉 Firestore Metadata Cleanup Complete!
    -----------------------------------
    Total Files Scanned:       {total_scanned}
    Orphaned Docs Found:       {orphans_found}
    Orphaned Docs Deleted:     {deleted_count}
    -----------------------------------
    """
    logger.info(summary)

if __name__ == "__main__":
    asyncio.run(cleanup_orphaned_firestore_files())

import asyncio
import os
import sys
import logging
import re
from typing import Set
from dotenv import load_dotenv

# Load env
load_dotenv()

# Ensure we can import from src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.db.firebase_client import get_async_firestore_client, get_storage_client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def cleanup_orphaned_files():
    logger.info("🧹 Starting cleanup of orphaned files...")
    
    db = get_async_firestore_client()
    bucket = get_storage_client()
    
    # 1. Discover all Session IDs in Storage
    logger.info("🔍 Scanning Storage for 'user-uploads/'...")
    blobs = list(bucket.list_blobs(prefix="user-uploads/"))
    
    storage_session_ids: Set[str] = set()
    session_blobs = {} # Map session_id -> list of blobs
    
    # Regex to extract session_id from "user-uploads/{session_id}/..."
    # UUID pattern roughly or just the next segment
    pattern = re.compile(r"user-uploads/([^/]+)/")
    
    for blob in blobs:
        match = pattern.match(blob.name)
        if match:
            sid = match.group(1)
            storage_session_ids.add(sid)
            if sid not in session_blobs:
                session_blobs[sid] = []
            session_blobs[sid].append(blob)
            
    logger.info(f"found {len(storage_session_ids)} unique session folders in Storage.")
    
    if not storage_session_ids:
        logger.info("✅ No user uploads found.")
        return

    # 2. Check each ID against Firestore
    logger.info("🕵️ Checking existence in Firestore...")
    
    deleted_sessions_count = 0
    reclaimed_space = 0
    blobs_deleted = 0
    
    # Process in chunks to avoid blowing up memory if huge (unlikely but good practice)
    # We can inspect them individually.
    
    # "sessions" is the collection
    sessions_ref = db.collection("sessions")
    
    for sid in storage_session_ids:
        # Check if doc exists
        # Note: In async firestore, get() is async
        doc_ref = sessions_ref.document(sid)
        doc = await doc_ref.get()
        
        if not doc.exists:
            logger.warning(f"⚠️ ORPHAN DETECTED: Session {sid} does not exist in Firestore!")
            
            # 3. Delete Blobs
            blobs_to_delete = session_blobs[sid]
            blob_count = len(blobs_to_delete)
            size_bytes = sum(b.size for b in blobs_to_delete if b.size)
            
            logger.info(f"   🗑️ Deleting {blob_count} blobs ({size_bytes/1024:.2f} KB)...")
            
            try:
                # Batch delete if possible, or iterating
                # bucket.delete_blobs(blobs_to_delete) is efficient
                bucket.delete_blobs(blobs_to_delete)
                
                blobs_deleted += blob_count
                reclaimed_space += size_bytes
                deleted_sessions_count += 1
                logger.info("   ✅ Deleted.")
            except Exception as e:
                logger.error(f"   ❌ Failed to delete blobs for {sid}: {e}")
            # logger.debug(f"✅ Session {sid} exists.")

    # ----------------------------------------------------------------------
    # 2. Scanning Frontend Uploads Path: projects/{session_id}/uploads/
    # ----------------------------------------------------------------------
    logger.info("🔍 Scanning Storage for 'projects/' (Frontend uploads)...")
    blobs_projects = list(bucket.list_blobs(prefix="projects/"))
    
    project_session_ids: Set[str] = set()
    project_blobs = {} 
    
    # Pattern: projects/{session_id}/uploads/...
    pattern_proj = re.compile(r"projects/([^/]+)/uploads/")
    
    for blob in blobs_projects:
        match = pattern_proj.match(blob.name)
        if match:
            sid = match.group(1)
            project_session_ids.add(sid)
            if sid not in project_blobs:
                project_blobs[sid] = []
            project_blobs[sid].append(blob)

    logger.info(f"found {len(project_session_ids)} unique project folders in Storage path 'projects/'.")

    for sid in project_session_ids:
        # Check against 'sessions' collection (Source of Truth)
        doc_ref = sessions_ref.document(sid)
        doc = await doc_ref.get()
        
        if not doc.exists:
            logger.warning(f"⚠️ ORPHAN DETECTED (Frontend Path): Session {sid} missing in Firestore!")
            blobs_to_delete = project_blobs[sid]
            blob_count = len(blobs_to_delete)
            size_bytes = sum(b.size for b in blobs_to_delete if b.size)
            
            logger.info(f"   🗑️ Deleting {blob_count} blobs ({size_bytes/1024:.2f} KB)...")
            try:
                bucket.delete_blobs(blobs_to_delete)
                blobs_deleted += blob_count
                reclaimed_space += size_bytes
                deleted_sessions_count += 1
                logger.info("   ✅ Deleted.")
            except Exception as e:
                logger.error(f"   ❌ Failed to delete blobs for {sid}: {e}")
        else:
            pass
            # valid

    # Report
    summary = f"""
    🎉 Cleanup Complete!
    -----------------------------------
    Orphaned Sessions Removed: {deleted_sessions_count}
    Total Blobs Deleted:       {blobs_deleted}
    Total Space Reclaimed:     {reclaimed_space / 1024 / 1024:.2f} MB
    -----------------------------------
    """
    logger.info(summary)

if __name__ == "__main__":
    asyncio.run(cleanup_orphaned_files())

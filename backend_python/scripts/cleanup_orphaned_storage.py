import asyncio
import os
import sys
import logging

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from src.db.firebase_client import get_async_firestore_client, get_storage_client
from google.cloud import storage

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def cleanup_orphaned_files():
    """
    Scans Storage folders (renders/, documents/, user-uploads/) and deletes
    those that do not have a corresponding Firestore session document.
    """
    print("👻 Ghostbusters: Starting Cleanup of Orphaned Files...")
    
    db = get_async_firestore_client()
    bucket = get_storage_client()
    
    # 1. Get all valid session IDs
    print("📚 Fetching valid sessions from Firestore...")
    valid_sessions = set()
    docs = db.collection("sessions").stream()
    async for doc in docs:
        valid_sessions.add(doc.id)
    
    print(f"✅ Found {len(valid_sessions)} valid projects.")
    
    PREFIXES_TO_SCAN = ["renders/", "documents/", "user-uploads/", "projects/"]
    
    total_deleted = 0
    
    for prefix in PREFIXES_TO_SCAN:
        print(f"\n🔍 Scanning prefix: {prefix} ...")
        
        # List blobs with delimiter to find "folders" (session_ids)
        # Note: GCS doesn't have real folders. We simulate by listing with delimiter.
        # But 'list_blobs' with delimiter returns 'prefixes' (subdirectories).
        
        iterator = bucket.list_blobs(prefix=prefix, delimiter="/")
        # We need to iterate to populate .prefixes
        list(iterator) 
        
        sub_folders = iterator.prefixes
        
        print(f"   Found {len(sub_folders)} folders in {prefix}")
        
        for folder in sub_folders:
            # folder is like 'renders/session_id/'
            # Extract session_id
            parts = folder.strip("/").split("/")
            if len(parts) < 2:
                continue
            
            session_id = parts[1] # 'renders' -> [0], 'session_id' -> [1]
            
            if session_id not in valid_sessions:
                print(f"   ❌ ORPHAN FOUND: {session_id} (in {prefix})")
                
                # Delete all blobs in this folder
                blobs = list(bucket.list_blobs(prefix=folder))
                if blobs:
                    print(f"      🗑️ Deleting {len(blobs)} files...")
                    bucket.delete_blobs(blobs)
                    total_deleted += len(blobs)
                else:
                    print("      Empty folder.")
            else:
                # print(f"   ✅ Valid: {session_id}")
                pass

    print(f"\n🎉 Cleanup Complete! Deleted {total_deleted} orphaned files.")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(cleanup_orphaned_files())

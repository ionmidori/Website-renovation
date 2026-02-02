import asyncio
import os
import sys
import logging
from dotenv import load_dotenv

# Load env before imports that might rely on env
load_dotenv()

# Ensure we can import from src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.db.projects import delete_project, create_project, PROJECTS_COLLECTION
from src.db.firebase_client import get_async_firestore_client, get_storage_client
from src.models.project import ProjectCreate

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_deep_delete():
    user_id = "test_user_delete_ops"
    
    # 1. Create Dummy Project
    logger.info("--- Creating Dummy Project ---")
    session_id = await create_project(user_id, ProjectCreate(title="Deep Delete Test"))
    logger.info(f"Created project: {session_id}")
    
    db = get_async_firestore_client()
    bucket = get_storage_client()
    
    # 2. Add Dummy Subcollection Data
    logger.info("--- Adding Dummy Subcollections ---")
    doc_ref = db.collection(PROJECTS_COLLECTION).document(session_id)
    
    # Add messages
    await doc_ref.collection("messages").add({"text": "test message 1", "role": "user"})
    await doc_ref.collection("messages").add({"text": "test message 2", "role": "assistant"})
    
    # Add files metadata
    await doc_ref.collection("files").add({"name": "test_image.jpg", "type": "image"})
    
    # 3. Add Dummy Storage Blob
    logger.info("--- Adding Dummy Storage Blob ---")
    blob_path = f"user-uploads/{session_id}/test_image.txt"
    blob = bucket.blob(blob_path)
    blob.upload_from_string("dummy content")
    logger.info(f"Uploaded blob: {blob_path}")
    
    # Verify existence before delete
    assert blob.exists()
    
    # 4. Perform Deep Delete
    logger.info("--- Executing Deep Delete ---")
    success = await delete_project(session_id, user_id)
    
    if success:
        logger.info("✅ delete_project returned True")
    else:
        logger.error("❌ delete_project returned False")
        return

    # 5. Verify Cleanup
    logger.info("--- Verifying Cleanup ---")
    
    # Check Doc
    doc = await doc_ref.get()
    if not doc.exists:
        logger.info("✅ Project Document deleted")
    else:
        logger.error("❌ Project Document STILL EXISTS")
        
    # Check Messages
    msgs = await doc_ref.collection("messages").get()
    if len(msgs) == 0:
        logger.info("✅ Messages subcollection empty")
    else:
        logger.error(f"❌ Messages subcollection has {len(msgs)} docs")

    # Check Files
    files = await doc_ref.collection("files").get()
    if len(files) == 0:
        logger.info("✅ Files subcollection empty")
    else:
        logger.error(f"❌ Files subcollection has {len(files)} docs")
        
    # Check Blob
    blob_check = bucket.blob(blob_path)
    if not blob_check.exists():
         logger.info("✅ Storage Blob deleted")
    else:
         logger.error("❌ Storage Blob STILL EXISTS")

if __name__ == "__main__":
    asyncio.run(test_deep_delete())

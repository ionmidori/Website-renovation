import asyncio
import os
import sys
import json
from datetime import datetime

# Add src to path
sys.path.append(os.getcwd())

from src.db.firebase_client import get_async_firestore_client

async def main():
    db = get_async_firestore_client()
    
    print("Dumping last 20 sessions (all fields)...")
    try:
        docs = db.collection("sessions").order_by("createdAt", direction="DESCENDING").limit(20).stream()
        
        async for doc in docs:
            data = doc.to_dict()
            # Convert datetimes for JSON printing
            for k, v in data.items():
                if isinstance(v, datetime):
                    data[k] = v.isoformat()
            
            print(f"\nDOCUMENT ID: {doc.id}")
            print(json.dumps(data, indent=2))
            print("-" * 50)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())

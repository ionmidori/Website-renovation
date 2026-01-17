from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from src.auth.jwt_handler import verify_token
from src.utils.stream_protocol import stream_text
import asyncio

app = FastAPI(title="SYD Brain 🧠", version="0.1.0")

class ChatRequest(BaseModel):
    messages: list[dict]
    session_id: str

@app.get("/health")
def health_check():
    """Health check endpoint for Cloud Run."""
    return {"status": "ok", "service": "syd-brain"}

async def chat_stream_generator(request: ChatRequest, user_email: str):
    """Simulates streaming chat response using Vercel AI SDK protocol."""
    # Simulate a streaming response (will be replaced with real AI logic)
    message = f"Hello {user_email}! This is a streaming test from Python backend. "
    
    for word in message.split():
        async for chunk in stream_text(word + " "):
            yield chunk
        await asyncio.sleep(0.1)  # Simulate processing delay

@app.post("/chat/stream")
async def chat_stream(request: ChatRequest, user_payload: dict = Depends(verify_token)):
    """Streaming chat endpoint - Secured by Internal JWT."""
    user_email = user_payload.get("email", "unknown")
    
    return StreamingResponse(
        chat_stream_generator(request, user_email),
        media_type="text/plain; charset=utf-8",
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)

import json
from typing import AsyncGenerator, Any

async def stream_text(text: str) -> AsyncGenerator[str, None]:
    """
    Formats text chunks according to the Vercel AI SDK Data Stream Protocol.
    Format: 0:"<text_chunk>"\n
    """
    # Simply wrap the text in the protocol format
    yield f'0:{json.dumps(text)}\n'

async def stream_data(data: Any) -> AsyncGenerator[str, None]:
    """
    Formats arbitrary data chunks (tools, metadata) for Vercel AI SDK.
    Format: 2:[<json_data>]\n
    """
    yield f'2:{json.dumps([data])}\n'

async def stream_error(error: str) -> AsyncGenerator[str, None]:
    """
    Formats error messages for the client.
    Format: 3:"<error_message>"\n
    """
    yield f'3:{json.dumps(error)}\n'

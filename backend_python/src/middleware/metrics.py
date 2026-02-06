"""
Metrics Middleware for Performance Monitoring

Tracks request metrics and logs them in JSON format for observability.
Integrates with the existing Request ID system for request correlation.
"""

import time
import logging
from fastapi import Request
from src.core.context import get_request_id
from src.core.logger import get_logger

logger = get_logger(__name__)


async def metrics_middleware(request: Request, call_next):
    """
    Middleware to track request metrics and log performance data.
    
    Args:
        request: FastAPI Request object
        call_next: Next middleware/handler in the chain
        
    Returns:
        Response object with added metrics
    """
    start_time = time.time()
    
    # Process request
    response = await call_next(request)
    
    # Calculate duration
    duration_ms = (time.time() - start_time) * 1000
    
    # Extract upload-specific metrics if present
    extra_metrics = {}
    if "/upload/" in request.url.path:
        # These will be set by upload handlers via response headers
        if "X-Upload-File-Size" in response.headers:
            extra_metrics["file_size_bytes"] = int(response.headers["X-Upload-File-Size"])
        if "X-Upload-Mime-Type" in response.headers:
            extra_metrics["mime_type"] = response.headers["X-Upload-Mime-Type"]
    
    # Log metrics with structured data
    logger.info(
        "request_completed",
        extra={
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": round(duration_ms, 2),
            "request_id": get_request_id(),
            "client_host": request.client.host if request.client else "unknown",
            **extra_metrics
        }
    )
    
    # Add duration header for client debugging
    response.headers["X-Response-Time"] = f"{round(duration_ms, 2)}ms"
    
    return response

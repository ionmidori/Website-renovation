"""
Video Upload Handler using Google AI File API.

This module provides endpoints for uploading videos to Google's File API
for native multimodal processing with Gemini models.
"""
import logging
import io
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from src.auth.jwt_handler import verify_token
from src.schemas.internal import UserSession
from src.services.media_processor import MediaProcessor, get_media_processor, VideoProcessingError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/upload", tags=["upload"])


class UploadResponse(BaseModel):
    """Response model for file upload."""
    file_uri: str
    mime_type: str
    display_name: str
    state: str
    size_bytes: int


@router.post("/video", response_model=UploadResponse)
async def upload_video(
    file: UploadFile = File(...),
    user_session: UserSession = Depends(verify_token),
    processor: MediaProcessor = Depends(get_media_processor) # ✅ Dependency Injection
) -> UploadResponse:
    """
    Upload a video file to Google AI File API for native processing.
    
    Args:
        file: Video file (mp4, webm, mov, avi)
        user_session: JWT verified user session
        processor: Injected MediaProcessor service
        
    Returns:
        UploadResponse with file URI and metadata
        
    Raises:
        HTTPException: If upload fails or file type is invalid
    """
    try:
        # 🛡️ RATE LIMITING CHECK
        user_id = user_session.uid
        
        from src.tools.quota import check_quota, increment_quota
        allowed, remaining, reset_at = check_quota(user_id, "upload_video")
        
        if not allowed:
            reset_time = reset_at.strftime("%H:%M")
            raise HTTPException(
                status_code=429,
                detail=f"⏳ Upload limit reached (1 video/day). Resets at {reset_time}."
            )
        
        try:
            # 🛡️ SECURITY: Magic Bytes Validation
            from src.utils.security import validate_video_magic_bytes, sanitize_filename
            
            detected_mime = await validate_video_magic_bytes(file)
            logger.info(f"🛡️ Magic Bytes check passed: {detected_mime}")
            
            safe_filename = await sanitize_filename(file.filename or "upload.mp4")
            logger.info(f"📹 User {user_id} uploading video: {safe_filename} ({file.content_type})")
            
            content = await file.read()
            file_size = len(content)
            
            MAX_SIZE = 100 * 1024 * 1024  # 100MB
            if file_size > MAX_SIZE:
                raise HTTPException(
                    status_code=413,
                    detail=f"File too large: {file_size / 1024 / 1024:.2f}MB. Maximum size is 100MB."
                )
            
            # Prepare stream for service
            file_stream = io.BytesIO(content)
            
            # 🚀 DELEGATE TO SERVICE
            uploaded_file = await processor.upload_video_for_analysis(
                file_stream=file_stream,
                mime_type=file.content_type,
                display_name=safe_filename
            )
            
            # Wait for processing (Polling)
            active_file = await processor.wait_for_processing(uploaded_file.name)
            
            # ✅ INCREMENT QUOTA (Only on success)
            increment_quota(user_id, "upload_video")
            
            return UploadResponse(
                file_uri=active_file.uri,
                mime_type=active_file.mime_type,
                display_name=active_file.display_name,
                state=active_file.state.name,
                size_bytes=file_size
            )
            
        except VideoProcessingError as e:
            logger.error(f"❌ Video processing error: {str(e)}")
            raise HTTPException(
                status_code=502, # Bad Gateway (Upstream error)
                detail=str(e)
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Video upload handler failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )

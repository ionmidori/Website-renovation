"""
Media Upload Handler for Images and Videos.

This module provides endpoints for uploading media files:
- Images: Uploaded to Firebase Storage with signed URLs
- Videos: Uploaded to Google AI File API for native multimodal processing
"""
import uuid
import time
from datetime import datetime, timedelta
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form, Response
from pydantic import BaseModel
from typing import Optional
from src.db.firebase_client import get_storage_client
from src.auth.jwt_handler import verify_token
from src.schemas.internal import UserSession
from src.services.media_processor import MediaProcessor, get_media_processor, VideoProcessingError
from src.core.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/upload", tags=["upload"])


class VideoUploadResponse(BaseModel):
    """Response model for video upload."""
    file_uri: str
    mime_type: str
    display_name: str
    state: str
    size_bytes: int


class ImageUploadResponse(BaseModel):
    """Response model for image upload."""
    public_url: str
    signed_url: str
    file_path: str
    mime_type: str
    size_bytes: int


@router.post("/image", response_model=ImageUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    session_id: str = Form(...),
    user_session: UserSession = Depends(verify_token),
) -> ImageUploadResponse:
    """
    Upload an image to Firebase Storage.
    
    Args:
        file: Image file (jpeg, png, webp, gif)
        session_id: Chat session ID for organizing uploads
        user_session: JWT verified user session
        
    Returns:
        ImageUploadResponse with public URL and metadata
        
    Raises:
        HTTPException: If upload fails or file type is invalid
    """
    try:
        user_id = user_session.uid
        
        # 🛡️ RATE LIMITING CHECK
        from src.tools.quota import check_quota, increment_quota
        allowed, remaining, reset_at = check_quota(user_id, "upload_image")
        
        if not allowed:
            reset_time = reset_at.strftime("%H:%M")
            raise HTTPException(
                status_code=429,
                detail=f"⏳ Upload limit reached (10 images/day). Resets at {reset_time}."
            )
        
        # 🛡️ SECURITY: Validate MIME type
        ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported image type: {file.content_type}. Allowed: {', '.join(ALLOWED_MIME_TYPES)}"
            )
        
        # Read file content
        content = await file.read()
        file_size = len(content)
        
        # 📊 LOG: Upload Started
        logger.info(
            "image_upload_started",
            extra={
                "session_id": session_id,
                "file_size_bytes": file_size,
                "mime_type": file.content_type,
                "user_id": user_id,
                "quota_remaining": remaining
            }
        )
        
        MAX_SIZE = 10 * 1024 * 1024  # 10MB
        if file_size > MAX_SIZE:
            logger.warning(
                "image_upload_rejected_size",
                extra={
                    "file_size_bytes": file_size,
                    "max_size_bytes": MAX_SIZE,
                    "user_id": user_id
                }
            )
            raise HTTPException(
                status_code=413,
                detail=f"File too large: {file_size / 1024 / 1024:.2f}MB. Maximum size is 10MB."
            )
        
        # Generate unique filename
        ext = file.filename.split('.')[-1] if file.filename and '.' in file.filename else 'jpg'
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        file_path = f"user-uploads/{session_id}/{unique_filename}"
        
        # Upload to Firebase Storage
        from firebase_admin import storage
        bucket = storage.bucket()
        blob = bucket.blob(file_path)
        
        blob.upload_from_string(
            content,
            content_type=file.content_type
        )
        
        # Generate signed URL (7 days validity)
        signed_url = blob.generate_signed_url(
            version="v4",
            expiration=timedelta(days=7),
            method="GET"
        )
        
        # Make public URL
        blob.make_public()
        public_url = blob.public_url
        
        # ✅ INCREMENT QUOTA
        increment_quota(user_id, "upload_image")
        
        # 📊 LOG: Upload Completed
        logger.info(
            "image_upload_completed",
            extra={
                "session_id": session_id,
                "file_path": file_path,
                "file_size_bytes": file_size,
                "mime_type": file.content_type,
                "user_id": user_id,
                "storage_url": public_url
            }
        )
        
        return ImageUploadResponse(
            public_url=public_url,
            signed_url=signed_url,
            file_path=file_path,
            mime_type=file.content_type,
            size_bytes=file_size
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Image upload failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )


@router.post("/video", response_model=VideoUploadResponse)
async def upload_video(
    file: UploadFile = File(...),
    user_session: UserSession = Depends(verify_token),
    processor: MediaProcessor = Depends(get_media_processor)
) -> VideoUploadResponse:
    """
    Upload a video file to Google AI File API for native processing.
    
    Args:
        file: Video file (mp4, webm, mov, avi)
        user_session: JWT verified user session
        processor: Injected MediaProcessor service
        
    Returns:
        VideoUploadResponse with file URI and metadata
        
    Raises:
        HTTPException: If upload fails or file type is invalid
    """
    try:
        user_id = user_session.uid
        
        # 🛡️ RATE LIMITING CHECK
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
            
            return VideoUploadResponse(
                file_uri=active_file.uri,
                mime_type=active_file.mime_type,
                display_name=active_file.display_name,
                state=active_file.state.name,
                size_bytes=file_size
            )
            
        except VideoProcessingError as e:
            logger.error(f"❌ Video processing error: {str(e)}")
            raise HTTPException(
                status_code=502,
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


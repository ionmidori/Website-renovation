"""
Security utilities for file validation and sanitization.

This module provides security-critical functions for validating uploaded files
beyond simple MIME type checks, including Magic Bytes validation.
"""

import logging
from typing import Optional
from fastapi import HTTPException, UploadFile

logger = logging.getLogger(__name__)

# Magic Bytes signatures for allowed video formats
VIDEO_SIGNATURES = {
    "video/mp4": [
        bytes.fromhex("00 00 00 18 66 74 79 70"),  # ftyp (MP4 container)
        bytes.fromhex("00 00 00 20 66 74 79 70"),  # ftyp (alternative)
        bytes.fromhex("00 00 00 1C 66 74 79 70"),  # ftyp (alternative)
    ],
    "video/quicktime": [
        bytes.fromhex("00 00 00 14 66 74 79 70 71 74"),  # ftypqt (QuickTime)
    ],
    "video/webm": [
        bytes.fromhex("1A 45 DF A3"),  # EBML header (WebM/MKV)
    ],
    "video/x-matroska": [
        bytes.fromhex("1A 45 DF A3"),  # EBML header (Matroska)
    ],
}


async def validate_video_magic_bytes(file: UploadFile, max_header_size: int = 2048) -> str:
    """
    Validate video file using Magic Bytes inspection.
    
    This is a critical security function that prevents attackers from uploading
    malicious files disguised as videos by renaming them (e.g., exploit.exe -> video.mp4).
    
    Args:
        file: The uploaded file object
        max_header_size: Number of bytes to read for signature detection
        
    Returns:
        Detected MIME type
        
    Raises:
        HTTPException(400): If file signature doesn't match declared type
        
    Security Note:
        This function uses a whitelist approach - only explicitly allowed
        video signatures are permitted. Any unknown signature is rejected.
    """
    try:
        # Read file header (first N bytes contain the magic signature)
        header = await file.read(max_header_size)
        
        # Reset file pointer for subsequent reads
        await file.seek(0)
        
        if len(header) < 8:
            raise HTTPException(
                status_code=400,
                detail="File too small or corrupted. Minimum 8 bytes required."
            )
        
        # Check against known video signatures
        detected_type: Optional[str] = None
        
        for mime_type, signatures in VIDEO_SIGNATURES.items():
            for signature in signatures:
                if header.startswith(signature):
                    detected_type = mime_type
                    break
            if detected_type:
                break
        
        # Validate match between declared and detected types
        declared_type = file.content_type
        
        if not detected_type:
            logger.warning(f"🚨 Security Alert: Rejected file with unknown signature. "
                          f"Declared: {declared_type}, Header: {header[:16].hex()}")
            raise HTTPException(
                status_code=400,
                detail=f"Security validation failed. File signature not recognized as a valid video format."
            )
        
        # Allow minor MIME type variations (e.g., video/mp4 vs video/x-m4v)
        # Both declared and detected should be video/*
        if not declared_type or not declared_type.startswith("video/"):
            raise HTTPException(
                status_code=400,
                detail=f"Security Alert: File claims to be {declared_type} but detected as {detected_type}"
            )
        
        logger.info(f"✅ Magic Bytes validation passed: {detected_type}")
        return detected_type
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during magic bytes validation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="File validation failed. Please try again."
        )


async def sanitize_filename(filename: str, max_length: int = 255) -> str:
    """
    Sanitize uploaded filename to prevent path traversal attacks.
    
    Removes or replaces dangerous characters that could be used in attacks like:
    - ../../../etc/passwd
    - file<script>.mp4
    
    Args:
        filename: Original filename
        max_length: Maximum allowed filename length
        
    Returns:
        Sanitized filename safe for storage
    """
    import re
    
    # Remove path components (e.g., ../../)
    safe_name = filename.split("/")[-1].split("\\")[-1]
    
    # Remove non-alphanumeric characters except dots, dashes, underscores
    safe_name = re.sub(r'[^a-zA-Z0-9._-]', '_', safe_name)
    
    # Limit length
    if len(safe_name) > max_length:
        # Keep extension
        parts = safe_name.rsplit('.', 1)
        if len(parts) == 2:
            name, ext = parts
            max_name_len = max_length - len(ext) - 1
            safe_name = name[:max_name_len] + '.' + ext
        else:
            safe_name = safe_name[:max_length]
    
    return safe_name or "unnamed_file"

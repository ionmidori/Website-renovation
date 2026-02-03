from typing import Optional, Dict, Any

class AppException(Exception):
    """Base class for all application exceptions."""
    status_code: int = 500
    error_code: str = "INTERNAL_ERROR"
    
    def __init__(self, message: str, detail: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.detail = detail

class ResourceNotFound(AppException):
    status_code = 404
    error_code = "RESOURCE_NOT_FOUND"

class AuthError(AppException):
    status_code = 401
    error_code = "AUTH_ERROR"

class PermissionDenied(AppException):
    status_code = 403
    error_code = "PERMISSION_DENIED"

class ServiceError(AppException):
    """Exceptions related to external services (AI, DB, etc.)"""
    status_code = 502
    error_code = "SERVICE_ERROR"
    
class AIServiceError(ServiceError):
    error_code = "AI_GENERATION_FAILED"

class QuotaExceeded(AppException):
    status_code = 429
    error_code = "QUOTA_EXCEEDED"

"""
Redis-based rate limiting for Magic Links.

Provides dual-layer protection:
- Per Email: 3 requests/hour
- Per IP: 10 requests/hour

Graceful Degradation: If Redis is unavailable, rate limiting is bypassed
to prevent blocking legitimate users.
"""

from datetime import timedelta
from typing import Optional
import logging
import os

# Rate limits
EMAIL_LIMIT = 3
EMAIL_WINDOW = timedelta(hours=1)
IP_LIMIT = 10
IP_WINDOW = timedelta(hours=1)

logger = logging.getLogger(__name__)

# Check if Redis is available
REDIS_URL = os.getenv("REDIS_URL", "")
REDIS_AVAILABLE = bool(REDIS_URL)

if REDIS_AVAILABLE:
    import redis.asyncio as redis


class RateLimiter:
    """Redis-backed rate limiter with automatic expiry and graceful degradation."""
    
    def __init__(self):
        self.redis_client = None
        self._connection_failed = False
    
    async def connect(self):
        """Initialize Redis connection."""
        if not REDIS_AVAILABLE:
            logger.warning("⚠️ REDIS_URL not configured - rate limiting disabled")
            self._connection_failed = True
            return
            
        if self._connection_failed:
            return  # Don't retry if already failed
            
        if not self.redis_client:
            try:
                self.redis_client = await redis.from_url(
                    REDIS_URL,
                    encoding="utf-8",
                    decode_responses=True,
                    socket_connect_timeout=2  # Fast fail
                )
                # Test connection
                await self.redis_client.ping()
                logger.info("✅ Redis connected for rate limiting")
            except Exception as e:
                logger.warning(f"⚠️ Redis connection failed - rate limiting disabled: {e}")
                self._connection_failed = True
                self.redis_client = None
    
    async def disconnect(self):
        """Close Redis connection."""
        if self.redis_client:
            await self.redis_client.close()
    
    async def check_and_increment(self, key: str, limit: int, window: timedelta) -> bool:
        """
        Check if request is within rate limit and increment counter.
        
        Args:
            key: Redis key (e.g., "ratelimit:email:user@example.com")
            limit: Max requests allowed
            window: Time window for the limit
            
        Returns:
            True if request is allowed, False if rate limit exceeded
        """
        if not self.redis_client and not self._connection_failed:
            await self.connect()
        
        # Graceful degradation: allow all requests if Redis unavailable
        if self._connection_failed or not self.redis_client:
            return True
        
        try:
            # Get current count
            current = await self.redis_client.get(key)
            
            if current is None:
                # First request - initialize counter
                await self.redis_client.setex(
                    key,
                    int(window.total_seconds()),
                    1
                )
                return True
            
            current_count = int(current)
            
            if current_count >= limit:
                return False  # Rate limit exceeded
            
            # Increment counter
            await self.redis_client.incr(key)
            return True
        except Exception as e:
            logger.error(f"Redis error during rate check: {e}")
            return True  # Allow on error
    
    async def check_email_limit(self, email: str) -> bool:
        """Check if email is within rate limit."""
        key = f"ratelimit:email:{email.lower()}"
        return await self.check_and_increment(key, EMAIL_LIMIT, EMAIL_WINDOW)
    
    async def check_ip_limit(self, ip_address: str) -> bool:
        """Check if IP is within rate limit."""
        key = f"ratelimit:ip:{ip_address}"
        return await self.check_and_increment(key, IP_LIMIT, IP_WINDOW)


# Global instance
rate_limiter = RateLimiter()

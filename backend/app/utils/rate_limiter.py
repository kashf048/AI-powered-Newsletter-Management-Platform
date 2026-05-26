import time
import logging
from collections import defaultdict
from fastapi import Request, HTTPException, status

logger = logging.getLogger(__name__)

# Cleanup old entries every N requests to prevent unbounded memory growth
_CLEANUP_INTERVAL = 500


class RateLimiter:
    """
    In-process sliding-window rate limiter per client IP.

    NOTE: This implementation is suitable for single-process deployments.
    For multi-process/multi-instance deployments, use a Redis-backed
    rate limiter (e.g., slowapi with Redis storage).

    Also handles X-Forwarded-For for reverse proxy awareness — only
    enable trusted_proxy=True when you trust your load balancer/proxy.
    """

    def __init__(
        self,
        max_requests: int = 5,
        duration_seconds: int = 60,
        custom_message: str = "",
        trusted_proxy: bool = False,
    ):
        self.max_requests = max_requests
        self.duration_seconds = duration_seconds
        self.message = custom_message or "Too many requests. Please try again later."
        self.trusted_proxy = trusted_proxy
        self._history: dict[str, list[float]] = defaultdict(list)
        self._request_count = 0

    def _get_client_ip(self, request: Request) -> str:
        if self.trusted_proxy:
            forwarded_for = request.headers.get("X-Forwarded-For")
            if forwarded_for:
                # Take the leftmost IP (original client)
                return forwarded_for.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _cleanup(self, current_time: float) -> None:
        """Remove expired entries to prevent memory growth."""
        cutoff = current_time - self.duration_seconds
        expired_ips = [
            ip for ip, timestamps in self._history.items()
            if not timestamps or timestamps[-1] < cutoff
        ]
        for ip in expired_ips:
            del self._history[ip]

    def __call__(self, request: Request) -> None:
        client_ip = self._get_client_ip(request)
        current_time = time.time()

        # Periodic cleanup to prevent memory leak
        self._request_count += 1
        if self._request_count % _CLEANUP_INTERVAL == 0:
            self._cleanup(current_time)

        # Slide the window — remove timestamps older than duration
        cutoff = current_time - self.duration_seconds
        self._history[client_ip] = [
            t for t in self._history[client_ip] if t > cutoff
        ]

        if len(self._history[client_ip]) >= self.max_requests:
            logger.warning(
                "Rate limit exceeded for IP %s on %s",
                client_ip,
                request.url.path,
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=self.message,
                headers={"Retry-After": str(self.duration_seconds)},
            )

        self._history[client_ip].append(current_time)


# Pre-configured rate limiter instances
rate_limit = RateLimiter(
    max_requests=10,
    duration_seconds=60,
    custom_message="Too many requests. Please try again in a minute.",
)
login_rate_limit = RateLimiter(
    max_requests=5,
    duration_seconds=60,
    custom_message="Too many login attempts. Please try again in a minute.",
)
password_reset_rate_limit = RateLimiter(
    max_requests=3,
    duration_seconds=300,
    custom_message="Too many password reset requests. Please wait 5 minutes before trying again.",
)

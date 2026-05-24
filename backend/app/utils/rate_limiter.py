import time
from collections import defaultdict
from fastapi import Request, HTTPException, status

# Simple in-memory rate limiter: max 5 requests per 60 seconds per IP for public routes
RATE_LIMIT_DURATION = 60  # seconds
RATE_LIMIT_MAX_REQUESTS = 5

# key: client IP, value: list of timestamps of recent requests
request_history = defaultdict(list)

def rate_limit(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    current_time = time.time()
    
    # Filter out requests that are older than the rate limit window
    request_history[client_ip] = [
        t for t in request_history[client_ip]
        if current_time - t < RATE_LIMIT_DURATION
    ]
    
    if len(request_history[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again in a minute."
        )
        
    request_history[client_ip].append(current_time)

import datetime
import logging
from typing import Dict, Any, Optional
from jose import jwt, JWTError
import bcrypt
from backend.app.config import settings

logger = logging.getLogger(__name__)

# JWT token lifetime constants
ACCESS_TOKEN_EXPIRE_DAYS = 7


def utcnow() -> datetime.datetime:
    """Return current UTC time as a naive datetime (stored as UTC in the DB)."""
    return datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)


def create_jwt_token(
    data: Dict[str, Any],
    expires_delta: Optional[datetime.timedelta] = None
) -> str:
    """Create a signed JWT token with a 7-day expiry by default."""
    to_encode = data.copy()
    expire = utcnow() + (expires_delta or datetime.timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm="HS256")


def decode_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT token. Returns None on any error."""
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    except JWTError:
        return None
    except Exception:
        logger.warning("Unexpected error decoding JWT token", exc_info=True)
        return None


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against its bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def validate_password_strength(password: str) -> None:
    """Enforce password complexity requirements.

    Raises ValueError with a descriptive message if requirements are not met.
    """
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if not any(c.isupper() for c in password):
        raise ValueError("Password must contain at least one uppercase letter")
    if not any(c.islower() for c in password):
        raise ValueError("Password must contain at least one lowercase letter")
    if not any(c.isdigit() for c in password):
        raise ValueError("Password must contain at least one digit")
    special_chars = "!@#$%^&*(),.?\":{}|<>"
    if not any(c in special_chars for c in password):
        raise ValueError("Password must contain at least one special character")

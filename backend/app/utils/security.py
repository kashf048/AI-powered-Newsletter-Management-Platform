import datetime
from typing import Dict, Any, Optional
from jose import jwt
from backend.app.config import settings

def create_jwt_token(data: Dict[str, Any], expires_delta: Optional[datetime.timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(days=365) # Matching ONE_YEAR_MS from shared/const.ts
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm="HS256")
    return encoded_jwt

def decode_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        decoded_payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        return decoded_payload
    except Exception:
        return None

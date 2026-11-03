import hashlib
import hmac
import json
import secrets
import time
from typing import Any

import bcrypt
from fastapi import HTTPException, Request, Response, status

from .config import SESSION_SECRET, settings
from .database import db_session

COOKIE_NAME = "dashboard_session"
CSRF_COOKIE_NAME = "dashboard_csrf"
MAX_FAILED_ATTEMPTS = 8
LOCKOUT_SECONDS = 15 * 60
SESSION_MAX_AGE = settings.session_days * 24 * 60 * 60


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


def _sign(payload: str) -> str:
    return hmac.new(SESSION_SECRET.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()


def create_session_token(username: str) -> str:
    data = {
        "u": username,
        "iat": int(time.time()),
        "exp": int(time.time()) + SESSION_MAX_AGE,
        "n": secrets.token_hex(8),
    }
    payload = json.dumps(data, separators=(",", ":"))
    encoded = payload.encode("utf-8").hex()
    return f"{encoded}.{_sign(encoded)}"


def decode_session_token(token: str) -> dict[str, Any] | None:
    try:
        encoded, signature = token.split(".", 1)
    except ValueError:
        return None
    if not hmac.compare_digest(_sign(encoded), signature):
        return None
    try:
        payload = json.loads(bytes.fromhex(encoded).decode("utf-8"))
    except (ValueError, json.JSONDecodeError):
        return None
    if int(payload.get("exp", 0)) < int(time.time()):
        return None
    return payload


def client_ip(request: Request) -> str:
    if settings.trust_proxy:
        forwarded = request.headers.get("x-forwarded-for", "")
        if forwarded:
            return forwarded.split(",")[0].strip()[:64]
    return request.client.host if request.client else "unknown"


def too_many_attempts(ip: str) -> bool:
    with db_session() as conn:
        row = conn.execute(
            """
            SELECT COUNT(*) AS failed
            FROM login_attempts
            WHERE ip = ?
              AND success = 0
              AND attempted_at >= datetime('now', ?)
            """,
            (ip, f"-{LOCKOUT_SECONDS} seconds"),
        ).fetchone()
        return bool(row and row["failed"] >= MAX_FAILED_ATTEMPTS)


def record_attempt(ip: str, success: bool) -> None:
    with db_session() as conn:
        conn.execute(
            "INSERT INTO login_attempts (ip, success) VALUES (?, ?)",
            (ip, 1 if success else 0),
        )
        conn.execute(
            "DELETE FROM login_attempts WHERE attempted_at < datetime('now', '-1 day')"
        )


def set_session_cookies(response: Response, username: str) -> str:
    token = create_session_token(username)
    csrf = secrets.token_urlsafe(32)
    response.set_cookie(
        COOKIE_NAME,
        token,
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
        max_age=SESSION_MAX_AGE,
        path="/",
    )
    response.set_cookie(
        CSRF_COOKIE_NAME,
        csrf,
        httponly=False,
        samesite="lax",
        secure=settings.cookie_secure,
        max_age=SESSION_MAX_AGE,
        path="/",
    )
    return csrf


def clear_session_cookies(response: Response) -> None:
    response.delete_cookie(COOKIE_NAME, path="/")
    response.delete_cookie(CSRF_COOKIE_NAME, path="/")


def current_user(request: Request) -> str | None:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return None
    payload = decode_session_token(token)
    if not payload:
        return None
    return str(payload.get("u") or "")


def require_admin(request: Request) -> str:
    username = current_user(request)
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required.")
    if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
        header = request.headers.get("x-csrf-token", "")
        cookie = request.cookies.get(CSRF_COOKIE_NAME, "")
        if not header or not cookie or not hmac.compare_digest(header, cookie):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid CSRF token.")
    return username

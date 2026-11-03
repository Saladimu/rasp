from urllib.parse import urlparse

from .auth import hash_password
from .config import settings
from .database import db_session


DEFAULT_APPS = [
    {
        "name": "File Browser",
        "description": "Personal file management and storage.",
        "url_setting": "filebrowser_url",
        "icon": "folder",
        "order": 1,
    },
    {
        "name": "FreeLLMAPI",
        "description": "Self-hosted AI API service.",
        "url_setting": "freellmapi_url",
        "icon": "brain",
        "order": 2,
    },
    {
        "name": "Telegram Bot",
        "description": "Personal Telegram automation bot.",
        "url_setting": "telegram_bot_url",
        "icon": "send",
        "order": 3,
    },
]


def ensure_admin() -> None:
    username = settings.admin_username.strip() or "admin"
    with db_session() as conn:
        existing = conn.execute(
            "SELECT id, password_hash FROM admin_users WHERE username = ?",
            (username,),
        ).fetchone()
        if existing and not settings.reset_admin_password:
            return
        if not settings.admin_password:
            if existing:
                return
            raise RuntimeError(
                "ADMIN_PASSWORD is required for first-time setup. "
                "Copy .env.example to .env and set a strong password."
            )
        password_hash = hash_password(settings.admin_password)
        if existing:
            conn.execute(
                """
                UPDATE admin_users
                SET password_hash = ?, updated_at = datetime('now')
                WHERE username = ?
                """,
                (password_hash, username),
            )
        else:
            conn.execute(
                "INSERT INTO admin_users (username, password_hash) VALUES (?, ?)",
                (username, password_hash),
            )


def seed_default_apps() -> None:
    with db_session() as conn:
        count = conn.execute("SELECT COUNT(*) AS total FROM apps").fetchone()["total"]
        if count:
            return
        for app in DEFAULT_APPS:
            url = getattr(settings, app["url_setting"]).strip()
            parsed = urlparse(url)
            health_method = "http"
            health_port = None
            if parsed.scheme in {"http", "https"}:
                health_method = parsed.scheme
                health_port = parsed.port
            conn.execute(
                """
                INSERT INTO apps (
                    name, description, url, icon, health_url, health_method,
                    health_port, monitoring_enabled, display_order
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
                """,
                (
                    app["name"],
                    app["description"],
                    url,
                    app["icon"],
                    url,
                    health_method,
                    health_port,
                    app["order"],
                ),
            )


def bootstrap() -> None:
    ensure_admin()
    seed_default_apps()

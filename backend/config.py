import os
import secrets
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    data_dir: Path = BASE_DIR / "data"
    admin_username: str = "admin"
    admin_password: str = ""
    reset_admin_password: bool = False
    server_hostname: str = ""
    session_secret: str = ""
    session_days: int = 7
    allowed_healthcheck_hosts: str = "127.0.0.1,localhost"
    dashboard_name: str = "My Home Server"
    dashboard_subtitle: str = "Personal Infrastructure & Services"
    cookie_secure: bool = False
    trust_proxy: bool = False
    health_interval_seconds: int = 45
    filebrowser_url: str = "http://127.0.0.1:8081"
    freellmapi_url: str = "http://127.0.0.1:8082"
    telegram_bot_url: str = "http://127.0.0.1:8083"


settings = Settings()
DATA_DIR = Path(settings.data_dir)
DATA_DIR.mkdir(parents=True, exist_ok=True)
(DATA_DIR / "icons").mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "dashboard.db"


def persist_secret() -> str:
    secret_file = DATA_DIR / ".session_secret"
    if settings.session_secret:
        return settings.session_secret
    if secret_file.exists():
        value = secret_file.read_text(encoding="utf-8").strip()
        if value:
            return value
    value = secrets.token_urlsafe(48)
    flags = os.O_WRONLY | os.O_CREAT | os.O_TRUNC
    fd = os.open(str(secret_file), flags, 0o600)
    with os.fdopen(fd, "w", encoding="utf-8") as handle:
        handle.write(value)
    return value


SESSION_SECRET = persist_secret()

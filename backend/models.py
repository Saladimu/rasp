from typing import Optional

from pydantic import BaseModel, Field, field_validator

ALLOWED_ICONS = {
    "folder",
    "brain",
    "send",
    "layout-grid",
    "server",
    "globe",
    "database",
    "cloud",
    "shield",
    "terminal",
    "camera",
    "music",
    "video",
    "mail",
    "home",
    "box",
    "cpu",
    "hard-drive",
    "wifi",
    "lock",
    "user",
    "users",
    "book-open",
    "newspaper",
    "pen-line",
    "file-text",
    "link",
    "external-link",
    "image",
    "palette",
    "briefcase",
    "graduation-cap",
    "map-pin",
    "heart",
    "star",
    "code",
    "rss",
    "share-2",
    "message-circle",
    "phone",
    "calendar",
    "shopping-bag",
    "gamepad-2",
}


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=1, max_length=128)


class AppPayload(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    description: str = Field(default="", max_length=240)
    url: str = Field(min_length=1, max_length=500)
    icon: str = Field(default="layout-grid", max_length=40)
    health_url: str = Field(default="", max_length=500)
    health_method: str = Field(default="http", max_length=10)
    health_port: Optional[int] = Field(default=None, ge=1, le=65535)
    monitoring_enabled: bool = True
    visible: bool = True
    display_order: int = Field(default=0, ge=0, le=10000)
    kind: str = Field(default="application", max_length=20)

    @field_validator("name", "description", "url", "icon", "health_url", "health_method", "kind")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("icon")
    @classmethod
    def validate_icon(cls, value: str) -> str:
        icon = value.lower()
        if icon.startswith("custom:"):
            token = icon.split(":", 1)[1]
            if not token or not all(part.isalnum() or part in {".", "-", "_"} for part in token) or ".." in token:
                raise ValueError("Invalid custom icon identifier.")
            return icon
        if icon not in ALLOWED_ICONS:
            raise ValueError("Unsupported icon.")
        return icon

    @field_validator("health_method")
    @classmethod
    def validate_method(cls, value: str) -> str:
        method = value.lower()
        if method not in {"http", "https", "tcp"}:
            raise ValueError("Health-check method must be http, https, or tcp.")
        return method

    @field_validator("kind")
    @classmethod
    def validate_kind(cls, value: str) -> str:
        kind = value.lower()
        if kind not in {"application", "website"}:
            raise ValueError("Kind must be application or website.")
        return kind


class ReorderPayload(BaseModel):
    ids: list[int]


class VisibilityPayload(BaseModel):
    visible: bool

import json
from datetime import datetime, time, timezone
from typing import Any
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

import httpx

from .config import settings
from .database import db_session
from .ssrf import HealthCheckTargetError, validate_health_target


def load_alert_settings() -> dict[str, Any]:
    stored: dict[str, str] = {}
    with db_session() as conn:
        rows = conn.execute(
            "SELECT key, value FROM settings WHERE key LIKE 'alert_%' OR key IN ('telegram_bot_token', 'telegram_chat_id', 'webhook_url', 'fail_threshold', 'quiet_start', 'quiet_end', 'timezone')"
        ).fetchall()
    for row in rows:
        stored[row["key"]] = row["value"]

    enabled_raw = stored.get("alert_enabled")
    threshold_raw = stored.get("fail_threshold") or stored.get("alert_fail_threshold")
    try:
        threshold = int(threshold_raw) if threshold_raw else settings.alert_fail_threshold
    except ValueError:
        threshold = settings.alert_fail_threshold

    return {
        "alert_enabled": (enabled_raw == "1") if enabled_raw is not None else settings.alert_enabled,
        "telegram_bot_token": stored.get("telegram_bot_token") or settings.alert_telegram_bot_token,
        "telegram_chat_id": stored.get("telegram_chat_id") or settings.alert_telegram_chat_id,
        "webhook_url": stored.get("webhook_url") or settings.alert_webhook_url,
        "fail_threshold": max(1, min(threshold, 10)),
        "quiet_start": stored.get("quiet_start") or settings.alert_quiet_start,
        "quiet_end": stored.get("quiet_end") or settings.alert_quiet_end,
        "timezone": stored.get("timezone") or settings.alert_timezone or "UTC",
    }


def public_alert_settings() -> dict[str, Any]:
    cfg = load_alert_settings()
    return {
        "alert_enabled": cfg["alert_enabled"],
        "telegram_configured": bool(cfg["telegram_bot_token"] and cfg["telegram_chat_id"]),
        "telegram_chat_id": cfg["telegram_chat_id"],
        "webhook_configured": bool(cfg["webhook_url"]),
        "webhook_url": cfg["webhook_url"],
        "fail_threshold": cfg["fail_threshold"],
        "quiet_start": cfg["quiet_start"],
        "quiet_end": cfg["quiet_end"],
        "timezone": cfg["timezone"],
    }


def save_alert_settings(payload: dict[str, Any]) -> dict[str, Any]:
    current = load_alert_settings()
    token = payload.get("telegram_bot_token")
    webhook = (payload.get("webhook_url") or "").strip()
    if webhook:
        validate_webhook_url(webhook)
    values = {
        "alert_enabled": "1" if payload.get("alert_enabled") else "0",
        "telegram_bot_token": token.strip() if isinstance(token, str) and token.strip() else current["telegram_bot_token"],
        "telegram_chat_id": (payload.get("telegram_chat_id") or "").strip(),
        "webhook_url": webhook,
        "fail_threshold": str(max(1, min(int(payload.get("fail_threshold") or current["fail_threshold"]), 10))),
        "quiet_start": _normalize_hhmm(payload.get("quiet_start")),
        "quiet_end": _normalize_hhmm(payload.get("quiet_end")),
        "timezone": (payload.get("timezone") or "UTC").strip() or "UTC",
    }
    _validate_timezone(values["timezone"])
    with db_session() as conn:
        for key, value in values.items():
            conn.execute(
                "INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
                (key, value),
            )
    return public_alert_settings()


def validate_webhook_url(url: str) -> str:
    parsed = urlparse(url.strip())
    if parsed.scheme != "https":
        raise HealthCheckTargetError("Webhook URL must use https.")
    if parsed.username or parsed.password:
        raise HealthCheckTargetError("Webhook URL must not contain credentials.")
    validate_health_target(url.strip(), "https", None, set(), allow_public=True)
    return url.strip()


def _normalize_hhmm(value: Any) -> str:
    text = str(value or "").strip()
    if not text:
        return ""
    parsed = _parse_hhmm(text)
    if parsed is None:
        raise HealthCheckTargetError("Quiet hours must use HH:MM.")
    return f"{parsed.hour:02d}:{parsed.minute:02d}"


def _parse_hhmm(value: str) -> time | None:
    try:
        hour, minute = value.split(":")
        parsed = time(int(hour), int(minute))
    except (TypeError, ValueError):
        return None
    return parsed


def _validate_timezone(name: str) -> None:
    try:
        ZoneInfo(name)
    except Exception as exc:
        raise HealthCheckTargetError("Unknown timezone.") from exc


def in_quiet_hours(cfg: dict[str, Any], now: datetime | None = None) -> bool:
    start = _parse_hhmm(cfg.get("quiet_start") or "")
    end = _parse_hhmm(cfg.get("quiet_end") or "")
    if start is None or end is None:
        return False
    try:
        tz = ZoneInfo(cfg.get("timezone") or "UTC")
    except Exception:
        tz = timezone.utc
    current = (now or datetime.now(timezone.utc)).astimezone(tz).time()
    if start == end:
        return False
    if start < end:
        return start <= current < end
    return current >= start or current < end


def _state_map(app_ids: list[int]) -> dict[int, dict[str, Any]]:
    if not app_ids:
        return {}
    placeholders = ",".join("?" for _ in app_ids)
    with db_session() as conn:
        rows = conn.execute(
            f"SELECT * FROM alert_state WHERE app_id IN ({placeholders})",
            app_ids,
        ).fetchall()
    return {int(row["app_id"]): dict(row) for row in rows}


def _upsert_state(app_id: int, consecutive: int, last_status: str, last_event: str, pending: int) -> None:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    with db_session() as conn:
        conn.execute(
            """
            INSERT INTO alert_state (app_id, consecutive_fails, last_status, last_event, pending, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(app_id) DO UPDATE SET
                consecutive_fails = excluded.consecutive_fails,
                last_status = excluded.last_status,
                last_event = excluded.last_event,
                pending = excluded.pending,
                updated_at = excluded.updated_at
            """,
            (app_id, consecutive, last_status, last_event, pending, now),
        )


async def process_alerts(apps: list[dict[str, Any]], results: list[dict[str, Any]]) -> None:
    cfg = load_alert_settings()
    if not cfg["alert_enabled"]:
        return
    names = {int(app["id"]): app.get("name") or f"Service {app['id']}" for app in apps}
    states = _state_map([int(item["id"]) for item in results if item.get("id") is not None])
    quiet = in_quiet_hours(cfg)

    for item in results:
        app_id = int(item["id"])
        status = item.get("status") or "unknown"
        state = states.get(app_id, {})
        consecutive = int(state.get("consecutive_fails") or 0)
        last_event = state.get("last_event") or ""
        pending = int(state.get("pending") or 0)
        event = None

        if status == "offline":
            consecutive += 1
            if consecutive >= cfg["fail_threshold"] and last_event != "down":
                event = "down"
        elif status == "online":
            if last_event == "down" or pending == 1:
                event = "recovered"
            consecutive = 0
            pending = 0
        else:
            _upsert_state(app_id, consecutive, status, last_event, pending)
            continue

        if event and quiet:
            pending = 1 if event == "down" else 0
            _upsert_state(app_id, consecutive, status, last_event, pending)
            continue

        if event:
            sent = await send_alert(
                cfg,
                event,
                names.get(app_id, f"Service {app_id}"),
                item,
            )
            if sent:
                last_event = "down" if event == "down" else "recovered"
                pending = 0
        _upsert_state(app_id, consecutive, status, last_event, pending)


async def send_alert(cfg: dict[str, Any], event: str, name: str, item: dict[str, Any]) -> bool:
    status = item.get("status") or "unknown"
    message = item.get("message") or ""
    checked = item.get("last_checked") or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    title = "Service recovered" if event == "recovered" else "Service down"
    text = f"{title}: {name}\nStatus: {status}\n{message}\nChecked: {checked}"
    payload = {
        "event": event,
        "name": name,
        "id": item.get("id"),
        "status": status,
        "message": message,
        "checked_at": checked,
        "latency_ms": item.get("latency_ms"),
    }
    ok = False
    if cfg.get("telegram_bot_token") and cfg.get("telegram_chat_id"):
        ok = await _send_telegram(cfg["telegram_bot_token"], cfg["telegram_chat_id"], text) or ok
    if cfg.get("webhook_url"):
        ok = await _send_webhook(cfg["webhook_url"], payload) or ok
    return ok


async def send_test_alert() -> dict[str, Any]:
    cfg = load_alert_settings()
    if not cfg["telegram_bot_token"] and not cfg["webhook_url"]:
        raise HealthCheckTargetError("Configure Telegram or a webhook before sending a test alert.")
    sample = {
        "id": 0,
        "status": "online",
        "message": "Test alert from Home Server Dashboard",
        "last_checked": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "latency_ms": None,
    }
    sent = await send_alert(cfg, "recovered", settings.dashboard_name or "Home Server", sample)
    if not sent:
        raise HealthCheckTargetError("Alert could not be delivered. Check Telegram or webhook settings.")
    return {"ok": True}


async def _send_telegram(token: str, chat_id: str, text: str) -> bool:
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    try:
        async with httpx.AsyncClient(timeout=8.0, trust_env=False, follow_redirects=False) as client:
            response = await client.post(
                url,
                json={"chat_id": chat_id, "text": text, "disable_web_page_preview": True},
            )
        return response.status_code < 400
    except Exception:
        return False


async def _send_webhook(url: str, payload: dict[str, Any]) -> bool:
    try:
        validate_webhook_url(url)
        async with httpx.AsyncClient(timeout=8.0, trust_env=False, follow_redirects=False) as client:
            response = await client.post(url, content=json.dumps(payload), headers={"Content-Type": "application/json"})
        return response.status_code < 400
    except Exception:
        return False

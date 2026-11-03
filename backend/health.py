import asyncio
import socket
import time
from typing import Any

import httpx

from .ssrf import HealthCheckTargetError, parse_allowed_hosts, validate_health_target
from .config import settings

STATUS_CACHE: dict[int, dict[str, Any]] = {}
WEBSITE_STATUS_CACHE: dict[int, dict[str, Any]] = {}


def cache_for(kind: str) -> dict[int, dict[str, Any]]:
    return WEBSITE_STATUS_CACHE if kind == "website" else STATUS_CACHE


def empty_status(app_id: int, reason: str = "Unknown", kind: str = "application") -> dict[str, Any]:
    cache = cache_for(kind)
    return {
        "id": app_id,
        "status": "unknown",
        "latency_ms": None,
        "last_checked": None,
        "last_success": cache.get(app_id, {}).get("last_success"),
        "message": reason,
    }


async def check_http(url: str, timeout: float = 4.0, follow_redirects: bool = False) -> dict[str, Any]:
    started = time.perf_counter()
    async with httpx.AsyncClient(
        timeout=timeout,
        follow_redirects=follow_redirects,
        trust_env=False,
        verify=True,
    ) as client:
        response = await client.get(url)
    latency = round((time.perf_counter() - started) * 1000)
    online = 200 <= response.status_code < 400
    return {
        "status": "online" if online else "offline",
        "latency_ms": latency,
        "message": f"HTTP {response.status_code}",
    }


async def check_tcp(host: str, port: int, timeout: float = 4.0) -> dict[str, Any]:
    started = time.perf_counter()

    def _connect() -> None:
        with socket.create_connection((host, port), timeout=timeout):
            return None

    await asyncio.to_thread(_connect)
    latency = round((time.perf_counter() - started) * 1000)
    return {
        "status": "online",
        "latency_ms": latency,
        "message": "TCP connection succeeded",
    }


async def check_app(app: dict[str, Any]) -> dict[str, Any]:
    app_id = int(app["id"])
    kind = app.get("kind") or "application"
    cache = cache_for(kind)
    if not app.get("monitoring_enabled"):
        result = empty_status(app_id, "Monitoring disabled", kind)
        cache[app_id] = result
        return result

    allowed = parse_allowed_hosts(settings.allowed_healthcheck_hosts)
    method = (app.get("health_method") or "http").lower()
    target = (app.get("health_url") or app.get("url") or "").strip()
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    try:
        host, port = validate_health_target(
            target,
            method,
            app.get("health_port"),
            allowed,
            allow_public=(kind == "website"),
        )
    except HealthCheckTargetError as exc:
        result = {
            "id": app_id,
            "status": "unknown",
            "latency_ms": None,
            "last_checked": now,
            "last_success": cache.get(app_id, {}).get("last_success"),
            "message": str(exc),
        }
        cache[app_id] = result
        return result

    try:
        if method == "tcp":
            probe = await check_tcp(host, port)
        else:
            probe = await check_http(
                target if "://" in target else f"{method}://{target}",
                follow_redirects=(kind == "website"),
            )
        result = {
            "id": app_id,
            "status": probe["status"],
            "latency_ms": probe["latency_ms"],
            "last_checked": now,
            "last_success": now if probe["status"] == "online" else cache.get(app_id, {}).get("last_success"),
            "message": probe["message"],
        }
    except Exception:
        result = {
            "id": app_id,
            "status": "offline",
            "latency_ms": None,
            "last_checked": now,
            "last_success": cache.get(app_id, {}).get("last_success"),
            "message": "Health check failed",
        }
    cache[app_id] = result
    return result


async def check_apps(apps: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not apps:
        return []
    return await asyncio.gather(*(check_app(app) for app in apps))

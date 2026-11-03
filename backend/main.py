import asyncio
import re
import secrets
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, File, HTTPException, Request, Response, UploadFile, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from .auth import (
    CSRF_COOKIE_NAME,
    clear_session_cookies,
    client_ip,
    current_user,
    record_attempt,
    require_admin,
    set_session_cookies,
    too_many_attempts,
    verify_password,
)
from .config import DATA_DIR, settings
from .database import db_session, init_db, row_to_dict
from .health import cache_for, check_apps
from .models import AppPayload, LoginRequest, ReorderPayload, VisibilityPayload
from .seed import bootstrap
from .serverinfo import collect_server_info
from .ssrf import HealthCheckTargetError, parse_allowed_hosts, validate_app_url, validate_health_target

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"
ICON_DIR = DATA_DIR / "icons"
SAFE_FILENAME = re.compile(r"^[A-Za-z0-9._-]{1,80}$")


def public_app(row: dict[str, Any]) -> dict[str, Any]:
    kind = row.get("kind") or "application"
    status_info = cache_for(kind).get(row["id"], {})
    return {
        "id": row["id"],
        "name": row["name"],
        "description": row["description"],
        "url": row["url"],
        "icon": row["icon"],
        "kind": kind,
        "monitoring_enabled": bool(row["monitoring_enabled"]),
        "visible": bool(row.get("visible", 1)),
        "display_order": row["display_order"],
        "status": status_info.get("status", "unknown"),
        "latency_ms": status_info.get("latency_ms"),
        "last_checked": status_info.get("last_checked"),
        "last_success": status_info.get("last_success"),
    }


def admin_app(row: dict[str, Any]) -> dict[str, Any]:
    payload = public_app(row)
    payload.update(
        {
            "health_url": row["health_url"],
            "health_method": row["health_method"],
            "health_port": row["health_port"],
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
        }
    )
    return payload


def fetch_apps(kind: str | None = None, visible_only: bool = False) -> list[dict[str, Any]]:
    query = "SELECT * FROM apps"
    clauses = []
    params: list[Any] = []
    if kind:
        clauses.append("kind = ?")
        params.append(kind)
    if visible_only:
        clauses.append("visible = 1")
    if clauses:
        query += " WHERE " + " AND ".join(clauses)
    query += " ORDER BY display_order ASC, id ASC"
    with db_session() as conn:
        rows = conn.execute(query, params).fetchall()
    return [dict(row) for row in rows]


def validate_payload(payload: AppPayload) -> None:
    try:
        validate_app_url(payload.url)
        if payload.monitoring_enabled:
            target = payload.health_url or payload.url
            allowed = parse_allowed_hosts(settings.allowed_healthcheck_hosts)
            validate_health_target(
                target,
                payload.health_method,
                payload.health_port,
                allowed,
                allow_public=(payload.kind == "website"),
            )
    except HealthCheckTargetError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


def next_display_order(kind: str) -> int:
    with db_session() as conn:
        row = conn.execute(
            "SELECT COALESCE(MAX(display_order), 0) AS max_order FROM apps WHERE kind = ?",
            (kind,),
        ).fetchone()
    return int(row["max_order"] or 0) + 1


def insert_entry(payload: AppPayload) -> dict[str, Any]:
    display_order = payload.display_order if payload.display_order > 0 else next_display_order(payload.kind)
    with db_session() as conn:
        cursor = conn.execute(
            """
            INSERT INTO apps (
                name, description, url, icon, health_url, health_method,
                health_port, monitoring_enabled, display_order, kind, visible
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.name,
                payload.description,
                payload.url,
                payload.icon,
                payload.health_url or payload.url,
                payload.health_method,
                payload.health_port,
                1 if payload.monitoring_enabled else 0,
                display_order,
                payload.kind,
                1 if payload.visible else 0,
            ),
        )
        app_id = cursor.lastrowid
        row = dict(conn.execute("SELECT * FROM apps WHERE id = ?", (app_id,)).fetchone())
    return admin_app(row)


def update_entry(app_id: int, payload: AppPayload) -> dict[str, Any]:
    with db_session() as conn:
        existing = conn.execute("SELECT id, kind FROM apps WHERE id = ?", (app_id,)).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Entry not found.")
        if existing["kind"] != payload.kind:
            raise HTTPException(status_code=400, detail="Cannot change entry type.")
        conn.execute(
            """
            UPDATE apps SET
                name = ?, description = ?, url = ?, icon = ?, health_url = ?,
                health_method = ?, health_port = ?, monitoring_enabled = ?,
                display_order = ?, visible = ?, updated_at = datetime('now')
            WHERE id = ?
            """,
            (
                payload.name,
                payload.description,
                payload.url,
                payload.icon,
                payload.health_url or payload.url,
                payload.health_method,
                payload.health_port,
                1 if payload.monitoring_enabled else 0,
                payload.display_order,
                1 if payload.visible else 0,
                app_id,
            ),
        )
        row = dict(conn.execute("SELECT * FROM apps WHERE id = ?", (app_id,)).fetchone())
    cache_for(payload.kind).pop(app_id, None)
    return admin_app(row)


def delete_entry(app_id: int, kind: str) -> None:
    with db_session() as conn:
        existing = conn.execute("SELECT id, kind FROM apps WHERE id = ?", (app_id,)).fetchone()
        if not existing or existing["kind"] != kind:
            raise HTTPException(status_code=404, detail="Entry not found.")
        conn.execute("DELETE FROM apps WHERE id = ?", (app_id,))
    cache_for(kind).pop(app_id, None)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    bootstrap()
    stop_event = asyncio.Event()

    async def monitor_loop() -> None:
        interval = max(30, min(settings.health_interval_seconds, 60))
        while not stop_event.is_set():
            apps = fetch_apps()
            await check_apps(apps)
            try:
                await asyncio.wait_for(stop_event.wait(), timeout=interval)
            except asyncio.TimeoutError:
                continue

    task = asyncio.create_task(monitor_loop())
    yield
    stop_event.set()
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(title="Home Server Dashboard", lifespan=lifespan)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "same-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    response.headers["Cache-Control"] = "no-store"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; img-src 'self' data:; style-src 'self'; "
        "script-src 'self'; connect-src 'self'; frame-ancestors 'none'"
    )
    if not request.cookies.get(CSRF_COOKIE_NAME) and current_user(request):
        response.set_cookie(
            CSRF_COOKIE_NAME,
            secrets.token_urlsafe(32),
            httponly=False,
            samesite="lax",
            secure=settings.cookie_secure,
            path="/",
        )
    return response


async def collect_status(kind: str | None = None, refresh: bool = False) -> list[dict[str, Any]]:
    rows = fetch_apps(kind, visible_only=True)
    results = []
    pending = []
    for row in rows:
        cache = cache_for(row.get("kind") or "application")
        cached = cache.get(row["id"])
        if refresh or not cached:
            pending.append(row)
        else:
            results.append(cached)
    if pending:
        probed = await check_apps(pending)
        results.extend(probed)
    order = {row["id"]: index for index, row in enumerate(rows)}
    results.sort(key=lambda item: order.get(item["id"], 0))
    return results


@app.get("/api/apps")
def list_apps() -> dict[str, Any]:
    apps = [public_app(row) for row in fetch_apps("application", visible_only=True)]
    return {"apps": apps}


@app.get("/api/websites")
def list_websites() -> dict[str, Any]:
    websites = [public_app(row) for row in fetch_apps("website", visible_only=True)]
    return {"websites": websites}


@app.get("/api/status")
async def list_status(refresh: bool = False) -> dict[str, Any]:
    return {"statuses": await collect_status("application", refresh)}


@app.get("/api/websites/status")
async def list_website_status(refresh: bool = False) -> dict[str, Any]:
    return {"statuses": await collect_status("website", refresh)}


@app.get("/api/server-info")
def server_info() -> dict[str, Any]:
    return collect_server_info()


@app.get("/api/auth/session")
def auth_session(request: Request) -> dict[str, Any]:
    username = current_user(request)
    return {
        "authenticated": bool(username),
        "username": username,
        "csrf_token": request.cookies.get(CSRF_COOKIE_NAME),
    }


@app.post("/api/auth/login")
def login(payload: LoginRequest, request: Request, response: Response) -> dict[str, Any]:
    ip = client_ip(request)
    if too_many_attempts(ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Try again later.",
        )
    username = payload.username.strip()
    with db_session() as conn:
        user = row_to_dict(
            conn.execute(
                "SELECT username, password_hash FROM admin_users WHERE username = ?",
                (username,),
            ).fetchone()
        )
    if not user or not verify_password(payload.password, user["password_hash"]):
        record_attempt(ip, False)
        raise HTTPException(status_code=401, detail="Invalid username or password.")
    record_attempt(ip, True)
    csrf = set_session_cookies(response, user["username"])
    return {"ok": True, "username": user["username"], "csrf_token": csrf}


@app.post("/api/auth/logout")
def logout(response: Response) -> dict[str, Any]:
    clear_session_cookies(response)
    return {"ok": True}


@app.get("/api/admin/apps")
def admin_list_apps(_: str = Depends(require_admin)) -> dict[str, Any]:
    return {"apps": [admin_app(row) for row in fetch_apps("application")]}


@app.get("/api/admin/websites")
def admin_list_websites(_: str = Depends(require_admin)) -> dict[str, Any]:
    return {"websites": [admin_app(row) for row in fetch_apps("website")]}


def set_visibility(app_id: int, kind: str, visible: bool) -> dict[str, Any]:
    with db_session() as conn:
        existing = conn.execute("SELECT * FROM apps WHERE id = ?", (app_id,)).fetchone()
        if not existing or existing["kind"] != kind:
            raise HTTPException(status_code=404, detail="Entry not found.")
        conn.execute(
            "UPDATE apps SET visible = ?, updated_at = datetime('now') WHERE id = ?",
            (1 if visible else 0, app_id),
        )
        row = dict(conn.execute("SELECT * FROM apps WHERE id = ?", (app_id,)).fetchone())
    return admin_app(row)


@app.put("/api/admin/reorder")
def reorder_apps(payload: ReorderPayload, _: str = Depends(require_admin)) -> dict[str, Any]:
    with db_session() as conn:
        for index, app_id in enumerate(payload.ids, start=1):
            conn.execute(
                "UPDATE apps SET display_order = ?, updated_at = datetime('now') WHERE id = ?",
                (index, app_id),
            )
    return {"ok": True}


@app.post("/api/admin/apps")
def create_app(payload: AppPayload, _: str = Depends(require_admin)) -> dict[str, Any]:
    payload.kind = "application"
    validate_payload(payload)
    return {"app": insert_entry(payload)}


@app.put("/api/admin/apps/{app_id}")
def update_app(app_id: int, payload: AppPayload, _: str = Depends(require_admin)) -> dict[str, Any]:
    payload.kind = "application"
    validate_payload(payload)
    return {"app": update_entry(app_id, payload)}


@app.delete("/api/admin/apps/{app_id}")
def delete_app(app_id: int, _: str = Depends(require_admin)) -> dict[str, Any]:
    delete_entry(app_id, "application")
    return {"ok": True}


@app.put("/api/admin/apps/{app_id}/visibility")
def set_app_visibility(
    app_id: int,
    payload: VisibilityPayload,
    _: str = Depends(require_admin),
) -> dict[str, Any]:
    return {"app": set_visibility(app_id, "application", payload.visible)}


@app.post("/api/admin/websites")
def create_website(payload: AppPayload, _: str = Depends(require_admin)) -> dict[str, Any]:
    payload.kind = "website"
    if payload.icon == "layout-grid":
        payload.icon = "globe"
    validate_payload(payload)
    return {"website": insert_entry(payload)}


@app.put("/api/admin/websites/{app_id}")
def update_website(app_id: int, payload: AppPayload, _: str = Depends(require_admin)) -> dict[str, Any]:
    payload.kind = "website"
    validate_payload(payload)
    return {"website": update_entry(app_id, payload)}


@app.delete("/api/admin/websites/{app_id}")
def delete_website(app_id: int, _: str = Depends(require_admin)) -> dict[str, Any]:
    delete_entry(app_id, "website")
    return {"ok": True}


@app.put("/api/admin/websites/{app_id}/visibility")
def set_website_visibility(
    app_id: int,
    payload: VisibilityPayload,
    _: str = Depends(require_admin),
) -> dict[str, Any]:
    return {"website": set_visibility(app_id, "website", payload.visible)}


@app.post("/api/admin/icons")
async def upload_icon(
    file: UploadFile = File(...),
    _: str = Depends(require_admin),
) -> dict[str, Any]:
    filename = Path(file.filename or "").name
    if not SAFE_FILENAME.match(filename) or not filename.lower().endswith((".png", ".svg", ".webp", ".jpg", ".jpeg")):
        raise HTTPException(status_code=400, detail="Icon must be a png, svg, webp, or jpg file.")
    data = await file.read()
    if len(data) > 256 * 1024:
        raise HTTPException(status_code=400, detail="Icon must be 256 KB or smaller.")
    destination = ICON_DIR / filename
    destination.write_bytes(data)
    return {"icon": f"custom:{filename}"}


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/icons/{filename}")
def custom_icon(filename: str):
    if not SAFE_FILENAME.match(filename):
        raise HTTPException(status_code=404, detail="Icon not found.")
    path = ICON_DIR / filename
    if not path.exists() or not path.is_file():
        raise HTTPException(status_code=404, detail="Icon not found.")
    return FileResponse(path)


@app.get("/")
def index_page():
    return FileResponse(FRONTEND_DIR / "index.html")


@app.get("/admin")
def admin_page():
    return FileResponse(FRONTEND_DIR / "admin.html")


@app.get("/admin.html")
def admin_html():
    return FileResponse(FRONTEND_DIR / "admin.html")


app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")


@app.exception_handler(HTTPException)
async def http_error_handler(_: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_: Request, exc: RequestValidationError):
    messages = []
    for error in exc.errors():
        loc = ".".join(str(part) for part in error.get("loc", []) if part != "body")
        messages.append(f"{loc}: {error.get('msg', 'Invalid value')}" if loc else error.get("msg", "Invalid value"))
    return JSONResponse(status_code=422, content={"detail": "; ".join(messages) or "Invalid request."})

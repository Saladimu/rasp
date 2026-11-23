# AGENTS.md

Repository memory for the Home Server Dashboard. Keep this file focused on
general setup, conventions, and invariants that apply across tasks.

## Project overview

- Self-hosted home-server control panel for a Raspberry Pi.
- Backend: FastAPI + Uvicorn, SQLite, Pydantic settings.
- Frontend: plain HTML/CSS/JavaScript PWA with no build step.
- Persistence: SQLite database, uploaded icons, and a generated session secret
  under `DATA_DIR`.
- Deployment: Docker Compose or `start.sh`; default port `8000`.

## Repository layout

```text
backend/
  main.py           FastAPI app, routes, lifespan monitor loop, command execution
  config.py         Pydantic settings loaded from .env; DATA_DIR and DB_PATH
  database.py       SQLite connection helper, schema creation, light migrations
  models.py         Pydantic request payloads and validators
  auth.py           Session cookies, CSRF, login rate limiting, bcrypt hashes
  health.py         HTTP/TCP health checks and status cache
  history.py        Uptime history storage and summaries
  alerts.py         Telegram/webhook alerts and alert settings
  ssrf.py           Health-target allowlist and private-address protections
  serverinfo.py     CPU/RAM/disk/temperature/USB host metrics
  seed.py           First-run admin and default application seeding
  command_safety.py Rejects commands that start with sudo
frontend/
  index.html/app.js  Public dashboard
  admin.html/admin.js Admin panel
  style.css           Shared styles
  sw.js               Service worker and cache version
data/                 Persisted SQLite DB, icons, session secret
Docs/                 Host setup notes (home_server_master.md)
```

## Common commands

### Docker

```bash
cp .env.example .env
# Set a strong ADMIN_PASSWORD in .env before starting.
docker compose up -d --build
# Dashboard: http://SERVER_IP:8000
# Admin:     http://SERVER_IP:8000/admin
```

### Local

```bash
python3 -m pip install --break-system-packages -r backend/requirements.txt
cp .env.example .env
# Set ADMIN_PASSWORD.
chmod +x start.sh
./start.sh
```

`start.sh` refuses to start if `ADMIN_PASSWORD` is missing or still set to
`change-this-password`.

### Direct Uvicorn (useful for preview/testing)

```bash
PYTHONPATH="$PWD" python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

Set `DATA_DIR` to a temporary directory when testing so the repository `data/`
directory is not modified:

```bash
DATA_DIR=/tmp/dashboard-test ADMIN_PASSWORD=testpass \
  python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### Verification

There is currently no automated test suite, lint config, or `package.json`.
Use these checks after changes:

```bash
python -m py_compile backend/*.py
node --check frontend/app.js
node --check frontend/admin.js
```

For backend behavior, a FastAPI `TestClient` script can exercise real routes
against a temporary `DATA_DIR`. Health: `GET /api/health`.

## Configuration

Settings live in `backend/config.py` and are loaded from `.env`
(`.env.example` documents the available variables). Important values:

- `ADMIN_USERNAME` / `ADMIN_PASSWORD` - first-run admin account.
- `RESET_ADMIN_PASSWORD` - replace the stored hash once, then set back to false.
- `DATA_DIR` - SQLite DB, icons, and session secret location.
- `SESSION_DAYS`, `COOKIE_SECURE`, `TRUST_PROXY` - session/cookie behavior.
- `ALLOWED_HEALTHCHECK_HOSTS` - comma-separated health-check allowlist.
- `HEALTH_INTERVAL_SECONDS` - monitor interval (clamped to 30-60s).
- `FILEBROWSER_URL`, `FREELLMAPI_URL`, `TELEGRAM_BOT_URL`,
  `PERSONAL_WEBSITE_URL` - default seeded entries.

## Code conventions

- Backend code uses 4-space indent, type hints, and small helper functions.
- Keep route handlers in `backend/main.py`; request models in `models.py`.
- Add SQLite schema changes to `init_db()` with `CREATE TABLE IF NOT EXISTS`
  and `ALTER TABLE` guards for existing installs.
- Use `db_session()` for transactions; it commits on success and rolls back on
  exceptions.
- Admin mutating routes must use `Depends(require_admin)`. The frontend must
  send `X-CSRF-Token` matching the `dashboard_csrf` cookie.
- Validate health-check targets through `backend/ssrf.py`; never bypass the
  allowlist.
- Frontend is plain JavaScript. Escape rendered data with `escapeHtml`.
- When changing CSS/JS, bump the `?v=N` query string in `index.html` /
  `admin.html` and the `CACHE_NAME`/`PRECACHE` versions in `sw.js`.
- Do not introduce a frontend build step or external CDN dependency.

## Security invariants

- Admin access is effectively host-level access: Docker Compose runs the
  dashboard privileged with `pid: host`, and command execution can use
  `nsenter` to run in host namespaces.
- Keep session cookies, CSRF, login rate limiting, and health-target SSRF
  protections intact.
- Saved run commands are executed by database id, not arbitrary request text.
  `command_safety.ensure_command_allowed()` rejects `sudo` at save time and
  again at execution time.
- Do not log or commit secrets from `.env`, `data/.session_secret`, or the
  SQLite database.

## Persistence and operations

- `DATA_DIR/dashboard.db` is the main database; it uses WAL and foreign keys.
- `DATA_DIR/icons/` stores uploaded application icons.
- `DATA_DIR/.session_secret` stores the generated session signing secret.
- In Docker, `./data` is mounted at `/app/data`.
- Back up the database and icons before upgrades:

```bash
docker compose stop
cp data/dashboard.db backups/dashboard-$(date +%F).db
cp -r data/icons backups/icons-$(date +%F)
docker compose start
```

## Documentation

- `README.md` - feature overview, API list, deployment, and security notes.
- `home_server_dashboard_readme.md` - duplicated readme.
- `Docs/home_server_master.md` - Raspberry Pi host setup guide.

## Notes / limitations

- This memory was written after exploring the repository at a high level;
  it may not cover every module or deployment detail.
- No automated tests, lint, or typecheck are configured. If those are added,
  document their commands here.

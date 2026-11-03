# Home Server Dashboard

A lightweight, self-hosted control panel for a personal home server. It provides a dark-mode welcome page, live application health checks through a backend API, and a session-protected admin panel for managing services.

## Features

- Responsive dashboard for File Browser, FreeLLMAPI, Telegram Bot, and any extra apps you add
- Backend health checks over HTTP, HTTPS, or TCP (avoids browser CORS limits)
- SQLite persistence for applications and the hashed admin account
- Session cookies, CSRF protection, login rate limiting, and health-check host allowlisting
- Docker Compose deployment with a persistent data volume

## Project layout

```text
home-server-dashboard/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── auth.py
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── admin.html
│   ├── style.css
│   └── app.js
├── data/
│   └── dashboard.db
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Quick start with Docker

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Set a strong admin password and your service URLs in `.env`.

3. Start the stack:

```bash
docker compose up -d --build
```

4. Open `http://SERVER_IP:8000`.

5. Sign in at `/admin` with `ADMIN_USERNAME` and `ADMIN_PASSWORD`.

The first start creates the admin user from `ADMIN_PASSWORD` and seeds the three example applications. After that, the hashed password in SQLite is used. Set `RESET_ADMIN_PASSWORD=true` only when you intentionally want to replace the stored hash, then set it back to `false`.

## Local start without Docker

```bash
python3 -m pip install --break-system-packages -r backend/requirements.txt
cp .env.example .env
```

Edit `.env`, then:

```bash
chmod +x start.sh
./start.sh
```

The dashboard listens on port 8000.

## Initial admin setup

- Username comes from `ADMIN_USERNAME` (default `admin`).
- Password comes from `ADMIN_PASSWORD` and is hashed with bcrypt before storage.
- Never put the password in frontend files.
- After the first successful boot, keep `RESET_ADMIN_PASSWORD=false`.

If login is locked after failed attempts, wait 15 minutes or sign in from a new source address.

## Example application configuration

These defaults are seeded on first launch from `.env`:

| Application | Example URL | Health check |
|---|---|---|
| File Browser | `http://127.0.0.1:8081` | HTTP GET on the same URL |
| FreeLLMAPI | `http://127.0.0.1:8082` | HTTP GET on the same URL |
| Telegram Bot | `http://127.0.0.1:8083` | HTTP GET on the same URL |

If a service exposes `/health`, set that as the health-check URL in the admin panel. For apps without HTTP, use method `tcp` plus host and port.

When the dashboard runs in Docker and the apps run on the host, use a reachable hostname such as `host.docker.internal` or the LAN IP, then add that host to `ALLOWED_HEALTHCHECK_HOSTS`.

## Health checks and SSRF protection

The browser never probes application URLs directly. The backend checks them every 30-60 seconds.

Health-check targets must:

- Use `http`, `https`, or `tcp`
- Belong to `ALLOWED_HEALTHCHECK_HOSTS`
- Avoid credentials in URLs
- Avoid metadata hostnames

Private or loopback addresses are allowed only when the hostname or IP is present in the allowlist. This is intentional for a home server, but keep the allowlist limited to services you control.

## Public and admin APIs

Public:

- `GET /api/apps`
- `GET /api/status`
- `GET /api/status?refresh=true`
- `GET /api/server-info`
- `GET /api/health`

Admin (session cookie required):

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `GET /api/admin/apps`
- `POST /api/admin/apps`
- `PUT /api/admin/apps/{id}`
- `DELETE /api/admin/apps/{id}`
- `PUT /api/admin/reorder`
- `POST /api/admin/icons`

Mutating admin requests must send header `X-CSRF-Token` matching the `dashboard_csrf` cookie.

## Server metrics

CPU, RAM, disk, and uptime are read from the dashboard host with `psutil`. If a metric cannot be collected, the UI shows `Not Available`. Values are never invented.

## Backup and update

Backup the SQLite database and uploaded icons:

```bash
docker compose stop
cp data/dashboard.db backups/dashboard-$(date +%F).db
cp -r data/icons backups/icons-$(date +%F)
docker compose start
```

Update:

```bash
git pull
docker compose up -d --build
```

The `./data` directory is mounted as a volume, so applications and the admin account survive rebuilds.

## Security recommendations

- Change `ADMIN_PASSWORD` before the first start.
- Do not expose port 8000 to the public internet. Put it behind a reverse proxy, VPN, or LAN-only bind.
- Set `COOKIE_SECURE=true` when serving HTTPS.
- Set `TRUST_PROXY=true` only behind a trusted reverse proxy.
- Keep `ALLOWED_HEALTHCHECK_HOSTS` as small as possible.
- Review health-check URLs before saving them. The backend rejects targets outside the allowlist.
- Rotate the admin password with `RESET_ADMIN_PASSWORD=true`, restart once, then set it back to `false`.

## Environment variables

| Variable | Purpose |
|---|---|
| `ADMIN_USERNAME` | Initial admin username |
| `ADMIN_PASSWORD` | Initial admin password, used only on first setup or reset |
| `RESET_ADMIN_PASSWORD` | Replace the stored password hash on startup |
| `SERVER_HOSTNAME` | Hostname shown on the dashboard |
| `ALLOWED_HEALTHCHECK_HOSTS` | Comma-separated hosts permitted for probes |
| `FILEBROWSER_URL` | Seed URL for File Browser |
| `FREELLMAPI_URL` | Seed URL for FreeLLMAPI |
| `TELEGRAM_BOT_URL` | Seed URL for Telegram Bot |
| `HEALTH_INTERVAL_SECONDS` | Probe interval, clamped to 30-60 seconds |
| `COOKIE_SECURE` | Set true when using HTTPS |
| `DATA_DIR` | SQLite and icon storage directory |

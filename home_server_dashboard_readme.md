# Home Server Dashboard

A lightweight, self-hosted control panel for a personal home server. It provides a dark-mode welcome page, live application health checks through a backend API, and a session-protected admin panel for managing services.

## Documentation

Full infrastructure notes, deployment steps, and operational guides for the Raspberry Pi host live in the [`Docs/`](Docs/) directory:

* [**Raspberry Pi Home Server — Master Reference & User Guide**](Docs/home_server_master.md)**:** Complete reference covering hardware specifications, 64 GB SD card & 2.0 GB swap tuning, core Docker containers (Home Server Dashboard, Glance, File Browser, FreeLLMAPI), the lightweight Python Telegram AI bot, Tailscale SSH, and Cloudflare Tunnel routing (`saladimu.my.id`).

## Features

* Responsive dashboard for File Browser, FreeLLMAPI, Telegram Bot, personal websites, and extra apps you add

* Backend health checks over HTTP, HTTPS, or TCP (avoids browser CORS limits)

* 24h/7d uptime history, latency bars, and sparklines from stored probe results

* Telegram or HTTPS webhook alerts after consecutive failures, with optional quiet hours

* Installable PWA with cached CSS/JS for faster repeat visits

* SQLite persistence for applications and the hashed admin account

* Session cookies, CSRF protection, login rate limiting, and health-check host allowlisting

* Docker Compose deployment with a persistent data volume

## Quick Start

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Set a strong admin password and your service URLs in `.env`. Keep `DASHBOARD_NAME=Saladimu Server`.

3. Start the stack:

   ```bash
   docker compose up -d --build
   ```

4. Open `http://SERVER_IP:8000`.

5. Sign in at `/admin` with `ADMIN_USERNAME` and `ADMIN_PASSWORD`.

The first start creates the admin user from `ADMIN_PASSWORD` and seeds the three example applications. After that, the hashed password in SQLite is used. Set `RESET_ADMIN_PASSWORD=true` only when you intentionally want to replace the stored hash, then set it back to `false`.

## Health Checks and SSRF Protection

The browser never probes application URLs directly. The backend checks them every 30–60 seconds.

Health-check targets must:

* Use `http`, `https`, or `tcp`

* Belong to `ALLOWED_HEALTHCHECK_HOSTS`, extra hosts added in **Admin > Allowed Health-check Hosts**, or a matching wildcard such as `*.saladimu.my.id`

* Avoid credentials in URLs

* Avoid metadata hostnames

Private or loopback addresses are allowed only when the hostname or IP is present in the allowlist. This is intentional for a home server, but keep the allowlist limited to services you control.

## Public and Admin APIs

### Public

* `GET /api/dashboard`

* `GET /api/apps`

* `GET /api/status`

* `GET /api/status?refresh=true`

* `GET /api/websites`

* `GET /api/websites/status`

* `GET /api/server-info`

* `GET /api/health`

### Admin (Session Cookie Required)

* `POST /api/auth/login`

* `POST /api/auth/logout`

* `GET /api/auth/session`

* `GET /api/admin/apps`

* `POST /api/admin/apps`

* `PUT /api/admin/apps/{id}`

* `PUT /api/admin/apps/{id}/visibility`

* `POST /api/admin/apps/{id}/run`

* `GET /api/admin/run-commands`

* `POST /api/admin/run-commands`

* `PUT /api/admin/run-commands/{id}`

* `DELETE /api/admin/run-commands/{id}`

* `DELETE /api/admin/apps/{id}`

* `GET /api/admin/websites`

* `POST /api/admin/websites`

* `PUT /api/admin/websites/{id}`

* `PUT /api/admin/websites/{id}/visibility`

* `DELETE /api/admin/websites/{id}`

* `PUT /api/admin/reorder`

* `GET /api/admin/alerts`

* `PUT /api/admin/alerts`

* `POST /api/admin/alerts/test`

* `GET /api/admin/healthcheck-hosts`

* `POST /api/admin/healthcheck-hosts`

* `PUT /api/admin/healthcheck-hosts`

* `DELETE /api/admin/healthcheck-hosts?host=`

* `POST /api/admin/icons`

Mutating admin requests must send header `X-CSRF-Token` matching the `dashboard_csrf` cookie.

## Server Metrics

CPU, RAM, swap, disk, and uptime are read from the dashboard host with `psutil`. Temperature prefers `vcgencmd measure_temp pmic` (then `vcgencmd measure_temp`), and falls back to `/sys/class/thermal` so it still works inside Docker. If a metric cannot be collected, the UI shows `Not Available`. Values are never invented.

Docker Compose runs the dashboard privileged with `pid: host` so `vcgencmd` can reach the Pi firmware. Rebuild after pulling:

```bash
docker compose up -d --build
```

A recovery message is sent when a previously down service comes back online. Use **Send Test** after saving alert settings.

## Backup and Update

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

## Security Recommendations

* Change `ADMIN_PASSWORD` before the first start.

* Do not expose port `8000` directly to the public internet without protection. Put it behind Cloudflare Access, a VPN (such as Tailscale), or a LAN-only bind.

* Set `COOKIE_SECURE=true` when serving HTTPS.

* Set `TRUST_PROXY=true` only behind a trusted reverse proxy.

* Keep `ALLOWED_HEALTHCHECK_HOSTS` as small as possible.

* Review health-check URLs before saving them. The backend rejects targets outside the allowlist.

* The Applications panel runs commands saved in Admin > Parameter Run Command as the dashboard user. Commands that start with `sudo` are rejected. Keep admin credentials private and do not expose the dashboard publicly without a trusted access layer.

* Rotate the admin password with `RESET_ADMIN_PASSWORD=true`, restart once, then set it back to `false`.

## Environment Variables

| Variable | Purpose |
| :--- | :--- |
| `ADMIN_USERNAME` | Initial admin username |
| `ADMIN_PASSWORD` | Initial admin password, used only on first setup or reset |
| `RESET_ADMIN_PASSWORD` | Replace the stored password hash on startup |
| `SERVER_HOSTNAME` | Hostname shown on the dashboard |
| `ALLOWED_HEALTHCHECK_HOSTS` | Comma-separated hosts permitted for probes |
| `FILEBROWSER_URL` | Seed URL for File Browser |
| `FREELLMAPI_URL` | Seed URL for FreeLLMAPI |
| `TELEGRAM_BOT_URL` | Seed URL for Telegram Bot |
| `PERSONAL_WEBSITE_URL` | Seed URL for the Personal Website section |
| `HEALTH_INTERVAL_SECONDS` | Probe interval, clamped to 30–60 seconds |
| `COOKIE_SECURE` | Set `true` when using HTTPS |
| `ALERT_ENABLED` | Enable down alerts |
| `ALERT_TELEGRAM_BOT_TOKEN` | Telegram bot token |
| `ALERT_TELEGRAM_CHAT_ID` | Telegram chat ID |
| `ALERT_WEBHOOK_URL` | HTTPS webhook for down/recovery events |
| `ALERT_FAIL_THRESHOLD` | Consecutive failures before alerting |
| `ALERT_QUIET_START` | Quiet-hours start, `HH:MM` |
| `ALERT_QUIET_END` | Quiet-hours end, `HH:MM` |
| `ALERT_TIMEZONE` | IANA timezone for quiet hours |
| `DATA_DIR` | SQLite and icon storage directory |
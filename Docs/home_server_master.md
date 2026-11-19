# Raspberry Pi Home Server — Master Reference & User Guide

> **Repository:** [`Saladimu/rasp`](https://github.com/Saladimu/rasp)  
> **Host:** Raspberry Pi (`rasp`) — 64-bit ARM (`aarch64`) / 1 GB RAM  
> **Primary Domain:** `saladimu.my.id` (Cloudflare Tunnel + Tailscale Mesh VPN)

This document serves as the unified technical reference and operational guide for the Raspberry Pi Home Server stack. It covers hardware and memory tuning, containerized services, custom dashboards, the Telegram AI bot, secure remote networking, and daily maintenance procedures.

---

## Table of Contents

- [1. System Architecture and Hardware Specifications](#1-system-architecture-and-hardware-specifications)
- [2. Master Port, Service, and Network Reference](#2-master-port-service-and-network-reference)
- [3. Storage and Swap Memory Optimization](#3-storage-and-swap-memory-optimization)
- [4. Core Docker Stack Setup and Configuration](#4-core-docker-stack-setup-and-configuration)
  - [4.1 Home Server Dashboard](#41-home-server-dashboard)
  - [4.2 Glance Dashboard](#42-glance-dashboard)
  - [4.3 File Browser](#43-file-browser)
  - [4.4 FreeLLMAPI Bridge](#44-freellmapi-bridge)
  - [4.5 Optional Low-Overhead Containers](#45-optional-low-overhead-containers)
- [5. Python Telegram AI Bot and Health Monitoring](#5-python-telegram-ai-bot-and-health-monitoring)
- [6. Networking, Remote Access, and Cloudflare Tunnel](#6-networking-remote-access-and-cloudflare-tunnel)
  - [6.1 Tailscale VPN and Private SSH](#61-tailscale-vpn-and-private-ssh)
  - [6.2 Cloudflare Tunnel Ingress Routing](#62-cloudflare-tunnel-ingress-routing)
  - [6.3 Switching to Local-Only Mode](#63-switching-to-local-only-mode)
- [7. Daily Operations, Troubleshooting, and CLI Cheat Sheet](#7-daily-operations-troubleshooting-and-cli-cheat-sheet)

---

## 1. System Architecture and Hardware Specifications

Because the server runs on a **1 GB RAM Raspberry Pi** (`~905 MB` usable physical memory), every service is chosen or tuned to minimize memory overhead and prevent Out-Of-Memory (OOM) crashes.

| Component | Specification / Configuration | Notes |
| :--- | :--- | :--- |
| **Board & CPU** | Raspberry Pi (64-bit `aarch64`) | Runs Debian / Raspberry Pi OS Bookworm (64-bit) |
| **Physical RAM** | ~905 MB (1 GB Model) | ~450–500 MB free under normal 24/7 container load |
| **Swap Buffer** | **2048 MB (2.0 GB)** via `dphys-swapfile` | Creates a ~2.9 GiB total memory safety buffer (`vm.swappiness=60`) |
| **Primary Storage** | **64 GB MicroSD Card** (~58–60 GB usable) | Cloned from 32 GB card via `rpi-clone` / Rufus and expanded |
| **Container Engine** | Docker + Docker Compose | All containers configured with `--restart unless-stopped` |
| **Public Ingress** | Cloudflare Tunnel (`cloudflared`) | Zero open router ports; automatic HTTPS/TLS via `saladimu.my.id` |
| **Private Admin** | Tailscale Mesh VPN (`tailscaled`) | Encrypted SSH (`ssh pi@rasp`) and private LAN/VPN access |

> **Hardware Expansion Note:** A secondary **Raspberry Pi 1 Model B Rev 2.0** (512 MB RAM, ARMv6) is kept in reserve for future standalone network tasks (such as Pi-hole DNS ad-blocking or an external ping watchdog) rather than Docker clustering, due to CPU architecture differences (`armv6l` vs. `aarch64`).

---

## 2. Master Port, Service, and Network Reference

### Active Services Matrix

| Service / Container | Runtime | Host Port | Public URL (Cloudflare) | Local / VPN Endpoint | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Home Server Dashboard** | Docker (`home-server-dashboard`) | `8000` | `https://saladimu.my.id` | `http://192.168.1.155:8000` | FastAPI + SQLite status & admin portal (`Saladimu/rasp`) |
| **Glance Dashboard** | Docker (`glance`) | `8085` | `https://dash.saladimu.my.id` | `http://192.168.1.155:8085` | Lightweight Go startpage, service monitors, feeds (~15 MB RAM) |
| **File Browser** | Docker (`filebrowser`) | `8080` | `https://files.saladimu.my.id` | `http://192.168.1.155:8080` | Web file manager isolated to `/home/pi/files` |
| **FreeLLMAPI** | Docker (`freellmapi-freellmapi-1`) | `3001` | `https://llm.saladimu.my.id` | `http://localhost:3001` | OpenAI-compatible LLM API bridge |
| **Telegram AI Bot** | Systemd (`telegram-bot`) | `8083` *(health)* | N/A (Telegram API) | `http://localhost:8083` | Low-RAM Python AI assistant + `/temp` hardware monitor |
| **Cloudflare Tunnel** | Systemd (`cloudflared`) | Outbound | `*.saladimu.my.id` | `/etc/cloudflared/config.yml` | Encrypted reverse proxy tunnel (`rasp-server`) |
| **Tailscale VPN** | Systemd (`tailscaled`) | UDP `41641` | N/A (Private Mesh) | `100.x.y.z` / `rasp` | Secure SSH & private access to all ports |

---

## 3. Storage and Swap Memory Optimization

### 3.1 SD Card Backup and Expansion (32 GB to 64 GB)

Two methods are supported for migrating or backing up the SD card:

1. **Live Cloning on the Pi (`rpi-clone`):**
   - Insert the target 64 GB SD card into a USB card reader attached to the Pi.
   - Identify the device name (typically `sda`):
     ```bash
     lsblk
     ```
   - Clone and auto-expand partitions:
     ```bash
     sudo rpi-clone sda
     ```
   - Shut down (`sudo shutdown -h now`), swap the SD cards, and boot.

2. **Windows Image Method (`Win32 Disk Imager` + `Rufus`):**
   - Read the source card to an `.img` file using Win32 Disk Imager.
   - Write the `.img` file in raw mode to the 64 GB card using Rufus.
   - Boot the Pi and expand the root filesystem via `sudo raspi-config` $\rightarrow$ **Advanced Options** $\rightarrow$ **Expand Filesystem**.

*Verification:* Run `df -h /` and confirm `/` reports `~58G–60G` total capacity.

---

### 3.2 Expanding Swap Memory to 2.0 GB (`dphys-swapfile`)

Expanding swap to **2048 MB** prevents OOM crashes during Docker builds or simultaneous API requests.

1. Remove conflicting `zram` generator if present:
   ```bash
   sudo apt remove systemd-zram-generator -y
   ```

2. Edit `/etc/dphys-swapfile`:
   ```bash
   sudo nano /etc/dphys-swapfile
   ```
   Set the following values:
   ```text
   CONF_SWAPFILE=/var/swap
   CONF_SWAPSIZE=2048
   CONF_SWAPFACTOR=2
   CONF_MAXSWAP=2048
   ```

3. Rebuild and activate the swap file:
   ```bash
   sudo dphys-swapfile setup
   sudo dphys-swapfile swapon
   ```

*Verification:* Run `free -h` and confirm Swap shows `2.0Gi` (bringing total memory + swap to `~2.9Gi`).

---

## 4. Core Docker Stack Setup and Configuration

Ensure Docker starts automatically on boot and all core containers use auto-restart policies:

```bash
sudo systemctl enable docker
docker update --restart unless-stopped filebrowser freellmapi-freellmapi-1 glance
```

---

### 4.1 Home Server Dashboard

The custom FastAPI + SQLite dashboard from `https://github.com/Saladimu/rasp` runs on port **`8000`**.

#### Initial Deployment
```bash
cd /home/pi
git clone https://github.com/Saladimu/rasp.git homeserver
cd /home/pi/homeserver

# Create runtime environment configuration
cp .env.example .env
nano .env

# Build and start in detached mode
docker compose up -d --build
```

#### Database Seeding (If Required)
```bash
docker exec -it home-server-dashboard python /app/backend/seed.py
```

#### Routine Updates
```bash
cd /home/pi/homeserver
git pull origin main
docker compose up -d --build
```

---

### 4.2 Glance Dashboard

**Glance** is an ultra-lightweight Go dashboard (`~10–15 MB RAM`) running on port **`8085`**.

> **Important Version & Formatting Rules (v0.7.0+):**
> 1. Glance v0.7.0+ requires the config file mounted at **`/app/config/glance.yml`** (not `/app/glance.yml`).
> 2. Theme colors **must use HSL strings** (e.g., `"222 47% 11%"`). Standard hex codes (e.g., `#0f172a`) will cause Glance to fail on startup.

#### Deploy Container
```bash
mkdir -p /home/pi/glance
docker run -d \
  --name glance \
  --restart unless-stopped \
  -p 8085:8085 \
  -v /home/pi/glance/glance.yml:/app/config/glance.yml \
  glanceapp/glance:latest
```

#### Production `glance.yml` (`/home/pi/glance/glance.yml`)
```yaml
server:
  port: 8085

theme:
  background-color: "222 47% 11%"
  primary-color: "199 89% 60%"
  contrast-color: "217 33% 17%"

pages:
  - name: Home Server
    columns:
      # Left Column: Service Health Monitors & Bookmarks
      - size: small
        widgets:
          - type: monitor
            title: Service Monitors
            sites:
              - title: Home Server Admin
                url: http://localhost:8000
              - title: File Browser
                url: http://localhost:8080
              - title: FreeLLMAPI
                url: http://localhost:3001
          - type: bookmarks
            title: Cloud Access Links
            groups:
              - title: Web Portals
                links:
                  - title: Home Server Web App
                    url: https://saladimu.my.id
                    icon: home
                  - title: Glance Dashboard
                    url: https://dash.saladimu.my.id
                    icon: layout-dashboard
                  - title: File Browser
                    url: https://files.saladimu.my.id
                    icon: folder
                  - title: Tailscale Admin
                    url: https://login.tailscale.com
                    icon: shield

      # Middle Column: Clock & Web Search
      - size: full
        widgets:
          - type: clock
            time-format: "24h"
            time-zone: "Asia/Jakarta"
          - type: search
            search-engine: google
            new-tab: true

      # Right Column: Tech News Feed
      - size: small
        widgets:
          - type: rss
            title: Tech Updates
            limit: 4
            feeds:
              - url: https://news.ycombinator.com/rss
                title: Hacker News
```

Apply configuration changes anytime:
```bash
docker restart glance && docker logs --tail 20 glance
```

---

### 4.3 File Browser

**File Browser** runs on port **`8080`** and is strictly isolated to `/home/pi/files` so OS directories and dotfiles remain hidden from the web UI.

#### Clean Reinstall / Database Initialization
> **Note:** Always `touch filebrowser.db` and run `config init` before starting the container; otherwise Docker creates `filebrowser.db` as an empty directory.

```bash
mkdir -p /home/pi/filebrowser /home/pi/files
cd /home/pi/filebrowser

# 1. Remove old container and reset database file
docker rm -f filebrowser
rm -rf filebrowser.db
touch filebrowser.db

# 2. Initialize database and create admin user
docker run --rm -v $(pwd)/filebrowser.db:/database/filebrowser.db \
  filebrowser/filebrowser:latest config init -d /database/filebrowser.db

docker run --rm -v $(pwd)/filebrowser.db:/database/filebrowser.db \
  filebrowser/filebrowser:latest users add admin <YOUR_STRONG_PASSWORD> --perm.admin -d /database/filebrowser.db

# 3. Launch isolated File Browser container
docker run -d \
  --name filebrowser \
  --restart always \
  -p 8080:80 \
  -v /home/pi/files:/srv \
  -v $(pwd)/filebrowser.db:/database/filebrowser.db \
  filebrowser/filebrowser:latest
```

---

### 4.4 FreeLLMAPI Bridge

**FreeLLMAPI** (`freellmapi-freellmapi-1`) runs on port **`3001`** and provides an OpenAI-compatible `/v1/chat/completions` endpoint used by the Telegram AI Bot and external clients (such as OpenHands BYOK).

- **Local Endpoint:** `http://localhost:3001/v1`
- **Public Endpoint:** `https://llm.saladimu.my.id/v1`
- **Directory:** `/home/pi/freellmapi`

```bash
# Check status and recent logs
docker logs --tail 50 freellmapi-freellmapi-1
```

---

### 4.5 Optional Low-Overhead Containers

| Application | Port | RAM Usage | Docker Command / Notes |
| :--- | :--- | :--- | :--- |
| **Homebox** *(Inventory)* | `7745` | ~30–60 MB | `docker run -d --name homebox --restart unless-stopped -p 7745:7745 -e TZ=Asia/Jakarta -v /home/pi/homebox:/data/ ghcr.io/sysadminsmedia/homebox:latest` |
| **Stirling-PDF** *(On-Demand)* | `8090` | ~250–400 MB | Run with `-e JAVA_TOOL_OPTIONS="-Xmx384m"` and stop when idle (`docker stop stirling-pdf`) to preserve RAM |
| **Uptime Kuma** *(Alerts)* | `3005` | ~70 MB | `docker run -d --name uptime-kuma --restart unless-stopped -p 3005:3001 -v /home/pi/uptime-kuma:/app/data louislam/uptime-kuma:1` |
| **Syncthing** *(Auto-Backup)* | `8384` | ~40 MB | Mount `-v /home/pi/files:/var/syncthing` so synced phone/PC files appear directly in File Browser |

---

## 5. Python Telegram AI Bot and Health Monitoring

Instead of running heavy web LLM interfaces (such as AnythingLLM with local models), the Pi runs a lightweight Python script (`~/telegram_llm_bot.py`, `~30 MB RAM`) managed by `systemd`.

### Key Capabilities
- **AI Chat Bridge:** Forwards Telegram prompts to `http://localhost:3001/v1/chat/completions` using Bearer token authentication.
- **HTTP Health Server (`Port 8083`):** Runs a lightweight background daemon thread (`start_health_server`) so the Home Server Dashboard (`:8000`) can verify the bot is online.
- **Hardware Telemetry (`/temp`):** Reports CPU temperature (`vcgencmd measure_temp`) and undervoltage/throttling flags (`vcgencmd get_throttled`).

### Service Management Commands
```bash
# Check bot service status
sudo systemctl status telegram-bot

# Restart bot after editing ~/telegram_llm_bot.py
sudo systemctl restart telegram-bot

# View live bot logs
sudo journalctl -u telegram-bot -f

# Test local health check endpoint
curl -i http://localhost:8083
```

---

## 6. Networking, Remote Access, and Cloudflare Tunnel

This setup separates **public web access** from **private administrative access**:
- **Public Web Apps:** Exposed over HTTPS via Cloudflare Tunnel with zero open router ports.
- **SSH & Admin Ports:** Accessible strictly over your local LAN (`192.168.1.155`) or encrypted Tailscale VPN.

---

### 6.1 Tailscale VPN and Private SSH

| Task | Command |
| :--- | :--- |
| **SSH via MagicDNS hostname** | `ssh pi@rasp` |
| **SSH via Tailscale IPv4** | `ssh pi@100.x.y.z` |
| **Check Tailscale status & peers** | `sudo tailscale status` |
| **Print Pi Tailscale IPv4** | `tailscale ip -4` |
| **Re-authenticate after SD clone** | `sudo tailscale up --reset` |

---

### 6.2 Cloudflare Tunnel Ingress Routing

- **Tunnel Name:** `rasp-server`
- **Tunnel ID:** `3be3d032-6945-4fd0-9f46-db7f17a8a3eb`
- **Credentials File:** `/home/pi/.cloudflared/3be3d032-6945-4fd0-9f46-db7f17a8a3eb.json`

> **Critical File Sync Rule:**  
> Because `cloudflared` runs as a `systemd` root service, **it reads `/etc/cloudflared/config.yml`**, not `/home/pi/.cloudflared/config.yml`. Always copy changes to `/etc/cloudflared/config.yml` before restarting the daemon.

#### Current `/etc/cloudflared/config.yml`
```yaml
tunnel: 3be3d032-6945-4fd0-9f46-db7f17a8a3eb
credentials-file: /home/pi/.cloudflared/3be3d032-6945-4fd0-9f46-db7f17a8a3eb.json

ingress:
  # Route root domain to Home Server web app (Port 8000)
  - hostname: saladimu.my.id
    service: http://localhost:8000

  # Route dash subdomain to Glance Dashboard container (Port 8085)
  - hostname: dash.saladimu.my.id
    service: http://localhost:8085

  # Route files subdomain to File Browser container (Port 8080)
  - hostname: files.saladimu.my.id
    service: http://localhost:8080

  # Route llm subdomain to FreeLLMAPI container (Port 3001)
  - hostname: llm.saladimu.my.id
    service: http://localhost:3001

  # Catch-all rule (Required at the bottom)
  - service: http_status:404
```

#### Workflow: Updating a Port/IP or Adding a Subdomain
```bash
# 1. Edit user config file
nano ~/.cloudflared/config.yml

# 2. (Only if adding a new subdomain) Create DNS CNAME route in Cloudflare
cloudflared tunnel route dns rasp-server <new-subdomain>.saladimu.my.id

# 3. Validate YAML syntax
cloudflared tunnel ingress validate --config ~/.cloudflared/config.yml

# 4. Sync to active system path and restart service
sudo cp /home/pi/.cloudflared/config.yml /etc/cloudflared/config.yml
sudo systemctl restart cloudflared

# 5. Verify active status
sudo systemctl status cloudflared
```

---

### 6.3 Switching to Local-Only Mode

If you ever want to keep the Raspberry Pi strictly local (LAN + Tailscale) and point `saladimu.my.id` elsewhere (e.g., GitHub Pages or Cloudflare Pages):

1. Disable `cloudflared` on the Pi:
   ```bash
   sudo systemctl disable --now cloudflared
   ```
2. Remove the `*.cfargotunnel.com` CNAME records in the Cloudflare DNS dashboard for `saladimu.my.id`.
3. Update links in `/home/pi/glance/glance.yml` from `https://*.saladimu.my.id` to `http://192.168.1.155:<PORT>` (or your Tailscale IP) and run `docker restart glance`.

---

## 7. Daily Operations, Troubleshooting, and CLI Cheat Sheet

### One-Line Master Health Check
Run this snippet via SSH to inspect disk space, RAM/swap, CPU temperature, Docker containers, and network tunnels at once:

```bash
echo "=== STORAGE ===" && df -h / && \
echo "=== MEMORY & SWAP ===" && free -h && \
echo "=== CPU TEMP ===" && vcgencmd measure_temp && \
echo "=== DOCKER CONTAINERS ===" && docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" && \
echo "=== TUNNELS ===" && systemctl is-active cloudflared tailscaled telegram-bot
```

### Nano Editor Block-Copy Shortcuts
| Action | Shortcut |
| :--- | :--- |
| Jump to top of file | `Alt + \` |
| Start text selection (`[ Mark Set ]`) | `Ctrl + 6` (or `Alt + A`) |
| Jump to bottom of file | `Alt + /` (or `Ctrl + End`) |
| Copy selected block to nano buffer | `Alt + 6` |
| Paste from nano buffer | `Ctrl + U` |
| Save file / Exit nano | `Ctrl + O`, `Enter`, then `Ctrl + X` |

### Pushing Documentation Updates to GitHub (`/Docs`)
To keep `/home/pi/homeserver` synced with `Saladimu/rasp` and push updated Markdown documentation cleanly without committing local `.env` or SQLite database files:

```bash
cd /home/pi/homeserver
git pull --rebase origin main
git add Docs/ README.md
git commit -m "docs: update Raspberry Pi master reference guide"
git push origin main
```
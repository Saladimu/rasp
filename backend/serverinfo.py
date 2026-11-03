import os
import socket
import time
from typing import Any

from .config import settings


def collect_server_info() -> dict[str, Any]:
    hostname = settings.server_hostname.strip() or socket.gethostname() or "Not Available"
    cpu = "Not Available"
    ram = "Not Available"
    disk = "Not Available"
    uptime = "Not Available"

    try:
        import psutil

        cpu = f"{psutil.cpu_percent(interval=0.15):.1f}%"
        memory = psutil.virtual_memory()
        ram = f"{memory.percent:.1f}%"
        disk_stat = psutil.disk_usage("/")
        disk = f"{disk_stat.percent:.1f}%"
        elapsed = max(int(time.time() - psutil.boot_time()), 0)
        days, rem = divmod(elapsed, 86400)
        hours, rem = divmod(rem, 3600)
        minutes, _ = divmod(rem, 60)
        uptime = f"{days}d {hours}h {minutes}m"
    except Exception:
        pass

    return {
        "hostname": hostname,
        "cpu": cpu,
        "ram": ram,
        "disk": disk,
        "uptime": uptime,
        "pid": os.getpid(),
        "status": "online",
        "dashboard_name": settings.dashboard_name,
        "dashboard_subtitle": settings.dashboard_subtitle,
    }

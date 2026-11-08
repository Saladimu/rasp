import os
import re
import shutil
import socket
import subprocess
import time
from typing import Any

from .config import settings

_CACHE: dict[str, Any] = {"data": None, "ts": 0.0}
_CACHE_TTL = 5.0
_cpu_primed = False
_cpu_model_cache: str | None = None

try:
    import psutil as _psutil

    _psutil.cpu_percent(interval=None)
    _cpu_primed = True
except Exception:
    pass


def format_bytes(value: int) -> str:
    gb = value / (1024 ** 3)
    if gb >= 10:
        return f"{gb:.0f} GB"
    if gb >= 1:
        return f"{gb:.1f} GB"
    mb = value / (1024 ** 2)
    if mb >= 1:
        return f"{mb:.0f} MB"
    return f"{value} B"


def cpu_model_name() -> str:
    global _cpu_model_cache
    if _cpu_model_cache:
        return _cpu_model_cache
    model = ""
    try:
        with open("/proc/cpuinfo", encoding="utf-8") as handle:
            for line in handle:
                if line.lower().startswith("model name") or line.lower().startswith("hardware"):
                    model = line.split(":", 1)[1].strip()
                    if model:
                        break
    except OSError:
        model = ""
    if not model:
        try:
            import platform

            model = (platform.processor() or platform.machine() or "").strip()
        except Exception:
            model = ""
    _cpu_model_cache = model or "Not Available"
    return _cpu_model_cache


def _parse_vcgencmd_temp(output: str) -> str | None:
    text = (output or "").strip()
    if not text:
        return None
    match = re.search(r"temp\s*=\s*(-?\d+(?:\.\d+)?)", text, re.IGNORECASE)
    if not match:
        match = re.search(r"(-?\d+(?:\.\d+)?)", text)
    if not match:
        return None
    try:
        return f"{float(match.group(1)):.1f}°C"
    except ValueError:
        return None


def _run_command(args: list[str]) -> str | None:
    try:
        completed = subprocess.run(
            args,
            capture_output=True,
            text=True,
            timeout=3,
            check=False,
        )
    except (OSError, subprocess.SubprocessError):
        return None
    return _parse_vcgencmd_temp(f"{completed.stdout or ''}\n{completed.stderr or ''}")


def _vcgencmd_binaries() -> list[str]:
    found: list[str] = []
    env_path = os.environ.get("VCGENCMD_PATH", "").strip()
    if env_path:
        found.append(env_path)
    which = shutil.which("vcgencmd")
    if which:
        found.append(which)
    found.extend(
        [
            "/usr/bin/vcgencmd",
            "/opt/vc/bin/vcgencmd",
            "/usr/local/bin/vcgencmd",
            "/proc/1/root/usr/bin/vcgencmd",
            "/proc/1/root/opt/vc/bin/vcgencmd",
        ]
    )
    binaries: list[str] = []
    seen: set[str] = set()
    for path in found:
        if path in seen:
            continue
        seen.add(path)
        if os.path.isfile(path) and os.access(path, os.X_OK):
            binaries.append(path)
    return binaries


def _vcgencmd_temperature() -> tuple[str, str] | None:
    probes = (
        (["measure_temp", "pmic"], "PMIC"),
        (["measure_temp"], "SoC"),
    )
    nsenter = shutil.which("nsenter")
    for extra, label in probes:
        for binary in _vcgencmd_binaries():
            value = _run_command([binary, *extra])
            if value:
                return value, label
        if nsenter and os.path.exists("/proc/1/ns/mnt"):
            value = _run_command([nsenter, "-t", "1", "-m", "--", "vcgencmd", *extra])
            if value:
                return value, label
    return None


def _sysfs_temperature() -> tuple[str, str] | None:
    base = "/sys/class/thermal"
    try:
        names = sorted(os.listdir(base))
    except OSError:
        return None
    zones: list[tuple[float, str]] = []
    for name in names:
        if not name.startswith("thermal_zone"):
            continue
        zone = os.path.join(base, name)
        try:
            with open(os.path.join(zone, "temp"), encoding="utf-8") as handle:
                celsius = int(handle.read().strip()) / 1000.0
            kind = "SoC"
            try:
                with open(os.path.join(zone, "type"), encoding="utf-8") as handle:
                    kind = handle.read().strip() or "SoC"
            except OSError:
                pass
            zones.append((celsius, kind))
        except (OSError, ValueError):
            continue
    if not zones:
        return None
    chosen = zones[0]
    for celsius, kind in zones:
        lowered = kind.lower()
        if "pmic" in lowered:
            chosen = (celsius, kind)
            break
        if "cpu" in lowered or "soc" in lowered:
            chosen = (celsius, kind)
    celsius, kind = chosen
    label = "PMIC" if "pmic" in kind.lower() else "SoC"
    return f"{celsius:.1f}°C", label


def read_pmic_temperature() -> tuple[str, str]:
    value = _vcgencmd_temperature()
    if value:
        return value
    value = _sysfs_temperature()
    if value:
        return value
    return "Not Available", ""


def collect_server_info() -> dict[str, Any]:
    now = time.monotonic()
    cached = _CACHE["data"]
    if cached and now - _CACHE["ts"] < _CACHE_TTL:
        return cached

    hostname = settings.server_hostname.strip() or socket.gethostname() or "Not Available"
    cpu = "Not Available"
    cpu_detail = "Not Available"
    ram = "Not Available"
    ram_detail = "Not Available"
    disk = "Not Available"
    disk_detail = "Not Available"
    temp, temp_detail = read_pmic_temperature()
    uptime = "Not Available"

    try:
        import psutil

        global _cpu_primed
        sample = psutil.cpu_percent(interval=None)
        if not _cpu_primed:
            _cpu_primed = True
            sample = psutil.cpu_percent(interval=None)
        cores = psutil.cpu_count(logical=True) or 0
        model = cpu_model_name()
        cpu = f"{sample:.1f}%"
        cpu_detail = model if model != "Not Available" else "Not Available"
        if cores and cpu_detail != "Not Available":
            cpu_detail = f"{cpu_detail} · {cores} cores"
        elif cores:
            cpu_detail = f"{cores} cores"
        memory = psutil.virtual_memory()
        ram = f"{memory.percent:.1f}%"
        ram_detail = f"{format_bytes(memory.used)} / {format_bytes(memory.total)}"
        disk_stat = psutil.disk_usage("/")
        disk = f"{disk_stat.percent:.1f}%"
        disk_detail = f"{format_bytes(disk_stat.used)} / {format_bytes(disk_stat.total)}"
        elapsed = max(int(time.time() - psutil.boot_time()), 0)
        days, rem = divmod(elapsed, 86400)
        hours, rem = divmod(rem, 3600)
        minutes, _ = divmod(rem, 60)
        uptime = f"{days}d {hours}h {minutes}m"
    except Exception:
        pass

    result = {
        "hostname": hostname,
        "cpu": cpu,
        "cpu_detail": cpu_detail,
        "ram": ram,
        "ram_detail": ram_detail,
        "disk": disk,
        "disk_detail": disk_detail,
        "temp": temp,
        "temp_detail": temp_detail,
        "uptime": uptime,
        "pid": os.getpid(),
        "status": "online",
        "dashboard_name": settings.dashboard_name,
        "dashboard_subtitle": settings.dashboard_subtitle,
    }
    _CACHE["data"] = result
    _CACHE["ts"] = now
    return result

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
_HIDDEN_MOUNTS: dict[str, float] = {}
_HIDDEN_TTL = 45.0
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


def format_gb(value: int) -> str:
    gb = max(value, 0) / (1024 ** 3)
    if gb >= 10:
        return f"{gb:.1f} GB"
    return f"{gb:.2f} GB"


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


_THROTTLE_HISTORY: list[int] = []
_THROTTLE_HISTORY_MAX = 8
_ACTIVE_UNDERVOLTAGE = 1 << 0
_ACTIVE_FREQ_CAP = 1 << 1
_ACTIVE_THROTTLED = 1 << 2
_ACTIVE_SOFT_TEMP = 1 << 3
_ACTIVE_MASK = 0xF
_HISTORICAL_UNDERVOLTAGE = 1 << 16
_POWER_ADVICE = "Use a dedicated 5V/3A adapter and a short, thick USB cable"

_THROTTLE_FLAGS = (
    (_ACTIVE_UNDERVOLTAGE, "under-voltage"),
    (_ACTIVE_FREQ_CAP, "freq capped"),
    (_ACTIVE_THROTTLED, "throttled"),
    (_ACTIVE_SOFT_TEMP, "soft temp limit"),
    (_HISTORICAL_UNDERVOLTAGE, "under-voltage occurred"),
    (1 << 17, "freq cap occurred"),
    (1 << 18, "throttling occurred"),
    (1 << 19, "soft temp limit occurred"),
)


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


def _parse_vcgencmd_throttled(output: str) -> int | None:
    text = (output or "").strip()
    if not text:
        return None
    match = re.search(r"throttled\s*=\s*(0x[0-9a-fA-F]+|\d+)", text, re.IGNORECASE)
    if not match:
        return None
    try:
        return int(match.group(1), 0)
    except ValueError:
        return None


def _run_process(args: list[str]) -> str | None:
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
    text = f"{completed.stdout or ''}\n{completed.stderr or ''}".strip()
    return text or None


def _decode_sys_text(raw: bytes | str, collapse: bool = True) -> str:
    if isinstance(raw, bytes):
        text = raw.split(b"\x00", 1)[0].decode("utf-8", "replace")
    else:
        text = str(raw).split("\x00", 1)[0]
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    if collapse:
        return " ".join(text.split()).strip()
    return text.strip()


def _read_file_safe(path: str, collapse: bool = True) -> str | None:
    try:
        with open(path, "rb") as handle:
            text = _decode_sys_text(handle.read(), collapse=collapse)
    except OSError:
        return None
    return text or None


def _host_file_candidates(path: str) -> list[str]:
    host_path = f"/proc/1/root{path}"
    candidates = [host_path, path]
    seen: list[str] = []
    for item in candidates:
        if item not in seen:
            seen.append(item)
    return seen


def _read_host_file(path: str, collapse: bool = True) -> str | None:
    for candidate in _host_file_candidates(path):
        text = _read_file_safe(candidate, collapse=collapse)
        if text:
            return text
    nsenter = shutil.which("nsenter")
    if nsenter and os.path.exists("/proc/1/ns/mnt"):
        try:
            completed = subprocess.run(
                [nsenter, "-t", "1", "-m", "--", "cat", path],
                capture_output=True,
                timeout=3,
                check=False,
            )
        except (OSError, subprocess.SubprocessError):
            completed = None
        if completed is not None:
            text = _decode_sys_text(completed.stdout or b"", collapse=collapse)
            if text:
                return text
    return None


def _cpuinfo_field(text: str, *names: str) -> str | None:
    wanted = {name.lower() for name in names}
    for line in (text or "").splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        if key.strip().lower() in wanted:
            value = value.strip()
            if value:
                return value
    return None


def _cpuinfo_model() -> str | None:
    text = _read_host_file("/proc/cpuinfo", collapse=False)
    if not text:
        return None
    model = _cpuinfo_field(text, "Model")
    if model and not model.isdigit() and len(model) > 3:
        return model
    hardware = _cpuinfo_field(text, "Hardware")
    if hardware and not hardware.isdigit():
        return hardware
    model_name = _cpuinfo_field(text, "model name")
    if model_name:
        return model_name
    return None


def _usable_model(value: str | None) -> str | None:
    text = (value or "").strip()
    if not text:
        return None
    lowered = text.lower()
    if lowered in {"none", "not available", "default string", "system product name", "to be filled by o.e.m."}:
        return None
    return text


def _device_model_name() -> str:
    for path in (
        "/proc/device-tree/model",
        "/sys/firmware/devicetree/base/model",
        "/sys/devices/virtual/dmi/id/product_name",
        "/sys/class/dmi/id/product_name",
    ):
        value = _usable_model(_read_host_file(path))
        if value:
            return value
    value = _usable_model(_cpuinfo_model())
    if value:
        return value
    compatible = _read_host_file("/proc/device-tree/compatible") or _read_host_file(
        "/sys/firmware/devicetree/base/compatible"
    )
    if compatible:
        first = compatible.split(",")[0].strip()
        if _usable_model(first):
            return first
    try:
        import platform

        value = _usable_model(platform.machine())
        if value:
            return value
    except Exception:
        pass
    return "Not Available"


def _parse_os_release(text: str) -> str | None:
    fields: dict[str, str] = {}
    for line in (text or "").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, raw = stripped.split("=", 1)
        fields[key] = raw.strip().strip('"').strip("'")
    pretty = fields.get("PRETTY_NAME") or fields.get("NAME")
    version = fields.get("VERSION_ID") or fields.get("VERSION")
    if pretty:
        return pretty
    if fields.get("NAME") and version:
        return f"{fields['NAME']} {version}"
    return version or None


def _os_pretty_name() -> str:
    for path in ("/etc/os-release", "/usr/lib/os-release"):
        value = _parse_os_release(_read_host_file(path, collapse=False) or "")
        if value:
            return value
    try:
        import platform

        system = (platform.system() or "").strip()
        release = (platform.release() or "").strip()
        if system and release:
            return f"{system} {release}"
        if system:
            return system
    except Exception:
        pass
    return "Not Available"


def _kernel_arch() -> str:
    try:
        info = os.uname()
        release = (info.release or "").strip()
        machine = (info.machine or "").strip()
        if release and machine:
            return f"{release} {machine}"
        if release or machine:
            return release or machine
    except OSError:
        pass
    for args in (["uname", "-rm"], ["uname", "-r"]):
        value = _decode_sys_text(_run_process(args) or "")
        if value:
            return value
    nsenter = shutil.which("nsenter")
    if nsenter and os.path.exists("/proc/1/ns/uts"):
        value = _decode_sys_text(_run_process([nsenter, "-t", "1", "-u", "--", "uname", "-rm"]) or "")
        if value:
            return value
    text = _read_host_file("/proc/version", collapse=False)
    if text:
        parts = text.split()
        if len(parts) >= 3:
            machine = ""
            try:
                machine = os.uname().machine
            except OSError:
                machine = ""
            return f"{parts[2]} {machine}".strip()
        return text.split("\n", 1)[0]
    return "Not Available"


def collect_system_info() -> dict[str, str]:
    device_model = "Not Available"
    os_pretty_name = "Not Available"
    kernel_arch = "Not Available"
    try:
        device_model = _device_model_name()
    except Exception:
        pass
    try:
        os_pretty_name = _os_pretty_name()
    except Exception:
        pass
    try:
        kernel_arch = _kernel_arch()
    except Exception:
        pass
    return {
        "device_model": device_model or "Not Available",
        "os_pretty_name": os_pretty_name or "Not Available",
        "kernel_arch": kernel_arch or "Not Available",
    }


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


def _vcgencmd_outputs(extra: list[str]):
    nsenter = shutil.which("nsenter")
    for binary in _vcgencmd_binaries():
        text = _run_process([binary, *extra])
        if text:
            yield text
    if nsenter and os.path.exists("/proc/1/ns/mnt"):
        text = _run_process([nsenter, "-t", "1", "-m", "--", "vcgencmd", *extra])
        if text:
            yield text


def _first_vcgencmd(extra: list[str], parser):
    for text in _vcgencmd_outputs(extra):
        value = parser(text)
        if value is not None:
            return value
    return None


def _vcgencmd_temperature() -> tuple[str, str] | None:
    probes = (
        (["measure_temp", "pmic"], "PMIC"),
        (["measure_temp"], "SoC"),
    )
    for extra, label in probes:
        value = _first_vcgencmd(extra, _parse_vcgencmd_temp)
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


def _throttle_hex(value: int) -> str:
    return f"0x{value:x}"


def _flag_labels(value: int) -> list[str]:
    return [label for bit, label in _THROTTLE_FLAGS if value & bit]


def _record_throttle(value: int) -> list[int]:
    _THROTTLE_HISTORY.append(value)
    if len(_THROTTLE_HISTORY) > _THROTTLE_HISTORY_MAX:
        del _THROTTLE_HISTORY[0 : len(_THROTTLE_HISTORY) - _THROTTLE_HISTORY_MAX]
    return list(_THROTTLE_HISTORY)


def _power_status(value: int, history: list[int]) -> tuple[str, str, str]:
    raw = f"throttled={_throttle_hex(value)}"
    if value == 0:
        detail = "Active and historical throttle flags are cleared across consecutive checks"
        if len(history) <= 1:
            detail = "Active and historical throttle flags are clear"
        return "Clean Power Delivery", raw, detail
    if value & _ACTIVE_MASK:
        labels = _flag_labels(value & _ACTIVE_MASK)
        detail = ", ".join(labels) if labels else "Power bottleneck is active"
        if value & (_ACTIVE_UNDERVOLTAGE | _ACTIVE_THROTTLED):
            detail = f"{detail}. {_POWER_ADVICE}"
        return "Power Issue", raw, detail
    if value & _HISTORICAL_UNDERVOLTAGE:
        return (
            "Past Undervoltage",
            raw,
            f"Active flags cleared; historical under-voltage remains until reboot. {_POWER_ADVICE}",
        )
    labels = _flag_labels(value)
    detail = ", ".join(labels) if labels else "Historical throttle flags remain until reboot"
    return "Past Throttle", raw, detail


def read_power_delivery() -> tuple[str, str, str]:
    value = _first_vcgencmd(["get_throttled"], _parse_vcgencmd_throttled)
    if value is None:
        return "Not Available", "", "vcgencmd get_throttled is unavailable"
    history = _record_throttle(value)
    return _power_status(value, history)


def _read_meminfo_swap(path: str) -> tuple[int, int] | None:
    try:
        values: dict[str, int] = {}
        with open(path, encoding="utf-8") as handle:
            for line in handle:
                if line.startswith("SwapTotal:") or line.startswith("SwapFree:"):
                    key, raw, *_rest = line.split()
                    values[key.rstrip(":")] = int(raw) * 1024
        total = values.get("SwapTotal")
        free = values.get("SwapFree")
        if total is None or free is None:
            return None
        return total, max(total - free, 0)
    except (OSError, ValueError):
        return None


_SKIP_FS = {
    "proc",
    "sysfs",
    "cgroup",
    "cgroup2",
    "tmpfs",
    "devtmpfs",
    "devpts",
    "overlay",
    "squashfs",
    "autofs",
    "fuse.portal",
    "fusectl",
    "rpc_pipefs",
    "securityfs",
    "pstore",
    "bpf",
    "tracefs",
    "debugfs",
    "configfs",
    "hugetlbfs",
    "mqueue",
    "binfmt_misc",
    "nsfs",
    "ramfs",
    "iso9660",
}

_SKIP_MOUNT_PREFIXES = (
    "/proc",
    "/sys",
    "/dev",
    "/run/docker",
    "/var/lib/docker",
    "/var/lib/containerd",
    "/boot",
    "/snap",
)


def _host_command(args: list[str]) -> str | None:
    nsenter = shutil.which("nsenter")
    if nsenter and os.path.exists("/proc/1/ns/mnt"):
        text = _run_process([nsenter, "-t", "1", "-m", "--", *args])
        if text:
            return text
    return _run_process(args)


def _get_parent_block_device(device: str) -> str:
    basename = os.path.basename(device or "")
    if not basename:
        return ""
    if basename.startswith(("nvme", "mmcblk", "loop", "nbd")):
        return re.sub(r"p\d+$", "", basename)
    return re.sub(r"\d+$", "", basename)


def _sys_block_roots(name: str) -> list[str]:
    roots = [f"/sys/block/{name}", f"/proc/1/root/sys/block/{name}"]
    seen: list[str] = []
    for path in roots:
        if path not in seen:
            seen.append(path)
    return seen


def _sysfs_usb(name: str) -> bool:
    if not name or name.startswith(("loop", "ram", "zram", "dm-", "md", "sr")):
        return False
    for base in _sys_block_roots(name):
        if not os.path.isdir(base):
            continue
        try:
            real = os.path.realpath(os.path.join(base, "device"))
            if "/usb" in real.lower():
                return True
        except OSError:
            pass
        for rel in ("device/uevent", "uevent"):
            text = (_read_file_safe(os.path.join(base, rel), collapse=False) or "").upper()
            if "USB" in text or "DRIVER=USB-STORAGE" in text:
                return True
    return False


def _lsblk_transport(name: str) -> str:
    device = name if name.startswith("/dev/") else f"/dev/{name}"
    text = _host_command(["lsblk", "-no", "TRAN", device]) or ""
    return text.split("\n", 1)[0].strip().lower()


def _is_usb_drive(device: str) -> bool:
    parent = _get_parent_block_device(device)
    if not parent:
        return False
    if _sysfs_usb(parent):
        return True
    return _lsblk_transport(parent) == "usb" or _lsblk_transport(device) == "usb"


def _get_drive_label(device: str) -> str | None:
    for args in (
        ["blkid", "-o", "value", "-s", "LABEL", device],
        ["lsblk", "-no", "LABEL", device],
    ):
        label = (_host_command(args) or "").split("\n", 1)[0].strip()
        if label:
            return label
    return None


def _get_drive_firmware(device: str) -> str | None:
    parent = _get_parent_block_device(device)
    for attr in ("device/model", "device/vendor", "device/rev"):
        for base in _sys_block_roots(parent):
            value = _read_file_safe(os.path.join(base, attr))
            if value:
                return value
    model = (_host_command(["lsblk", "-no", "MODEL,VENDOR", f"/dev/{parent}"]) or "").split("\n", 1)[0].strip()
    return model or None


def _parse_mounts(path: str) -> list[tuple[str, str, str]]:
    mounts: list[tuple[str, str, str]] = []
    text = _read_file_safe(path, collapse=False)
    if not text:
        return mounts
    for line in text.splitlines():
        parts = line.split()
        if len(parts) < 3:
            continue
        device, mountpoint, fstype = parts[0], parts[1], parts[2]
        mountpoint = mountpoint.replace("\\040", " ")
        mounts.append((device, mountpoint, fstype))
    return mounts


def _host_mounts() -> list[tuple[str, str, str]]:
    seen: set[tuple[str, str]] = set()
    mounts: list[tuple[str, str, str]] = []
    for path in ("/proc/1/mounts", "/proc/mounts"):
        for device, mountpoint, fstype in _parse_mounts(path):
            key = (device, mountpoint)
            if key in seen:
                continue
            seen.add(key)
            mounts.append((device, mountpoint, fstype))
    text = _host_command(["findmnt", "-r", "-n", "-o", "SOURCE,TARGET,FSTYPE"])
    if text:
        for line in text.splitlines():
            parts = line.split()
            if len(parts) < 3:
                continue
            device, mountpoint, fstype = parts[0], parts[1].replace("\\x20", " "), parts[2]
            key = (device, mountpoint)
            if key in seen:
                continue
            seen.add(key)
            mounts.append((device, mountpoint, fstype))
    return mounts


def _mount_usage(mountpoint: str) -> tuple[int, int] | None:
    candidates = [mountpoint]
    host_path = f"/proc/1/root{mountpoint}"
    if host_path not in candidates:
        candidates.append(host_path)
    try:
        import psutil

        for path in candidates:
            try:
                usage = psutil.disk_usage(path)
            except (OSError, PermissionError):
                continue
            if usage.total:
                return usage.total, usage.used
    except Exception:
        pass
    text = _host_command(["df", "-B1", "--output=size,used,target", mountpoint])
    if not text:
        text = _host_command(["df", "-B1", mountpoint])
    if not text:
        return None
    for line in text.splitlines()[1:]:
        parts = line.split()
        if len(parts) >= 2:
            try:
                return int(parts[0]), int(parts[1])
            except ValueError:
                continue
    return None


def hide_usb_mount(mountpoint: str) -> None:
    if mountpoint:
        _HIDDEN_MOUNTS[mountpoint] = time.monotonic()


def _is_hidden_mount(mountpoint: str) -> bool:
    hidden_at = _HIDDEN_MOUNTS.get(mountpoint)
    if hidden_at is None:
        return False
    if time.monotonic() - hidden_at > _HIDDEN_TTL:
        _HIDDEN_MOUNTS.pop(mountpoint, None)
        return False
    return True


def _findmnt_active(mountpoint: str, device: str = "") -> bool:
    args = ["findmnt", "-n", "-o", "SOURCE,TARGET", "--target", mountpoint]
    commands: list[list[str]] = []
    nsenter = shutil.which("nsenter")
    if nsenter and os.path.exists("/proc/1/ns/mnt"):
        commands.append([nsenter, "-t", "1", "-m", "--", *args])
    commands.append(args)
    ran = False
    for command in commands:
        try:
            completed = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=3,
                check=False,
            )
        except (OSError, subprocess.SubprocessError):
            continue
        ran = True
        text = f"{completed.stdout or ''}\n{completed.stderr or ''}"
        if completed.returncode != 0 or mountpoint not in text:
            return False
        if device and os.path.basename(device) not in text and device not in text:
            return False
        return True
    return not ran


def _usable_usb_mount(device: str, mountpoint: str, fstype: str) -> bool:
    if not device.startswith("/dev/"):
        return False
    if fstype.lower() in _SKIP_FS:
        return False
    if not mountpoint or mountpoint == "/":
        return False
    if any(mountpoint == prefix or mountpoint.startswith(prefix + "/") for prefix in _SKIP_MOUNT_PREFIXES):
        return False
    if not _is_usb_drive(device):
        return False
    return _findmnt_active(mountpoint, device)


def collect_usb_drives() -> list[dict[str, Any]]:
    usb_drives: list[dict[str, Any]] = []
    seen: set[str] = set()
    try:
        for device, mountpoint, fstype in _host_mounts():
            if mountpoint in seen or _is_hidden_mount(mountpoint) or not _usable_usb_mount(device, mountpoint, fstype):
                continue
            usage = _mount_usage(mountpoint)
            if not usage:
                continue
            total, used = usage
            use_pct = (used / total * 100) if total > 0 else 0
            usb_drives.append(
                {
                    "device": device,
                    "mountpoint": mountpoint,
                    "fstype": fstype,
                    "label": _get_drive_label(device) or "Unknown",
                    "firmware": _get_drive_firmware(device) or "Unknown",
                    "used": format_gb(used),
                    "size": format_gb(total),
                    "use_pct": f"{use_pct:.1f}%",
                    "used_bytes": used,
                    "total_bytes": total,
                    "status": "mounted",
                }
            )
            seen.add(mountpoint)
    except Exception:
        return usb_drives
    usb_drives.sort(key=lambda item: item.get("mountpoint") or "")
    return usb_drives


def collect_server_info() -> dict[str, Any]:
    now = time.monotonic()
    cached = _CACHE["data"]
    if cached and now - _CACHE["ts"] < _CACHE_TTL:
        fresh = dict(cached)
        fresh["usb_drives"] = collect_usb_drives()
        _CACHE["data"] = fresh
        return fresh

    hostname = settings.server_hostname.strip() or socket.gethostname() or "Not Available"
    cpu = "Not Available"
    cpu_detail = "Not Available"
    ram = "Not Available"
    ram_detail = "Not Available"
    swap = "Not Available"
    swap_detail = "Not Available"
    disk = "Not Available"
    disk_detail = "Not Available"
    temp, temp_detail = read_pmic_temperature()
    power, power_raw, power_detail = read_power_delivery()
    uptime = "Not Available"
    system_info = collect_system_info()

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
        swap_stat = psutil.swap_memory()
        swap_total = swap_stat.total
        swap_used = swap_stat.used
        if not swap_total:
            for path in ("/proc/meminfo", "/proc/1/root/proc/meminfo"):
                parsed = _read_meminfo_swap(path)
                if parsed and parsed[0]:
                    swap_total, swap_used = parsed
                    break
        if swap_total:
            swap = f"{(swap_used / swap_total) * 100:.1f}%"
            swap_detail = f"{format_bytes(swap_used)} / {format_bytes(swap_total)}"
        else:
            swap = "None"
            swap_detail = "No swap configured"
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
        "swap": swap,
        "swap_detail": swap_detail,
        "disk": disk,
        "disk_detail": disk_detail,
        "temp": temp,
        "temp_detail": temp_detail,
        "power": power,
        "power_raw": power_raw,
        "power_detail": power_detail,
        "uptime": uptime,
        "device_model": system_info["device_model"],
        "os_pretty_name": system_info["os_pretty_name"],
        "kernel_arch": system_info["kernel_arch"],
        "pid": os.getpid(),
        "status": "online",
        "dashboard_name": settings.dashboard_name,
        "dashboard_subtitle": settings.dashboard_subtitle,
        "usb_drives": collect_usb_drives(),
    }
    _CACHE["data"] = result
    _CACHE["ts"] = now
    return result

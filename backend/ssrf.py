import ipaddress
import json
import re
import socket
from urllib.parse import urlparse

from .database import db_session

ALWAYS_BLOCKED_HOSTS = {
    "metadata.google.internal",
    "metadata.google.com",
    "instance-data",
    "metadata",
}

DEFAULT_BLOCKED_HOSTS = {
    "localhost",
    "localhost.localdomain",
}

EXTRA_HOSTS_KEY = "extra_healthcheck_hosts"
HOST_NAME_RE = re.compile(r"^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$")
HOST_LABEL_RE = re.compile(r"^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$")


class HealthCheckTargetError(ValueError):
    pass


def parse_allowed_hosts(raw: str) -> set[str]:
    hosts: set[str] = set()
    for item in raw.split(","):
        value = item.strip().lower()
        if value:
            hosts.add(value)
    return hosts


def normalize_host(value: str) -> str:
    raw = (value or "").strip()
    if "://" in raw:
        parsed = urlparse(raw)
        raw = parsed.hostname or ""
    raw = raw.strip().lower().strip("[]")
    if raw.count(":") == 1 and not raw.startswith(":"):
        host_part, port_part = raw.rsplit(":", 1)
        if port_part.isdigit():
            raw = host_part
    return raw.strip()


def validate_allowlist_host(value: str) -> str:
    hostname = normalize_host(value)
    if not hostname:
        raise HealthCheckTargetError("Host is required.")
    if hostname in ALWAYS_BLOCKED_HOSTS:
        raise HealthCheckTargetError("Health-check host is not allowed.")
    if len(hostname) > 253:
        raise HealthCheckTargetError("Host is too long.")
    try:
        ipaddress.ip_address(hostname)
        return hostname
    except ValueError:
        pass
    if HOST_NAME_RE.match(hostname) or HOST_LABEL_RE.match(hostname):
        return hostname
    raise HealthCheckTargetError("Enter a hostname or IP, for example llm.saladimu.my.id")


def extra_allowed_hosts() -> set[str]:
    with db_session() as conn:
        row = conn.execute("SELECT value FROM settings WHERE key = ?", (EXTRA_HOSTS_KEY,)).fetchone()
    if not row:
        return set()
    try:
        values = json.loads(row["value"])
    except (TypeError, json.JSONDecodeError):
        values = []
    hosts: set[str] = set()
    if isinstance(values, list):
        for item in values:
            if isinstance(item, str) and item.strip():
                hosts.add(item.strip().lower())
    return hosts


def allowed_healthcheck_hosts() -> set[str]:
    from .config import settings

    return parse_allowed_hosts(settings.allowed_healthcheck_hosts) | extra_allowed_hosts()


def extra_hosts_payload() -> dict[str, list[str]]:
    from .config import settings

    env_hosts = sorted(parse_allowed_hosts(settings.allowed_healthcheck_hosts))
    extra_hosts = sorted(extra_allowed_hosts())
    return {
        "env_hosts": env_hosts,
        "extra_hosts": extra_hosts,
        "hosts": sorted(set(env_hosts) | set(extra_hosts)),
    }


def add_extra_host(value: str) -> dict[str, list[str]]:
    hostname = validate_allowlist_host(value)
    hosts = extra_allowed_hosts()
    hosts.add(hostname)
    _save_extra_hosts(hosts)
    return extra_hosts_payload()


def remove_extra_host(value: str) -> dict[str, list[str]]:
    hostname = normalize_host(value)
    hosts = extra_allowed_hosts()
    hosts.discard(hostname)
    _save_extra_hosts(hosts)
    return extra_hosts_payload()


def _save_extra_hosts(hosts: set[str]) -> None:
    payload = json.dumps(sorted(hosts))
    with db_session() as conn:
        conn.execute(
            "INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            (EXTRA_HOSTS_KEY, payload),
        )


def _is_private_or_disallowed(ip: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    return any(
        [
            ip.is_private,
            ip.is_loopback,
            ip.is_link_local,
            ip.is_multicast,
            ip.is_reserved,
            ip.is_unspecified,
            getattr(ip, "is_site_local", False),
        ]
    )


def resolve_host(hostname: str) -> list[str]:
    try:
        infos = socket.getaddrinfo(hostname, None, proto=socket.IPPROTO_TCP)
    except socket.gaierror as exc:
        raise HealthCheckTargetError("Unable to resolve health-check host.") from exc
    addresses = []
    for info in infos:
        addresses.append(info[4][0])
    if not addresses:
        raise HealthCheckTargetError("Unable to resolve health-check host.")
    return addresses


def validate_health_target(
    url: str,
    method: str,
    port: int | None,
    allowed_hosts: set[str],
    allow_public: bool = False,
) -> tuple[str, int]:
    method = (method or "http").strip().lower()
    if method not in {"http", "https", "tcp"}:
        raise HealthCheckTargetError("Health-check method must be http, https, or tcp.")

    if method in {"http", "https"}:
        parsed = urlparse(url.strip())
        if parsed.scheme not in {"http", "https"}:
            raise HealthCheckTargetError("Health-check URL must use http or https.")
        if parsed.username or parsed.password:
            raise HealthCheckTargetError("Health-check URL must not contain credentials.")
        hostname = (parsed.hostname or "").strip().lower()
        target_port = parsed.port or (443 if parsed.scheme == "https" else 80)
        if parsed.scheme != method:
            raise HealthCheckTargetError("Health-check URL scheme must match the selected method.")
    else:
        hostname = (url or "").strip().lower()
        if hostname.startswith("tcp://"):
            hostname = hostname[6:]
        if ":" in hostname and hostname.count(":") == 1 and not hostname.startswith("["):
            host_part, port_part = hostname.rsplit(":", 1)
            hostname = host_part
            if port is None and port_part.isdigit():
                port = int(port_part)
        hostname = hostname.strip("[]")
        target_port = port
        if target_port is None:
            raise HealthCheckTargetError("TCP health checks require a port.")

    if not hostname:
        raise HealthCheckTargetError("Health-check host is required.")
    if hostname in ALWAYS_BLOCKED_HOSTS:
        raise HealthCheckTargetError("Health-check host is not allowed.")
    if hostname in DEFAULT_BLOCKED_HOSTS and hostname not in allowed_hosts:
        raise HealthCheckTargetError("Health-check host is not allowed.")
    if (hostname.endswith(".local") or hostname.endswith(".internal")) and hostname not in allowed_hosts:
        raise HealthCheckTargetError("Health-check host is not allowed.")
    if not 1 <= int(target_port) <= 65535:
        raise HealthCheckTargetError("Health-check port is invalid.")

    try:
        ip = ipaddress.ip_address(hostname)
    except ValueError:
        ip = None

    if ip is not None:
        if _is_private_or_disallowed(ip) and hostname not in allowed_hosts:
            raise HealthCheckTargetError("Private or reserved IP addresses are not allowed.")
        if hostname not in allowed_hosts and not (allow_public and not _is_private_or_disallowed(ip)):
            raise HealthCheckTargetError("Health-check host is not in the allowlist.")
        return hostname, int(target_port)

    if hostname not in allowed_hosts and not allow_public:
        raise HealthCheckTargetError(
            "Health-check host is not in the allowlist. Add it in Admin > Allowed Health-check Hosts."
        )

    for address in resolve_host(hostname):
        ip = ipaddress.ip_address(address)
        if _is_private_or_disallowed(ip) and hostname not in allowed_hosts:
            raise HealthCheckTargetError("Resolved address is not allowed for health checks.")

    return hostname, int(target_port)


def validate_app_url(url: str) -> str:
    value = (url or "").strip()
    parsed = urlparse(value)
    if parsed.scheme not in {"http", "https"}:
        raise HealthCheckTargetError("Application URL must use http or https.")
    if not parsed.hostname:
        raise HealthCheckTargetError("Application URL must include a host.")
    return value

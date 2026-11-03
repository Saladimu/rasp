from datetime import datetime, timedelta, timezone
from typing import Any

from .database import db_session

HISTORY_DAYS = 7
SPARKLINE_POINTS = 36


def record_results(results: list[dict[str, Any]]) -> None:
    if not results:
        return
    rows = []
    for item in results:
        app_id = item.get("id")
        status = item.get("status") or "unknown"
        if app_id is None:
            continue
        rows.append(
            (
                int(app_id),
                status,
                item.get("latency_ms"),
                item.get("last_checked") or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                (item.get("message") or "")[:240],
            )
        )
    if not rows:
        return
    cutoff = (datetime.now(timezone.utc) - timedelta(days=HISTORY_DAYS)).strftime("%Y-%m-%dT%H:%M:%SZ")
    with db_session() as conn:
        conn.executemany(
            """
            INSERT INTO health_history (app_id, status, latency_ms, checked_at, message)
            VALUES (?, ?, ?, ?, ?)
            """,
            rows,
        )
        conn.execute("DELETE FROM health_history WHERE checked_at < ?", (cutoff,))


def delete_history(app_id: int) -> None:
    with db_session() as conn:
        conn.execute("DELETE FROM health_history WHERE app_id = ?", (app_id,))
        conn.execute("DELETE FROM alert_state WHERE app_id = ?", (app_id,))


def _parse_ts(value: str | None) -> datetime | None:
    if not value:
        return None
    text = value.replace("Z", "+00:00") if value.endswith("Z") else value
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _ratio(online: int, counted: int) -> float | None:
    if counted <= 0:
        return None
    return round(100.0 * online / counted, 1)


def summaries_for(app_ids: list[int]) -> dict[int, dict[str, Any]]:
    unique_ids = [int(app_id) for app_id in app_ids]
    empty = {
        "uptime_24h": None,
        "uptime_7d": None,
        "avg_latency_ms": None,
        "checks_24h": 0,
        "sparkline": [],
    }
    summaries = {app_id: dict(empty) for app_id in unique_ids}
    if not unique_ids:
        return summaries

    cutoff = (datetime.now(timezone.utc) - timedelta(days=HISTORY_DAYS)).strftime("%Y-%m-%dT%H:%M:%SZ")
    placeholders = ",".join("?" for _ in unique_ids)
    with db_session() as conn:
        rows = conn.execute(
            f"""
            SELECT app_id, status, latency_ms, checked_at
            FROM health_history
            WHERE app_id IN ({placeholders}) AND checked_at >= ?
            ORDER BY checked_at ASC
            """,
            [*unique_ids, cutoff],
        ).fetchall()

    now = datetime.now(timezone.utc)
    day_ago = now - timedelta(hours=24)
    grouped: dict[int, list[dict[str, Any]]] = {app_id: [] for app_id in unique_ids}
    for row in rows:
        grouped[int(row["app_id"])].append(dict(row))

    for app_id, items in grouped.items():
        online_7d = counted_7d = online_24h = counted_24h = latency_total = latency_count = 0
        spark: list[int | None] = []
        for item in items:
            status = item.get("status") or "unknown"
            checked = _parse_ts(item.get("checked_at"))
            in_day = bool(checked and checked >= day_ago)
            if status in {"online", "offline"}:
                counted_7d += 1
                if status == "online":
                    online_7d += 1
                if in_day:
                    counted_24h += 1
                    if status == "online":
                        online_24h += 1
            if status == "online" and in_day and item.get("latency_ms") is not None:
                latency_total += int(item["latency_ms"])
                latency_count += 1
            if in_day:
                if status == "online":
                    spark.append(1)
                elif status == "offline":
                    spark.append(0)
                else:
                    spark.append(None)
        summaries[app_id] = {
            "uptime_24h": _ratio(online_24h, counted_24h),
            "uptime_7d": _ratio(online_7d, counted_7d),
            "avg_latency_ms": round(latency_total / latency_count) if latency_count else None,
            "checks_24h": counted_24h,
            "sparkline": spark[-SPARKLINE_POINTS:],
        }
    return summaries


def overall_uptime(summaries: dict[int, dict[str, Any]]) -> float | None:
    values = [item["uptime_24h"] for item in summaries.values() if item.get("uptime_24h") is not None]
    if not values:
        return None
    return round(sum(values) / len(values), 1)

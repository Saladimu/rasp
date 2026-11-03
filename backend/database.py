import sqlite3
from contextlib import contextmanager
from typing import Any, Iterator

from .config import DB_PATH


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn


@contextmanager
def db_session() -> Iterator[sqlite3.Connection]:
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    with db_session() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS admin_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS apps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                url TEXT NOT NULL,
                icon TEXT NOT NULL DEFAULT 'layout-grid',
                health_url TEXT NOT NULL DEFAULT '',
                health_method TEXT NOT NULL DEFAULT 'http',
                health_port INTEGER,
                monitoring_enabled INTEGER NOT NULL DEFAULT 1,
                display_order INTEGER NOT NULL DEFAULT 0,
                kind TEXT NOT NULL DEFAULT 'application',
                visible INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS login_attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ip TEXT NOT NULL,
                attempted_at TEXT NOT NULL DEFAULT (datetime('now')),
                success INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS health_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                app_id INTEGER NOT NULL,
                status TEXT NOT NULL,
                latency_ms INTEGER,
                checked_at TEXT NOT NULL,
                message TEXT NOT NULL DEFAULT '',
                FOREIGN KEY(app_id) REFERENCES apps(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS alert_state (
                app_id INTEGER PRIMARY KEY,
                consecutive_fails INTEGER NOT NULL DEFAULT 0,
                last_status TEXT NOT NULL DEFAULT '',
                last_event TEXT NOT NULL DEFAULT '',
                pending INTEGER NOT NULL DEFAULT 0,
                updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY(app_id) REFERENCES apps(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time
                ON login_attempts(ip, attempted_at);
            CREATE INDEX IF NOT EXISTS idx_health_history_app_time
                ON health_history(app_id, checked_at);
            """
        )
        columns = {row[1] for row in conn.execute("PRAGMA table_info(apps)").fetchall()}
        if "kind" not in columns:
            conn.execute("ALTER TABLE apps ADD COLUMN kind TEXT NOT NULL DEFAULT 'application'")
        if "visible" not in columns:
            conn.execute("ALTER TABLE apps ADD COLUMN visible INTEGER NOT NULL DEFAULT 1")
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_apps_kind_order ON apps(kind, display_order, id)"
        )


def row_to_dict(row: sqlite3.Row | None) -> dict[str, Any] | None:
    if row is None:
        return None
    return dict(row)

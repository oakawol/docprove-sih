"""Server-side repeated suspicious-document protection."""

from __future__ import annotations

import hashlib
import sqlite3
import time
from contextlib import closing
from pathlib import Path

COOLDOWN_SECONDS = 5 * 60
SUSPICIOUS_LIMIT = 3

SCHEMA = """
CREATE TABLE IF NOT EXISTS verification_protection (
    client_key TEXT PRIMARY KEY,
    consecutive_suspicious INTEGER NOT NULL DEFAULT 0,
    cooldown_until REAL NOT NULL DEFAULT 0
);
"""


def _key(session_id: str | None, client_host: str | None) -> str:
    # Store only a one-way key; no raw address or browser identifier is retained.
    value = f"{session_id or 'anonymous'}|{client_host or 'unknown'}"
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _connect(db_path: str | Path) -> sqlite3.Connection:
    path = Path(db_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path), timeout=10)
    conn.execute("PRAGMA busy_timeout=10000")
    conn.executescript(SCHEMA)
    return conn


def check(db_path: str | Path, session_id: str | None, client_host: str | None) -> dict:
    key = _key(session_id, client_host)
    now = time.time()
    with closing(_connect(db_path)) as conn:
        row = conn.execute(
            "SELECT consecutive_suspicious, cooldown_until FROM verification_protection WHERE client_key = ?",
            (key,),
        ).fetchone()
    cooldown_until = float(row[1]) if row else 0.0
    remaining = max(0, int(cooldown_until - now + 0.999))
    if remaining == 0 and cooldown_until:
        with closing(_connect(db_path)) as conn:
            conn.execute(
                "UPDATE verification_protection SET cooldown_until = 0, consecutive_suspicious = 0 WHERE client_key = ?",
                (key,),
            )
            conn.commit()
    return {
        "cooldown_active": remaining > 0,
        "cooldown_remaining_seconds": remaining,
        "cooldown_until": cooldown_until if remaining else None,
        "consecutive_suspicious": int(row[0]) if row else 0,
    }


def record_result(db_path: str | Path, session_id: str | None, client_host: str | None,
                  suspicious: bool) -> dict:
    key = _key(session_id, client_host)
    now = time.time()
    with closing(_connect(db_path)) as conn:
        conn.execute("BEGIN IMMEDIATE")
        row = conn.execute(
            "SELECT consecutive_suspicious, cooldown_until FROM verification_protection WHERE client_key = ?",
            (key,),
        ).fetchone()
        count = int(row[0]) if row else 0
        if suspicious:
            count += 1
        else:
            count = 0
        cooldown_until = float(row[1]) if row else 0.0
        if count >= SUSPICIOUS_LIMIT:
            cooldown_until = now + COOLDOWN_SECONDS
        conn.execute(
            "INSERT INTO verification_protection(client_key, consecutive_suspicious, cooldown_until) VALUES (?, ?, ?) "
            "ON CONFLICT(client_key) DO UPDATE SET consecutive_suspicious=excluded.consecutive_suspicious, cooldown_until=excluded.cooldown_until",
            (key, count, cooldown_until),
        )
        conn.commit()
    remaining = max(0, int(cooldown_until - time.time() + 0.999))
    return {
        "cooldown_active": remaining > 0,
        "cooldown_remaining_seconds": remaining,
        "cooldown_until": cooldown_until if remaining else None,
        "consecutive_suspicious": count,
    }

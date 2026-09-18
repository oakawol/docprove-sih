"""
Phase 11 - Scan history / audit trail.

A small SQLite store, no server required. Every completed scan is written
here by the pipeline (or by api.py after a request). It backs three things:

  * the audit trail itself - list/search/export past scans
  * Phase 9's "multiple identity" check - has this face been seen before
    under a different name or document number?
  * the frontend's history page

Schema is intentionally flat (one row per scan, structured fields as JSON)
so it needs no migration tooling for a hackathon-scale project.
"""

from __future__ import annotations

import json
import sqlite3
import time
from contextlib import closing
from pathlib import Path
from typing import Any

DEFAULT_DB = Path(__file__).resolve().parent.parent / "data" / "scan_history.db"

SCHEMA_TABLE = """
CREATE TABLE IF NOT EXISTS scans (
    scan_id         TEXT PRIMARY KEY,
    created_at      REAL NOT NULL,
    doc_type        TEXT NOT NULL,
    name            TEXT,
    document_no     TEXT,
    dob             TEXT,
    photo_hash      TEXT,
    risk_score      REAL,
    risk_level      TEXT,
    final_status    TEXT,
    client_ip       TEXT,
    device_type     TEXT,
    extracted_json  TEXT,
    validation_json TEXT,
    mrz_json        TEXT,
    tampering_json  TEXT,
    face_json       TEXT,
    checklist_json  TEXT,
    reasons_json    TEXT,
    artifacts_json  TEXT
);
"""

SCHEMA_INDEXES = """
CREATE INDEX IF NOT EXISTS idx_scans_photo_hash ON scans(photo_hash);
CREATE INDEX IF NOT EXISTS idx_scans_document_no ON scans(document_no);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at);
CREATE INDEX IF NOT EXISTS idx_scans_client_ip ON scans(client_ip);
"""


def connect(db_path: str | Path = DEFAULT_DB) -> sqlite3.Connection:
    db_path = Path(db_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    conn.executescript(SCHEMA_TABLE)

    # Auto-migrate if columns are missing
    cols = [col["name"] for col in conn.execute("PRAGMA table_info(scans)").fetchall()]
    if "client_ip" not in cols:
        try:
            conn.execute("ALTER TABLE scans ADD COLUMN client_ip TEXT")
            conn.commit()
        except Exception:
            pass
    if "device_type" not in cols:
        try:
            conn.execute("ALTER TABLE scans ADD COLUMN device_type TEXT")
            conn.commit()
        except Exception:
            pass

    try:
        conn.executescript(SCHEMA_INDEXES)
    except Exception:
        pass

    return conn


def _photo_hash(image_path, box: list[int] | None) -> str | None:
    """256-bit average hash of the portrait region, as a hex bit-string.

    Kept separate from face.py's richer match() - this is a fast index key
    for "has this face been seen before", not a verification score.
    """
    try:
        import cv2
        import numpy as np
        from PIL import Image
        img = image_path if hasattr(image_path, "convert") else Image.open(image_path)
        arr = np.asarray(img.convert("RGB"))
        if box:
            x0, y0, x1, y1 = [max(0, int(v)) for v in box]
            if x1 > x0 and y1 > y0:
                arr = arr[y0:y1, x0:x1]
        gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
        small = cv2.resize(gray, (16, 16), interpolation=cv2.INTER_AREA)
        bits = (small > small.mean()).flatten()
        return "".join("1" if b else "0" for b in bits)
    except Exception:
        return None


def _hamming(a: str, b: str) -> int:
    return sum(x != y for x, y in zip(a, b))


def save_scan(result: dict[str, Any], *, client_ip: str | None = None, device_type: str | None = None, image_path=None, db_path: str | Path = DEFAULT_DB
             ) -> None:
    """Persist a completed pipeline result (see pipeline.screen / report.build)."""
    extracted = result.get("extracted", {})
    photo_box = result.get("tampering", {}).get("diagnostics", {}).get("regions", {}).get("photo")
    photo_hash = _photo_hash(image_path, photo_box) if image_path is not None else None
    ip = client_ip or result.get("client_ip")
    dev = device_type or result.get("device_type")

    with closing(connect(db_path)) as conn:
        conn.execute(
            """INSERT OR REPLACE INTO scans
               (scan_id, created_at, doc_type, name, document_no, dob, photo_hash,
                risk_score, risk_level, final_status, client_ip, device_type, extracted_json, validation_json,
                mrz_json, tampering_json, face_json, checklist_json, reasons_json,
                artifacts_json)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                result["scan_id"], time.time(), result["doc_type"],
                extracted.get("name") or extracted.get("given_name"),
                extracted.get("passport_no") or extracted.get("visa_no"),
                extracted.get("dob"), photo_hash,
                result.get("risk", {}).get("score"), result.get("risk", {}).get("level"),
                result.get("final_status"), ip, dev,
                json.dumps(extracted), json.dumps(result.get("validation", {})),
                json.dumps(result.get("mrz", {})), json.dumps(result.get("tampering", {})),
                json.dumps(result.get("face", {})), json.dumps(result.get("checklist", {})),
                json.dumps(result.get("risk", {}).get("reasons", [])),
                json.dumps(result.get("artifacts", {})),
            ),
        )
        conn.commit()


def get_scan(scan_id: str, db_path: str | Path = DEFAULT_DB) -> dict[str, Any] | None:
    with closing(connect(db_path)) as conn:
        row = conn.execute("SELECT * FROM scans WHERE scan_id = ?", (scan_id,)).fetchone()
    return _row_to_dict(row) if row else None


def list_scans(*, doc_type: str | None = None, level: str | None = None,
              query: str | None = None, limit: int = 50, offset: int = 0,
              db_path: str | Path = DEFAULT_DB) -> list[dict[str, Any]]:
    sql = "SELECT * FROM scans WHERE 1=1"
    args: list[Any] = []
    if doc_type:
        sql += " AND doc_type = ?"
        args.append(doc_type)
    if level:
        sql += " AND risk_level = ?"
        args.append(level)
    if query:
        sql += " AND (name LIKE ? OR document_no LIKE ?)"
        args += [f"%{query}%", f"%{query}%"]
    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    args += [limit, offset]
    with closing(connect(db_path)) as conn:
        rows = conn.execute(sql, args).fetchall()
    return [_row_to_dict(r) for r in rows]


def find_multiple_identity(photo_hash: str | None, *, name: str | None, document_no: str | None,
                           max_distance: int = 6, db_path: str | Path = DEFAULT_DB,
                           exclude_scan_id: str | None = None) -> list[dict[str, Any]]:
    """Phase 9 input: same face, different declared identity, seen before.

    Returns prior scans whose photo hash is close to this one (Hamming
    distance <= max_distance out of 64 bits) but whose name or document
    number differs - i.e. the same person appears to be using more than one
    identity.
    """
    if not photo_hash:
        return []
    with closing(connect(db_path)) as conn:
        rows = conn.execute(
            "SELECT scan_id, created_at, doc_type, name, document_no, photo_hash "
            "FROM scans WHERE photo_hash IS NOT NULL"
        ).fetchall()
    hits = []
    for r in rows:
        if exclude_scan_id and r["scan_id"] == exclude_scan_id:
            continue
        dist = _hamming(photo_hash, r["photo_hash"])
        if dist > max_distance:
            continue
        same_name = (r["name"] or "").strip().upper() == (name or "").strip().upper()
        same_doc = (r["document_no"] or "").strip().upper() == (document_no or "").strip().upper()
        if same_name or same_doc:
            continue                                     # the same document or person, not a conflict
        hits.append({"scan_id": r["scan_id"], "created_at": r["created_at"],
                    "doc_type": r["doc_type"], "name": r["name"],
                    "document_no": r["document_no"], "face_distance": dist})
    hits.sort(key=lambda h: h["face_distance"])
    return hits


def _row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    d = dict(row)
    for key in ("extracted", "validation", "mrz", "tampering", "face", "checklist", "reasons",
               "artifacts"):
        raw = d.pop(f"{key}_json", None)
        d[key] = json.loads(raw) if raw else None
    return d


def stats(db_path: str | Path = DEFAULT_DB) -> dict[str, Any]:
    with closing(connect(db_path)) as conn:
        total = conn.execute("SELECT COUNT(*) c FROM scans").fetchone()["c"]
        by_level = conn.execute(
            "SELECT risk_level, COUNT(*) c FROM scans GROUP BY risk_level").fetchall()
        by_type = conn.execute(
            "SELECT doc_type, COUNT(*) c FROM scans GROUP BY doc_type").fetchall()
    return {"total": total,
           "by_level": {r["risk_level"]: r["c"] for r in by_level},
           "by_doc_type": {r["doc_type"]: r["c"] for r in by_type}}

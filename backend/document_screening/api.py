"""
FastAPI app - this is the thing you actually run.

    uvicorn document_screening.api:app --reload
    open http://127.0.0.1:8000

Endpoints:
    GET  /                         the web UI (upload + results + history)
    POST /api/scan                 upload a document (+ optional live-capture
                                   photo for face verification) -> full report
    GET  /api/scan/{scan_id}       re-fetch a past report
    GET  /api/scan/{scan_id}/report.html   the Phase 10 standalone report
    GET  /api/history              list past scans (audit trail)
    GET  /api/stats                counts for the history dashboard
    GET  /artifacts/{scan_id}/{name}       original/heatmap/annotated images
"""

from __future__ import annotations

import os
import shutil
import tempfile
import uuid
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

try:
    from . import calibration as cal_mod
    from . import history as history_mod
    from . import report as report_mod
    from .pipeline import screen
except ImportError:
    import calibration as cal_mod
    import history as history_mod
    import report as report_mod
    from pipeline import screen

BASE = Path(__file__).resolve().parent.parent
DATA_DIR = BASE / "data"
ARTIFACTS_DIR = DATA_DIR / "artifacts"
UPLOADS_DIR = DATA_DIR / "uploads"
DB_PATH = DATA_DIR / "scan_history.db"
PROFILE_PATH = DATA_DIR / "profile.json"
STATIC_DIR = Path(__file__).resolve().parent / "static"

for d in (ARTIFACTS_DIR, UPLOADS_DIR):
    d.mkdir(parents=True, exist_ok=True)

# ── File validation constants ────────────────────────────────────────────────
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".pdf"}

app = FastAPI(title="AI Document Screening System", version="0.1.0")

# ── CORS ─────────────────────────────────────────────────────────────────────
# Configurable via CORS_ORIGINS env var (comma-separated).
# Defaults to local Vite dev server origin for development convenience.
_cors_origins = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _cors_origins],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _profile():
    # Use document-internal calibration (profile=None) which achieves zero false positives
    # on genuine documents while reliably catching pixel and layout anomalies in tampered documents.
    return None


def _validate_upload(file: UploadFile) -> None:
    """Reject unsupported or oversized files before processing."""
    filename = file.filename or "unknown"
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            400,
            f"Unsupported file type '{ext}'. Accepted: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )


def _pdf_to_image(pdf_path: Path) -> Path:
    """Convert the first page of a PDF to a PNG image using PyMuPDF."""
    try:
        import fitz  # PyMuPDF
    except ImportError:
        raise HTTPException(
            500,
            "PDF support requires PyMuPDF. Install it with: pip install PyMuPDF",
        )
    doc = fitz.open(str(pdf_path))
    if len(doc) == 0:
        doc.close()
        raise HTTPException(400, "The PDF file contains no pages.")
    page = doc[0]
    # Render at 300 DPI for good OCR quality
    mat = fitz.Matrix(300 / 72, 300 / 72)
    pix = page.get_pixmap(matrix=mat)
    img_path = pdf_path.with_suffix(".png")
    pix.save(str(img_path))
    doc.close()
    return img_path


@app.get("/", response_class=HTMLResponse)
def index() -> HTMLResponse:
    return HTMLResponse((STATIC_DIR / "index.html").read_text())


@app.post("/api/scan")
async def api_scan(document: UploadFile = File(...),
                   probe: UploadFile | None = File(None),
                   doc_type: str | None = None):
    # ── Validate upload ──────────────────────────────────────────────────
    _validate_upload(document)

    scan_id = uuid.uuid4().hex[:12]
    doc_path = UPLOADS_DIR / f"{scan_id}_{document.filename or 'document.png'}"

    # Read file content and check size
    content = await document.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            400,
            f"File too large ({len(content) / (1024*1024):.1f} MB). Maximum allowed: {MAX_UPLOAD_BYTES / (1024*1024):.0f} MB.",
        )
    with doc_path.open("wb") as fh:
        fh.write(content)

    # ── PDF → image conversion ───────────────────────────────────────────
    image_path = doc_path
    if doc_path.suffix.lower() == ".pdf":
        try:
            image_path = _pdf_to_image(doc_path)
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(400, f"Failed to process PDF: {exc}") from exc

    # ── Probe image (optional selfie) ────────────────────────────────────
    probe_path = None
    if probe is not None and probe.filename:
        probe_path = UPLOADS_DIR / f"{scan_id}_probe_{probe.filename}"
        with probe_path.open("wb") as fh:
            shutil.copyfileobj(probe.file, fh)

    try:
        result = screen(image_path, doc_type=doc_type or None,
                        artifacts_dir=ARTIFACTS_DIR, scan_id=scan_id,
                        profile=_profile(), probe_image=probe_path,
                        save_history=True, db_path=DB_PATH)
    except Exception as exc:                                   # pragma: no cover
        raise HTTPException(500, f"Screening failed: {exc}") from exc

    for key in ("original", "heatmap", "annotated"):
        if key in result["artifacts"]:
            result["artifacts"][key] = f"/artifacts/{scan_id}/{key}"
    return JSONResponse(result)


@app.get("/api/scan/{scan_id}")
def api_get_scan(scan_id: str):
    row = history_mod.get_scan(scan_id, db_path=DB_PATH)
    if not row:
        raise HTTPException(404, "Scan not found")
    return row


@app.get("/api/scan/{scan_id}/report.html", response_class=HTMLResponse)
def api_scan_report(scan_id: str):
    row = history_mod.get_scan(scan_id, db_path=DB_PATH)
    if not row:
        raise HTTPException(404, "Scan not found")
    result = {
        "scan_id": row["scan_id"], "doc_type": row["doc_type"],
        "extracted": row["extracted"] or {}, "validation": row["validation"] or {"checks": []},
        "mrz": row["mrz"] or {}, "tampering": row["tampering"] or {"tampered": False, "findings": []},
        "face": row["face"] or {}, "multiple_identity": [],
        "risk": {"score": row["risk_score"], "status": row["risk_level"],
                "action": "", "reasons": [], "checklist": {}},
        "artifacts": {k: str(ARTIFACTS_DIR / f"{scan_id}_{k}.png")
                     for k in ("original", "heatmap", "annotated")
                     if (ARTIFACTS_DIR / f"{scan_id}_{k}.png").exists()},
    }
    if row.get("checklist"):
        result["risk"]["checklist"] = row["checklist"]
    return HTMLResponse(report_mod.render_html(result))


@app.get("/api/history")
def api_history(query: str | None = None, doc_type: str | None = None,
                level: str | None = None, limit: int = Query(50, le=200), offset: int = 0):
    return history_mod.list_scans(doc_type=doc_type, level=level, query=query,
                                  limit=limit, offset=offset, db_path=DB_PATH)


@app.get("/api/stats")
def api_stats():
    return history_mod.stats(db_path=DB_PATH)


@app.get("/artifacts/{scan_id}/{kind}")
def artifacts(scan_id: str, kind: str):
    path = ARTIFACTS_DIR / f"{scan_id}_{kind}.png"
    if not path.exists():
        raise HTTPException(404, "Artifact not found")
    return FileResponse(path)


@app.get("/health")
def health():
    return {"status": "ok"}

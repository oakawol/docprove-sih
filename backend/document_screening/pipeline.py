"""
Screening pipeline - Phase 2 -> 3 -> 4 -> 5 -> 6 -> 9 -> 10 -> 11, as one call.

    from document_screening import screen
    result = screen("passport_001_dob.png", artifacts_dir="out/",
                    probe_image="selfie.jpg", save_history=True)
    print(result["risk"]["status"], result["risk"]["checklist_text"])

The returned dict is plain JSON (Phase 10's final report), ready to hand to a
REST layer or a frontend. Passing `save_history=True` also writes the scan to
the Phase 11 audit trail and runs the Phase 9 multiple-identity check against
everything scanned before it.
"""

from __future__ import annotations

import re
import time
import uuid
from pathlib import Path
from typing import Any

from PIL import Image

from . import face as face_mod
from . import eligibility as eligibility_mod
from . import history as history_mod
from . import mrz as mrz_mod
from . import ocr as ocr_mod
from . import risk as risk_mod
from . import tampering as tamper_mod
from . import validation as val_mod


def _printed_record(result: ocr_mod.OCRResult) -> dict[str, str | None]:
    return {name: f.value for name, f in result.fields.items()}


def _stamp_signal(record: dict[str, str | None]) -> str | None:
    """An entry stamp must fall inside the visa's validity window."""
    from .validation import parse_date
    stamp = parse_date(record.get("stamp_date"))
    start, end = parse_date(record.get("valid_from")), parse_date(record.get("valid_until"))
    if not stamp or not (start and end):
        return None
    if start <= stamp <= end:
        return None
    return (f"Stamp is dated {record['stamp_date']}, outside the visa validity window "
            f"({record.get('valid_from')} - {record.get('valid_until')}).")


def _cross_signals(record: dict[str, str | None], mrz_res: mrz_mod.MRZResult,
                   validation: dict[str, Any], doc_type: str) -> dict[str, list[str]]:
    """Logical inconsistencies, mapped onto the field they localise to."""
    signals: dict[str, list[str]] = {}

    def push(field: str, text: str):
        signals.setdefault(field, []).append(text)

    for m in mrz_res.mismatches:
        push(m["field"],
             f"{m['label']} printed here ({m['printed']}) contradicts the MRZ ({m['mrz']}).")

    for c in validation.get("checks", []):
        if c["status"] == "fail" and c.get("field"):
            push(c["field"], c["detail"])

    stamp_issue = _stamp_signal(record)
    if stamp_issue:
        push("stamp", stamp_issue)

    sig = (record.get("signature_name") or "").strip().upper()
    if sig and doc_type == "passport":
        sig_compact = re.sub(r"[^A-Z0-9]", "", sig)
        given_val = (record.get("given_name") or "").strip().upper()
        sur_val = (record.get("surname") or "").strip().upper()
        given_compact = re.sub(r"[^A-Z0-9]", "", given_val)
        sur_compact = re.sub(r"[^A-Z0-9]", "", sur_val)
        printed_compact = given_compact + sur_compact

        if printed_compact and mrz_mod._levenshtein(sig_compact, printed_compact) > 2:
            msg = f"Printed name does not match the signature specimen ({record.get('signature_name')})."
            # If surname matches part of signature but given_name does not, attribute to given_name
            if sur_compact and sur_compact in sig_compact and given_compact and given_compact not in sig_compact:
                push("given_name", msg)
            elif given_compact and given_compact in sig_compact and sur_compact and sur_compact not in sig_compact:
                push("surname", msg)
            else:
                for f in ("surname", "given_name", "signature_name"):
                    push(f, msg)
    return signals


def screen(image_path: str | Path | Image.Image, *, doc_type: str | None = None,
           artifacts_dir: str | Path | None = None, scan_id: str | None = None,
           profile: dict | str | Path | None = None,
           probe_image: str | Path | Image.Image | None = None,
           save_history: bool = False, db_path: str | Path | None = None,
           ) -> dict[str, Any]:
    started = time.time()
    scan_id = scan_id or uuid.uuid4().hex[:12]
    img = ocr_mod.preprocess(ocr_mod.load_image(image_path))

    # ---- Phase 2: OCR ------------------------------------------------------
    t0 = time.time()
    result = ocr_mod.extract(img, doc_type=doc_type)
    record = _printed_record(result)
    t_ocr = time.time() - t0

    # Reject unrelated/empty images before validation, MRZ, tampering, face,
    # artifact rendering, risk scoring, or audit persistence can consume work.
    eligibility = eligibility_mod.assess(result)
    if not eligibility.document_valid:
        return {
            "scan_id": scan_id,
            "document_valid": False,
            "document_type": "unknown",
            "rejection_reason": eligibility.rejection_reason,
            "message": "The uploaded image does not contain enough recognizable document information to begin verification.",
            "eligibility": eligibility.to_dict(),
            "doc_type": "unknown",
            "image_size": [img.width, img.height],
            "ocr": result.to_dict(),
            "extracted": {k: v for k, v in record.items() if v},
            "validation": {"checks": [], "failed": 0, "warnings": 0, "failed_fields": []},
            "mrz": {"present": False, "mismatches": [], "issues": []},
            "tampering": {"tampered": False, "findings": [], "diagnostics": {"regions": {}}},
            "face": {"status": "not_attempted", "detail": "Document eligibility was not met."},
            "multiple_identity": [],
            "risk": None,
            "final_status": "INVALID INPUT",
            "artifacts": {},
            "timings_ms": {"ocr": round(t_ocr * 1000), "validation": 0, "mrz": 0,
                            "tampering": 0, "face": 0, "total": round((time.time() - started) * 1000)},
        }

    result.stamp_box = None
    result.stamp_date = None
    if result.doc_type == "visa":
        photo_box = tamper_mod.detect_photo_region(img)
        box = tamper_mod.detect_stamp_region(img, avoid=photo_box)
        if box:
            result.stamp_box = box
            got = ocr_mod.read_stamp_date(img, box)
            if got:
                result.stamp_date, _ = got
                record["stamp_date"] = result.stamp_date

    # ---- Phase 3: validation ------------------------------------------------
    t0 = time.time()
    validation = val_mod.validate(record, result.doc_type)
    t_val = time.time() - t0

    # ---- Phase 4: MRZ --------------------------------------------------------
    t0 = time.time()
    if result.doc_type == "passport":
        mrz_res = mrz_mod.parse_td3(result.mrz_lines)
        mrz_res = mrz_mod.compare_printed(mrz_res, record)
    else:
        mrz_res = mrz_mod.MRZResult(present=False,
                                    issues=["Visas in this scheme carry no MRZ."])
    t_mrz = time.time() - t0

    # ---- Phase 5: tampering ---------------------------------------------------
    t0 = time.time()
    signals = _cross_signals(record, mrz_res, validation, result.doc_type)
    prof = profile
    if isinstance(prof, (str, Path)):
        from . import calibration
        prof = calibration.load(prof)
    if isinstance(prof, dict) and result.doc_type in prof:
        prof = prof[result.doc_type]
    findings, heat, diag = tamper_mod.analyse(img, result, signals, profile=prof)
    t_tamper = time.time() - t0

    # ---- Phase 6: face verification --------------------------------------------
    t0 = time.time()
    photo_box = diag.get("regions", {}).get("photo")
    face_result: dict[str, Any] = face_mod.FaceResult("not_attempted",
                                                       detail="No probe (live capture) image "
                                                       "was supplied.").to_dict()
    if probe_image is not None:
        probe_img = ocr_mod.load_image(probe_image)
        face_result = face_mod.match(probe_img, img, reference_box=photo_box).to_dict()
    t_face = time.time() - t0

    artifacts: dict[str, str] = {}
    if artifacts_dir:
        out = Path(artifacts_dir)
        out.mkdir(parents=True, exist_ok=True)
        heat_img = tamper_mod.render_heatmap(img, heat, findings)
        ann_img = tamper_mod.render_annotated(img, findings)
        paths = {
            "original": out / f"{scan_id}_original.png",
            "heatmap": out / f"{scan_id}_heatmap.png",
            "annotated": out / f"{scan_id}_annotated.png",
        }
        img.save(paths["original"])
        heat_img.save(paths["heatmap"])
        ann_img.save(paths["annotated"])
        artifacts = {k: str(v) for k, v in paths.items()}

    # ---- Phase 9 (partial): multiple-identity lookup against history ------------
    multiple_identity: list[dict[str, Any]] = []
    if save_history:
        phash = history_mod._photo_hash(img, photo_box)
        multiple_identity = history_mod.find_multiple_identity(
            phash, name=record.get("name") or record.get("given_name"),
            document_no=record.get("passport_no") or record.get("visa_no"),
            db_path=db_path or history_mod.DEFAULT_DB, exclude_scan_id=scan_id)

    # ---- Phase 9: combined risk score -------------------------------------------
    risk = risk_mod.score(validation, mrz_res.to_dict(), findings,
                          result.mean_confidence, result.doc_type,
                          face=face_result, multiple_identity=multiple_identity)

    # ---- Phase 10: final report ---------------------------------------------------
    report = {
        "scan_id": scan_id,
        "document_valid": True,
        "document_type": result.doc_type,
        "eligibility": eligibility.to_dict(),
        "doc_type": result.doc_type,
        "image_size": [img.width, img.height],
        "ocr": result.to_dict(),
        "extracted": {k: v for k, v in record.items() if v},
        "validation": validation,
        "mrz": mrz_res.to_dict(),
        "tampering": {
            "tampered": bool(findings),
            "findings": [f.to_dict() for f in findings],
            "diagnostics": diag,
        },
        "face": face_result,
        "multiple_identity": multiple_identity,
        "risk": risk,
        "final_status": risk["status"],
        "artifacts": artifacts,
        "timings_ms": {
            "ocr": round(t_ocr * 1000), "validation": round(t_val * 1000),
            "mrz": round(t_mrz * 1000), "tampering": round(t_tamper * 1000),
            "face": round(t_face * 1000),
            "total": round((time.time() - started) * 1000),
        },
    }

    # ---- Phase 11: audit trail ------------------------------------------------------
    if save_history:
        history_mod.save_scan(report, image_path=img, db_path=db_path or history_mod.DEFAULT_DB)

    return report

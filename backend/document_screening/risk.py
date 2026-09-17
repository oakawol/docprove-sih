"""
Phase 9 - Risk scoring.

Combines the outputs of every earlier phase into a five-line checklist, one
0-100 score, and a final status - each contribution kept so the score is
always explainable:

    OCR Validation       PASS
    MRZ Validation       FAIL
    Tampering Detection  WARN
    Face Verification    PASS
    Multiple Identity    WARN

    Risk Score: 72/100
    Status: SUSPICIOUS
"""

from __future__ import annotations

from typing import Any

WEIGHTS = {
    "validation_fail_high": 25,
    "validation_fail_medium": 15,
    "validation_fail_low": 5,
    "validation_warn": 3,
    "mrz_missing": 15,
    "mrz_format": 15,
    "mrz_check_digit": 20,
    "mrz_mismatch_high": 40,
    "mrz_mismatch_medium": 25,
    "tamper_high": 45,
    "tamper_medium": 38,
    "ocr_low_confidence": 6,
    "face_mismatch": 35,
    "face_inconclusive": 6,
    "multiple_identity": 35,
}

# 0-100 score -> final status. Kept separate from the module-level LOW/MEDIUM/HIGH
# bands used inside individual findings.
STATUS_BANDS = [(76, "HIGH RISK"), (35, "SUSPICIOUS"), (0, "CLEAR")]

ACTIONS = {
    "HIGH RISK": "Refer to secondary inspection. Do not clear on this document alone.",
    "SUSPICIOUS": "Manual review recommended - confirm the flagged fields against the issuing record.",
    "CLEAR": "No automated indicators of fraud. Proceed with standard checks.",
}

CHECKLIST_ITEMS = [
    ("ocr_validation", "OCR Validation"),
    ("mrz_validation", "MRZ Validation"),
    ("tampering_detection", "Tampering Detection"),
    ("face_verification", "Face Verification"),
    ("multiple_identity", "Multiple Identity"),
]
STATUS_ICON = {"PASS": "\u2705", "FAIL": "\u274c", "WARN": "\u26a0\ufe0f", "N/A": "\u2796"}


def _add(reasons: list[dict[str, Any]], points: float, text: str, category: str,
        field: str | None = None) -> float:
    reasons.append({"points": round(points, 1), "reason": text, "category": category,
                    "field": field})
    return points


def score(validation: dict[str, Any], mrz: dict[str, Any], findings: list[Any],
          ocr_conf: float, doc_type: str, *, face: dict[str, Any] | None = None,
          multiple_identity: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    total = 0.0
    reasons: list[dict[str, Any]] = []
    face = face or {"status": "not_attempted"}
    multiple_identity = multiple_identity or []

    # ---- validation (Phase 3) --------------------------------------------
    for c in validation.get("checks", []):
        if c["status"] == "fail":
            total += _add(reasons, WEIGHTS[f"validation_fail_{c['severity']}"],
                         c["detail"], "validation", c.get("field"))
        elif c["status"] == "warn":
            total += _add(reasons, WEIGHTS["validation_warn"], c["detail"], "validation",
                         c.get("field"))
    validation_status = "FAIL" if validation.get("failed") else (
        "WARN" if validation.get("warnings") else "PASS")

    # ---- MRZ (Phase 4) ------------------------------------------------------
    mrz_status = "N/A"
    if doc_type == "passport":
        if not mrz.get("present"):
            total += _add(reasons, WEIGHTS["mrz_missing"],
                         "No machine readable zone could be read.", "mrz")
            mrz_status = "FAIL"
        else:
            bad_format = not mrz.get("format_ok")
            bad_digits = [k for k, v in mrz.get("check_digits", {}).items() if not v["valid"]]
            mismatches = mrz.get("mismatches", [])
            if bad_format:
                total += _add(reasons, WEIGHTS["mrz_format"],
                             "MRZ does not follow the ICAO 9303 TD3 layout.", "mrz", "mrz")
            if bad_digits:
                total += _add(reasons, WEIGHTS["mrz_check_digit"],
                             "Invalid MRZ check digit(s): "
                             + ", ".join(b.replace("_", " ") for b in bad_digits), "mrz", "mrz")
            for m in mismatches:
                total += _add(reasons, WEIGHTS[f"mrz_mismatch_{m['severity']}"],
                             f"{m['label']} printed as {m['printed']} but encoded as "
                             f"{m['mrz']} in the MRZ.", "mrz", m["field"])
            mrz_status = "FAIL" if (bad_format or bad_digits or mismatches) else "PASS"

    # ---- tampering (Phase 5) -------------------------------------------------
    for f in findings:
        d = f.to_dict() if hasattr(f, "to_dict") else f
        pts = WEIGHTS["tamper_high"] if d["severity"] == "high" else WEIGHTS["tamper_medium"]
        total += _add(reasons, pts, f"{d['label']}: " + " ".join(d["reasons"][:2]),
                     "tampering", d["field"])
    high_tamper = any((f.to_dict() if hasattr(f, "to_dict") else f)["severity"] == "high"
                      for f in findings)
    tampering_status = "FAIL" if high_tamper else ("WARN" if findings else "PASS")

    # ---- OCR confidence -------------------------------------------------------
    if ocr_conf and ocr_conf < 70:
        total += _add(reasons, WEIGHTS["ocr_low_confidence"],
                     f"Overall OCR confidence is low ({ocr_conf:.0f}%) - the scan quality "
                     "may be hiding detail.", "ocr")
    ocr_status = "PASS" if (not ocr_conf or ocr_conf >= 70) else "WARN"
    if validation.get("failed_fields"):
        ocr_status = "FAIL"

    # ---- face verification (Phase 6) -------------------------------------------
    fstatus = face.get("status", "not_attempted")
    if fstatus == "mismatch":
        total += _add(reasons, WEIGHTS["face_mismatch"], face.get("detail", "Face mismatch."),
                     "face", "photo")
        face_status = "FAIL"
    elif fstatus == "inconclusive":
        total += _add(reasons, WEIGHTS["face_inconclusive"],
                     face.get("detail", "Face verification inconclusive."), "face", "photo")
        face_status = "WARN"
    elif fstatus == "match":
        face_status = "PASS"
    else:
        face_status = "N/A"

    # ---- multiple identity (Phase 9 input from Phase 11 history) --------------
    if multiple_identity:
        names = sorted({h["name"] or "unknown" for h in multiple_identity})
        total += _add(reasons, WEIGHTS["multiple_identity"],
                     f"The same face was seen in {len(multiple_identity)} earlier scan(s) "
                     f"under a different identity ({', '.join(names[:3])}).",
                     "identity", "photo")
        identity_status = "FAIL" if len(multiple_identity) > 1 else "WARN"
    else:
        identity_status = "PASS"

    total = max(0.0, min(100.0, total))
    status = next(name for threshold, name in STATUS_BANDS if total >= threshold)
    reasons.sort(key=lambda r: -r["points"])

    checklist = {
        "ocr_validation": ocr_status,
        "mrz_validation": mrz_status,
        "tampering_detection": tampering_status,
        "face_verification": face_status,
        "multiple_identity": identity_status,
    }

    return {
        "score": round(total, 1),
        "status": status,               # CLEAR | SUSPICIOUS | HIGH RISK
        "level": status,                # alias kept for older callers
        "action": ACTIONS[status],
        "reasons": reasons,
        "summary": _summary(status, reasons),
        "checklist": checklist,
        "checklist_text": render_checklist(checklist),
    }


def render_checklist(checklist: dict[str, str]) -> str:
    lines = []
    for key, label in CHECKLIST_ITEMS:
        status = checklist.get(key, "N/A")
        lines.append(f"{label:<21}{STATUS_ICON.get(status, '')}  {status}")
    return "\n".join(lines)


def _summary(status: str, reasons: list[dict[str, Any]]) -> str:
    if not reasons:
        return ("All automated checks passed: fields, dates, document number, MRZ and face "
                "match are consistent, with no prior identity conflicts.")
    top = reasons[0]
    fields = {r["field"] for r in reasons if r.get("field")}
    field_txt = (" Fields involved: " + ", ".join(sorted(f.replace("_", " ") for f in fields))
                + ".") if fields else ""
    return f"{status}. Strongest indicator: {top['reason']}{field_txt}"

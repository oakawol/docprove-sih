"""
Phase 3 - Document validation.

Rule-based checks over the structured record produced by Phase 2:
required fields, date formats, chronology, expiry, document-number format,
nationality, sex, and document-specific rules for passports and visas.

Every check returns the same shape so the frontend can render them uniformly:
    {id, label, status: pass|fail|warn|skip, detail, field, severity}
"""

from __future__ import annotations

import re
from datetime import date, datetime
from typing import Any, Callable

DATE_FMT = "%d/%m/%Y"

REQUIRED = {
    "passport": ["surname", "given_name", "passport_no", "nationality", "sex",
                 "dob", "issue", "expiry"],
    "visa": ["visa_no", "passport_no", "name", "nationality", "dob", "sex",
             "visa_type", "valid_from", "valid_until"],
}

DATE_FIELDS = {
    "passport": ["dob", "issue", "expiry"],
    "visa": ["dob", "valid_from", "valid_until"],
}

# Document-number formats for the fictional issuing state used by the dataset.
NUMBER_FORMATS = {
    "passport_no": (re.compile(r"^TEST[A-Z]\d{4}$"), "TEST + 1 letter + 4 digits (9 characters)"),
    "visa_no": (re.compile(r"^TSTV\d{6}$"), "TSTV + 6 digits"),
    "file_no": (re.compile(r"^TF\d{7}$"), "TF + 7 digits"),
}

ALLOWED_NATIONALITIES = {"TESTLANDIAN"}
ALLOWED_SEX = {"M", "F", "X"}
MAX_PASSPORT_VALIDITY_YEARS = 10


def parse_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return datetime.strptime(value.strip(), DATE_FMT).date()
    except ValueError:
        return None


def _check(cid: str, label: str, status: str, detail: str,
           field: str | None = None, severity: str = "medium") -> dict[str, Any]:
    return {"id": cid, "label": label, "status": status, "detail": detail,
            "field": field, "severity": severity}


def validate(record: dict[str, str | None], doc_type: str,
             today: date | None = None) -> dict[str, Any]:
    today = today or date.today()
    checks: list[dict[str, Any]] = []
    g: Callable[[str], str | None] = lambda k: (record.get(k) or None)

    # --- required fields --------------------------------------------------- #
    missing = [f for f in REQUIRED[doc_type] if not g(f)]
    checks.append(_check(
        "required_fields", "Required fields present",
        "pass" if not missing else "fail",
        "All mandatory fields were read from the document."
        if not missing else "Missing or unreadable: " + ", ".join(missing),
        severity="high",
    ))

    # --- date formats ------------------------------------------------------ #
    bad_dates = []
    for f in DATE_FIELDS[doc_type]:
        raw = g(f)
        if raw is None:
            continue
        if not parse_date(raw):
            bad_dates.append(f"{f}={raw}")
    checks.append(_check(
        "date_format", "Date fields are valid calendar dates",
        "pass" if not bad_dates else "fail",
        "All dates parse as DD/MM/YYYY."
        if not bad_dates else "Unparseable dates: " + ", ".join(bad_dates),
        severity="high",
    ))

    # --- document numbers -------------------------------------------------- #
    for key in ("passport_no", "visa_no", "file_no"):
        val = g(key)
        if val is None:
            continue
        rx, desc = NUMBER_FORMATS[key]
        checks.append(_check(
            f"format_{key}", f"{key.replace('_', ' ').title()} format",
            "pass" if rx.match(val) else "fail",
            f"{val} matches the expected pattern ({desc})."
            if rx.match(val) else f"{val} does not match the expected pattern ({desc}).",
            field=key, severity="high" if key != "file_no" else "low",
        ))

    # --- nationality / sex ------------------------------------------------- #
    nat = g("nationality")
    if nat:
        ok = nat.upper() in ALLOWED_NATIONALITIES
        checks.append(_check(
            "nationality", "Nationality recognised", "pass" if ok else "warn",
            f"{nat} is a recognised issuing nationality." if ok
            else f"{nat} is not in the accepted nationality list.",
            field="nationality", severity="medium"))

    sex = g("sex")
    if sex:
        ok = sex.upper() in ALLOWED_SEX
        checks.append(_check(
            "sex", "Sex code valid", "pass" if ok else "fail",
            f"Sex code '{sex}' is valid." if ok
            else f"Sex code '{sex}' is not one of M/F/X.",
            field="sex", severity="medium"))

    # --- chronology and expiry -------------------------------------------- #
    if doc_type == "passport":
        dob, issue, expiry = (parse_date(g("dob")), parse_date(g("issue")),
                              parse_date(g("expiry")))
        if dob and issue:
            checks.append(_check(
                "dob_before_issue", "Date of birth precedes issue date",
                "pass" if dob < issue else "fail",
                "Birth date is earlier than the issue date." if dob < issue
                else f"Date of birth ({g('dob')}) is not before the issue date ({g('issue')}).",
                field="dob", severity="high"))
        if issue and expiry:
            ok = issue < expiry
            years = (expiry - issue).days / 365.25
            checks.append(_check(
                "issue_before_expiry", "Issue date precedes expiry",
                "pass" if ok else "fail",
                "Issue and expiry dates are in the correct order." if ok
                else "Expiry date is on or before the issue date.",
                field="expiry", severity="high"))
            checks.append(_check(
                "validity_period", "Validity period within 10 years",
                "pass" if years <= MAX_PASSPORT_VALIDITY_YEARS + 0.1 else "fail",
                f"Validity period is {years:.1f} years.",
                field="expiry", severity="medium"))
        if expiry:
            valid = expiry >= today
            days = (expiry - today).days
            checks.append(_check(
                "expiry", "Document not expired", "pass" if valid else "fail",
                f"Valid for another {days} days (expires {g('expiry')})." if valid
                else f"Expired {abs(days)} days ago (expiry {g('expiry')}).",
                field="expiry", severity="high"))
        if dob:
            age = (today - dob).days / 365.25
            if not (0 < age < 120):
                checks.append(_check("age_plausible", "Age plausible", "fail",
                                     f"Computed age of {age:.0f} years is implausible.",
                                     field="dob", severity="high"))

    else:  # visa
        dob = parse_date(g("dob"))
        vfrom, vuntil = parse_date(g("valid_from")), parse_date(g("valid_until"))
        if vfrom and vuntil:
            ok = vfrom < vuntil
            checks.append(_check(
                "visa_window", "Validity window ordered", "pass" if ok else "fail",
                "Valid-from precedes valid-until." if ok
                else f"Valid-from ({g('valid_from')}) is not before valid-until ({g('valid_until')}).",
                field="valid_until", severity="high"))
            dur = g("duration")
            m = re.search(r"(\d+)", dur or "")
            if m:
                stay, window = int(m.group(1)), (vuntil - vfrom).days
                ok = stay <= window
                checks.append(_check(
                    "duration_fits", "Duration of stay fits the validity window",
                    "pass" if ok else "fail",
                    f"{stay} days of stay inside a {window} day window." if ok
                    else f"Permitted stay ({stay} days) exceeds the validity window ({window} days).",
                    field="duration", severity="medium"))
        if vuntil:
            valid = vuntil >= today
            days = (vuntil - today).days
            checks.append(_check(
                "expiry", "Visa not expired", "pass" if valid else "fail",
                f"Valid for another {days} days." if valid
                else f"Expired {abs(days)} days ago (valid until {g('valid_until')}).",
                field="valid_until", severity="high"))
        if dob and vfrom and dob >= vfrom:
            checks.append(_check("dob_before_issue", "Date of birth precedes issue",
                                 "fail", "Date of birth is not before the visa issue date.",
                                 field="dob", severity="high"))

    failed = [c for c in checks if c["status"] == "fail"]
    warned = [c for c in checks if c["status"] == "warn"]
    return {
        "checks": checks,
        "passed": len(checks) - len(failed) - len(warned),
        "failed": len(failed),
        "warnings": len(warned),
        "valid": not failed,
        "failed_fields": sorted({c["field"] for c in failed if c["field"]}),
    }

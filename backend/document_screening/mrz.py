"""
Phase 4 - Machine Readable Zone verification (passports only).

Implements the ICAO 9303 TD3 layout: two lines of 44 characters, with the
7-3-1 weighted check-digit scheme. Provides:

  * check_digit()      - the 9303 checksum
  * parse_td3()        - MRZ text -> structured fields + per-field check results
  * score_line2()      - how many check digits hold (used to pick between OCR
                         hypotheses, the way real MRZ readers do)
  * compare_printed()  - MRZ vs the printed/OCR data, field by field
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field as dc_field
from typing import Any

WEIGHTS = (7, 3, 1)


def check_digit(data: str) -> str:
    total = 0
    for i, ch in enumerate(data):
        if ch.isdigit():
            v = int(ch)
        elif ch.isalpha():
            v = ord(ch.upper()) - 55
        else:
            v = 0
        total += v * WEIGHTS[i % 3]
    return str(total % 10)


def mrz_to_display_date(yymmdd: str, *, future_window: bool = False) -> str | None:
    """YYMMDD -> DD/MM/YYYY. Century rule: expiry dates are always in the future."""
    if not re.fullmatch(r"\d{6}", yymmdd or ""):
        return None
    yy, mm, dd = int(yymmdd[:2]), yymmdd[2:4], yymmdd[4:6]
    century = 2000 if (future_window or yy <= 30) else 1900
    return f"{dd}/{mm}/{century + yy}"


def display_to_mrz_date(ddmmyyyy: str | None) -> str | None:
    if not ddmmyyyy:
        return None
    m = re.fullmatch(r"(\d{2})[/\-.](\d{2})[/\-.](\d{4})", ddmmyyyy.strip())
    if not m:
        return None
    return f"{m.group(3)[2:]}{m.group(2)}{m.group(1)}"


# --------------------------------------------------------------------------- #
@dataclass
class MRZResult:
    present: bool = False
    lines: list[str] = dc_field(default_factory=list)
    format_ok: bool = False
    fields: dict[str, Any] = dc_field(default_factory=dict)
    check_digits: dict[str, dict[str, Any]] = dc_field(default_factory=dict)
    all_checks_pass: bool = False
    mismatches: list[dict[str, Any]] = dc_field(default_factory=list)
    issues: list[str] = dc_field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "present": self.present,
            "lines": self.lines,
            "format_ok": self.format_ok,
            "fields": self.fields,
            "check_digits": self.check_digits,
            "all_checks_pass": self.all_checks_pass,
            "mismatches": self.mismatches,
            "issues": self.issues,
        }


def parse_td3(lines: list[str]) -> MRZResult:
    res = MRZResult(lines=list(lines or []))
    if not lines:
        res.issues.append("No MRZ detected on the document.")
        return res
    res.present = True

    padded = [ln.ljust(44, "<")[:44] for ln in lines]
    l1 = next((ln for ln in padded if ln.startswith("P")), None)
    l2 = next((ln for ln in padded if sum(c.isdigit() for c in ln) >= 10), None)
    if not l2:
        res.issues.append("MRZ line 2 (data line) could not be read.")
        return res

    if l1:
        res.fields["document_code"] = l1[0:2].replace("<", "")
        res.fields["issuing_state"] = l1[2:5].replace("<", "")
        name_part = l1[5:44]
        surname, _, given = name_part.partition("<<")
        res.fields["surname"] = surname.replace("<", " ").strip()
        res.fields["given_name"] = given.replace("<", " ").strip()
        res.fields["name"] = f"{res.fields['given_name']} {res.fields['surname']}".strip()
    else:
        res.issues.append("MRZ line 1 (name line) could not be read.")

    doc_no = l2[0:9]
    doc_chk = l2[9]
    nationality = l2[10:13]
    dob = l2[13:19]
    dob_chk = l2[19]
    sex = l2[20]
    expiry = l2[21:27]
    exp_chk = l2[27]
    personal = l2[28:42]
    personal_chk = l2[42]
    composite_chk = l2[43]

    res.fields.update({
        "passport_no": doc_no.replace("<", ""),
        "nationality_code": nationality.replace("<", ""),
        "dob_raw": dob,
        "dob": mrz_to_display_date(dob),
        "sex": sex if sex in "MFX" else None,
        "expiry_raw": expiry,
        "expiry": mrz_to_display_date(expiry, future_window=True),
        "personal_no": personal.replace("<", ""),
    })

    composite = (doc_no + doc_chk + dob + dob_chk + expiry + exp_chk + personal + personal_chk)
    checks = {
        "passport_no": (doc_no, doc_chk),
        "dob": (dob, dob_chk),
        "expiry": (expiry, exp_chk),
        "personal_no": (personal, personal_chk),
        "composite": (composite, composite_chk),
    }
    for name, (data, printed) in checks.items():
        expected = check_digit(data)
        res.check_digits[name] = {
            "expected": expected, "found": printed, "valid": expected == printed,
        }
    res.all_checks_pass = all(c["valid"] for c in res.check_digits.values())

    res.format_ok = bool(
        re.fullmatch(r"[A-Z0-9<]{44}", l2)
        and (l1 is None or re.fullmatch(r"[A-Z0-9<]{44}", l1))
        and re.fullmatch(r"\d{6}", dob) and re.fullmatch(r"\d{6}", expiry)
        and sex in "MFX"
    )
    if not res.format_ok:
        res.issues.append("MRZ does not follow the ICAO 9303 TD3 character layout.")
    for name, c in res.check_digits.items():
        if not c["valid"]:
            res.issues.append(
                f"MRZ check digit for {name.replace('_', ' ')} is wrong "
                f"(expected {c['expected']}, found {c['found']})."
            )
    return res


def score_line2(line: str) -> int:
    """How many of the five TD3 check digits hold. Used to rank OCR hypotheses."""
    if not line or len(line.rstrip("<")) < 30:
        return -1
    r = parse_td3([line.ljust(44, "<")[:44]])
    return sum(1 for c in r.check_digits.values() if c["valid"]) + (2 if r.format_ok else 0)


# --------------------------------------------------------------------------- #
COMPARE_FIELDS = [
    ("passport_no", "passport_no", "Passport number"),
    ("dob", "dob", "Date of birth"),
    ("expiry", "expiry", "Date of expiry"),
    ("sex", "sex", "Sex"),
    ("surname", "surname", "Surname"),
    ("given_name", "given_name", "Given name(s)"),
    ("nationality_code", "nationality", "Nationality"),
]

NATIONALITY_CODES = {"TESTLANDIAN": "TST"}


def _norm(v: str | None) -> str:
    return re.sub(r"[^A-Z0-9/]", "", (v or "").upper())


def compare_printed(mrz: MRZResult, printed: dict[str, str | None]) -> MRZResult:
    """Phase 4 cross-check: MRZ data vs the printed (OCR'd) data."""
    if not mrz.present or not mrz.fields:
        return mrz
    for mrz_key, print_key, label in COMPARE_FIELDS:
        mval, pval = mrz.fields.get(mrz_key), printed.get(print_key)
        if not mval or not pval:
            continue
        a, b = _norm(str(mval)), _norm(str(pval))
        if mrz_key == "nationality_code":
            b = NATIONALITY_CODES.get(b, b[:3])
        if a == b:
            continue
        # tolerate a single OCR character slip in name fields
        if mrz_key in ("surname", "given_name") and _levenshtein(a, b) <= 1:
            continue
        mrz.mismatches.append({
            "field": print_key, "label": label,
            "printed": pval, "mrz": mval,
            "severity": "high" if print_key in ("dob", "expiry", "passport_no") else "medium",
        })
    return mrz


def _levenshtein(a: str, b: str) -> int:
    if a == b:
        return 0
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]

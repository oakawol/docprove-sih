"""Document eligibility gate for inexpensive pre-verification screening."""

from __future__ import annotations

import re
from dataclasses import dataclass, asdict
from typing import Any

from . import ocr as ocr_mod

# Tunable, deliberately conservative thresholds. These decide only whether the
# image looks document-like enough to enter verification; they never score risk.
MIN_WORDS = 6
MIN_ALPHA_CHARS = 18
MIN_DIGITS = 2
MIN_TEXT_LINES = 3
MIN_SIGNAL_TERMS = 1
MIN_PLAUSIBILITY_SCORE = 5

DOCUMENT_TERMS = (
    "PASSPORT", "VISA", "REPUBLIC", "NATIONALITY", "SURNAME", "GIVEN",
    "NAME", "DATE", "BIRTH", "EXPIRY", "ISSUE", "DOCUMENT", "NUMBER",
    "MRZ", "ENTRY", "VALID", "SEX", "TYPE", "COUNTRY",
)


@dataclass
class EligibilityResult:
    document_valid: bool
    document_type: str
    rejection_reason: str | None
    signals: dict[str, Any]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def assess(ocr_result: ocr_mod.OCRResult) -> EligibilityResult:
    """Assess document plausibility from OCR structure and document signals."""
    words = [w for w in ocr_result.words if w.text.strip()]
    text = " ".join(w.text.upper() for w in words)
    alpha_chars = len(re.findall(r"[A-ZÀ-ÖØ-Ý]", text))
    digits = len(re.findall(r"\d", text))
    lines = ocr_mod.group_lines(words)
    signal_terms = sorted({term for term in DOCUMENT_TERMS if term in text})
    mrz_present = bool(ocr_result.mrz_lines and ocr_result.mrz_box)

    # A document-like image has text on several rows and across more than one
    # horizontal position. This rejects a single caption or screenshot label.
    line_positions = {
        round(sum(w.cx for w in line) / max(1, len(line)) / 100)
        for line in lines
    }
    distributed_text = len(line_positions) >= 2 and len(lines) >= MIN_TEXT_LINES

    score = 0
    score += 2 if len(words) >= MIN_WORDS else 0
    score += 1 if alpha_chars >= MIN_ALPHA_CHARS else 0
    score += 1 if digits >= MIN_DIGITS else 0
    score += 2 if distributed_text else 0
    score += min(2, len(signal_terms))
    score += 1 if mrz_present else 0

    # Require both meaningful OCR structure and at least one document signal.
    # MRZ is strong evidence for passports, but is not required for visas.
    accepted = (
        score >= MIN_PLAUSIBILITY_SCORE
        and len(words) >= MIN_WORDS
        and alpha_chars >= MIN_ALPHA_CHARS
        and distributed_text
        and (bool(signal_terms) or mrz_present)
    )

    return EligibilityResult(
        document_valid=accepted,
        document_type=ocr_result.doc_type if accepted else "unknown",
        rejection_reason=None if accepted else "insufficient_document_signals",
        signals={
            "word_count": len(words),
            "alphabetic_characters": alpha_chars,
            "numeric_characters": digits,
            "text_lines": len(lines),
            "distributed_text": distributed_text,
            "document_terms": signal_terms,
            "mrz_present": mrz_present,
            "plausibility_score": score,
        },
    )

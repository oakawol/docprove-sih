"""
Phase 2 - OCR and structured extraction.

Reads a document image, returns words with bounding boxes and confidences,
then anchors on printed field labels ("DATE OF BIRTH", "PASSPORT NO.", ...)
to turn raw OCR into a structured record.

Every extracted field keeps its bounding box - Phase 5 needs the boxes to
localise tampering, and the frontend needs them to draw overlays.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field as dc_field, asdict
from typing import Any

import numpy as np
from PIL import Image

from . import mrz

import os as _os

try:
    import pytesseract
    _tess_cmd = _os.environ.get("TESSERACT_CMD")
    if not _tess_cmd and _os.path.exists(r"C:\Program Files\Tesseract-OCR\tesseract.exe"):
        _tess_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    if _tess_cmd:
        pytesseract.pytesseract.tesseract_cmd = _tess_cmd
    from pytesseract import Output
    _TESSERACT = True
except Exception:                                    # pragma: no cover
    _TESSERACT = False


# --------------------------------------------------------------------------- #
@dataclass
class Word:
    text: str
    conf: float
    box: tuple[int, int, int, int]        # x0, y0, x1, y1
    line_id: tuple[int, int, int]         # block, par, line

    @property
    def cx(self) -> float:
        return (self.box[0] + self.box[2]) / 2

    @property
    def top(self) -> int:
        return self.box[1]


@dataclass
class Field:
    name: str
    value: str | None
    box: list[int] | None = None
    confidence: float = 0.0
    source: str = "ocr"                   # ocr | mrz | derived
    label_box: list[int] | None = None    # printed label above the value

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class OCRResult:
    doc_type: str
    fields: dict[str, Field] = dc_field(default_factory=dict)
    mrz_lines: list[str] = dc_field(default_factory=list)
    mrz_box: list[int] | None = None
    words: list[Word] = dc_field(default_factory=list)
    raw_text: str = ""
    mean_confidence: float = 0.0

    def value(self, name: str) -> str | None:
        f = self.fields.get(name)
        return f.value if f else None

    def box(self, name: str) -> list[int] | None:
        f = self.fields.get(name)
        return f.box if f else None

    def to_dict(self) -> dict[str, Any]:
        return {
            "doc_type": self.doc_type,
            "mean_confidence": round(self.mean_confidence, 2),
            "fields": {k: v.to_dict() for k, v in self.fields.items()},
            "mrz_lines": self.mrz_lines,
            "mrz_box": self.mrz_box,
        }


# --------------------------------------------------------------------------- #
# Label vocabulary. Each entry: canonical field -> printed label variants.
# Order matters: longer labels are matched first so "DATE OF BIRTH" wins over "DATE".
# --------------------------------------------------------------------------- #
PASSPORT_LABELS: dict[str, list[str]] = {
    "surname": ["SURNAME"],
    "given_name": ["GIVEN NAME(S)", "GIVEN NAMES", "GIVEN NAME"],
    "passport_no": ["PASSPORT NO.", "PASSPORT NO", "DOCUMENT NO."],
    "nationality": ["NATIONALITY"],
    "sex": ["SEX", "GENDER"],
    "dob": ["DATE OF BIRTH", "DOB"],
    "place_of_birth": ["PLACE OF BIRTH"],
    "issue": ["DATE OF ISSUE"],
    "expiry": ["DATE OF EXPIRY", "DATE OF EXPIRE"],
    "place_of_issue": ["PLACE OF ISSUE"],
    "file_no": ["FILE NO.", "FILE NO"],
    "type_code": ["TYPE / CODE", "TYPE/CODE", "TYPE"],
}

VISA_LABELS: dict[str, list[str]] = {
    "visa_no": ["VISA NO.", "VISA NO"],
    "passport_no": ["PASSPORT NO.", "PASSPORT NO"],
    "name": ["FULL NAME", "NAME"],
    "nationality": ["NATIONALITY"],
    "dob": ["DATE OF BIRTH", "DOB"],
    "sex": ["SEX", "GENDER"],
    "visa_type": ["VISA TYPE"],
    "entries": ["ENTRIES"],
    "valid_from": ["VALID FROM"],
    "valid_until": ["VALID UNTIL", "VALID TILL"],
    "duration": ["DURATION OF STAY", "DURATION"],
    "issued_at": ["ISSUED AT"],
    "port": ["PORT OF ENTRY"],
}

# labels that must never be swallowed as a value
STOP_WORDS = {w for labels in list(PASSPORT_LABELS.values()) + list(VISA_LABELS.values())
              for label in labels for w in label.replace("/", " ").split()}
STOP_WORDS |= {"SIGNATURE", "HOLDER", "SPECIMEN", "BARCODE", "FUNCTIONAL",
               "MACHINE", "READABLE", "ZONE", "FICTIONAL", "OF", "NO", "NO."}

MRZ_RE = re.compile(r"^[A-Z0-9<]{28,50}$")
DATE_RE = re.compile(r"\b(\d{2})[/\-.](\d{2})[/\-.](\d{4})\b")


# --------------------------------------------------------------------------- #
def load_image(path_or_img) -> Image.Image:
    if isinstance(path_or_img, Image.Image):
        return path_or_img.convert("RGB")
    return Image.open(path_or_img).convert("RGB")


def preprocess(img: Image.Image) -> Image.Image:
    """Upscale small scans; OCR on document images likes ~1500px wide."""
    if img.width < 1200:
        scale = 1200 / img.width
        img = img.resize((int(img.width * scale), int(img.height * scale)), Image.LANCZOS)
    return img


def _merge_word_lists(primary: list[Word], secondary: list[Word]) -> list[Word]:
    """Merge OCR words from two passes (e.g. sparse PSM 11 and dense PSM 6) without duplicates."""
    def _iou(b1, b2):
        x0 = max(b1[0], b2[0])
        y0 = max(b1[1], b2[1])
        x1 = min(b1[2], b2[2])
        y1 = min(b1[3], b2[3])
        if x1 <= x0 or y1 <= y0:
            return 0.0
        inter = (x1 - x0) * (y1 - y0)
        a1 = (b1[2] - b1[0]) * (b1[3] - b1[1])
        a2 = (b2[2] - b2[0]) * (b2[3] - b2[1])
        return inter / float(a1 + a2 - inter)

    merged = list(primary)
    for w in secondary:
        if not any(_iou(w.box, ex.box) > 0.35 for ex in merged):
            merged.append(w)
    return merged


def run_ocr(img: Image.Image, psm: int = 11, dual_pass: bool = True) -> list[Word]:
    """Extract words from document image.

    By default runs a dual-pass OCR (PSM 11 sparse + PSM 6 uniform block)
    to guarantee that both sparse card fields and edited text blocks are recognized.
    """
    if not _TESSERACT:
        raise RuntimeError(
            "pytesseract/tesseract not available. Install tesseract-ocr and pytesseract, "
            "or plug another engine into run_ocr()."
        )
    def _extract_words(config: str) -> list[Word]:
        data = pytesseract.image_to_data(img, output_type=Output.DICT, config=config)
        words: list[Word] = []
        for i, text in enumerate(data["text"]):
            text = text.strip()
            if not text:
                continue
            try:
                conf = float(data["conf"][i])
            except (TypeError, ValueError):
                conf = -1.0
            if conf < 0:
                continue
            x, y, w, h = data["left"][i], data["top"][i], data["width"][i], data["height"][i]
            words.append(Word(text, conf, (x, y, x + w, y + h),
                              (data["block_num"][i], data["par_num"][i], data["line_num"][i])))
        return words

    cfg_primary = f"--psm {psm} -c preserve_interword_spaces=1"
    words_primary = _extract_words(cfg_primary)
    if not dual_pass:
        return words_primary

    alt_psm = 6 if psm != 6 else 11
    cfg_secondary = f"--psm {alt_psm} -c preserve_interword_spaces=1"
    words_secondary = _extract_words(cfg_secondary)
    return _merge_word_lists(words_primary, words_secondary)


# --------------------------------------------------------------------------- #
def group_lines(words: list[Word]) -> list[list[Word]]:
    """Group words into visual lines by centre-line overlap.

    Uses the smaller of the two glyph heights as the tolerance so an oversized
    watermark letter cannot swallow three real rows of text.
    """
    lines: list[dict] = []
    for w in sorted(words, key=lambda w: (w.box[1], w.box[0])):
        cy = (w.box[1] + w.box[3]) / 2
        h = max(1, w.box[3] - w.box[1])
        placed = False
        for ln in lines:
            tol = 0.55 * min(h, ln["h"])
            if abs(cy - ln["cy"]) <= tol:
                ln["words"].append(w)
                n = len(ln["words"])
                ln["cy"] = ln["cy"] + (cy - ln["cy"]) / n
                ln["h"] = min(ln["h"], h)
                placed = True
                break
        if not placed:
            lines.append({"cy": cy, "h": h, "words": [w]})
    out = [sorted(ln["words"], key=lambda w: w.box[0]) for ln in lines]
    out.sort(key=lambda ln: min(w.box[1] for w in ln))
    return out


def _token_match(seen: str, want: str) -> bool:
    """Short labels (SEX, DOB) must match exactly; longer ones tolerate one
    OCR slip, because a misread label must not lose the whole field."""
    seen = re.sub(r"[^A-Z0-9]", "", seen or "")
    want = re.sub(r"[^A-Z0-9]", "", want or "")
    if not seen or not want:
        return False
    if len(want) <= 3:
        return seen == want
    if seen == want or seen.startswith(want) or want.startswith(seen):
        return len(seen) >= 3
    return len(seen) >= 4 and mrz._levenshtein(seen, want) <= 1


def find_label(lines: list[list[Word]], label: str) -> tuple[int, int, int, int] | None:
    """Locate a (possibly multi-word) label and return its bounding box."""
    tokens = [re.sub(r"[^A-Z0-9]", "", t.upper()) for t in label.replace("/", " ").split()]
    tokens = [t for t in tokens if t]
    for line in lines:
        texts = [re.sub(r"[^A-Z0-9]", "", w.text.upper()) for w in line]
        # First try exact contiguous window
        for i in range(len(texts) - len(tokens) + 1):
            window = texts[i:i + len(tokens)]
            if all(_token_match(a, b) for a, b in zip(window, tokens)):
                seg = line[i:i + len(tokens)]
                return (min(w.box[0] for w in seg), min(w.box[1] for w in seg),
                        max(w.box[2] for w in seg), max(w.box[3] for w in seg))
        # Fallback: subsequence match allowing duplicate/noise tokens between label words (e.g. OF OF)
        matched_words = []
        curr_idx = 0
        for w, txt in zip(line, texts):
            if not txt:
                continue
            if _token_match(txt, tokens[curr_idx]):
                matched_words.append(w)
                curr_idx += 1
                if curr_idx == len(tokens):
                    return (min(w.box[0] for w in matched_words), min(w.box[1] for w in matched_words),
                            max(w.box[2] for w in matched_words), max(w.box[3] for w in matched_words))
    return None


def value_below(lines: list[list[Word]], label_box, *, max_gap: int = 70,
                x_tol: int = 30, max_width: int = 420) -> tuple[str, list[int], float] | None:
    """Take the text line that sits directly under a label, left-aligned with it.

    Tolerates slight vertical overlap (e.g. manually edited / overlaid text).
    """
    lx0, ly0, lx1, ly1 = label_box
    best = None
    for line in lines:
        # allow words whose top is within -30px of label bottom, provided their vertical center is below label top
        cand = [w for w in line
                if lx0 - x_tol <= w.box[0] <= lx0 + max_width
                and -30 <= w.box[1] - ly1 < max_gap
                and (w.box[1] + w.box[3]) / 2 > ly0]
        if not cand:
            continue
        # a row that is nothing but printed labels is not a value
        if all(w.text.upper().strip(".,()") in STOP_WORDS for w in cand):
            continue
        # avoid matching the label's own tokens if they slightly overlap
        if any(w.box[0] >= lx0 - 5 and w.box[2] <= lx1 + 10 and abs(w.box[1] - ly0) < 15 for w in cand):
            continue
        gap = min(w.box[1] for w in cand) - ly1
        if best is None or gap < best[0]:
            best = (gap, cand)
    if not best:
        return None
    cand = best[1]
    # keep words contiguous horizontally (stop at a big gap -> next column)
    kept = [cand[0]]
    for w in cand[1:]:
        if w.box[0] - kept[-1].box[2] > 60:
            break
        kept.append(w)
    text = " ".join(w.text for w in kept).strip()
    box = [min(w.box[0] for w in kept), min(w.box[1] for w in kept),
           max(w.box[2] for w in kept), max(w.box[3] for w in kept)]
    conf = float(np.mean([w.conf for w in kept]))
    return text, box, conf


def value_above(lines: list[list[Word]], label_box, *, max_gap: int = 60,
                x_tol: int = 40) -> tuple[str, list[int], float] | None:
    """Take the text line sitting directly above a caption (signature specimen)."""
    lx0, ly0, lx1, _ = label_box
    best = None
    for line in lines:
        cand = [w for w in line
                if w.box[0] >= lx0 - x_tol and w.box[0] <= lx1 + x_tol
                and 0 < ly0 - w.box[3] < max_gap]
        if not cand:
            continue
        gap = ly0 - max(w.box[3] for w in cand)
        if best is None or gap < best[0]:
            best = (gap, cand)
    if not best:
        return None
    cand = best[1]
    text = " ".join(w.text for w in cand).strip()
    box = [min(w.box[0] for w in cand), min(w.box[1] for w in cand),
           max(w.box[2] for w in cand), max(w.box[3] for w in cand)]
    return text, box, float(np.mean([w.conf for w in cand]))


def detect_mrz(lines: list[list[Word]]) -> tuple[list[str], list[int] | None]:
    """Find the machine readable zone: long A-Z0-9< strings near the bottom."""
    cands: list[tuple[str, list[int]]] = []
    for line in lines:
        joined = "".join(w.text for w in line).upper().replace(" ", "")
        joined = joined.replace("«", "<").replace("K<", "<<")
        if len(joined) >= 28 and MRZ_RE.match(joined) and joined.count("<") >= 3:
            box = [min(w.box[0] for w in line), min(w.box[1] for w in line),
                   max(w.box[2] for w in line), max(w.box[3] for w in line)]
            cands.append((joined, box))
    if not cands:
        return [], None
    cands = cands[-2:]
    lines_out = [c[0] for c in cands]
    boxes = [c[1] for c in cands]
    mrz_box = [min(b[0] for b in boxes), min(b[1] for b in boxes),
               max(b[2] for b in boxes), max(b[3] for b in boxes)]
    return lines_out, mrz_box


MRZ_PSMS = (7, 13, 6)
MRZ_WHITELIST = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<"


def _binarize(img: Image.Image, thresh: int = 150) -> Image.Image:
    a = np.array(img.convert("L"))
    return Image.fromarray(np.where(a < thresh, 0, 255).astype("uint8"))


def _mrz_hypotheses(img: Image.Image, box: list[int]) -> list[str]:
    """Read one MRZ row several ways; the checksum decides which read is right."""
    crop = img.crop((max(0, box[0] - 8), max(0, box[1] - 8),
                     min(img.width, box[2] + 8), min(img.height, box[3] + 8)))
    if crop.width < 2200:
        f = 2200 / max(1, crop.width)
        crop = crop.resize((int(crop.width * f), int(crop.height * f)), Image.LANCZOS)
    variants = [(crop, 7), (_binarize(crop), 13), (_binarize(crop, 190), 7),
                (crop, 13), (_binarize(crop, 170), 7), (_binarize(crop, 210), 13)]
    out: list[str] = []
    for var, psm in variants:
        for _ in (0,):
            cfg = f"--psm {psm} -c tessedit_char_whitelist={MRZ_WHITELIST}"
            try:
                raw = pytesseract.image_to_string(var, config=cfg)
            except Exception:
                continue
            text = re.sub(r"[^A-Z0-9<]", "", raw.upper())
            if len(text) >= 20:
                out.append(text)
    return out


def _normalize_name_line(text: str) -> str:
    """TD3 line 1 is 'P<ISO' + name + '<' filler. Cut at the filler run so that
    watermark speckle read inside the filler cannot pollute the name."""
    body = text[:44]
    m = re.search(r"<{3,}", body[5:])
    if m:
        body = body[:5 + m.start()]
    return body.ljust(44, "<")[:44]


def _pick_line(hyps: list[str]) -> tuple[str | None, str | None]:
    """Return (name_line, data_line) chosen from all hypotheses for one row."""
    names = [_normalize_name_line(h) for h in hyps if h.startswith("P")]
    name = None
    if names:
        # majority vote across the reads, longest wins a tie
        name = max(set(names), key=lambda n: (names.count(n), len(n.rstrip("<"))))
    data_cands = [h for h in hyps if sum(c.isdigit() for c in h) >= 10]
    data = None
    if data_cands:
        data = max(data_cands, key=lambda h: (mrz.score_line2(h.ljust(44, "<")[:44]),
                                              -abs(len(h) - 44)))
    return name, data


def read_mrz(img: Image.Image, lines: list[list[Word]]) -> tuple[list[str], list[int] | None]:
    """Re-OCR the MRZ band with an ICAO character whitelist.

    General OCR models mangle long runs of '<' into C/E/K and the security
    watermark bleeds into the band, so every candidate row in the lower part of
    the card is read again several ways (raw + two binarisations x three page
    segmentation modes) and the ICAO check digits pick the winning read.
    """
    top = img.height * 0.6
    rows = []
    for ln in lines:
        y0 = min(w.box[1] for w in ln)
        joined = "".join(w.text for w in ln).upper()
        if y0 <= top or len(joined) < 25:
            continue
        # MRZ rows are the only long rows carrying digits or filler runs;
        # captions ("SIGNATURE OF HOLDER", "MACHINE READABLE ZONE") carry neither
        filler_run = re.search(r"[<CEK]{4,}", joined)
        if not filler_run and sum(c.isdigit() for c in joined) < 8:
            continue
        rows.append([min(w.box[0] for w in ln), y0, img.width - 12,
                     max(w.box[3] for w in ln)])
    if not rows:
        return detect_mrz(lines)

    best_name = best_data = None
    name_box = data_box = None
    for box in rows[-4:]:
        hyps = _mrz_hypotheses(img, box)
        name, data = _pick_line(hyps)
        if name and (best_name is None or len(name) > len(best_name)):
            best_name, name_box = name, box
        if data and (best_data is None or
                     mrz.score_line2(data.ljust(44, "<")[:44]) >
                     mrz.score_line2(best_data.ljust(44, "<")[:44])):
            best_data, data_box = data, box

    out: list[str] = []
    if best_name:
        out.append(_normalize_name_line(best_name))     # trailing filler is always '<'
    if best_data:
        out.append(best_data[:44].ljust(44, "<"))
    if not out:
        return detect_mrz(lines)

    boxes = [b for b in (name_box, data_box) if b]
    region = [min(b[0] for b in boxes) - 8, min(b[1] for b in boxes) - 8,
              max(b[2] for b in boxes) + 8, max(b[3] for b in boxes) + 8]
    return out, region


STAMP_DATE_RE = re.compile(r"\b(\d{1,2})\s*([A-Z]{3})\s*((?:19|20)\d{2})\b")
MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
          "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]


def read_stamp_date(img: Image.Image, box: list[int]) -> tuple[str, str] | None:
    """Read the date inside a round stamp, trying a range of rotations.

    Returns (DD/MM/YYYY, raw text) or None when the impression is not legible -
    an unreadable stamp is never reported as evidence.
    """
    x0, y0, x1, y1 = [int(v) for v in box]
    pad = 6
    crop = img.crop((max(0, x0 - pad), max(0, y0 - pad),
                     min(img.width, x1 + pad), min(img.height, y1 + pad)))
    if crop.width < 260:
        f = 260 / max(1, crop.width)
        crop = crop.resize((int(crop.width * f), int(crop.height * f)), Image.LANCZOS)
    cfg = "--psm 6"
    for angle in (0, -6, 6, -14, 14, -20, 20):
        test = crop.rotate(-angle, resample=Image.BICUBIC, fillcolor=(255, 255, 255)) \
            if angle else crop
        try:
            text = pytesseract.image_to_string(test, config=cfg).upper()
        except Exception:
            return None
        m = STAMP_DATE_RE.search(re.sub(r"[^A-Z0-9\s]", " ", text))
        if m and m.group(2) in MONTHS:
            month = MONTHS.index(m.group(2)) + 1
            return f"{int(m.group(1)):02d}/{month:02d}/{m.group(3)}", m.group(0)
    return None


def guess_doc_type(words: list[Word]) -> str:
    text = " ".join(w.text.upper() for w in words)
    if "VISA" in text and "PASSPORT" not in text.split("VISA")[0][-40:]:
        return "visa" if text.count("VISA") >= text.count("PASSPORT") else "passport"
    return "visa" if "VISA NO" in text else "passport"


# --------------------------------------------------------------------------- #
def extract(path_or_img, doc_type: str | None = None) -> OCRResult:
    """Phase 2 entry point: image -> structured record."""
    img = preprocess(load_image(path_or_img))
    words = run_ocr(img)
    lines = group_lines(words)
    doc_type = doc_type or guess_doc_type(words)
    labels = PASSPORT_LABELS if doc_type == "passport" else VISA_LABELS

    result = OCRResult(doc_type=doc_type, words=words,
                       raw_text="\n".join(" ".join(w.text for w in ln) for ln in lines))
    if words:
        result.mean_confidence = float(np.mean([w.conf for w in words]))

    for name, variants in labels.items():
        got = None
        label_box = None
        for variant in variants:
            lb = find_label(lines, variant)
            if lb:
                got = value_below(lines, lb)
                if got:
                    label_box = list(lb)
                    break
        if got:
            text, box, conf = got
            result.fields[name] = Field(name, clean_value(name, text), box,
                                        round(conf, 1), label_box=label_box)
        else:
            result.fields[name] = Field(name, None, None, 0.0)

    # signature specimen sits *above* its caption - useful as a cross-check
    if doc_type == "passport":
        cap = (find_label(lines, "SIGNATURE OF HOLDER") or
               find_label(lines, "SIGNATURE HOLDER") or
               find_label(lines, "OF HOLDER"))
        if cap:
            above = value_above(lines, cap)
            if above:
                text, box, conf = above
                result.fields["signature_name"] = Field(
                    "signature_name", re.sub(r"\s+", " ", text).upper(), box,
                    round(conf, 1), label_box=list(cap))

    # composite name for passports
    if doc_type == "passport":
        given = result.value("given_name")
        sur = result.value("surname")
        if given and sur:
            result.fields["name"] = Field("name", f"{given} {sur}", None, source="derived")

    if doc_type == "passport":
        result.mrz_lines, result.mrz_box = read_mrz(img, lines)
    else:
        result.mrz_lines, result.mrz_box = [], None
    return result


def clean_value(name: str, text: str) -> str:
    text = text.strip(" .,:;|")
    if name in {"dob", "expiry", "issue", "valid_from", "valid_until"}:
        m = DATE_RE.search(text.replace(" ", ""))
        if m:
            return f"{m.group(1)}/{m.group(2)}/{m.group(3)}"
    if name in {"passport_no", "visa_no", "file_no"}:
        return re.sub(r"[^A-Z0-9]", "", text.upper())
    if name == "sex":
        t = re.sub(r"[^A-Z]", "", text.upper())
        return t[:1] if t else text
    return re.sub(r"\s+", " ", text.upper())

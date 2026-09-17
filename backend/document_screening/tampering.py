"""
Phase 5 - Tampering detection, localisation, and heatmap rendering.

Four families of evidence are combined:

  1. Image forensics (pixel level)
       ELA .............. re-compression error; a region that was edited and
                          re-saved reacts differently from the rest of the page
       noise residual ... high-pass energy; splices carry their own noise floor
       chroma residual .. R-B deviation; colour drift from a pasted patch
       blockiness ....... 8x8 JPEG grid energy left by a re-encoded patch
  2. Layout forensics
       label-to-value gap and glyph height per field; retyped text rarely lands
       on the original baseline, and rarely uses the original font metrics
  3. Cross-field logic (fed in by Phases 3 and 4)
       MRZ vs printed data, signature specimen vs printed name, failed rules
  4. Copy-move
       duplicated high-variance blocks inside the same document

Region scores are robust z-scores (median / MAD) taken across the document's
own fields, so the detector calibrates itself per document instead of relying
on absolute thresholds that shift with scanner and lighting.
"""

from __future__ import annotations

import io
from dataclasses import dataclass, asdict
from typing import Any

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# --------------------------------------------------------------------------- #
FEATURE_WEIGHTS = {
    "ela": 1.0,
    "noise": 0.9,
    "chroma": 1.1,
    "blockiness": 0.7,
    "gap": 1.2,          # layout: label-to-value distance
    "height": 0.6,       # layout: glyph height
}
SUSPICION_THRESHOLD = 3.0        # robust z above which a region is reported
HIGH_THRESHOLD = 5.0

# Regions whose print differs structurally from the field grid (a portrait, the
# mono MRZ band, a handwriting specimen, a rubber stamp). Mixing them into the
# text-field statistics makes every genuine document look tampered, so they get
# their own detectors instead.
NON_TEXT_REGIONS = {"photo", "mrz", "signature_name", "stamp"}

# Separately-compressed patch: its own noise floor rises while its response to
# re-compression falls. Above ~1.0 the region was not encoded with the page.
# A one- or two-character value carries too few pixels for stable statistics.
MIN_FIELD_WIDTH = 46

# Aggregated field score at which a field is reported, with and without a
# reference profile. Fitted on the genuine half of the dataset.
FIELD_FLAG_CALIBRATED = 6.0
FIELD_FLAG_INTERNAL = 7.0

PRI_FLAG = 0.98
PRI_HIGH = 1.15

FIELD_LABELS = {
    "dob": "Date of birth", "expiry": "Date of expiry", "issue": "Date of issue",
    "surname": "Surname", "given_name": "Given name(s)", "name": "Full name",
    "passport_no": "Passport number", "visa_no": "Visa number",
    "valid_from": "Valid from", "valid_until": "Valid until",
    "photo": "Holder photograph", "stamp": "Entry stamp",
    "place_of_issue": "Place of issue", "place_of_birth": "Place of birth",
    "file_no": "File number", "nationality": "Nationality", "sex": "Sex",
    "duration": "Duration of stay", "port": "Port of entry", "mrz": "Machine readable zone",
    "issued_at": "Issued at", "visa_type": "Visa type", "entries": "Entries",
    "signature_name": "Signature specimen",
}


@dataclass
class Finding:
    field: str
    label: str
    box: list[int]
    score: float
    severity: str                      # low | medium | high
    reasons: list[str]
    evidence: dict[str, float]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


# --------------------------------------------------------------------------- #
# Pixel-level forensic maps
# --------------------------------------------------------------------------- #
def ela_map(img: Image.Image, quality: int = 92) -> np.ndarray:
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="JPEG", quality=quality)
    buf.seek(0)
    recompressed = Image.open(buf).convert("RGB")
    diff = np.abs(np.asarray(img.convert("RGB"), np.float32) -
                  np.asarray(recompressed, np.float32))
    return diff.max(axis=2)


def noise_map(gray: np.ndarray) -> np.ndarray:
    smooth = cv2.medianBlur(gray.astype(np.uint8), 3).astype(np.float32)
    return np.abs(gray.astype(np.float32) - smooth)


def chroma_map(rgb: np.ndarray) -> np.ndarray:
    rb = rgb[:, :, 0].astype(np.float32) - rgb[:, :, 2].astype(np.float32)
    local = cv2.blur(rb, (61, 61))
    return np.abs(rb - local)


def blockiness_map(gray: np.ndarray) -> np.ndarray:
    """Energy on the 8x8 JPEG grid: a re-encoded patch leaves a stronger grid."""
    g = gray.astype(np.float32)
    dx = np.abs(np.diff(g, axis=1, prepend=g[:, :1]))
    dy = np.abs(np.diff(g, axis=0, prepend=g[:1, :]))
    grid = np.zeros_like(g)
    grid[:, ::8] += dx[:, ::8]
    grid[::8, :] += dy[::8, :]
    return cv2.blur(grid, (9, 9))


def compute_maps(img: Image.Image) -> dict[str, np.ndarray]:
    rgb = np.asarray(img.convert("RGB"))
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    return {
        "ela": ela_map(img),
        "noise": noise_map(gray),
        "chroma": chroma_map(rgb),
        "blockiness": blockiness_map(gray),
        "_gray": gray.astype(np.float32),
    }


# --------------------------------------------------------------------------- #
def _crop(m: np.ndarray, box: list[int]) -> np.ndarray:
    h, w = m.shape[:2]
    x0, y0 = max(0, int(box[0])), max(0, int(box[1]))
    x1, y1 = min(w, int(box[2])), min(h, int(box[3]))
    if x1 <= x0 or y1 <= y0:
        return np.zeros((1, 1), np.float32)
    return m[y0:y1, x0:x1]


def _robust_z(values: dict[str, float]) -> dict[str, float]:
    """Median / MAD z-score. Deviations in both directions count."""
    arr = np.array(list(values.values()), np.float32)
    if len(arr) < 3:
        return {k: 0.0 for k in values}
    med = float(np.median(arr))
    mad = float(np.median(np.abs(arr - med))) or float(arr.std()) or 1e-6
    return {k: abs(v - med) / (1.4826 * mad) for k, v in values.items()}


def aggregate(z_values: list[float]) -> float:
    """Strongest signal plus diminishing support from the others.

    Averaging across features buries a real single-feature hit under the
    features that saw nothing, so the top evidence leads and the rest supports.
    """
    v = sorted((float(z) for z in z_values), reverse=True)
    v += [0.0, 0.0, 0.0]
    return v[0] + 0.4 * v[1] + 0.2 * v[2]


def profile_z(raw: dict[str, dict[str, float]], profile: dict | None
              ) -> dict[str, dict[str, float]] | None:
    """z-scores against a reference profile of genuine documents of this type."""
    if not profile or not profile.get("fields"):
        return None
    out: dict[str, dict[str, float]] = {}
    for feat, vals in raw.items():
        if not vals:
            continue
        med = float(np.median(list(vals.values()))) or 1e-6
        for field, v in vals.items():
            ref = profile["fields"].get(field, {}).get(feat)
            if not ref:
                continue
            ratio = float(v) / med
            out.setdefault(feat, {})[field] = abs(ratio - ref["median"]) / max(ref["spread"], 1e-6)
    return out or None


def region_features(maps: dict[str, np.ndarray], regions: dict[str, list[int]]
                    ) -> dict[str, dict[str, float]]:
    raw: dict[str, dict[str, float]] = {}
    for key in ("ela", "noise", "chroma", "blockiness"):
        m = maps[key]
        per_region = {}
        for name, box in regions.items():
            patch = _crop(m, box)
            per_region[name] = float(np.mean(patch)) if patch.size else 0.0
        raw[key] = per_region
    return raw


def layout_features(fields: dict[str, Any]) -> dict[str, dict[str, float]]:
    """Label-to-value gap and glyph height, per field."""
    gaps: dict[str, float] = {}
    heights: dict[str, float] = {}
    for name, f in fields.items():
        box = getattr(f, "box", None) or (f.get("box") if isinstance(f, dict) else None)
        lbox = getattr(f, "label_box", None) or (f.get("label_box") if isinstance(f, dict) else None)
        if not box:
            continue
        heights[name] = float(box[3] - box[1])
        if lbox:
            gaps[name] = float(box[1] - lbox[3])
    return {"gap": gaps, "height": heights}


# --------------------------------------------------------------------------- #
def copy_move(gray: np.ndarray, block: int = 24, stride: int = 12,
              max_hits: int = 6) -> list[tuple[list[int], list[int]]]:
    """Duplicate high-variance blocks that are far apart -> copy-paste."""
    h, w = gray.shape
    small = cv2.resize(gray.astype(np.uint8), (w // 2, h // 2))
    seen: dict[bytes, tuple[int, int]] = {}
    hits: list[tuple[list[int], list[int]]] = []
    bh = block // 2
    for y in range(0, small.shape[0] - bh, stride // 2):
        for x in range(0, small.shape[1] - bh, stride // 2):
            patch = small[y:y + bh, x:x + bh]
            if patch.std() < 28:                       # flat background, ignore
                continue
            dct = cv2.dct(np.float32(patch) / 255.0)[:6, :6]
            key = np.sign(dct - np.median(dct)).astype(np.int8).tobytes()
            if key in seen:
                px, py = seen[key]
                if abs(px - x) + abs(py - y) > 40:
                    hits.append(([px * 2, py * 2, px * 2 + block, py * 2 + block],
                                 [x * 2, y * 2, x * 2 + block, y * 2 + block]))
                    if len(hits) >= max_hits:
                        return hits
            else:
                seen[key] = (x, y)
    return hits


# --------------------------------------------------------------------------- #
def detect_photo_region(img: Image.Image) -> list[int] | None:
    """Find the portrait window: a bordered, saturated rectangle in the left third."""
    rgb = np.asarray(img.convert("RGB"))
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    sat = cv2.GaussianBlur(hsv[:, :, 1], (9, 9), 0)
    mask = (sat > 45).astype(np.uint8) * 255
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    best, best_area = None, 0
    H, W = rgb.shape[:2]
    for c in contours:
        x, y, w, h = cv2.boundingRect(c)
        area = w * h
        if not (0.01 * H * W < area < 0.25 * H * W):
            continue
        if x > W * 0.45 or h < 40:
            continue
        ar = w / max(1, h)
        if not (0.45 < ar < 1.15):
            continue
        if area > best_area:
            best, best_area = [x, y, x + w, y + h], area
    return best


def recompression_index(maps: dict[str, np.ndarray], box: list[int]) -> dict[str, float]:
    """Compare a picture region against the rest of the page.

    A region that was edited and re-encoded on its own carries more high-pass
    noise than the page around it, yet reacts *less* to a fresh compression pass
    because it is already quantised. The ratio of those two effects is stable
    across scanners, which an absolute ELA threshold is not.
    """
    ela, noise = maps["ela"], maps["noise"]
    x0, y0, x1, y1 = [int(v) for v in box]
    h, w = ela.shape
    x0, y0 = max(0, x0), max(0, y0)
    x1, y1 = min(w, x1), min(h, y1)
    if x1 - x0 < 24 or y1 - y0 < 24:
        return {"pri": 0.0, "ela_ratio": 0.0, "noise_ratio": 0.0}
    inner = (slice(y0 + 6, y1 - 6), slice(x0 + 6, x1 - 6))
    outside = np.ones(ela.shape, bool)
    outside[y0:y1, x0:x1] = False
    ela_ratio = float(ela[inner].mean() / (ela[outside].mean() + 1e-6))
    noise_ratio = float(noise[inner].mean() / (noise[outside].mean() + 1e-6))
    pri = noise_ratio / max(ela_ratio, 1e-6)
    return {"pri": round(pri, 3), "ela_ratio": round(ela_ratio, 3),
            "noise_ratio": round(noise_ratio, 3)}


def detect_stamp_region(img: Image.Image, avoid: list[int] | None = None) -> list[int] | None:
    """Locate a round ink stamp with a Hough circle search.

    `avoid` is the portrait window - a drawn head is a circle too, so any
    candidate overlapping it is discarded.
    """
    gray = cv2.cvtColor(np.asarray(img.convert("RGB")), cv2.COLOR_RGB2GRAY)
    gray = cv2.medianBlur(gray, 5)
    minr = int(min(img.width, img.height) * 0.08)
    maxr = int(min(img.width, img.height) * 0.30)
    circles = cv2.HoughCircles(gray, cv2.HOUGH_GRADIENT, dp=1.4,
                               minDist=int(img.width * 0.2), param1=120, param2=90,
                               minRadius=minr, maxRadius=maxr)
    if circles is None:
        return None
    for x, y, r in sorted(circles[0], key=lambda c: -c[2]):
        box = [int(x - r), int(y - r), int(x + r), int(y + r)]
        if avoid and not (box[2] < avoid[0] or box[0] > avoid[2]
                          or box[3] < avoid[1] or box[1] > avoid[3]):
            continue                                   # that is the portrait
        return box
    return None


# --------------------------------------------------------------------------- #
def analyse(img: Image.Image, ocr_result, cross_signals: dict[str, list[str]] | None = None,
            profile: dict | None = None,
            ) -> tuple[list[Finding], np.ndarray, dict[str, Any]]:
    """Return (findings, suspicion heatmap in 0..1, diagnostics)."""
    cross_signals = cross_signals or {}
    maps = compute_maps(img)

    text_regions: dict[str, list[int]] = {}
    skipped: list[str] = []
    for name, f in ocr_result.fields.items():
        if not f.box or name in NON_TEXT_REGIONS:
            continue
        if (f.box[2] - f.box[0]) < MIN_FIELD_WIDTH:
            skipped.append(name)          # one or two glyphs: statistics are noise
            continue
        text_regions[name] = list(f.box)

    picture_regions: dict[str, list[int]] = {}
    photo = detect_photo_region(img)
    if photo:
        picture_regions["photo"] = photo
    # The stamp is judged by what it says, not by its pixels: a rubber
    # impression is semi-transparent and rotated, so its noise statistics
    # overlap with a genuine one. See pipeline._cross_signals.
    stamp = getattr(ocr_result, "stamp_box", None)

    logic_regions: dict[str, list[int]] = {}
    if stamp:
        logic_regions["stamp"] = list(stamp)
    for name in ("mrz", "signature_name"):
        box = (list(ocr_result.mrz_box) if name == "mrz" and getattr(ocr_result, "mrz_box", None)
               else (list(ocr_result.fields[name].box)
                     if name in ocr_result.fields and ocr_result.fields[name].box else None))
        if box:
            logic_regions[name] = box

    regions = {**text_regions, **picture_regions, **logic_regions}
    if not regions:
        return [], np.zeros(maps["_gray"].shape, np.float32), {"regions": {}}

    # --- text fields: robust z against the document's own other fields -------
    raw = region_features(maps, text_regions)
    raw.update(layout_features({k: v for k, v in ocr_result.fields.items()
                                if k in text_regions}))
    calibrated = profile_z(raw, profile)
    zs = calibrated or {feat: _robust_z(vals) for feat, vals in raw.items()}
    mode = "reference-calibrated" if calibrated else "document-internal"
    flag_at = FIELD_FLAG_CALIBRATED if calibrated else FIELD_FLAG_INTERNAL

    findings: list[Finding] = []
    scores: dict[str, float] = {}

    for name, box in text_regions.items():
        evidence, reasons = {}, []
        for feat in FEATURE_WEIGHTS:
            z = zs.get(feat, {}).get(name)
            if z is None:
                continue
            evidence[feat] = round(float(z), 2)
        score = aggregate([min(v, 14.0) * FEATURE_WEIGHTS[k] for k, v in evidence.items()])
        score = score * (SUSPICION_THRESHOLD / flag_at)          # put on the 0-12 reporting scale
        for feat, z in sorted(evidence.items(), key=lambda kv: -kv[1])[:3]:
            if z >= flag_at * 0.55:
                reasons.append(FEATURE_REASONS[feat])
        for reason in cross_signals.get(name, []):
            reasons.append(reason)
            score += 2.5                                  # logic beats pixels
        scores[name] = score
        if score >= SUSPICION_THRESHOLD and reasons:
            findings.append(_finding(name, box, score, reasons, evidence))

    # --- portrait and stamp: re-compression index ----------------------------
    for name, box in picture_regions.items():
        pri = recompression_index(maps, box)
        evidence = dict(pri)
        score = 0.0
        reasons = []
        if pri["pri"] >= PRI_FLAG:
            score = SUSPICION_THRESHOLD + (pri["pri"] - PRI_FLAG) * 14
            reasons.append(
                "This area was compressed separately from the rest of the page "
                f"(noise/compression ratio {pri['pri']:.2f}, expected below {PRI_FLAG:.2f}) - "
                "consistent with a pasted or re-saved "
                + ("photograph." if name == "photo" else "stamp."))
        for reason in cross_signals.get(name, []):
            reasons.append(reason)
            score += 2.5
        scores[name] = score
        if score >= SUSPICION_THRESHOLD and reasons:
            findings.append(_finding(name, box, score, reasons, evidence))

    # --- MRZ band and signature specimen: logic only -------------------------
    for name, box in logic_regions.items():
        reasons = list(cross_signals.get(name, []))
        score = SUSPICION_THRESHOLD + 1.0 if reasons else 0.0
        scores[name] = score
        if reasons:
            findings.append(_finding(name, box, score, reasons, {}))

    cm = copy_move(maps["_gray"])
    findings.sort(key=lambda f: -f.score)
    heat = build_heatmap(maps, regions, scores, findings)
    diag = {
        "regions": {k: [int(v) for v in b] for k, b in regions.items()},
        "scores": {k: round(float(v), 2) for k, v in scores.items()},
        # reported but not scored: printed documents repeat glyphs, so block
        # duplication alone is not evidence on a text card
        "copy_move_hits": len(cm),
        "fields_too_small_to_assess": skipped,
        "calibration": mode,
    }
    return findings, heat, diag


def _finding(name: str, box: list[int], score: float, reasons: list[str],
             evidence: dict[str, float]) -> Finding:
    return Finding(
        field=name,
        label=FIELD_LABELS.get(name, name.replace("_", " ").title()),
        box=[int(v) for v in box],
        score=round(float(min(score, 12.0)), 2),
        severity="high" if score >= HIGH_THRESHOLD else "medium",
        reasons=reasons, evidence=evidence)


FEATURE_REASONS = {
    "ela": "Compression error level in this area differs from the rest of the page.",
    "noise": "Local noise pattern does not match the surrounding print.",
    "chroma": "Colour balance in this area drifts from the rest of the document.",
    "blockiness": "JPEG block structure here differs from the surrounding page - "
                  "the area appears to have been re-encoded separately.",
    "gap": "Text sits off the printed baseline for this field.",
    "height": "Glyph height does not match the other printed fields.",
}


def build_heatmap(maps: dict[str, np.ndarray], regions: dict[str, list[int]],
                  scores: dict[str, float], findings: list[Finding] | None = None) -> np.ndarray:
    """Pixel residual energy, modulated by each region's anomaly score.

    Calibrated so genuine/untouched documents remain calm and cool (no false red hot spots),
    while anomalous regions receive intense, localized thermal energy.
    """
    shape = maps["_gray"].shape
    base = np.zeros(shape, np.float32)
    for key, weight in (("ela", 1.0), ("noise", 0.8), ("chroma", 1.0), ("blockiness", 0.5)):
        m = maps[key].astype(np.float32)
        hi = np.percentile(m, 99.5) or 1.0
        base += weight * np.clip(m / hi, 0, 1)
    base /= 3.3
    base = cv2.GaussianBlur(base, (0, 0), 3)

    findings = findings or []
    # If there are no findings and all scores are below suspicion threshold,
    # keep a low, uniform cool baseline without artificial amplification.
    if not findings and all(s < SUSPICION_THRESHOLD for s in scores.values()):
        return np.clip(base * 0.08, 0, 0.12)

    gate = np.zeros(shape, np.float32)
    for name, box in regions.items():
        s = scores.get(name, 0.0)
        if s < 1.8:
            continue
        x0, y0, x1, y1 = [int(v) for v in box]
        x0, y0 = max(0, x0 - 10), max(0, y0 - 10)
        x1, y1 = min(shape[1], x1 + 10), min(shape[0], y1 + 10)
        intensity = np.clip((s - 1.5) / (HIGH_THRESHOLD - 1.5), 0.5, 1.0)
        gate[y0:y1, x0:x1] = np.maximum(gate[y0:y1, x0:x1], intensity)

    gate = cv2.GaussianBlur(gate, (0, 0), 18)
    gate_max = gate.max() or 1.0
    # Anomalous areas glow warmly (up to 1.0), background stays crisp & cool
    heat = np.clip(base * 0.05 + (gate / gate_max) * (0.50 + 0.50 * np.clip(base * 2.0, 0, 1)), 0, 1.0)
    return heat


# --------------------------------------------------------------------------- #
# Rendering
# --------------------------------------------------------------------------- #
def _font(size: int):
    # Support Windows, macOS, and Linux system fonts
    candidates = (
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/segoeuib.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "/System/Library/Fonts/SFProText-Bold.otf",
        "/System/Library/Fonts/HelveticaNeue.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    )
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except (OSError, Exception):
            continue
    return ImageFont.load_default()


def render_heatmap(img: Image.Image, heat: np.ndarray, findings: list[Finding],
                   *, alpha: float = 0.68) -> Image.Image:
    """Thermal overlay: cool and clear where the page is clean, glowing where suspicious."""
    rgb = np.asarray(img.convert("RGB")).astype(np.float32)

    # Generate thermal colormap (TURBO: deep blue -> cyan -> yellow -> orange -> red)
    heat_u8 = (np.clip(heat, 0, 1) * 255).astype(np.uint8)
    colormap = cv2.applyColorMap(heat_u8, cv2.COLORMAP_TURBO)
    colormap = cv2.cvtColor(colormap, cv2.COLOR_BGR2RGB).astype(np.float32)

    # Dynamic transparency: clean areas (< 0.12) remain natural and readable;
    # suspicious areas smoothly transition to vivid thermal visualization.
    blend_weight = (np.clip((heat - 0.10) / 0.50, 0, 1) ** 1.1) * alpha
    blend_3d = blend_weight[:, :, None]

    out = rgb * (1.0 - blend_3d) + colormap * blend_3d
    out_img = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))

    d = ImageDraw.Draw(out_img, "RGBA")
    fnt = _font(15)

    if not findings:
        # Subtle status indicator on clean documents
        tag = "VERIFIED • NO FORENSIC ANOMALIES DETECTED"
        try:
            tw = d.textlength(tag, font=fnt)
        except Exception:
            tw = len(tag) * 8
        d.rectangle([16, 16, 28 + int(tw), 42], fill=(16, 120, 60, 220), outline=(255, 255, 255, 180), width=1)
        d.text((22, 21), tag, font=fnt, fill=(255, 255, 255, 255))
        return out_img

    for f in findings:
        if f.field == "copy_move":
            continue
        x0, y0, x1, y1 = f.box
        col = (235, 35, 35) if f.severity == "high" else (245, 140, 25)
        # Forensic reticle box
        d.rectangle([x0 - 5, y0 - 5, x1 + 5, y1 + 5], outline=col + (255,), width=3)
        # Label badge with crisp pill styling
        tag = f"{f.label.upper()} • {f.score:.1f}"
        try:
            tw = d.textlength(tag, font=fnt)
        except Exception:
            tw = len(tag) * 8
        ty = max(4, y0 - 26)
        d.rectangle([x0 - 5, ty, x0 + int(tw) + 12, ty + 22], fill=col + (240,), outline=(255, 255, 255, 180), width=1)
        d.text((x0 + 1, ty + 3), tag, font=fnt, fill=(255, 255, 255, 255))

    return out_img


def render_annotated(img: Image.Image, findings: list[Finding]) -> Image.Image:
    """The original document with the suspect fields ringed and labeled."""
    out = img.convert("RGB").copy()
    d = ImageDraw.Draw(out, "RGBA")
    fnt = _font(15)

    if not findings:
        tag = "PASSED • ALL FIELDS VERIFIED IN SITU"
        try:
            tw = d.textlength(tag, font=fnt)
        except Exception:
            tw = len(tag) * 8
        d.rectangle([16, 16, 28 + int(tw), 42], fill=(16, 120, 60, 220), outline=(255, 255, 255, 180), width=1)
        d.text((22, 21), tag, font=fnt, fill=(255, 255, 255, 255))
        return out

    for f in findings:
        x0, y0, x1, y1 = f.box
        high = f.severity == "high"
        col = (220, 20, 30) if high else (240, 140, 20)
        d.rectangle([x0 - 6, y0 - 6, x1 + 6, y1 + 6], fill=col + (55,), outline=col + (255,), width=3)
        tag = f.label.upper() if f.field != "copy_move" else "COPY-PASTE BLOCK"
        try:
            tw = d.textlength(tag, font=fnt)
        except Exception:
            tw = len(tag) * 8
        ty = y1 + 8 if y0 < 40 else y0 - 28
        d.rectangle([x0 - 6, ty, x0 + int(tw) + 14, ty + 23], fill=col + (240,), outline=(255, 255, 255, 180), width=1)
        d.text((x0 + 1, ty + 3), tag, font=fnt, fill=(255, 255, 255))

    return out

"""
Face verification - document photo vs a second ("live capture" / selfie) image.

Real uploaded photos go through Haar cascade face detection first, cropped to
the face before comparison. The synthetic dataset's photos are drawn avatars
that no face detector recognises as a face, so when detection fails the whole
supplied photo region is compared as-is - the module degrades gracefully
instead of refusing to run on the sample data.

Similarity is a blend of three cheap, dependency-free signals rather than a
deep embedding model (no pretrained face-recognition weights are available in
this environment):
    * average hash (aHash)     - coarse structural layout, robust to rescaling
    * HSV histogram correlation - overall colour/tone match
    * ORB keypoint match ratio  - local texture/feature agreement

None of these are a substitute for a real face-recognition model in
production; swap `match()` for one (e.g. `face_recognition`, ArcFace) when
real biometric accuracy is required. The interface (`FaceResult`) stays the
same either way, which is the point of keeping it isolated in this module.
"""

from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Any

import cv2
import numpy as np
from PIL import Image

try:
    _cascade_file = getattr(getattr(cv2, "data", None), "haarcascades", "") + "haarcascade_frontalface_default.xml"
    _CASCADE = cv2.CascadeClassifier(_cascade_file) if hasattr(cv2, "CascadeClassifier") else None
except Exception:
    _CASCADE = None

MATCH_THRESHOLD = 55.0        # score (0-100) at or above which faces are called a match
REVIEW_THRESHOLD = 40.0       # below MATCH but at/above this: inconclusive, not a fail


@dataclass
class FaceResult:
    status: str                        # match | mismatch | inconclusive | not_attempted
    score: float | None = None         # 0-100
    detail: str = ""
    probe_face_detected: bool = False
    reference_face_detected: bool = False

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def _detect_face(img: np.ndarray) -> tuple[np.ndarray, bool]:
    """Return (cropped face BGR array, whether a real face was detected)."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)
    faces = _CASCADE.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5,
                                      minSize=(40, 40)) if _CASCADE is not None and getattr(_CASCADE, "empty", lambda: True)() is False else []
    if len(faces) == 0:
        return img, False
    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
    pad = int(0.15 * max(w, h))
    x0, y0 = max(0, x - pad), max(0, y - pad)
    x1, y1 = min(img.shape[1], x + w + pad), min(img.shape[0], y + h + pad)
    return img[y0:y1, x0:x1], True


def _prep(img: Image.Image, box: list[int] | None) -> tuple[np.ndarray, bool]:
    arr = np.asarray(img.convert("RGB"))
    bgr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
    if box:
        x0, y0, x1, y1 = [max(0, int(v)) for v in box]
        bgr = bgr[y0:y1, x0:x1] if (x1 > x0 and y1 > y0) else bgr
    return _detect_face(bgr)


def _ahash(gray: np.ndarray, size: int = 12) -> np.ndarray:
    small = cv2.resize(gray, (size, size), interpolation=cv2.INTER_AREA)
    return (small > small.mean()).astype(np.uint8)


def _hist_score(a: np.ndarray, b: np.ndarray) -> float:
    ha = cv2.calcHist([cv2.cvtColor(a, cv2.COLOR_BGR2HSV)], [0, 1], None, [30, 32],
                      [0, 180, 0, 256])
    hb = cv2.calcHist([cv2.cvtColor(b, cv2.COLOR_BGR2HSV)], [0, 1], None, [30, 32],
                      [0, 180, 0, 256])
    cv2.normalize(ha, ha)
    cv2.normalize(hb, hb)
    corr = cv2.compareHist(ha, hb, cv2.HISTCMP_CORREL)
    return max(0.0, corr) * 100


def _orb_score(a: np.ndarray, b: np.ndarray) -> float:
    orb = cv2.ORB_create(nfeatures=300)
    ga, gb = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY), cv2.cvtColor(b, cv2.COLOR_BGR2GRAY)
    k1, d1 = orb.detectAndCompute(ga, None)
    k2, d2 = orb.detectAndCompute(gb, None)
    if d1 is None or d2 is None or len(k1) < 4 or len(k2) < 4:
        return 0.0
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    matches = bf.match(d1, d2)
    if not matches:
        return 0.0
    good = [m for m in matches if m.distance < 64]
    return 100.0 * len(good) / max(1, min(len(k1), len(k2)))


def match(probe: Image.Image, reference: Image.Image, *,
          probe_box: list[int] | None = None,
          reference_box: list[int] | None = None) -> FaceResult:
    """Compare a probe image (e.g. a live capture) against a reference (document photo)."""
    p_face, p_detected = _prep(probe, probe_box)
    r_face, r_detected = _prep(reference, reference_box)
    if p_face.size == 0 or r_face.size == 0:
        return FaceResult("inconclusive", None, "One of the two images had no usable region.")

    target = (160, 200)
    p_r = cv2.resize(p_face, target)
    r_r = cv2.resize(r_face, target)

    a1 = _ahash(cv2.cvtColor(p_r, cv2.COLOR_BGR2GRAY))
    a2 = _ahash(cv2.cvtColor(r_r, cv2.COLOR_BGR2GRAY))
    hash_score = 100.0 * (1 - (a1 != a2).mean())
    hist_score = _hist_score(p_r, r_r)
    orb_score = _orb_score(p_r, r_r)

    score = 0.45 * hash_score + 0.30 * hist_score + 0.25 * orb_score
    score = round(float(score), 1)

    if score >= MATCH_THRESHOLD:
        status, detail = "match", f"Face similarity {score:.0f}/100 - consistent with the same person."
    elif score >= REVIEW_THRESHOLD:
        status, detail = "inconclusive", f"Face similarity {score:.0f}/100 - too close to call automatically."
    else:
        status, detail = "mismatch", f"Face similarity {score:.0f}/100 - the two photos do not appear to match."

    if not (p_detected and r_detected):
        detail += (" (No real face was detected in one or both images - likely a synthetic "
                   "test photo, so this compares the image region directly rather than a "
                   "detected face.)")
    return FaceResult(status, score, detail, p_detected, r_detected)

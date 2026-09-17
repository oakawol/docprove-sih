"""
Reference calibration - "what does an untouched document of this type look like?"

Some fields are systematically noisier than others: a short code like "P / TST",
a date full of slashes, a field the security watermark happens to cross. Judging
every field against the document's own average therefore flags the same innocent
fields over and over.

So a profile is fitted once from a folder of known-genuine documents. For each
document type it stores, per field and per feature, the *ratio* of that field's
value to the document's own median - a scanner-independent quantity - plus how
much that ratio normally varies (median and MAD).

    python -m document_screening.calibration fit SIH_Dataset/passports/genuine \\
        --doc-type passport --out profile.json

Screening without a profile still works; it falls back to document-internal
statistics, which catch less.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import numpy as np

from . import ocr as ocr_mod
from . import tampering as T

FEATURES = ("ela", "noise", "chroma", "blockiness", "gap", "height")


def document_ratios(image_path) -> tuple[str, dict[str, dict[str, float]]]:
    """Per-field feature ratios for one document: value / document median."""
    img = ocr_mod.preprocess(ocr_mod.load_image(image_path))
    result = ocr_mod.extract(img)
    maps = T.compute_maps(img)

    regions = {n: list(f.box) for n, f in result.fields.items()
               if f.box and n not in T.NON_TEXT_REGIONS
               and (f.box[2] - f.box[0]) >= T.MIN_FIELD_WIDTH}
    if not regions:
        return result.doc_type, {}

    raw = T.region_features(maps, regions)
    raw.update(T.layout_features({k: v for k, v in result.fields.items() if k in regions}))

    ratios: dict[str, dict[str, float]] = {}
    for feat in FEATURES:
        vals = raw.get(feat, {})
        if not vals:
            continue
        med = float(np.median(list(vals.values()))) or 1e-6
        for field, v in vals.items():
            ratios.setdefault(field, {})[feat] = float(v) / med
    return result.doc_type, ratios


def fit(paths: list[str | Path], doc_type: str | None = None) -> dict[str, Any]:
    """Fit a profile from genuine documents."""
    collected: dict[str, dict[str, list[float]]] = {}
    seen_type = doc_type
    n = 0
    for p in paths:
        dt, ratios = document_ratios(p)
        seen_type = doc_type or dt
        if not ratios:
            continue
        n += 1
        for field, feats in ratios.items():
            for feat, val in feats.items():
                collected.setdefault(field, {}).setdefault(feat, []).append(val)

    profile: dict[str, dict[str, dict[str, float]]] = {}
    for field, feats in collected.items():
        for feat, vals in feats.items():
            if len(vals) < 5:
                continue
            arr = np.asarray(vals, np.float64)
            med = float(np.median(arr))
            mad = float(np.median(np.abs(arr - med)))
            spread = max(1.4826 * mad, 0.05 * abs(med), 0.02)
            profile.setdefault(field, {})[feat] = {"median": round(med, 4),
                                                   "spread": round(spread, 4)}
    return {"doc_type": seen_type, "documents": n, "fields": profile}


def save(profiles: dict[str, Any], path: str | Path) -> None:
    Path(path).write_text(json.dumps(profiles, indent=1))


def load(path: str | Path) -> dict[str, Any]:
    return json.loads(Path(path).read_text())


def main(argv: list[str] | None = None) -> None:
    ap = argparse.ArgumentParser(description="Fit a reference profile from genuine documents.")
    sub = ap.add_subparsers(dest="cmd", required=True)
    f = sub.add_parser("fit")
    f.add_argument("folders", nargs="+", help="folder(s) of genuine document images")
    f.add_argument("--doc-type", help="passport | visa (auto-detected when omitted)")
    f.add_argument("--out", default="profile.json")
    f.add_argument("--limit", type=int, default=40)
    args = ap.parse_args(argv)

    existing: dict[str, Any] = {}
    out = Path(args.out)
    if out.exists():
        existing = load(out)

    files: list[Path] = []
    for folder in args.folders:
        files += sorted(Path(folder).glob("*.png"))[:args.limit]
    prof = fit(files, args.doc_type)
    existing[prof["doc_type"]] = prof
    save(existing, out)
    print(f"Fitted {prof['doc_type']} profile from {prof['documents']} documents "
          f"({len(prof['fields'])} fields) -> {out}")


if __name__ == "__main__":
    main()

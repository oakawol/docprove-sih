# AI-Based Fake Identity & Document Screening System

Prototype for SIH PS 26188. Every document is a fictional "TESTLAND" passport
or visa (see `generate_dataset.py`) - nothing here processes real identity
documents.

## Run it (this is the UI)

```bash
pip install -r requirements.txt
# tesseract-ocr must also be installed at the OS level, e.g.:
#   Ubuntu/Debian: sudo apt install tesseract-ocr
#   macOS:         brew install tesseract
#   Windows:       https://github.com/UB-Mannheim/tesseract/wiki

uvicorn document_screening.api:app --reload
```

Then open **http://127.0.0.1:8000** in a browser. That's the whole app:

- **Scan tab** - drag a document image in (optionally a second "live capture"
  photo for face verification), click *Run screening*, get the full report:
  score, checklist, extracted fields, validation, MRZ, tampering findings with
  the heatmap/annotated images, face match, and multiple-identity warnings.
- **History tab** - every scan is saved automatically (SQLite, no setup) and
  searchable by name or document number - the Phase 11 audit trail.
- **Open full report** on any scan gives a standalone, shareable HTML report
  (Phase 10) with the images embedded, so it works as a plain file too.

The API performs a server-side document eligibility check before the expensive
verification phases. It also keeps a hashed per-session/client protection record
in `data/scan_history.db`: three consecutive completed suspicious results start
a five-minute cooldown. The browser sends only a random session identifier in
`X-Docprove-Session`; cooldown timing is stored and enforced by the server.

No separate frontend build step, no Node, no database server - `uvicorn` is
the only thing you run.

## What's implemented, phase by phase

| Phase | Module | What it does |
|---|---|---|
| 1 | `generate_dataset.py` | Generates the fictional passport/visa dataset with genuine + tampered copies and ground-truth labels |
| 2 | `document_screening/ocr.py` | Tesseract OCR, label-anchored field extraction, MRZ band re-read with a character whitelist |
| 3 | `document_screening/validation.py` | Required fields, date formats, chronology, expiry, document-number formats, nationality/sex |
| 4 | `document_screening/mrz.py` | ICAO 9303 TD3 parse, 7-3-1 check digits, MRZ vs printed-data comparison |
| 5 | `document_screening/tampering.py` | ELA / noise / chroma / blockiness residuals, re-compression index for the photo, layout checks, heatmap + annotated rendering |
| 6 | `document_screening/face.py` | Document photo vs a live-capture image (Haar face detection + aHash/histogram/ORB similarity) |
| 9 | `document_screening/risk.py` | Combines every phase into a 5-line checklist, a 0-100 score, and CLEAR / SUSPICIOUS / HIGH RISK, with every point explained |
| 10 | `document_screening/report.py` | Renders the pipeline output as a plain-text report or a standalone HTML report |
| 11 | `document_screening/history.py` | SQLite audit trail; also answers "has this face been seen under another name before" for Phase 9 |
| - | `document_screening/api.py` + `static/index.html` | The FastAPI backend and the single-page UI described above |
| - | `document_screening/calibration.py` | Fits a reference profile from a folder of genuine documents so tampering detection is judged against real documents of that type, not just the document's own fields |

`document_screening/pipeline.py` is the one entry point that runs phases 2-11
in order:

```python
from document_screening import screen
result = screen("some_passport.png", probe_image="selfie.jpg",
                artifacts_dir="out/", save_history=True)
print(result["risk"]["status"], result["risk"]["checklist_text"])
```

## Regenerating / extending the dataset

```bash
python generate_dataset.py generate --count 50 --out SIH_Dataset
python -m document_screening.calibration fit SIH_Dataset/passports/genuine \
    --doc-type passport --out data/profile.json
python -m document_screening.calibration fit SIH_Dataset/visas/genuine \
    --doc-type visa --out data/profile.json
```

The API picks up `data/profile.json` automatically if it exists - re-fit it
whenever you regenerate the dataset so tampering detection stays calibrated.

## Known limits (say these before a judge finds them)

- OCR/MRZ accuracy is tied to tesseract; ~90-95% exact-MRZ-line accuracy on
  the synthetic set, not 100% - a genuine document can occasionally show a
  false MRZ check-digit failure from a single misread character.
- Face verification uses classical CV (Haar cascade + aHash/histogram/ORB),
  not a trained face-recognition model - there are no real face photos or
  pretrained face-embedding weights available in this environment. Swap
  `face.match()` for a real model (e.g. `face_recognition`, ArcFace) before
  relying on it for anything beyond a demo.
- Tampering detection is calibrated on the synthetic dataset's own forgery
  style (font-swap, recompression, colour drift). Real-world forgeries need
  a profile re-fitted on real genuine documents of the target type.

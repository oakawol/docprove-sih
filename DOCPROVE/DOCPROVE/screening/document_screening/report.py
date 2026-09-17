"""
Phase 10 - Final result / report.

Takes the dict `pipeline.screen()` already returns (it *is* the Phase 10
report - document type, extracted data, OCR/validation/MRZ/tampering/face
results, multiple-identity warning, risk score, final status and reasons)
and adds two renderings of it:

    report.render_text(result)   -> plain-text report for a terminal or log
    report.render_html(result)   -> a single self-contained HTML page,
                                    with the heatmap/annotated images inlined
                                    as data URIs so it works as a standalone file
"""

from __future__ import annotations

import base64
from pathlib import Path
from typing import Any

STATUS_COLOUR = {"CLEAR": "#1a7d3a", "SUSPICIOUS": "#b8860b", "HIGH RISK": "#b02a2e"}
CHECK_COLOUR = {"PASS": "#1a7d3a", "WARN": "#b8860b", "FAIL": "#b02a2e", "N/A": "#6c768c"}


def render_text(result: dict[str, Any]) -> str:
    lines: list[str] = []
    add = lines.append
    ex = result.get("extracted", {})

    add("=" * 62)
    add(f"DOCUMENT SCREENING REPORT   scan {result['scan_id']}")
    add("=" * 62)
    add(f"Document type   : {result['doc_type'].upper()}")
    add(f"Name            : {ex.get('name') or ex.get('given_name', '')}")
    add(f"Document no.    : {ex.get('passport_no') or ex.get('visa_no', '')}")
    add(f"Date of birth   : {ex.get('dob', '')}")
    add(f"Nationality     : {ex.get('nationality', '')}")
    add("")
    add("-- Extracted fields (Phase 2: OCR) " + "-" * 25)
    for k, v in ex.items():
        add(f"  {k:<16}: {v}")
    add("")
    add("-- Validation (Phase 3) " + "-" * 36)
    for c in result["validation"]["checks"]:
        add(f"  [{c['status'].upper():<4}] {c['label']}: {c['detail']}")
    add("")
    if result["doc_type"] == "passport":
        add("-- MRZ verification (Phase 4) " + "-" * 30)
        m = result["mrz"]
        add(f"  Present: {m['present']}   Format OK: {m['format_ok']}   "
            f"All check digits valid: {m['all_checks_pass']}")
        for name, c in m.get("check_digits", {}).items():
            add(f"    {name:<12} expected {c['expected']}  found {c['found']}  "
                f"{'OK' if c['valid'] else 'MISMATCH'}")
        for mm in m.get("mismatches", []):
            add(f"  ! {mm['label']}: printed {mm['printed']} vs MRZ {mm['mrz']} "
                f"({mm['severity']})")
        add("")
    add("-- Tampering detection (Phase 5) " + "-" * 27)
    t = result["tampering"]
    add(f"  Tampered: {t['tampered']}")
    for f in t["findings"]:
        add(f"  ! {f['label']} (score {f['score']}, {f['severity']}):")
        for r in f["reasons"]:
            add(f"      - {r}")
    add("")
    add("-- Face verification (Phase 6) " + "-" * 29)
    fc = result.get("face", {})
    add(f"  Status: {fc.get('status')}   {fc.get('detail', '')}")
    add("")
    mi = result.get("multiple_identity", [])
    add("-- Multiple identity check (Phase 9/11) " + "-" * 20)
    if mi:
        for h in mi:
            add(f"  ! Same face previously scanned as '{h['name']}' "
                f"(doc {h['document_no']}, scan {h['scan_id']}, "
                f"hash distance {h['face_distance']}).")
    else:
        add("  No conflicting prior identity found.")
    add("")
    add("=" * 62)
    r = result["risk"]
    add(r.get("checklist_text", ""))
    add("")
    add(f"Risk Score: {r['score']}/100")
    add(f"Status: {r['status']}")
    add(f"Action: {r['action']}")
    add("")
    add("Reasons:")
    for reason in r["reasons"]:
        add(f"  (+{reason['points']:>4}) {reason['reason']}")
    add("=" * 62)
    return "\n".join(lines)


def _img_data_uri(path: str | Path | None) -> str | None:
    if not path or not Path(path).exists():
        return None
    data = base64.b64encode(Path(path).read_bytes()).decode()
    return f"data:image/png;base64,{data}"


def render_html(result: dict[str, Any], *, embed_images: bool = True) -> str:
    ex = result.get("extracted", {})
    r = result["risk"]
    colour = STATUS_COLOUR.get(r["status"], "#333")
    art = result.get("artifacts", {})

    def img_tag(key: str, label: str) -> str:
        src = _img_data_uri(art.get(key)) if embed_images else art.get(key)
        if not src:
            return ""
        return f'<figure><img src="{src}" alt="{label}"><figcaption>{label}</figcaption></figure>'

    def checklist_html() -> str:
        rows = []
        from .risk import CHECKLIST_ITEMS
        for key, label in CHECKLIST_ITEMS:
            status = r["checklist"].get(key, "N/A")
            rows.append(f'<tr><td>{label}</td><td style="color:{CHECK_COLOUR[status]};'
                       f'font-weight:600">{status}</td></tr>')
        return "".join(rows)

    def rows(items, cols):
        out = []
        for it in items:
            out.append("<tr>" + "".join(f"<td>{it.get(c, '')}</td>" for c in cols) + "</tr>")
        return "".join(out)

    extracted_rows = "".join(f"<tr><td>{k.replace('_',' ').title()}</td><td>{v}</td></tr>"
                             for k, v in ex.items())
    validation_rows = "".join(
        f'<tr><td>{c["label"]}</td><td style="color:{CHECK_COLOUR.get(c["status"].upper() if c["status"]!="warn" else "WARN","#333")}">'
        f'{c["status"].upper()}</td><td>{c["detail"]}</td></tr>'
        for c in result["validation"]["checks"])
    finding_rows = "".join(
        f'<tr><td>{f["label"]}</td><td>{f["severity"].upper()}</td><td>{f["score"]}</td>'
        f'<td>{"<br>".join(f["reasons"])}</td></tr>'
        for f in result["tampering"]["findings"]) or "<tr><td colspan=4>None</td></tr>"
    reason_rows = "".join(
        f'<tr><td>+{rr["points"]}</td><td>{rr["category"]}</td><td>{rr["reason"]}</td></tr>'
        for rr in r["reasons"]) or "<tr><td colspan=3>None</td></tr>"
    mrz_block = ""
    if result["doc_type"] == "passport":
        m = result["mrz"]
        mismatch_rows = "".join(
            f'<tr><td>{mm["label"]}</td><td>{mm["printed"]}</td><td>{mm["mrz"]}</td>'
            f'<td>{mm["severity"]}</td></tr>' for mm in m.get("mismatches", [])
        ) or "<tr><td colspan=4>None</td></tr>"
        mrz_block = f"""
        <h2>MRZ Verification (Phase 4)</h2>
        <p>Present: <b>{m['present']}</b> &nbsp; Format OK: <b>{m['format_ok']}</b> &nbsp;
           All check digits valid: <b>{m['all_checks_pass']}</b></p>
        <table><tr><th>Field</th><th>Printed</th><th>MRZ</th><th>Severity</th></tr>
        {mismatch_rows}</table>"""

    face = result.get("face", {})
    mi = result.get("multiple_identity", [])
    mi_html = ("".join(f'<li>Same face seen as <b>{h["name"]}</b> (doc {h["document_no"]}, '
                       f'scan {h["scan_id"]})</li>' for h in mi)
              if mi else "<li>No conflicting prior identity found.</li>")

    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>Screening report {result['scan_id']}</title>
<style>
 body {{ font-family: -apple-system, Segoe UI, Roboto, sans-serif; background:#f4f5f7;
        color:#1c2230; margin:0; padding:32px; }}
 .card {{ background:#fff; border-radius:12px; padding:28px 32px; max-width:980px;
         margin:0 auto 24px; box-shadow:0 1px 3px rgba(0,0,0,.08); }}
 h1 {{ margin-top:0; font-size:22px; }}
 h2 {{ font-size:16px; border-bottom:1px solid #e4e6ec; padding-bottom:6px; margin-top:28px;}}
 table {{ width:100%; border-collapse:collapse; font-size:14px; margin-top:8px;}}
 td, th {{ text-align:left; padding:6px 10px; border-bottom:1px solid #eee; vertical-align:top;}}
 th {{ color:#6c768c; font-weight:600; font-size:12px; text-transform:uppercase; }}
 .status {{ display:inline-block; padding:6px 18px; border-radius:20px; color:#fff;
           font-weight:700; background:{colour}; }}
 .score {{ font-size:42px; font-weight:800; color:{colour}; }}
 figure {{ display:inline-block; margin:8px 12px 8px 0; text-align:center; }}
 figure img {{ max-width:300px; border-radius:8px; border:1px solid #ddd; }}
 figcaption {{ font-size:12px; color:#6c768c; margin-top:4px; }}
 .gallery {{ display:flex; flex-wrap:wrap; }}
</style></head>
<body>
<div class="card">
  <h1>Document Screening Report</h1>
  <p>Scan ID: <code>{result['scan_id']}</code></p>
  <p><span class="score">{r['score']}</span>/100 &nbsp; <span class="status">{r['status']}</span></p>
  <p>{r['action']}</p>
  <table>{checklist_html()}</table>
  <h2>Document</h2>
  <table>
    <tr><th>Type</th><td>{result['doc_type'].upper()}</td></tr>
    {extracted_rows}
  </table>
  <div class="gallery">
    {img_tag('original', 'Original')}
    {img_tag('heatmap', 'Tamper heatmap')}
    {img_tag('annotated', 'Annotated (suspect fields)')}
  </div>
  <h2>OCR &amp; Validation (Phases 2-3)</h2>
  <table><tr><th>Check</th><th>Status</th><th>Detail</th></tr>{validation_rows}</table>
  {mrz_block}
  <h2>Tampering Detection (Phase 5)</h2>
  <p>Tampered: <b>{result['tampering']['tampered']}</b></p>
  <table><tr><th>Field</th><th>Severity</th><th>Score</th><th>Reasons</th></tr>{finding_rows}</table>
  <h2>Face Verification (Phase 6)</h2>
  <p>Status: <b>{face.get('status')}</b> &mdash; {face.get('detail', '')}</p>
  <h2>Multiple Identity (Phase 9 / 11)</h2>
  <ul>{mi_html}</ul>
  <h2>Why this score (Phase 9)</h2>
  <table><tr><th>Points</th><th>Category</th><th>Reason</th></tr>{reason_rows}</table>
</div>
</body></html>"""

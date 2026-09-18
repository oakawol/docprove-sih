/**
 * TypeScript interfaces matching the FastAPI backend's JSON response shape.
 * These are the REAL types from the document_screening pipeline — not mock data.
 */

// ── OCR ─────────────────────────────────────────────────────────────────────

export interface OcrFieldData {
  name: string;
  value: string | null;
  box: number[] | null;
  confidence: number;
  source: string; // "ocr" | "mrz" | "derived"
  label_box: number[] | null;
}

export interface OcrData {
  doc_type: string;
  mean_confidence: number;
  fields: Record<string, OcrFieldData>;
  mrz_lines: string[];
  mrz_box: number[] | null;
}

// ── Validation ──────────────────────────────────────────────────────────────

export interface ValidationCheck {
  field: string | null;
  label: string;
  detail: string;
  status: 'pass' | 'fail' | 'warn';
  severity: 'low' | 'medium' | 'high';
}

export interface ValidationData {
  checks: ValidationCheck[];
  failed: number;
  warnings: number;
  failed_fields: string[];
}

// ── MRZ ─────────────────────────────────────────────────────────────────────

export interface MrzCheckDigit {
  expected: string;
  actual: string;
  valid: boolean;
}

export interface MrzMismatch {
  field: string;
  label: string;
  printed: string;
  mrz: string;
  severity: string;
}

export interface MrzData {
  present: boolean;
  format_ok?: boolean;
  line1?: string;
  line2?: string;
  parsed?: Record<string, string>;
  check_digits?: Record<string, MrzCheckDigit>;
  mismatches?: MrzMismatch[];
  issues?: string[];
}

// ── Tampering ───────────────────────────────────────────────────────────────

export interface TamperingFinding {
  field: string;
  label: string;
  box: number[];
  score: number;
  severity: 'medium' | 'high';
  reasons: string[];
  evidence: Record<string, number>;
}

export interface TamperingDiagnostics {
  regions: Record<string, number[]>;
  scores: Record<string, number>;
  copy_move_hits: number;
  fields_too_small_to_assess: string[];
  calibration: string;
}

export interface TamperingData {
  tampered: boolean;
  findings: TamperingFinding[];
  diagnostics: TamperingDiagnostics;
}

// ── Face ────────────────────────────────────────────────────────────────────

export interface FaceData {
  status: 'match' | 'mismatch' | 'inconclusive' | 'not_attempted';
  score: number | null;
  detail: string;
  probe_face_detected: boolean;
  reference_face_detected: boolean;
}

// ── Risk ────────────────────────────────────────────────────────────────────

export interface RiskReason {
  points: number;
  reason: string;
  category: string;
  field: string | null;
}

export interface RiskData {
  score: number;
  status: 'CLEAR' | 'SUSPICIOUS' | 'HIGH RISK';
  level: string;
  action: string;
  reasons: RiskReason[];
  summary: string;
  checklist: Record<string, string>; // e.g. { ocr_validation: "PASS", mrz_validation: "FAIL" }
  checklist_text: string;
}

// ── Artifacts ───────────────────────────────────────────────────────────────

export interface ArtifactPaths {
  original?: string;
  heatmap?: string;
  annotated?: string;
}

// ── Timings ─────────────────────────────────────────────────────────────────

export interface TimingsData {
  ocr: number;
  validation: number;
  mrz: number;
  tampering: number;
  face: number;
  total: number;
}

// ── Multiple Identity ───────────────────────────────────────────────────────

export interface MultipleIdentityHit {
  scan_id: string;
  name: string | null;
  document_no: string | null;
  similarity: number;
}

// ── Full Scan Result ────────────────────────────────────────────────────────

export interface ScanResult {
  scan_id: string;
  doc_type: string;
  image_size: [number, number];
  ocr: OcrData;
  extracted: Record<string, string>;
  validation: ValidationData;
  mrz: MrzData;
  tampering: TamperingData;
  face: FaceData;
  multiple_identity: MultipleIdentityHit[];
  risk: RiskData;
  final_status: string;
  artifacts: ArtifactPaths;
  timings_ms: TimingsData;
  document_valid?: true;
  document_type?: string;
  eligibility?: Record<string, unknown>;
  cooldown_active?: boolean;
  cooldown_remaining_seconds?: number;
  cooldown_until?: number | null;
  consecutive_suspicious?: number;
}

export interface DocumentRejectedResult {
  scan_id: string;
  document_valid: false;
  document_type: 'unknown';
  rejection_reason: string;
  message: string;
  eligibility: Record<string, unknown>;
  ocr: OcrData;
  extracted: Record<string, string>;
  artifacts: ArtifactPaths;
  cooldown_active?: false;
}

export interface CooldownResponse {
  cooldown_active: true;
  cooldown_remaining_seconds: number;
  cooldown_until: number | null;
  message: string;
}

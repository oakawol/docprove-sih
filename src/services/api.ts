/**
 * Real API Client Layer — connects to the FastAPI document_screening backend.
 *
 * In local dev, requests to /api/* and /artifacts/* are proxied by Vite to
 * http://127.0.0.1:8000. In production, set VITE_API_BASE_URL to the deployed
 * backend URL.
 */

import type { CooldownResponse, DocumentRejectedResult, ScanResult } from '../types/scan';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://docprove-24gld5l1.b4a.run';

// ── Errors ──────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: CooldownResponse;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: CooldownResponse) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

// ── File Validation ─────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.pdf']);

export function validateFile(file: File): string | null {
  // Check extension
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return `Unsupported file type "${ext}". Accepted: PNG, JPG, JPEG, PDF.`;
  }

  // Check size
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return `File too large (${sizeMB} MB). Maximum allowed: 10 MB.`;
  }

  return null; // Valid
}

// ── Core API Functions ──────────────────────────────────────────────────────

/**
 * Submit a document for verification via POST /api/scan.
 * Returns the complete ScanResult from the backend pipeline.
 */
function getSessionId(): string {
  const storageKey = 'docprove_session_id';
  const existing = sessionStorage.getItem(storageKey);
  if (existing) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem(storageKey, id);
  return id;
}

export async function scanDocument(file: File, signal?: AbortSignal): Promise<ScanResult | DocumentRejectedResult> {
  const formData = new FormData();
  formData.append('document', file);

  const url = `${API_BASE_URL}/api/scan`;

  // Combine user signal with a 90-second timeout controller for cloud container cold start / OCR processing
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 90000);

  const combinedSignal = signal ? AbortSignal.any([signal, timeoutController.signal]) : timeoutController.signal;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      signal: combinedSignal,
      headers: { 'X-Docprove-Session': getSessionId() },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `Verification failed (HTTP ${response.status})`;
      let errorBody: unknown;
      try {
        errorBody = await response.json();
        if (typeof errorBody === 'object' && errorBody && 'detail' in errorBody) {
          const detail = (errorBody as { detail?: unknown }).detail;
          if (detail) {
            errorMessage = typeof detail === 'string' ? detail : JSON.stringify(detail);
          }
        }
      } catch {
        // Could not parse error body
      }

      if (response.status === 429) {
        const detail = typeof errorBody === 'object' && errorBody && 'detail' in errorBody
          ? (errorBody as { detail?: unknown }).detail
          : undefined;
        const details = typeof detail === 'object' && detail
          ? detail as CooldownResponse
          : undefined;
        throw new ApiError(
          details?.message || errorMessage,
          429,
          'COOLDOWN_ACTIVE',
          details,
        );
      } else if (response.status === 400) {
        throw new ApiError(errorMessage, 400, 'VALIDATION_ERROR');
      } else if (response.status === 404) {
        throw new ApiError('Verification service endpoint not found.', 404, 'NOT_FOUND');
      } else if (response.status === 502 || response.status === 503 || response.status === 504) {
        throw new ApiError(
          'Verification backend is unreachable (HTTP 502 Bad Gateway). Please ensure the FastAPI server is running on port 8000.',
          response.status,
          'SERVICE_UNAVAILABLE'
        );
      } else {
        throw new ApiError(errorMessage, response.status, 'API_ERROR');
      }
    }

    const result: ScanResult | DocumentRejectedResult = await response.json();
    return result;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('ERR_CONNECTION')) {
      throw new ApiError(
        'Unable to connect to the verification service. Please ensure the backend is running.',
        0,
        'NETWORK_FAILURE'
      );
    }
    throw new ApiError(message, 0, 'UNKNOWN_ERROR');
  }
}

/**
 * Build a full URL for a backend artifact path.
 * The backend returns relative paths like /artifacts/{scan_id}/original
 */
export function getArtifactUrl(path: string): string {
  if (!path) return '';
  // If it's already an absolute URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_BASE_URL}${path}`;
}

/**
 * Check if the backend is reachable.
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}

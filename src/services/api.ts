// Decoupled API Client Layer
// Easily switchable from realistic mock mode to real enterprise backend endpoints

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
export const IS_MOCK_MODE = import.meta.env.VITE_USE_MOCK !== 'false';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export class ApiError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Clean wrapper around fetch for when the backend is connected.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new ApiError(
        errorBody.message || `API request failed with status ${response.status}`,
        response.status,
        errorBody.code || 'API_ERROR'
      );
    }

    const payload: ApiResponse<T> = await response.json();
    return payload.data;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'Unknown network failure';
    throw new ApiError(
      message || 'Network connection failed. Backend service unavailable.',
      0,
      'NETWORK_FAILURE'
    );
  }
}

/**
 * Realistic simulated delay utility for mock mode
 */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

import type {
  DashboardMetrics,
  DocumentUploadPayload,
  VerificationRecord,
} from '../types/verification';
import { API_BASE_URL, ApiError } from './api';

export const verificationService = {
  /**
   * Fetch aggregate dashboard statistics
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const res = await fetch(`${API_BASE_URL}/api/stats`);
    if (!res.ok) throw new ApiError('Failed to fetch stats', res.status);
    const data = await res.json();
    return {
      totalVerifications: data.total || 0,
      successfulVerifications: data.clear || 0,
      failedVerifications: data.high_risk || 0,
      reviewRequired: data.suspicious || 0,
      averageConfidence: 0,
      averageProcessingTimeMs: 0,
      tamperingDetectedCount: 0,
      todayCount: 0,
      weeklyTrend: [],
    };
  },

  /**
   * List verifications with query filtering and pagination
   */
  async listVerifications(params?: {
    query?: string;
    status?: string;
    docType?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: VerificationRecord[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.set('query', params.query);
    if (params?.status && params.status !== 'all') searchParams.set('level', params.status);
    if (params?.docType && params.docType !== 'all') searchParams.set('doc_type', params.docType);
    
    const limit = params?.limit || 10;
    const page = params?.page || 1;
    searchParams.set('limit', limit.toString());
    searchParams.set('offset', ((page - 1) * limit).toString());

    const res = await fetch(`${API_BASE_URL}/api/history?${searchParams.toString()}`);
    if (!res.ok) throw new ApiError('Failed to fetch history', res.status);
    const result = await res.json();
    const rawList = Array.isArray(result) ? result : (result.items || []);
    
    return {
      data: rawList.map((item: any) => ({
        id: item.scan_id,
        documentType: item.doc_type,
        documentName: item.name || item.scan_id,
        documentUrl: '',
        fileSize: '0 MB',
        createdAt: item.created_at ? new Date(item.created_at * 1000).toISOString() : (item.timestamp || new Date().toISOString()),
        status: item.risk_level === 'CLEAR' ? 'verified' : item.risk_level === 'HIGH RISK' ? 'rejected' : 'review',
        overallConfidence: item.risk_score != null ? item.risk_score : 100,
        riskLevel: item.risk_level === 'CLEAR' ? 'low' : item.risk_level === 'HIGH RISK' ? 'high' : 'medium',
        clientIp: item.client_ip || undefined,
        deviceType: item.device_type || undefined,
        ocr: { status: 'completed', fieldsExtracted: Object.keys(item.extracted || {}).length, fields: [] },
        validation: { status: 'passed', confidence: 100, checks: [] },
        tampering: { status: 'low_risk', authenticityScore: 100, manipulationProbability: 0, metrics: {} as any, anomalies: [] },
        face: { faceDetected: false, matchConfidence: 0, livenessStatus: 'warning', livenessScore: 0, imageQuality: 'poor', documentFaceUrl: '', selfieUrl: '', landmarks: {} as any },
        timeline: [],
      })),
      total: Array.isArray(result) ? result.length : (result.total || 0),
      page,
      limit,
    };
  },

  /**
   * Get single verification record by ID
   */
  async getVerificationById(id: string): Promise<VerificationRecord> {
    const res = await fetch(`${API_BASE_URL}/api/scan/${id}`);
    if (!res.ok) throw new ApiError('Failed to fetch scan', res.status);
    const item = await res.json();
    return {
      id: item.scan_id,
      documentType: item.doc_type,
      documentName: item.scan_id,
      documentUrl: '',
      fileSize: '0 MB',
      createdAt: item.timestamp,
      status: item.risk_level === 'CLEAR' ? 'verified' : item.risk_level === 'HIGH RISK' ? 'rejected' : 'review',
      overallConfidence: item.risk_score,
      riskLevel: item.risk_level === 'CLEAR' ? 'low' : item.risk_level === 'HIGH RISK' ? 'high' : 'medium',
      ocr: { status: 'completed', fieldsExtracted: 0, fields: [] },
      validation: { status: 'passed', confidence: 100, checks: [] },
      tampering: { status: 'low_risk', authenticityScore: 100, manipulationProbability: 0, metrics: {} as any, anomalies: [] },
      face: { faceDetected: false, matchConfidence: 0, livenessStatus: 'warning', livenessScore: 0, imageQuality: 'poor', documentFaceUrl: '', selfieUrl: '', landmarks: {} as any },
      timeline: [],
    };
  },

  /**
   * Start end-to-end verification pipeline
   */
  async startVerification(
    _payload: DocumentUploadPayload,
    _onProgress?: (stage: string, progress: number, log: string) => void
  ): Promise<VerificationRecord> {
    throw new Error('Use scanDocument from api.ts instead.');
  },

  /**
   * Update OCR field value (Human-in-the-loop)
   */
  async updateOcrField(
    _verificationId: string,
    _fieldId: string,
    _newValue: string
  ): Promise<VerificationRecord> {
    throw new Error('Not implemented on backend yet.');
  },
};

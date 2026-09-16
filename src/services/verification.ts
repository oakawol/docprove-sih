import type {
  DashboardMetrics,
  DocumentUploadPayload,
  VerificationRecord,
} from '../types/verification';
import { apiRequest, delay, IS_MOCK_MODE } from './api';
import { mockDashboardMetrics, mockVerificationRecords } from '../mock/mockVerifications';
import { sampleDocumentsList } from '../mock/sampleDocuments';

// In-memory store for session additions
let localRecords: VerificationRecord[] = [...mockVerificationRecords];

export const verificationService = {
  /**
   * Fetch aggregate dashboard statistics
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    if (!IS_MOCK_MODE) {
      return apiRequest<DashboardMetrics>('/verifications/metrics');
    }
    await delay(300);
    return { ...mockDashboardMetrics };
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
    if (!IS_MOCK_MODE) {
      const searchParams = new URLSearchParams();
      if (params?.query) searchParams.set('query', params.query);
      if (params?.status && params.status !== 'all') searchParams.set('status', params.status);
      if (params?.docType && params.docType !== 'all') searchParams.set('docType', params.docType);
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      return apiRequest(`/verifications?${searchParams.toString()}`);
    }

    await delay(200);
    let results = [...localRecords];

    if (params?.query) {
      const q = params.query.toLowerCase();
      results = results.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.documentName.toLowerCase().includes(q) ||
          r.ocr.fields.some((f) => f.value.toLowerCase().includes(q))
      );
    }

    if (params?.status && params.status !== 'all') {
      results = results.filter((r) => r.status === params.status);
    }

    if (params?.docType && params.docType !== 'all') {
      results = results.filter((r) => r.documentType === params.docType);
    }

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginated = results.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      total: results.length,
      page,
      limit,
    };
  },

  /**
   * Get single verification record by ID
   */
  async getVerificationById(id: string): Promise<VerificationRecord> {
    if (!IS_MOCK_MODE) {
      return apiRequest<VerificationRecord>(`/verifications/${id}`);
    }

    await delay(150);
    const found = localRecords.find((r) => r.id === id);
    if (!found) {
      return localRecords[0];
    }
    return found;
  },

  /**
   * Start end-to-end verification pipeline (Govt of India Immigration & Passport Suite)
   */
  async startVerification(
    payload: DocumentUploadPayload,
    onProgress?: (stage: string, progress: number, log: string) => void
  ): Promise<VerificationRecord> {
    if (!IS_MOCK_MODE) {
      const formData = new FormData();
      if (payload.file) formData.append('document', payload.file);
      formData.append('documentType', payload.documentType);
      return apiRequest<VerificationRecord>('/verifications/process', {
        method: 'POST',
        body: formData,
      });
    }

    // Determine matching sample or create dynamic record
    let sample = sampleDocumentsList.find((s) => s.id === payload.sampleDocumentId);
    if (!sample) {
      if (payload.documentType === 'visa') {
        sample = sampleDocumentsList[1]; // Indian e-Visa
      } else if (payload.documentType === 'driving_license') {
        sample = sampleDocumentsList[3]; // Indian DL
      } else {
        sample = sampleDocumentsList[0]; // Indian Passport
      }
    }

    // Government Immigration Inspection Pipeline Telemetry
    if (onProgress) {
      onProgress('upload', 15, `MEA / Bureau of Immigration Gateway: Ingesting buffer [${payload.file ? payload.file.name : sample.name}]`);
      await delay(550);

      onProgress('ocr', 35, 'Neural OCR: Parsing ICAO 9303 MRZ, biographical fields & State Insignia');
      await delay(750);

      onProgress('validation', 55, 'Statutory Validation: Querying Central Passport Seva & MHA Immigration Database');
      await delay(700);

      onProgress('tampering', 75, 'Forensic Tampering: Inspecting Ashoka seal, font kerning & ELA digital splicing');
      await delay(750);

      onProgress('face', 90, 'Biometric Face Match: Correlating credential photo with live 3D stream');
      await delay(650);

      onProgress('result', 100, 'Consolidating clearance verdict & generating official audit dossier');
      await delay(400);
    }

    const isTampered = sample.isTampered || false;
    const prefix = sample.type === 'visa' ? 'IND-VISA' : sample.type === 'passport' ? 'IND-PASSPORT' : 'IND-DL';
    const newId = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecord: VerificationRecord = {
      id: newId,
      documentType: sample.type,
      documentName: payload.file ? payload.file.name : `${sample.type}_${sample.countryCode.toLowerCase()}_${Date.now()}.pdf`,
      documentUrl: sample.previewUrl,
      fileSize: payload.file ? `${(payload.file.size / (1024 * 1024)).toFixed(1)} MB` : '2.8 MB',
      createdAt: new Date().toISOString(),
      completedAt: new Date(Date.now() + 3200).toISOString(),
      status: isTampered ? 'rejected' : 'verified',
      overallConfidence: isTampered ? 35.4 : 98.6,
      riskLevel: isTampered ? 'high' : 'low',
      ocr: {
        status: 'completed',
        fieldsExtracted: sample.type === 'visa' ? 8 : sample.type === 'passport' ? 9 : 6,
        fields: sample.type === 'visa' ? [
          { id: 'v1', label: 'Application ID / आवेदन संख्या', value: 'IN-2026-984210', confidence: 99.8, category: 'document' },
          { id: 'v2', label: 'e-Visa Number / वीज़ा संख्या', value: sample.documentNumber, confidence: 99.7, category: 'document' },
          { id: 'v3', label: 'Traveler Full Name / नाम', value: sample.holderName, confidence: 99.5, category: 'personal' },
          { id: 'v4', label: 'Nationality / राष्ट्रीयता', value: 'UNITED STATES (USA)', confidence: 99.2, category: 'personal' },
          { id: 'v5', label: 'Passport Reference / पासपोर्ट संख्या', value: 'P948210394', confidence: 99.6, category: 'document' },
          { id: 'v6', label: 'Visa Sub-type / वीज़ा प्रकार', value: sample.visaDetails?.visaType || 'e-TOURIST VISA (30 DAYS)', confidence: 99.4, category: 'document' },
          { id: 'v7', label: 'Date of Expiry / समाप्ति तिथि', value: isTampered ? '10/01/2030' : '10/01/2027', confidence: isTampered ? 52.0 : 98.9, category: 'dates' },
          { id: 'v8', label: 'Designated ICP / चेक पोस्ट', value: 'DELHI AIRPORT (IGI - ICP)', confidence: 99.1, category: 'document' },
        ] : sample.type === 'passport' ? [
          { id: 'f1', label: 'Surname / उपनाम', value: 'SHARMA', confidence: 99.5, category: 'personal' },
          { id: 'f2', label: 'Given Names / दिया गया नाम', value: sample.holderName, confidence: 99.8, category: 'personal' },
          { id: 'f3', label: 'Passport No. / पासपोर्ट सं.', value: sample.documentNumber, confidence: 99.9, category: 'document' },
          { id: 'f4', label: 'Nationality / राष्ट्रीयता', value: 'INDIAN', confidence: 100, category: 'personal' },
          { id: 'f5', label: 'Date of Birth / जन्म तिथि', value: '14/05/1988', confidence: 99.2, category: 'dates' },
          { id: 'f6', label: 'Place of Birth / जन्म स्थान', value: 'NEW DELHI', confidence: 99.0, category: 'personal' },
          { id: 'f7', label: 'Place of Issue / जारी स्थान', value: 'DELHI', confidence: 99.4, category: 'document' },
          { id: 'f8', label: 'Date of Expiry / समाप्ति तिथि', value: '21/08/2032', confidence: 99.6, category: 'dates' },
          { id: 'f9', label: 'MRZ Checksum', value: 'P<INDSHARMA<<RAJESH<KUMAR...', confidence: 100, category: 'mrz' },
        ] : [
          { id: 'c1', label: 'Licence No. / लाइसेंस सं.', value: sample.documentNumber, confidence: 99.7, category: 'document' },
          { id: 'c2', label: 'Name / नाम', value: sample.holderName, confidence: 99.5, category: 'personal' },
          { id: 'c3', label: 'DOB / जन्म तिथि', value: '18/10/1995', confidence: 99.1, category: 'dates' },
          { id: 'c4', label: 'Blood Group', value: 'B+VE', confidence: 98.8, category: 'personal' },
          { id: 'c5', label: 'State Authority', value: 'Government of NCT of Delhi', confidence: 99.4, category: 'document' },
        ],
      },
      validation: {
        status: isTampered ? 'failed' : 'passed',
        confidence: isTampered ? 36.0 : 98.9,
        checks: [
          { id: 'v1', name: 'Document Classification & Format', description: `${sample.name} geometry verified`, status: 'passed', confidence: 99.2, category: 'format' },
          { id: 'v2', name: 'Central Ministry Database Correlation', description: 'Cross-checked with Passport Seva / MHA Bureau of Immigration', status: isTampered ? 'failed' : 'passed', confidence: isTampered ? 18.0 : 99.6, category: 'security' },
          { id: 'v3', name: 'Optical Security & Seal Verification', description: 'Ashoka Stambh / Bureau of Immigration digital seal check', status: isTampered ? 'failed' : 'passed', confidence: isTampered ? 25.0 : 98.5, category: 'security' },
          { id: 'v4', name: 'Statutory Validity Period', description: 'Validity duration verified against legal guidelines', status: isTampered ? 'failed' : 'passed', confidence: isTampered ? 15.0 : 99.4, category: 'expiry' },
        ],
      },
      tampering: {
        status: isTampered ? 'high_risk' : 'low_risk',
        authenticityScore: isTampered ? 26.5 : 98.8,
        manipulationProbability: isTampered ? 93.5 : 1.2,
        metrics: {
          imageIntegrity: isTampered ? 34.0 : 99.3,
          textConsistency: isTampered ? 28.0 : 99.1,
          layoutConsistency: isTampered ? 62.0 : 98.7,
          fontUniformity: isTampered ? 20.0 : 99.0,
          compressionArtifacts: isTampered ? 32.0 : 98.2,
        },
        anomalies: isTampered ? [
          {
            id: 'anom-expiry-altered',
            type: 'Typography Mismatch & Forged Expiry',
            description: 'Expiry date altered from 2027 to 2030 using mismatched serif typeface (Overstay Fraud)',
            severity: 'high',
            boundingBox: { x: 44, y: 51, width: 15, height: 5 },
          },
          {
            id: 'anom-photo-splicing',
            type: 'Perimeter Digital Splicing',
            description: 'High-frequency edge discontinuity detected around photo perimeter',
            severity: 'high',
            boundingBox: { x: 5, y: 22, width: 20, height: 36 },
          },
        ] : [],
      },
      face: {
        faceDetected: true,
        matchConfidence: isTampered ? 45.0 : 97.8,
        livenessStatus: isTampered ? 'warning' : 'passed',
        livenessScore: isTampered ? 60.0 : 98.5,
        imageQuality: 'excellent',
        documentFaceUrl: sample.faceCropUrl,
        selfieUrl: sample.selfieUrl,
        landmarks: {
          eyesMatch: isTampered ? 48.0 : 98.2,
          noseMatch: isTampered ? 46.0 : 97.1,
          mouthMatch: isTampered ? 43.0 : 97.5,
          jawlineMatch: isTampered ? 45.0 : 98.0,
        },
      },
      timeline: [
        { id: 'tl1', step: 'upload', title: 'Document Ingested', description: 'Uploaded via MEA / Immigration Checkpoint', timestamp: new Date().toISOString(), status: 'completed', durationMs: 120 },
        { id: 'tl2', step: 'ocr', title: 'Neural OCR Extraction', description: 'Fields & MRZ text extracted with high confidence', timestamp: new Date().toISOString(), status: 'completed', durationMs: 650 },
        { id: 'tl3', step: 'validation', title: 'Database Check', description: isTampered ? 'Hash verification failed in MHA database' : 'Passed statutory validation rules', timestamp: new Date().toISOString(), status: isTampered ? 'failed' : 'completed', durationMs: 510 },
        { id: 'tl4', step: 'tampering', title: 'Forensic Tampering Check', description: isTampered ? 'High manipulation detected: Altered expiry & photo splicing' : 'Zero tampering detected', timestamp: new Date().toISOString(), status: isTampered ? 'failed' : 'completed', durationMs: 680 },
        { id: 'tl5', step: 'face', title: 'Biometric Face Match', description: isTampered ? 'Facial match borderline / flagged' : 'Biometric match confirmed (97.8%)', timestamp: new Date().toISOString(), status: isTampered ? 'failed' : 'completed', durationMs: 620 },
        { id: 'tl6', step: 'result', title: 'Clearance Decision', description: isTampered ? 'REJECTED: Document seized under Passports / Foreigners Act' : 'CLEARED: Government of India Verified Credential', timestamp: new Date().toISOString(), status: isTampered ? 'failed' : 'completed', durationMs: 140 },
      ],
    };

    localRecords = [newRecord, ...localRecords];
    return newRecord;
  },

  /**
   * Update OCR field value (Human-in-the-loop)
   */
  async updateOcrField(
    verificationId: string,
    fieldId: string,
    newValue: string
  ): Promise<VerificationRecord> {
    if (!IS_MOCK_MODE) {
      return apiRequest<VerificationRecord>(`/verifications/${verificationId}/fields/${fieldId}`, {
        method: 'PATCH',
        body: JSON.stringify({ value: newValue }),
      });
    }

    await delay(150);
    const recIndex = localRecords.findIndex((r) => r.id === verificationId);
    if (recIndex !== -1) {
      const rec = { ...localRecords[recIndex] };
      rec.ocr = {
        ...rec.ocr,
        fields: rec.ocr.fields.map((f) =>
          f.id === fieldId ? { ...f, value: newValue, isEdited: true } : f
        ),
      };
      localRecords[recIndex] = rec;
      return rec;
    }
    throw new Error('Verification record not found');
  },
};

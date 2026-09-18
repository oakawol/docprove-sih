export type DocumentType = 
  | 'passport' 
  | 'visa'
  | 'driving_license' 
  | 'national_id' 
  | 'residence_permit';

export type VerificationStatus = 
  | 'verified' 
  | 'review' 
  | 'rejected' 
  | 'processing' 
  | 'pending';

export type RiskLevel = 'low' | 'medium' | 'high';

export type VerificationStep = 
  | 'upload' 
  | 'ocr' 
  | 'validation' 
  | 'tampering' 
  | 'face' 
  | 'result';

export interface OcrField {
  id: string;
  label: string;
  value: string;
  confidence: number;
  category: 'personal' | 'document' | 'dates' | 'mrz';
  isEdited?: boolean;
}

export interface ValidationCheck {
  id: string;
  name: string;
  description: string;
  status: 'passed' | 'warning' | 'failed';
  confidence: number;
  category: 'format' | 'security' | 'expiry' | 'checksum';
  details?: string;
}

export interface TamperingAnomaly {
  id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  boundingBox?: {
    x: number; // percentage 0-100
    y: number;
    width: number;
    height: number;
  };
}

export interface TamperingMetrics {
  imageIntegrity: number;
  textConsistency: number;
  layoutConsistency: number;
  fontUniformity: number;
  compressionArtifacts: number;
}

export interface TamperingData {
  status: 'low_risk' | 'medium_risk' | 'high_risk';
  authenticityScore: number;
  manipulationProbability: number;
  metrics: TamperingMetrics;
  anomalies: TamperingAnomaly[];
}

export interface FaceVerificationData {
  faceDetected: boolean;
  matchConfidence: number;
  livenessStatus: 'passed' | 'failed' | 'warning';
  livenessScore: number;
  imageQuality: 'excellent' | 'good' | 'fair' | 'poor';
  documentFaceUrl: string;
  selfieUrl: string;
  landmarks: {
    eyesMatch: number;
    noseMatch: number;
    mouthMatch: number;
    jawlineMatch: number;
  };
}

export interface TimelineEvent {
  id: string;
  step: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'processing' | 'failed' | 'pending';
  durationMs?: number;
}

export interface VerificationRecord {
  id: string;
  documentType: DocumentType;
  documentName: string;
  documentUrl: string;
  fileSize: string;
  createdAt: string;
  completedAt?: string;
  status: VerificationStatus;
  overallConfidence: number;
  riskLevel: RiskLevel;
  ocr: {
    status: 'completed' | 'failed' | 'processing';
    fieldsExtracted: number;
    fields: OcrField[];
    rawJson?: Record<string, unknown>;
  };
  validation: {
    status: 'passed' | 'warning' | 'failed' | 'processing';
    confidence: number;
    checks: ValidationCheck[];
  };
  clientIp?: string;
  deviceType?: string;
  tampering: TamperingData;
  face: FaceVerificationData;
  timeline: TimelineEvent[];
}

export interface DashboardMetrics {
  totalVerifications: number;
  successfulVerifications: number;
  failedVerifications: number;
  reviewRequired: number;
  averageConfidence: number;
  averageProcessingTimeMs: number;
  tamperingDetectedCount: number;
  todayCount: number;
  weeklyTrend: { day: string; count: number; successRate: number }[];
}

export interface DocumentUploadPayload {
  file?: File;
  documentType: DocumentType;
  sampleDocumentId?: string;
}

import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

export type VerificationState =
  | 'idle'
  | 'uploading'
  | 'scanning'
  | 'ocrComplete'
  | 'validationComplete'
  | 'tamperingComplete'
  | 'faceComplete'
  | 'verified'
  | 'failed';

export type StageProgress = 'waiting' | 'processing' | 'completed';

export interface PipelineStages {
  ocr: StageProgress;
  validation: StageProgress;
  tampering: StageProgress;
  face: StageProgress;
}

export interface ExtractedDocumentData {
  documentType: string;
  fullName: string;
  documentNumber: string;
  nationality: string;
  dateOfBirth: string;
  dateOfExpiry: string;
  mrz: string;
  confidence: number;
  layers: {
    ocr: { status: string; label: string };
    validation: { status: string; label: string };
    tampering: { status: string; label: string };
    face: { status: string; label: string };
  };
}

export interface SelectedFileMeta {
  name: string;
  sizeFormatted: string;
  type: string;
  previewUrl?: string;
  isDemo?: boolean;
}

interface VerificationContextType {
  state: VerificationState;
  pipelineStages: PipelineStages;
  statusMessage: string;
  selectedFile: SelectedFileMeta | null;
  documentData: ExtractedDocumentData;
  handleFileSelect: (file: File) => void;
  loadSampleDocument: (type?: 'passport' | 'visa') => void;
  clearFile: () => void;
  startVerification: () => Promise<void>;
  resetVerification: () => void;
  cancelVerification: () => void;
}

const DEFAULT_DEMO_DATA: ExtractedDocumentData = {
  documentType: 'PASSPORT',
  fullName: 'ALEX MORGAN',
  documentNumber: 'PX0000000',
  nationality: 'EXAMPLE',
  dateOfBirth: 'XX / XX / XXXX',
  dateOfExpiry: 'XX / XX / XXXX',
  mrz: 'P<EXPMORGAN<<ALEX<<<<<<<<<<<<<<<<<<<<<<<\nPX00000005EXP9405201M3405202<<<<<<<<<<<<<<08',
  confidence: 98.4,
  layers: {
    ocr: { status: 'VERIFIED', label: 'OCR EXTRACTION' },
    validation: { status: 'VERIFIED', label: 'DOCUMENT VALIDATION' },
    tampering: { status: 'NO SUSPICIOUS ALTERATION INDICATORS', label: 'TAMPERING DETECTION' },
    face: { status: 'MATCH DETECTED', label: 'FACE DETECTION' },
  },
};

const INITIAL_PIPELINE: PipelineStages = {
  ocr: 'waiting',
  validation: 'waiting',
  tampering: 'waiting',
  face: 'waiting',
};

const DocproveVerificationContext = createContext<VerificationContextType | undefined>(undefined);

export const DocproveVerificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<VerificationState>('idle');
  const [pipelineStages, setPipelineStages] = useState<PipelineStages>(INITIAL_PIPELINE);
  const [statusMessage, setStatusMessage] = useState<string>('WAITING FOR DOCUMENT');
  const [selectedFile, setSelectedFile] = useState<SelectedFileMeta | null>(null);
  const [documentData] = useState<ExtractedDocumentData>(DEFAULT_DEMO_DATA);

  const abortControllerRef = useRef<boolean>(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
  };

  const handleFileSelect = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setSelectedFile({
      name: file.name,
      sizeFormatted: formatFileSize(file.size),
      type: file.type || 'application/octet-stream',
      previewUrl,
      isDemo: false,
    });
    setState('idle');
    setPipelineStages(INITIAL_PIPELINE);
    setStatusMessage('DOCUMENT READY FOR ANALYSIS');
  };

  const loadSampleDocument = (type: 'passport' | 'visa' = 'passport') => {
    setSelectedFile({
      name: type === 'passport' ? 'sample_specimen_passport.png' : 'sample_specimen_visa.png',
      sizeFormatted: '1.84 MB',
      type: 'image/png',
      isDemo: true,
    });
    setState('idle');
    setPipelineStages(INITIAL_PIPELINE);
    setStatusMessage('DEMO SPECIMEN LOADED');
  };

  const clearFile = () => {
    setSelectedFile(null);
    setState('idle');
    setPipelineStages(INITIAL_PIPELINE);
    setStatusMessage('WAITING FOR DOCUMENT');
  };

  const cancelVerification = () => {
    abortControllerRef.current = true;
    setState('idle');
    setPipelineStages(INITIAL_PIPELINE);
    setStatusMessage('VERIFICATION CANCELLED');
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const startVerification = useCallback(async () => {
    if (!selectedFile) return;

    abortControllerRef.current = false;
    setState('scanning');
    setStatusMessage('READING DOCUMENT');
    setPipelineStages({
      ocr: 'processing',
      validation: 'waiting',
      tampering: 'waiting',
      face: 'waiting',
    });

    // Stage 1: Reading & Text Extraction
    await sleep(750);
    if (abortControllerRef.current) return;
    setStatusMessage('EXTRACTING TEXT');
    await sleep(850);
    if (abortControllerRef.current) return;

    // Stage 2: Document Structure Validation
    setState('ocrComplete');
    setPipelineStages({
      ocr: 'completed',
      validation: 'processing',
      tampering: 'waiting',
      face: 'waiting',
    });
    setStatusMessage('CHECKING DOCUMENT STRUCTURE');
    await sleep(950);
    if (abortControllerRef.current) return;

    // Stage 3: Visual Tampering & Forensic Check
    setState('validationComplete');
    setPipelineStages({
      ocr: 'completed',
      validation: 'completed',
      tampering: 'processing',
      face: 'waiting',
    });
    setStatusMessage('ANALYZING VISUAL INTEGRITY');
    await sleep(1000);
    if (abortControllerRef.current) return;

    // Stage 4: Face Biometric Detection
    setState('tamperingComplete');
    setPipelineStages({
      ocr: 'completed',
      validation: 'completed',
      tampering: 'completed',
      face: 'processing',
    });
    setStatusMessage('DETECTING FACE');
    await sleep(900);
    if (abortControllerRef.current) return;

    // Stage 5: Finalizing Verification
    setState('faceComplete');
    setPipelineStages({
      ocr: 'completed',
      validation: 'completed',
      tampering: 'completed',
      face: 'completed',
    });
    setStatusMessage('FINALIZING VERIFICATION');
    await sleep(650);
    if (abortControllerRef.current) return;

    // Climax Result
    setState('verified');
    setStatusMessage('VERIFICATION COMPLETE');
  }, [selectedFile]);

  const resetVerification = () => {
    setState('idle');
    setPipelineStages(INITIAL_PIPELINE);
    setStatusMessage('WAITING FOR DOCUMENT');
  };

  return (
    <DocproveVerificationContext.Provider
      value={{
        state,
        pipelineStages,
        statusMessage,
        selectedFile,
        documentData,
        handleFileSelect,
        loadSampleDocument,
        clearFile,
        startVerification,
        resetVerification,
        cancelVerification,
      }}
    >
      {children}
    </DocproveVerificationContext.Provider>
  );
};

export const useDocprove = () => {
  const context = useContext(DocproveVerificationContext);
  if (!context) {
    throw new Error('useDocprove must be used within a DocproveVerificationProvider');
  }
  return context;
};

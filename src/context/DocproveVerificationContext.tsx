import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import type { ScanResult } from '../types/scan';
import { scanDocument, validateFile } from '../services/api';

// ── State Machine ───────────────────────────────────────────────────────────

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

export interface SelectedFileMeta {
  name: string;
  sizeFormatted: string;
  type: string;
  previewUrl?: string;
}

// ── Context Interface ───────────────────────────────────────────────────────

interface VerificationContextType {
  state: VerificationState;
  pipelineStages: PipelineStages;
  statusMessage: string;
  selectedFile: SelectedFileMeta | null;
  uploadedFile: File | null;
  scanResult: ScanResult | null;
  error: string | null;
  activeStageIndex: number;
  currentStageName: string;
  handleFileSelect: (file: File) => void;
  clearFile: () => void;
  startVerification: () => Promise<void>;
  resetVerification: () => void;
  cancelVerification: () => void;
}

// ── Defaults ────────────────────────────────────────────────────────────────

const INITIAL_PIPELINE: PipelineStages = {
  ocr: 'waiting',
  validation: 'waiting',
  tampering: 'waiting',
  face: 'waiting',
};

const DocproveVerificationContext = createContext<VerificationContextType | undefined>(undefined);

// ── Provider ────────────────────────────────────────────────────────────────

export const DocproveVerificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<VerificationState>('idle');
  const [pipelineStages, setPipelineStages] = useState<PipelineStages>(INITIAL_PIPELINE);
  const [statusMessage, setStatusMessage] = useState<string>('WAITING FOR DOCUMENT');
  const [selectedFile, setSelectedFile] = useState<SelectedFileMeta | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeStageIndex, setActiveStageIndex] = useState(-1);

  const STAGE_NAMES = ['DOCUMENT CHECK', 'TEXT READING', 'DETAIL CHECK', 'TAMPERING CHECK', 'FACE MATCH', 'VERIFIED RESULT'];
  const currentStageName = activeStageIndex >= 0 && activeStageIndex < STAGE_NAMES.length ? STAGE_NAMES[activeStageIndex] : '';

  const abortControllerRef = useRef<boolean>(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
  };

  // ── File Selection ──────────────────────────────────────────────────────

  const handleFileSelect = (file: File) => {
    // Client-side validation
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
    setSelectedFile({
      name: file.name,
      sizeFormatted: formatFileSize(file.size),
      type: file.type || 'application/octet-stream',
      previewUrl,
    });
    setUploadedFile(file);
    setState('idle');
    setPipelineStages(INITIAL_PIPELINE);
    setScanResult(null);
    setError(null);
    setStatusMessage('DOCUMENT READY FOR VERIFICATION');
  };

  const clearFile = () => {
    if (selectedFile?.previewUrl) {
      URL.revokeObjectURL(selectedFile.previewUrl);
    }
    setSelectedFile(null);
    setUploadedFile(null);
    setState('idle');
    setActiveStageIndex(-1);
    setPipelineStages(INITIAL_PIPELINE);
    setScanResult(null);
    setError(null);
    setStatusMessage('WAITING FOR DOCUMENT');
  };

  const cancelVerification = () => {
    abortControllerRef.current = true;
    setState('idle');
    setActiveStageIndex(-1);
    setPipelineStages(INITIAL_PIPELINE);
    setStatusMessage('VERIFICATION CANCELLED');
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // ── Start Verification (Real Backend Call) ──────────────────────────────

  const startVerification = useCallback(async () => {
    if (!uploadedFile) return;

    abortControllerRef.current = false;
    setError(null);
    setScanResult(null);
    setState('scanning');
    setActiveStageIndex(0);
    setStatusMessage('Inspecting document structure');
    setPipelineStages({
      ocr: 'processing',
      validation: 'waiting',
      tampering: 'waiting',
      face: 'waiting',
    });

    // Fire the real API request immediately (runs in background)
    const apiPromise = scanDocument(uploadedFile);

    // ── Animated stage progression (runs in parallel with the API call) ──

    // Stage 0 → 1: Document Check → Text Reading
    await sleep(800);
    if (abortControllerRef.current) return;
    setActiveStageIndex(1);
    setStatusMessage('Extracting document text');

    await sleep(900);
    if (abortControllerRef.current) return;

    // Stage 1 → 2: Text Reading → Detail Check
    setState('ocrComplete');
    setActiveStageIndex(2);
    setPipelineStages({
      ocr: 'completed',
      validation: 'processing',
      tampering: 'waiting',
      face: 'waiting',
    });
    setStatusMessage('Cross-checking document details');

    await sleep(1000);
    if (abortControllerRef.current) return;

    // Stage 2 → 3: Detail Check → Tampering Check
    setState('validationComplete');
    setActiveStageIndex(3);
    setPipelineStages({
      ocr: 'completed',
      validation: 'completed',
      tampering: 'processing',
      face: 'waiting',
    });
    setStatusMessage('Analyzing document integrity');

    await sleep(1100);
    if (abortControllerRef.current) return;

    // Stage 3 → 4: Tampering Check → Face Match
    setState('tamperingComplete');
    setActiveStageIndex(4);
    setPipelineStages({
      ocr: 'completed',
      validation: 'completed',
      tampering: 'completed',
      face: 'processing',
    });
    setStatusMessage('Checking portrait integrity');

    await sleep(800);
    if (abortControllerRef.current) return;

    // Stage 4 → 5: Face Match → Verified Result
    setState('faceComplete');
    setActiveStageIndex(5);
    setPipelineStages({
      ocr: 'completed',
      validation: 'completed',
      tampering: 'completed',
      face: 'completed',
    });
    setStatusMessage('Compiling verification results');

    // ── Wait for the actual API response ──────────────────────────────────
    try {
      const result = await apiPromise;
      if (abortControllerRef.current) return;

      setScanResult(result);
      setState('verified');
      setActiveStageIndex(-1);

      // Set final status message based on real result
      const riskStatus = result.risk?.status || result.final_status;
      if (riskStatus === 'CLEAR') {
        setStatusMessage('AUTOMATED SCREENING COMPLETE — CLEAR');
      } else if (riskStatus === 'SUSPICIOUS') {
        setStatusMessage('AUTOMATED SCREENING COMPLETE — REVIEW RECOMMENDED');
      } else if (riskStatus === 'HIGH RISK') {
        setStatusMessage('AUTOMATED SCREENING COMPLETE — HIGH RISK');
      } else {
        setStatusMessage('AUTOMATED SCREENING COMPLETE');
      }
    } catch (err: unknown) {
      if (abortControllerRef.current) return;

      const message = err instanceof Error ? err.message : 'Verification failed. Please try again.';
      console.error('[DocProve] Verification failed:', err);
      setError(message);
      setState('failed');
      setActiveStageIndex(-1);
      setPipelineStages(INITIAL_PIPELINE);
      setStatusMessage('VERIFICATION FAILED');
    }
  }, [uploadedFile]);

  // ── Reset ───────────────────────────────────────────────────────────────

  const resetVerification = () => {
    if (selectedFile?.previewUrl) {
      URL.revokeObjectURL(selectedFile.previewUrl);
    }
    setSelectedFile(null);
    setUploadedFile(null);
    setScanResult(null);
    setError(null);
    setState('idle');
    setActiveStageIndex(-1);
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
        uploadedFile,
        scanResult,
        error,
        activeStageIndex,
        currentStageName,
        handleFileSelect,
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

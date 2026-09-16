import React, { createContext, useContext, useState } from 'react';
import type {
  DocumentUploadPayload,
  VerificationRecord,
  VerificationStep,
} from '../types/verification';
import { verificationService } from '../services/verification';
import { mockVerificationRecords } from '../mock/mockVerifications';

interface VerificationContextType {
  currentRecord: VerificationRecord | null;
  currentStep: VerificationStep;
  isProcessing: boolean;
  processingProgress: number;
  processingStage: string;
  processingLog: string;
  selectedSampleDocId: string | null;
  uploadedFile: File | null;
  setStep: (step: VerificationStep) => void;
  setSelectedSampleDocId: (id: string | null) => void;
  setUploadedFile: (file: File | null) => void;
  startVerificationProcess: (payload: DocumentUploadPayload) => Promise<VerificationRecord>;
  loadRecord: (record: VerificationRecord) => void;
  loadRecordById: (id: string) => Promise<void>;
  updateField: (fieldId: string, value: string) => Promise<void>;
  resetSession: () => void;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export const VerificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to a realistic active record so all deep-dive pages show rich interactive data immediately!
  const [currentRecord, setCurrentRecord] = useState<VerificationRecord | null>(mockVerificationRecords[0]);
  const [currentStep, setCurrentStep] = useState<VerificationStep>('upload');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [processingLog, setProcessingLog] = useState<string>('');
  const [selectedSampleDocId, setSelectedSampleDocId] = useState<string | null>('sample-doc-passport-ind');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const startVerificationProcess = async (payload: DocumentUploadPayload): Promise<VerificationRecord> => {
    setIsProcessing(true);
    setProcessingProgress(5);
    setProcessingStage('upload');
    setProcessingLog('Initializing secure ingest channel...');

    try {
      const record = await verificationService.startVerification(
        payload,
        (stage, progress, log) => {
          setProcessingStage(stage);
          setProcessingProgress(progress);
          setProcessingLog(log);
        }
      );

      setCurrentRecord(record);
      setCurrentStep('result');
      return record;
    } finally {
      setIsProcessing(false);
    }
  };

  const loadRecord = (record: VerificationRecord) => {
    setCurrentRecord(record);
    setCurrentStep('result');
  };

  const loadRecordById = async (id: string) => {
    try {
      const rec = await verificationService.getVerificationById(id);
      setCurrentRecord(rec);
    } catch (e) {
      console.error('Failed to load record by id', e);
    }
  };

  const updateField = async (fieldId: string, value: string) => {
    if (!currentRecord) return;
    const updated = await verificationService.updateOcrField(currentRecord.id, fieldId, value);
    setCurrentRecord(updated);
  };

  const resetSession = () => {
    setCurrentStep('upload');
    setSelectedSampleDocId('sample-doc-passport-ind');
    setUploadedFile(null);
  };

  return (
    <VerificationContext.Provider
      value={{
        currentRecord,
        currentStep,
        isProcessing,
        processingProgress,
        processingStage,
        processingLog,
        selectedSampleDocId,
        uploadedFile,
        setStep: setCurrentStep,
        setSelectedSampleDocId,
        setUploadedFile,
        startVerificationProcess,
        loadRecord,
        loadRecordById,
        updateField,
        resetSession,
      }}
    >
      {children}
    </VerificationContext.Provider>
  );
};

export const useVerification = () => {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
};

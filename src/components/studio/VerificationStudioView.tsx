import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCheck2,
  FileWarning,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  FileText,
  Check,
  RefreshCw,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { useVerification } from '../../context/VerificationContext';
import { sampleDocumentsList } from '../../mock/sampleDocuments';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';
import type { DocumentType } from '../../types/verification';
import { cn } from '../../utils/cn';

interface VerificationStudioViewProps {
  onVerificationComplete: () => void;
}

export const VerificationStudioView: React.FC<VerificationStudioViewProps> = ({
  onVerificationComplete,
}) => {
  const {
    startVerificationProcess,
    selectedSampleDocId,
    setSelectedSampleDocId,
    uploadedFile,
    setUploadedFile,
    isProcessing,
  } = useVerification();

  const [documentType, setDocumentType] = useState<DocumentType>('passport');
  const [dragOver, setDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedSample = sampleDocumentsList.find((s) => s.id === selectedSampleDocId) || sampleDocumentsList[0];

  const handleSelectSample = (sampleId: string) => {
    setSelectedSampleDocId(sampleId);
    setUploadedFile(null);
    const sample = sampleDocumentsList.find((s) => s.id === sampleId);
    if (sample) {
      setDocumentType(sample.type);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      setSelectedSampleDocId(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setSelectedSampleDocId(null);
    }
  };

  const handleRunVerification = async () => {
    try {
      await startVerificationProcess({
        documentType,
        file: uploadedFile || undefined,
        sampleDocumentId: selectedSampleDocId || undefined,
      });
      onVerificationComplete();
    } catch (err) {
      console.error('Verification failed:', err);
    }
  };

  const docTypes: { id: DocumentType; labelHi: string; labelEn: string }[] = [
    { id: 'passport', labelHi: 'पासपोर्ट', labelEn: 'Indian Passport (ICAO)' },
    { id: 'visa', labelHi: 'भारतीय वीज़ा', labelEn: 'Indian e-Visa (BoI / MHA)' },
    { id: 'driving_license', labelHi: 'ड्राइविंग लाइसेंस', labelEn: 'Driving Licence (MoRTH)' },
    { id: 'national_id', labelHi: 'राष्ट्रीय पहचान', labelEn: 'National ID / Aadhaar' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Official Government Notice Banner */}
      <div className="bg-[#ffffff] border-l-4 border-l-[#f97316] border border-slate-200 p-4 rounded-lg shadow-xs flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#f97316] shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700">
          <strong className="text-slate-900 font-bold">आधिकारिक वैधानिक सूचना (Official Statutory Notice): </strong>
          All identity credentials, Republic of India Passports, and Indian e-Visa documents are verified in accordance with the <em>Passports Act 1967</em>, <em>The Foreigners Act 1946</em>, and <em>ICAO Document 9303</em> specifications.
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold text-[#0a2540] tracking-tight">
              दस्तावेज़ एवं वीज़ा सत्यापन कक्ष (Verification Studio)
            </h2>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
              Active Kiosk
            </span>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Ingest Republic of India Passports, Bureau of Immigration e-Visas, or select benchmark test credentials for instant forensic authenticity analysis.
          </p>
        </div>

        {/* Action Trigger */}
        <div className="flex items-center gap-3">
          <Button
            size="lg"
            variant="primary"
            isLoading={isProcessing}
            onClick={handleRunVerification}
            rightIcon={<ArrowRight className="w-5 h-5" />}
            className="bg-[#0a2540] hover:bg-[#133b68] text-white px-6 font-bold text-sm shadow-sm"
          >
            सत्यापन निष्पादित करें / Execute AI Verification
          </Button>
        </div>
      </div>

      {/* Main Grid: Upload Area & Sample Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload / Document Canvas Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Document Type Selector */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 mb-2">
              Select Document Classification / दस्तावेज़ प्रकार चुनें
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {docTypes.map((dt) => {
                const isSelected = documentType === dt.id;
                return (
                  <button
                    key={dt.id}
                    type="button"
                    onClick={() => setDocumentType(dt.id)}
                    className={cn(
                      'py-2 px-3 text-left rounded-lg border transition-all cursor-pointer select-none',
                      isSelected
                        ? 'bg-[#0a2540] text-white border-[#0a2540] shadow-sm ring-1 ring-[#0a2540]'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <div className="text-xs font-bold">{dt.labelHi}</div>
                    <div className={cn('text-[10px] truncate', isSelected ? 'text-slate-300' : 'text-slate-500')}>
                      {dt.labelEn}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'relative rounded-xl border-2 border-dashed p-7 text-center transition-all duration-200 cursor-pointer overflow-hidden bg-white group',
              dragOver
                ? 'border-orange-500 bg-orange-50/50 scale-[1.01]'
                : uploadedFile
                ? 'border-emerald-500 bg-emerald-50/40'
                : 'border-slate-300 hover:border-[#0a2540] hover:bg-slate-50'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {uploadedFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{uploadedFile.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for National Verification
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-1 text-xs"
                >
                  Select Different Document
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#0a2540] flex items-center justify-center group-hover:scale-105 transition-transform border border-slate-200">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Upload Passport, Visa PDF, or National Credential
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Supports high-resolution Indian Passports, Bureau of Immigration e-Visas, and smart cards (PDF, JPG, PNG)
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0a2540] bg-slate-100 px-3 py-1 rounded border border-slate-300 mt-1">
                  Click to Browse Files / फ़ाइल चुनें
                </span>
              </div>
            )}
          </div>

          {/* Active Document Visualization Preview */}
          <GlassCard variant="elevated" className="space-y-3 p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0a2540]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Active Document Buffer / वर्तमान दस्तावेज़ पूर्वावलोकन
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600">
                {uploadedFile ? uploadedFile.name : selectedSample?.name}
              </span>
            </div>

            {/* Document Image Preview */}
            <div className="relative rounded-lg overflow-hidden border border-slate-300 bg-slate-100 flex items-center justify-center p-2 min-h-[250px]">
              {uploadedFile ? (
                <div className="text-center py-10 text-slate-600">
                  <FileCheck className="w-12 h-12 mx-auto text-[#0a2540] mb-2 opacity-80" />
                  <p className="text-sm font-bold text-slate-900">{uploadedFile.name}</p>
                  <p className="text-xs text-slate-500 mt-1">Ready for optical character recognition and ELA forensics</p>
                </div>
              ) : selectedSample ? (
                <div className="relative w-full flex justify-center">
                  <img
                    src={selectedSample.previewUrl}
                    alt={selectedSample.name}
                    className="max-h-[290px] w-auto rounded shadow-md object-contain border border-slate-300"
                  />
                  {selectedSample.isTampered && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow border border-red-700 flex items-center gap-1.5 animate-pulse">
                      <FileWarning className="w-3.5 h-3.5" />
                      <span>Tampered Benchmark Credential</span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Benchmark One-Click Showcase (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0a2540]">
              Official Test Benchmarks / परीक्षण नमूने
            </h3>
            <span className="text-[11px] text-slate-500 font-semibold">1-Click Live Test</span>
          </div>

          <div className="space-y-2.5">
            {sampleDocumentsList.map((sample) => {
              const isSelected = selectedSampleDocId === sample.id && !uploadedFile;

              return (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample.id)}
                  className={cn(
                    'relative rounded-lg p-3.5 border transition-all duration-150 cursor-pointer text-left',
                    isSelected
                      ? 'bg-blue-50/70 border-[#0a2540] shadow-sm ring-1 ring-[#0a2540]'
                      : 'bg-white border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border',
                          sample.isTampered
                            ? 'bg-red-50 text-red-700 border-red-300'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        )}
                      >
                        {sample.isTampered ? (
                          <ShieldAlert className="w-4 h-4" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{sample.name}</h4>
                          {isSelected && (
                            <span className="w-3.5 h-3.5 rounded-full bg-[#0a2540] text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          {sample.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px]">
                          <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 font-semibold">
                            {sample.country} ({sample.countryCode})
                          </span>
                          <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 font-semibold">
                            Doc #{sample.documentNumber}
                          </span>
                          {sample.visaDetails && (
                            <span className="font-mono text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-semibold">
                              {sample.visaDetails.visaType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {sample.isTampered ? (
                        <StatusBadge status="rejected" label="Tampered / जालसाजी" size="sm" />
                      ) : (
                        <StatusBadge status="verified" label="Genuine / प्रामाणिक" size="sm" />
                      )}
                    </div>
                  </div>

                  {sample.tamperReason && (
                    <div className="mt-2.5 p-2 rounded bg-red-50 border border-red-200 text-[11px] text-red-800">
                      <span className="font-bold">Detected Violation: </span>
                      {sample.tamperReason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Demo Guidance Card */}
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <span>🇮🇳 Indian e-Visa Verification Mode:</span>
            </div>
            <p className="text-[11px] text-amber-900/90 leading-relaxed">
              Select <strong>Government of India e-Visa</strong> or test the <strong>Tampered Indian e-Visa</strong> to demonstrate anti-spoofing forgery detection at international immigration checkpoints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

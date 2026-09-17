import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  FileUp,
  ArrowRight,
  ChevronRight,
  X,
  AlertCircle,
  FileImage,
  File as FileIcon,
} from 'lucide-react';
import { MasterPassportDocument } from '../document/MasterPassportDocument';
import { PipelineStackScroll } from './PipelineStackScroll';
import { ScanningSequence } from './ScanningSequence';
import { useDocprove } from '../../context/DocproveVerificationContext';

export const ContinuousDocumentExperience: React.FC = () => {
  const {
    state,
    selectedFile,
    scanResult,
    error,
    activeStageIndex,
    handleFileSelect,
    clearFile,
    startVerification,
    resetVerification,
  } = useDocprove();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Headline Cursor Tracking for subtle 2-6px micro-parallax depth
  const headlineRef = useRef<HTMLDivElement>(null);
  const headMouseX = useMotionValue(0);
  const headMouseY = useMotionValue(0);
  const headSpring = { damping: 24, stiffness: 200 };
  const headShiftX1 = useSpring(useTransform(headMouseX, [-0.5, 0.5], [-3, 3]), headSpring);
  const headShiftY1 = useSpring(useTransform(headMouseY, [-0.5, 0.5], [-2, 2]), headSpring);

  const handleHeadlineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!headlineRef.current) return;
    const rect = headlineRef.current.getBoundingClientRect();
    headMouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    headMouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleHeadlineMouseLeave = () => {
    headMouseX.set(0);
    headMouseY.set(0);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const isProcessing = state === 'scanning' || state === 'ocrComplete' || state === 'validationComplete' || state === 'tamperingComplete' || state === 'faceComplete';
  const isComplete = state === 'verified' || state === 'failed';
  const isVerified = state === 'verified' && !!scanResult;

  // Determine intake display state
  const getIntakeState = () => {
    if (!selectedFile) return 'IDLE';
    if (isProcessing) return 'ANALYZING';
    if (isComplete) return 'COMPLETE';
    return 'READY';
  };

  const intakeState = getIntakeState();

  // Dynamic Headline Typewriter Animation (Visa <-> Passport)
  const WORDS = ['Visa', 'Passport'];
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState('Visa');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const targetWord = WORDS[wordIndex];
    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      if (displayText.length < targetWord.length) {
        timer = setTimeout(() => {
          setDisplayText(targetWord.slice(0, displayText.length + 1));
        }, 90);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 65);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % WORDS.length);
        }, 300);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, wordIndex]);

  // Verification Signals data
  const [hoveredSignal, setHoveredSignal] = useState<string | null>(null);

  return (
    <div className="w-full pt-28 sm:pt-32 lg:pt-36 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-20">
      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. HERO: CINEMATIC SEQUENCED ENTRANCE & HEADLINE DEPTH */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center text-center">
        {/* Headline with typewriter rotation "Verify your [Visa / Passport]" */}
        <div
          ref={headlineRef}
          onMouseMove={handleHeadlineMouseMove}
          onMouseLeave={handleHeadlineMouseLeave}
          className="mb-6 max-w-4xl group cursor-default select-none"
        >
          <div className="overflow-hidden">
            <motion.h1
              style={{ x: headShiftX1, y: headShiftY1 }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.048em] leading-[1.02] text-[#f8fafc] light:text-[#111318] inline-flex items-center justify-center flex-wrap"
            >
              <span>Verify your&nbsp;</span>
              <span className="inline-block text-left min-w-[4.8ch] sm:min-w-[5.2ch] relative text-[#E03131]">
                <span>{displayText}</span>
                <span className="inline-block w-[2px] h-[0.8em] bg-[#E03131] align-middle ml-[2px] animate-pulse" />
              </span>
            </motion.h1>
          </div>
        </div>

        {/* Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-base sm:text-lg text-[#8e95a5] light:text-[#555B66] max-w-2xl leading-[1.55] font-normal mb-12"
        >
          Docprove brings neural character extraction, structural validation, tampering forensics, and biometric face detection into one continuous verification workflow.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16"
        >
          {/* Primary CTA: START EXAMINATION */}
          <button
            onClick={() => {
              const el = document.getElementById('document-intake');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group relative overflow-hidden w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#f5f5f7] light:bg-[#111318] text-[#07090e] light:text-[#ffffff] font-semibold text-xs tracking-[0.14em] uppercase flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer shadow-[0_12px_30px_-8px_rgba(0,0,0,0.25)] active:scale-[0.98] active:translate-y-0 rainbow-hover-target"
          >
            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/80 light:via-white/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer" />
            <span className="relative z-10 font-sans">START EXAMINATION</span>
            <ArrowRight className="relative z-10 w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* Passport Specimen */}
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.985, rotateX: 3 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
          transition={{ duration: 0.95, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl"
        >
          <MasterPassportDocument mode="optical" tiltEffect={true} />

          {/* Minimal Precision Sub-Telemetry */}
          <div className="mt-6 flex items-center justify-between text-[10px] font-mono text-[#565f73] light:text-[#555B66] max-w-md mx-auto">
            <span>SPECIMEN ID: ERD-9209198</span>
            <span>FORMAT: ICAO DOC 9303 ID-3</span>
            <span className="text-[#8e95a5] light:text-[#111318]">RESOLUTION: 600 DPI</span>
          </div>
        </motion.div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. VERIFICATION PIPELINE: STACKED CARD SCROLL                */}
      {/* ──────────────────────────────────────────────────────────── */}
      <PipelineStackScroll />

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 3. DOCUMENT INTAKE WORKSPACE: REAL UPLOAD EXPERIENCE       */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section id="document-intake" className="pt-16 border-t border-white/[0.06] light:border-black/[0.08]">
        <div className="mb-10 text-left">
          <span className="text-xs font-mono tracking-widest text-[#8e95a5] light:text-[#555B66] uppercase block mb-2">
            [ 02 / DOCUMENT INTAKE WORKSPACE ]
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white light:text-[#111318] tracking-[-0.03em] leading-[1.1]">
            Examine your own document.
          </h2>
          <p className="text-sm text-[#8e95a5] light:text-[#555B66] mt-2 max-w-xl leading-[1.55]">
            Upload an international passport or visa to run the full multi-signal verification pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Intake Drag & Drop Box */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`rounded-3xl p-8 sm:p-10 flex-1 flex flex-col justify-between text-center relative overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                scanResult && state === 'verified'
                  ? scanResult.risk.status === 'CLEAR'
                    ? '!bg-[#087F5B] text-white border border-[#087F5B] shadow-[0_24px_50px_-12px_rgba(8,127,91,0.4)]'
                    : scanResult.risk.status === 'SUSPICIOUS'
                    ? '!bg-[#B45309] text-white border border-[#B45309] shadow-[0_24px_50px_-12px_rgba(180,83,9,0.4)]'
                    : '!bg-[#9B2226] text-white border border-[#9B2226] shadow-[0_24px_50px_-12px_rgba(155,34,38,0.4)]'
                  : isDragOver
                  ? 'surface-card border-blue-400/50 bg-[#12182a]/90 light:bg-[#ffffff] shadow-[0_0_30px_rgba(59,130,246,0.15)]'
                  : 'surface-card animate-breathing-border'
              }`}
            >
              {intakeState === 'IDLE' ? (
                <div
                  className="flex flex-col items-center justify-center my-auto py-8 cursor-pointer"
                  onClick={handleBrowseClick}
                >
                  {/* Icon with subtle radial light */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
                    <div className="relative w-14 h-14 rounded-2xl bg-white/[0.03] light:bg-black/[0.03] border border-white/[0.08] light:border-black/[0.1] flex items-center justify-center text-slate-300 light:text-slate-700 transition-transform duration-300 hover:scale-105">
                      <FileUp className="w-6 h-6 stroke-[1.5]" />
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white light:text-[#111318] tracking-wide mb-2">
                    Drop passport or visa file here
                  </h3>
                  <p className="text-xs sm:text-sm text-[#8e95a5] light:text-[#555B66] max-w-sm mb-4">
                    Supports high-resolution PNG, JPG, or PDF up to 10 MB.
                  </p>
                  <span className="text-[11px] font-mono text-blue-400 light:text-blue-600 opacity-80">
                    Click to browse files
                  </span>

                  {/* Show validation error if any */}
                  {error && (
                    <div className="mt-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span className="text-xs text-red-400 font-mono">{error}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col justify-between h-full py-4 text-left">
                  {/* File Header */}
                  <div className={`flex items-center justify-between pb-6 border-b transition-colors duration-1000 ${
                    isVerified
                      ? 'border-white/20'
                      : 'border-white/[0.08] light:border-black/[0.08]'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-1000 ${
                        isVerified
                          ? 'bg-white/15 text-white border border-white/20'
                          : 'bg-white/[0.05] light:bg-black/[0.04] border border-white/[0.1] light:border-black/[0.1] text-white light:text-[#111318]'
                      }`}>
                        {selectedFile?.type === 'application/pdf' ? (
                          <FileIcon className="w-5 h-5" />
                        ) : (
                          <FileImage className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <span className={`text-[9px] font-mono uppercase tracking-wider block transition-colors duration-1000 ${
                          isVerified
                            ? 'text-white/80'
                            : 'text-[#8e95a5] light:text-[#555B66]'
                        }`}>
                          DOCUMENT LOADED
                        </span>
                        <p className={`text-sm font-bold tracking-wide truncate max-w-xs sm:max-w-md transition-colors duration-1000 ${
                          isVerified
                            ? 'text-white'
                            : 'text-white light:text-[#111318]'
                        }`}>
                          {selectedFile?.name}
                        </p>
                      </div>
                    </div>

                    {!isProcessing && (
                      <button
                        onClick={isComplete ? resetVerification : clearFile}
                        className={`text-xs font-mono transition-colors cursor-pointer flex items-center gap-1 ${
                          isVerified
                            ? 'text-white/80 hover:text-white'
                            : 'text-[#565f73] light:text-[#737781] hover:text-white light:hover:text-[#111318]'
                        }`}
                      >
                        <X className="w-3 h-3" />
                        {isComplete ? 'New Document' : 'Remove'}
                      </button>
                    )}
                  </div>

                  {/* File Details & Preview */}
                  <div className="my-6 space-y-4">
                    {/* File metadata */}
                    <div className={`p-4 rounded-xl text-xs font-mono space-y-2 transition-all duration-1000 ${
                      isVerified
                        ? 'bg-white/10 border border-white/15 text-white'
                        : 'bg-white/[0.02] light:bg-[#F7F7F4] border border-white/[0.06] light:border-[#D6D5D0]'
                    }`}>
                      <div className="flex justify-between">
                        <span className={isVerified ? 'text-white/70' : 'text-slate-400 light:text-[#555B66]'}>FILE NAME</span>
                        <span className={`font-bold truncate max-w-[200px] ${isVerified ? 'text-white' : 'text-white light:text-[#111318]'}`}>{selectedFile?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isVerified ? 'text-white/70' : 'text-slate-400 light:text-[#555B66]'}>FILE SIZE</span>
                        <span className={`font-bold ${isVerified ? 'text-white' : 'text-white light:text-[#111318]'}`}>{selectedFile?.sizeFormatted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isVerified ? 'text-white/70' : 'text-slate-400 light:text-[#555B66]'}>FILE TYPE</span>
                        <span className={`font-bold uppercase ${isVerified ? 'text-white' : 'text-white light:text-[#111318]'}`}>
                          {selectedFile?.name.split('.').pop()?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </div>
                      {scanResult && (
                        <div className={`flex justify-between pt-2 border-t ${isVerified ? 'border-white/15 text-white' : 'text-slate-400 light:text-[#555B66] border-white/[0.06] light:border-[#D6D5D0]'}`}>
                          <span className={isVerified ? 'text-white/70' : 'text-slate-400 light:text-[#555B66]'}>SCAN ID</span>
                          <span className={`font-bold ${isVerified ? 'text-white' : 'text-emerald-400 light:text-emerald-600'}`}>{scanResult.scan_id}</span>
                        </div>
                      )}
                    </div>

                    {/* Image preview with forensic scanning treatment */}
                    {selectedFile?.previewUrl && (
                      <div className={`rounded-xl overflow-hidden relative transition-all duration-1000 ${
                        isVerified
                          ? 'border border-white/20 bg-black/10'
                          : 'border border-white/[0.06] light:border-[#D6D5D0] bg-black/20 light:bg-[#F7F7F4]'
                      }`}>
                        <img
                          src={selectedFile.previewUrl}
                          alt="Document preview"
                          className="w-full h-auto max-h-[200px] object-contain"
                        />

                        {/* Forensic Scanning Overlays — only during processing */}
                        {isProcessing && (
                          <>
                            {/* Thin horizontal forensic scan line — ultra-subtle 1px line */}
                            <div
                              key={`scan-line-stage-${activeStageIndex}`}
                              className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none animate-forensic-scan"
                              style={{
                                background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.2) 20%, rgba(59,130,246,0.35) 50%, rgba(59,130,246,0.2) 80%, transparent 100%)',
                                boxShadow: '0 0 4px rgba(59,130,246,0.15)',
                              }}
                            />

                            {/* Stage-aware region emphasis overlays */}
                            {activeStageIndex === 0 && (
                              /* Document Check — subtle full-document border pulse */
                              <div className="absolute inset-0 border border-blue-400/20 light:border-blue-600/20 rounded-xl pointer-events-none transition-opacity duration-700" />
                            )}
                            {activeStageIndex === 1 && (
                              /* Text Reading — subtle emphasis on lower text region */
                              <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-blue-400/[0.06] to-transparent pointer-events-none transition-opacity duration-700" />
                            )}
                            {activeStageIndex === 2 && (
                              /* Detail Check — subtle emphasis on middle region */
                              <div className="absolute inset-x-0 top-[20%] bottom-[20%] bg-blue-400/[0.04] pointer-events-none transition-opacity duration-700" />
                            )}
                            {activeStageIndex === 3 && (
                              /* Tampering Check — subtle forensic grid overlay */
                              <div
                                className="absolute inset-0 pointer-events-none animate-forensic-grid"
                                style={{
                                  backgroundImage: 'linear-gradient(0deg, transparent 95%, rgba(59,130,246,0.08) 95%), linear-gradient(90deg, transparent 95%, rgba(59,130,246,0.08) 95%)',
                                  backgroundSize: '20px 20px',
                                }}
                              />
                            )}
                            {activeStageIndex === 4 && (
                              /* Face Match — subtle emphasis on upper-left portrait area */
                              <div className="absolute top-0 left-0 w-[40%] h-[50%] bg-gradient-to-br from-blue-400/[0.08] to-transparent pointer-events-none transition-opacity duration-700 rounded-tl-xl" />
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Processing status — Premium Scanning Sequence */}
                    {isProcessing && (
                      <ScanningSequence />
                    )}

                    {/* Error state */}
                    {error && state === 'failed' && (
                      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/20">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-mono text-red-400 block font-bold">VERIFICATION FAILED</span>
                          <span className="text-xs text-red-400/80 mt-1 block">{error}</span>
                        </div>
                      </div>
                    )}

                    {/* Success summary — seamlessly belongs to the outer card surface */}
                    {scanResult && state === 'verified' && (
                      <div className="pt-3 pb-2 px-1 text-white">
                        <div className="flex items-end justify-between gap-6">
                          <div className="min-w-0">
                            <span className="text-[10px] font-mono tracking-[0.18em] uppercase block mb-1.5 font-medium text-white/80">
                              SCREENING RESULT
                            </span>
                            <span className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] leading-none block text-white">
                              {scanResult.risk.status === 'CLEAR'
                                ? 'Clear screening'
                                : scanResult.risk.status === 'SUSPICIOUS'
                                ? 'Review recommended'
                                : 'High risk detected'}
                            </span>
                          </div>
                          <span className="shrink-0 text-base sm:text-lg font-mono font-bold tracking-tight text-white">
                            {scanResult.risk.score} / 100
                          </span>
                        </div>
                        <span className="text-[11px] sm:text-xs mt-2 block font-normal leading-relaxed text-white/90">
                          {scanResult.risk.status === 'CLEAR'
                            ? 'No significant integrity anomalies identified'
                            : scanResult.risk.status === 'SUSPICIOUS'
                            ? 'Potential integrity anomalies require review'
                            : 'Multiple integrity anomalies identified'}
                        </span>
                        <div className="mt-3 h-[2px] w-full bg-white/25 overflow-hidden rounded-full">
                          <div
                            className="h-full bg-white transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] rounded-full"
                            style={{ width: `${Math.max(4, scanResult.risk.score)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono mt-2 block text-white/75">
                          Processed in {(scanResult.timings_ms.total / 1000).toFixed(1)}s · {scanResult.doc_type.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div>
                    {intakeState === 'READY' && (
                      <button
                        onClick={startVerification}
                        className="w-full py-3.5 rounded-xl bg-white light:bg-[#111318] text-slate-950 light:text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-slate-100 transition-all cursor-pointer shadow-lg active:scale-98 rainbow-hover-target"
                      >
                        <span>START VERIFICATION</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {isProcessing && (
                      <button
                        disabled
                        className="w-full py-3.5 rounded-xl bg-white/5 light:bg-[#111318]/5 text-[#8e95a5] light:text-[#555B66] font-mono text-[11px] tracking-wider uppercase flex items-center justify-center gap-3 cursor-not-allowed border border-white/[0.06] light:border-black/[0.06]"
                      >
                        <span className="relative flex items-center justify-center w-2 h-2">
                          <span className="w-[6px] h-[6px] rounded-full bg-blue-400 light:bg-blue-600" />
                          <span className="absolute w-[6px] h-[6px] rounded-full bg-blue-400 light:bg-blue-600 animate-ping opacity-40" />
                        </span>
                        <span>{activeStageIndex >= 0 ? `STAGE ${String(activeStageIndex + 1).padStart(2, '0')} / 06` : 'PROCESSING'}</span>
                      </button>
                    )}

                    {isComplete && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            // Scroll to pipeline to view detailed results
                            const el = document.getElementById('verification-pipeline');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className={`flex-1 py-3.5 rounded-xl font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98 ${
                            isVerified
                              ? 'bg-white text-slate-950 hover:bg-slate-100'
                              : 'bg-white light:bg-[#111318] text-slate-950 light:text-white hover:bg-slate-100'
                          }`}
                        >
                          <span>VIEW DETAILED RESULTS</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {state === 'failed' && (
                      <button
                        onClick={startVerification}
                        className="w-full py-3.5 rounded-xl bg-white light:bg-[#111318] text-slate-950 light:text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-slate-100 transition-all cursor-pointer shadow-lg active:scale-98"
                      >
                        <span>RETRY VERIFICATION</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Verification Signals Panel */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 flex flex-col surface-card light:!bg-[#F7F6F2] light:!border-[rgba(20,30,45,0.10)] light:!shadow-[0_12px_40px_rgba(20,30,45,0.06)] rounded-[24px] p-6 sm:p-8 lg:p-9 border border-white/[0.08] relative overflow-hidden"
          >
            {/* Extremely subtle bespoke watermark detail (barely visible 0.035 opacity crosshair / index in light mode) */}
            <div className="absolute right-4 bottom-4 pointer-events-none select-none opacity-[0.03] light:opacity-[0.035] text-[#111318] dark:text-white font-mono text-7xl font-bold tracking-tighter leading-none">
              04
            </div>

            {/* Header Area */}
            <div className="pb-5 border-b border-white/[0.06] light:border-[rgba(20,30,45,0.07)]">
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8e95a5] light:text-[#555B66] block mb-2 font-medium"
              >
                [ VERIFICATION SIGNALS ]
              </motion.span>
              <motion.h3
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="font-sans text-xl sm:text-2xl font-[580] text-white light:text-[#111318] tracking-[-0.02em] leading-tight"
              >
                What Docprove checks
                <br className="hidden sm:inline" /> on every ingest.
              </motion.h3>
            </div>

            {/* Signal Cards: balanced vertical rhythm filling the module with comfortable breathing room */}
            <div className="pt-5 flex flex-col justify-between flex-1 gap-3.5 sm:gap-4 relative z-10">
              {[
                {
                  id: 'ocr',
                  index: '01',
                  title: 'OCR EXTRACTION',
                  desc: 'Extracts full name, document numbers, nationality, birth dates, and expiration dates.',
                  // maps to pipeline stages: active if activeStageIndex === 1 (Text Reading)
                  stageIndex: 1,
                },
                {
                  id: 'validation',
                  index: '02',
                  title: 'DOCUMENT VALIDATION',
                  desc: 'Validates document structure, MRZ check digits, and cross-references printed data.',
                  // maps to pipeline stages: active if activeStageIndex === 0 or 2 (Document Check / Detail Check)
                  stageIndex: 2,
                },
                {
                  id: 'tampering',
                  index: '03',
                  title: 'TAMPERING ANALYSIS',
                  desc: 'ELA, noise analysis, chroma residuals, and re-compression detection across document fields.',
                  // maps to pipeline stages: active if activeStageIndex === 3 (Tampering Check)
                  stageIndex: 3,
                },
                {
                  id: 'face',
                  index: '04',
                  title: 'FACE DETECTION',
                  desc: 'Extracts facial landmarks and validates portrait integrity against photo swaps.',
                  // maps to pipeline stages: active if activeStageIndex === 4 (Face Match)
                  stageIndex: 4,
                },
              ].map((item, idx) => {
                const isHovered = hoveredSignal === item.id;
                const isActive = isProcessing && activeStageIndex === item.stageIndex;
                const isResolved = isProcessing && activeStageIndex > item.stageIndex;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.5,
                      delay: 0.08 + idx * 0.06,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    onMouseEnter={() => setHoveredSignal(item.id)}
                    onMouseLeave={() => setHoveredSignal(null)}
                    style={{
                      transform: isHovered ? 'translateY(-2px)' : 'translateY(0px)',
                      transition: 'transform 350ms cubic-bezier(0.22, 1, 0.36, 1), background-color 350ms cubic-bezier(0.22, 1, 0.36, 1), border-color 350ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                    className={`p-5 sm:p-[21px] rounded-[16px] relative cursor-default transition-all ${
                      // Light mode styling
                      isHovered
                        ? 'light:!bg-white light:!border-[rgba(20,30,45,0.18)] bg-white/[0.05] border-white/[0.14]'
                        : isActive
                        ? 'light:!bg-white/80 light:!border-blue-500/40 bg-white/[0.04] border-blue-400/40'
                        : isResolved
                        ? 'light:!bg-[rgba(255,255,255,0.7)] light:!border-[rgba(20,30,45,0.12)] bg-white/[0.03] border-white/[0.09]'
                        : 'light:!bg-[rgba(255,255,255,0.55)] light:!border-[rgba(20,30,45,0.08)] bg-white/[0.02] border-white/[0.06]'
                    } border`}
                  >
                    {/* Active stage left hairline accent indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r-full bg-blue-500 dark:bg-blue-400" />
                    )}

                    {/* Top Index & Title row */}
                    <div className="flex items-center gap-2.5 mb-2">
                      <span
                        style={{
                          transform: isHovered ? 'translateX(2px)' : 'translateX(0px)',
                          transition: 'transform 350ms cubic-bezier(0.22, 1, 0.36, 1), color 350ms cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                        className={`font-mono text-[11px] tracking-tight font-medium ${
                          isActive
                            ? 'text-blue-600 dark:text-blue-400 font-semibold'
                            : 'text-[#8e95a5] light:text-[#737781]'
                        }`}
                      >
                        {item.index}
                      </span>

                      {/* Tiny active stage dot next to index if running */}
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse" />
                      )}

                      <h4
                        style={{
                          transform: isHovered ? 'translateX(2px)' : 'translateX(0px)',
                          transition: 'transform 350ms cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                        className="font-mono text-[12.5px] font-semibold text-white light:text-[#111318] uppercase tracking-[0.04em]"
                      >
                        {item.title}
                      </h4>
                    </div>

                    {/* Description */}
                    <p className="font-sans text-[13px] sm:text-[13.5px] leading-[1.55] text-[#8e95a5] light:text-[#4B525D]">
                      {item.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 4. CLOSING EDITORIAL STATEMENT */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="pt-20 sm:pt-24 pb-4 sm:pb-6 border-t border-white/[0.06] light:border-black/[0.08] text-center max-w-4xl mx-auto space-y-6">
        <span className="text-[11px] font-mono tracking-[0.2em] text-[#565f73] light:text-[#737781] uppercase font-medium">
          [ DOCUMENT VERIFICATION STANDARDS ]
        </span>
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-semibold text-[#f8fafc] light:text-[#111318] tracking-[-0.04em] leading-[1.05] font-sans">
          Every document tells a story. <br className="hidden sm:inline" />
          We check every detail.
        </h2>
        <p className="text-base sm:text-lg text-[#8e95a5] light:text-[#555B66] max-w-2xl mx-auto leading-relaxed font-normal">
          DocProve examines identity documents across image quality, text, structure, tampering, and face matching — turning complex checks into one clear verification result.
        </p>
      </section>
    </div>
  );
};

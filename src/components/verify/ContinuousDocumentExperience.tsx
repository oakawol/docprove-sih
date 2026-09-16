import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  FileText,
  FileUp,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { MasterPassportDocument } from '../document/MasterPassportDocument';
import { PipelineStackScroll } from './PipelineStackScroll';

type IntakeState = 'IDLE' | 'READY' | 'UPLOADING' | 'ANALYZING' | 'COMPLETE' | 'ERROR';

export const ContinuousDocumentExperience: React.FC = () => {
  const [isAutomatedRunning, setIsAutomatedRunning] = useState(false);

  // Intake State Machine
  const [intakeState, setIntakeState] = useState<IntakeState>('IDLE');
  const [uploadedFileName, setUploadedFileName] = useState('fakepassport.png');
  const [isDragOver, setIsDragOver] = useState(false);

  // Active hover states on Verification Signals for interactive micro-visualizations
  const [hoveredSignal, setHoveredSignal] = useState<string | null>(null);

  // Headline Cursor Tracking for subtle 2-6px micro-parallax depth
  const headlineRef = useRef<HTMLDivElement>(null);
  const headMouseX = useMotionValue(0);
  const headMouseY = useMotionValue(0);
  const headSpring = { damping: 24, stiffness: 200 };
  const headShiftX1 = useSpring(useTransform(headMouseX, [-0.5, 0.5], [-3, 3]), headSpring);
  const headShiftY1 = useSpring(useTransform(headMouseY, [-0.5, 0.5], [-2, 2]), headSpring);
  const headShiftX2 = useSpring(useTransform(headMouseX, [-0.5, 0.5], [4, -4]), headSpring);
  const headShiftY2 = useSpring(useTransform(headMouseY, [-0.5, 0.5], [3, -3]), headSpring);

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

  const handleStartFullInspection = async () => {
    setIsAutomatedRunning(true);
    // Simulating sequence timings without changing core flow
    await new Promise((resolve) => setTimeout(resolve, 6200));
    setIsAutomatedRunning(false);
  };

  const handleSelectSample = (name: string) => {
    setUploadedFileName(name);
    setIntakeState('READY');
  };

  const handleBeginIntakeVerification = async () => {
    setIntakeState('ANALYZING');
    await handleStartFullInspection();
    setIntakeState('COMPLETE');
  };

  return (
    <div className="w-full pt-28 sm:pt-36 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-36">
      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. HERO: CINEMATIC SEQUENCED ENTRANCE & HEADLINE DEPTH */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center text-center">
        {/* Subtle Atmospheric Light Behind Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[360px] bg-gradient-to-b from-blue-900/12 via-indigo-950/10 to-transparent rounded-full blur-[140px] pointer-events-none -z-10"
        />

        {/* Step 3: Eyebrow badge fades upward */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-[#8e95a5] mb-8 group cursor-default"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400/90 animate-soft-pulse" />
          <span className="tracking-[0.2em] uppercase">PRECISION DOCUMENT INTELLIGENCE</span>
          <span className="text-[9px] text-slate-500 font-mono pl-1 border-l border-white/[0.08]">v2.4</span>
        </motion.div>

        {/* Step 4: Headline reveals line by line with cursor depth parallax & gradient movement on hover */}
        <div
          ref={headlineRef}
          onMouseMove={handleHeadlineMouseMove}
          onMouseLeave={handleHeadlineMouseLeave}
          className="mb-6 max-w-4xl group cursor-default select-none"
        >
          <div className="overflow-hidden">
            <motion.h1
              style={{ x: headShiftX1, y: headShiftY1 }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.048em] leading-[1.02] text-[#f8fafc]"
            >
              Verify every document
            </motion.h1>
          </div>

          <div className="overflow-hidden mt-1 sm:mt-2">
            <motion.h1
              style={{ x: headShiftX2, y: headShiftY2 }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.048em] leading-[1.02] text-[#f8fafc]"
            >
              with quiet confidence.
            </motion.h1>
          </div>
        </div>

        {/* Step 5: Paragraph follows */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg text-[#8e95a5] max-w-2xl leading-[1.55] font-normal mb-12"
        >
          Docprove brings neural character extraction, structural validation, tampering forensics, and biometric face detection into one continuous verification workflow.
        </motion.p>

        {/* Step 6: CTA Buttons with stagger & micro-interactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.88, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16"
        >
          {/* Primary CTA: START EXAMINATION */}
          <button
            onClick={() => {
              const el = document.getElementById('continuous-inspection-bay');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group relative overflow-hidden w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#f5f5f7] text-[#07090e] font-semibold text-xs tracking-[0.14em] uppercase flex items-center justify-center gap-3 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer shadow-[0_12px_30px_-8px_rgba(255,255,255,0.25)] hover:shadow-[0_16px_36px_-6px_rgba(255,255,255,0.35)] active:scale-[0.98] active:translate-y-0"
          >
            {/* Subtle Gradient Reflection Travelling Across Surface on Hover */}
            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer" />

            <span className="relative z-10 font-sans">START EXAMINATION</span>
            <ArrowRight className="relative z-10 w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          {/* Secondary CTA: DEMO FULL PIPELINE */}
          <button
            onClick={handleStartFullInspection}
            disabled={isAutomatedRunning}
            className="group relative overflow-hidden w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#0d121e]/80 text-[#c4cbd8] hover:text-white border border-white/[0.08] hover:border-blue-400/40 font-mono text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer disabled:opacity-50 surface-control hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
          >
            <span>{isAutomatedRunning ? 'EXAMINING SPECIMEN...' : 'DEMO FULL PIPELINE'}</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-blue-400" />
          </button>
        </motion.div>

        {/* Step 7 & 8: Passport Specimen rises into position */}
        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl"
        >
          <MasterPassportDocument mode="optical" tiltEffect={true} />

          {/* Minimal Precision Sub-Telemetry */}
          <div className="mt-6 flex items-center justify-between text-[10px] font-mono text-[#565f73] max-w-md mx-auto">
            <span>SPECIMEN ID: ERD-9209198</span>
            <span>FORMAT: ICAO DOC 9303 ID-3</span>
            <span className="text-[#8e95a5]">RESOLUTION: 600 DPI</span>
          </div>
        </motion.div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. VERIFICATION PIPELINE: STACKED CARD SCROLL                */}
      {/* ──────────────────────────────────────────────────────────── */}
      <PipelineStackScroll />

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 3. DOCUMENT INTAKE WORKSPACE: ASYMMETRICAL 2-COLUMN TERMINAL */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="pt-16 border-t border-white/[0.06]">
        <div className="mb-10 text-left">
          <span className="text-xs font-mono tracking-widest text-[#8e95a5] uppercase block mb-2">
            [ 02 / DOCUMENT INTAKE WORKSPACE ]
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-[-0.03em] leading-[1.1]">
            Examine your own document.
          </h2>
          <p className="text-sm text-[#8e95a5] mt-2 max-w-xl leading-[1.55]">
            Drop an international passport or visa to simulate the full multi-signal verification pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Intake Drag & Drop Box with Breathing Border and Clean State Machine */}
          <div className="lg:col-span-7 flex flex-col">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setUploadedFileName(e.dataTransfer.files[0].name);
                  setIntakeState('READY');
                }
              }}
              className={`surface-card rounded-3xl p-8 sm:p-10 flex-1 flex flex-col justify-between text-center relative overflow-hidden transition-all duration-300 ${
                isDragOver
                  ? 'border-blue-400/50 bg-[#12182a]/90 shadow-[0_0_30px_rgba(59,130,246,0.15)]'
                  : 'animate-breathing-border'
              }`}
            >
              {intakeState === 'IDLE' ? (
                <div className="flex flex-col items-center justify-center my-auto py-8">
                  {/* Icon with subtle radial light */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
                    <div className="relative w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-300 transition-transform duration-300 hover:scale-105">
                      <FileUp className="w-6 h-6 stroke-[1.5]" />
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide mb-2">
                    Drop passport or visa file here
                  </h3>
                  <p className="text-xs sm:text-sm text-[#8e95a5] max-w-sm mb-6">
                    Supports high-resolution PNG, JPG, or PDF up to 10 MB.
                  </p>

                  {/* Sample Selection Quick Triggers */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-white/[0.06] w-full max-w-md">
                    <span className="text-[11px] font-mono text-[#565f73]">Or test specimen:</span>
                    <button
                      onClick={() => handleSelectSample('fakepassport.png')}
                      className="px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-slate-300 transition-colors cursor-pointer"
                    >
                      fakepassport.png
                    </button>
                    <button
                      onClick={() => handleSelectSample('specimen_visa_tourist_entry.png')}
                      className="px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-slate-300 transition-colors cursor-pointer"
                    >
                      Tourist Visa Specimen
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col justify-between h-full py-4 text-left">
                  <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-white">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-[#8e95a5] uppercase tracking-wider block">
                          SPECIMEN LOADED
                        </span>
                        <p className="text-sm font-bold text-white tracking-wide truncate max-w-xs sm:max-w-md">
                          {uploadedFileName}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIntakeState('IDLE')}
                      className="text-xs font-mono text-[#565f73] hover:text-white transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="my-8 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-mono space-y-2">
                    <div className="flex justify-between text-slate-400">
                      <span>INTAKE STATE</span>
                      <span className="text-white font-bold">{intakeState}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>CALIBRATION STATUS</span>
                      <span className="text-emerald-400">NOMINAL (600 DPI)</span>
                    </div>
                  </div>

                  <button
                    onClick={handleBeginIntakeVerification}
                    disabled={intakeState === 'ANALYZING'}
                    className="w-full py-3.5 rounded-xl bg-white text-slate-950 font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-slate-100 transition-all cursor-pointer shadow-lg active:scale-98 disabled:opacity-50"
                  >
                    <span>{intakeState === 'ANALYZING' ? 'ANALYZING DOCUMENT...' : 'BEGIN VERIFICATION'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Verification Signals Panel with Interactive Hover Previews & Micro-Visualizations */}
          <div className="lg:col-span-5 flex flex-col justify-between surface-card rounded-3xl p-8 sm:p-10 border border-white/[0.08]">
            <div className="space-y-6">
              <span className="text-xs font-mono tracking-widest text-[#8e95a5] uppercase block">
                [ VERIFICATION SIGNALS ]
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">
                What Docprove checks on every ingest.
              </h3>

              <div className="space-y-3">
                {[
                  {
                    id: 'ocr',
                    title: 'OCR Extraction',
                    desc: 'Extracts full name, document numbers, nationality, birth dates, and expiration dates.',
                    microViz: 'TEXT MATRIX • ROSTOVA / P48291048',
                    color: 'text-cyan-400',
                    dotColor: 'bg-cyan-400',
                  },
                  {
                    id: 'validation',
                    title: 'Document Validation',
                    desc: 'Calculates ICAO 9303 checksum parity math and verifies document structure.',
                    microViz: '7-3-1 WEIGHT PARITY: 100% MATCH',
                    color: 'text-blue-400',
                    dotColor: 'bg-blue-400',
                  },
                  {
                    id: 'tampering',
                    title: 'Tampering Analysis',
                    desc: 'Micro-scans font consistency, substrate uniformity, and edge compression.',
                    microViz: 'NOISE LEVEL < 0.02% • 0 ALTERATIONS',
                    color: 'text-purple-400',
                    dotColor: 'bg-purple-400',
                  },
                  {
                    id: 'face',
                    title: 'Face Detection',
                    desc: 'Extracts facial landmarks and ensures portrait integrity against photo swaps.',
                    microViz: '68 LANDMARKS • 99.1% TOPOLOGY CONFIDENCE',
                    color: 'text-teal-400',
                    dotColor: 'bg-teal-400',
                  },
                ].map((item) => {
                  const isHovered = hoveredSignal === item.id;

                  return (
                    <div
                      key={item.id}
                      onMouseEnter={() => setHoveredSignal(item.id)}
                      onMouseLeave={() => setHoveredSignal(null)}
                      className={`p-3 rounded-xl border transition-all duration-300 cursor-default ${
                        isHovered
                          ? 'bg-white/[0.04] border-white/[0.12] -translate-x-1 shadow-sm'
                          : 'bg-transparent border-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                          {item.title}
                        </h4>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>

                      <p className="text-xs text-[#8e95a5] mt-1 leading-relaxed">
                        {item.desc}
                      </p>

                      {/* Micro-Visualization on Hover */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`mt-2 pt-2 border-t border-white/[0.06] text-[10px] font-mono ${item.color} flex items-center gap-1.5`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor} animate-pulse`} />
                            <span>{item.microViz}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 4. ARCHITECTURAL STANDARD: EDITORIAL CALLOUT */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="pt-20 border-t border-white/[0.06] text-center max-w-3xl mx-auto space-y-6">
        <span className="text-xs font-mono tracking-widest text-[#565f73] uppercase">
          [ ARCHITECTURAL STANDARD ]
        </span>
        <h2 className="text-3xl sm:text-5xl font-bold text-[#f5f5f7] tracking-tight leading-tight">
          Verification built for precision, <br />
          not decorative effects.
        </h2>
        <p className="text-sm sm:text-base text-[#8e95a5] max-w-xl mx-auto leading-relaxed">
          Docprove provides border authorities, security analysts, and enterprise platforms with transparent, verifiable identity document intelligence.
        </p>
      </section>
    </div>
  );
};

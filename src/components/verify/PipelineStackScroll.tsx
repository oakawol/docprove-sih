import React, { useState } from 'react';
import { motion } from 'framer-motion';

import {
  Search,
  FileText,
  ShieldCheck,
  Binary,
  UserCheck,
  CheckCircle2,
  Check,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { MasterPassportDocument } from '../document/MasterPassportDocument';
import type { DocumentInspectionMode } from '../document/MasterPassportDocument';

// ─── 6 Stage Definitions (Editorial & Human-Friendly) ─────────────────────────

interface StageConfig {
  id: string;
  mode: DocumentInspectionMode;
  number: string;
  label: string;
  Icon: React.ElementType;
  eyebrow: string;
  headline: string;
  statusText: string;
  confidence: string;
  description: string;
  data: { label: string; value: string }[];
}

const STAGES: StageConfig[] = [
  {
    id: 'optical',
    mode: 'optical',
    number: '01',
    label: 'DOCUMENT CHECK',
    Icon: Search,
    eyebrow: 'DOCUMENT QUALITY',
    headline: 'Document Alignment & Quality',
    statusText: 'STAGE 01 · DOCUMENT CHECK · ACTIVE',
    confidence: '100%',
    description: 'Checking the document image for proper alignment, proportions, and image quality.',
    data: [
      { label: 'DOCUMENT PROPORTIONS', value: 'CORRECT' },
      { label: 'IMAGE QUALITY',        value: 'CLEAR' },
      { label: 'ALIGNMENT',            value: '0.0° (ALIGNED)' },
    ],
  },
  {
    id: 'ocr',
    mode: 'ocr',
    number: '02',
    label: 'TEXT READING',
    Icon: FileText,
    eyebrow: 'TEXT EXTRACTION',
    headline: 'Reading Document Information',
    statusText: 'STAGE 02 · TEXT READING · ACTIVE',
    confidence: '99.4%',
    description: 'Reading the passport details and confirming that the printed information can be clearly detected.',
    data: [
      { label: 'SURNAME',     value: 'SHUKLA' },
      { label: 'GIVEN NAMES', value: 'AVIRAL' },
      { label: 'NATIONALITY', value: 'INDIAN' },
      { label: 'PASSPORT NO', value: 'Z48291048' },
    ],
  },
  {
    id: 'validation',
    mode: 'validation',
    number: '03',
    label: 'DETAIL CHECK',
    Icon: ShieldCheck,
    eyebrow: 'DETAIL VERIFICATION',
    headline: 'Checking Document Details',
    statusText: 'STAGE 03 · DETAIL CHECK · ACTIVE',
    confidence: '100%',
    description: 'Checking names, dates, passport number, nationality, and other document details for consistency.',
    data: [
      { label: 'INFORMATION CHECK', value: 'PASSED' },
      { label: 'DOCUMENT CHECK',    value: 'MATCHED' },
      { label: 'EXPIRY DATE',       value: 'VALID' },
    ],
  },
  {
    id: 'tampering',
    mode: 'tampering',
    number: '04',
    label: 'TAMPERING CHECK',
    Icon: Binary,
    eyebrow: 'TAMPERING DETECTION',
    headline: 'Document Tampering Check',
    statusText: 'STAGE 04 · TAMPERING CHECK · ACTIVE',
    confidence: '99.8%',
    description: 'Looking for signs that the document image has been edited, altered, or manipulated.',
    data: [
      { label: 'IMAGE QUALITY',  value: 'CONSISTENT' },
      { label: 'EDITING CHECK',  value: '0.02%' },
      { label: 'EDITED AREAS',   value: 'NONE DETECTED' },
    ],
  },
  {
    id: 'face',
    mode: 'face',
    number: '05',
    label: 'FACE MATCH',
    Icon: UserCheck,
    eyebrow: 'FACE DETECTION',
    headline: 'Face Detection & Match',
    statusText: 'STAGE 05 · FACE MATCH · ACTIVE',
    confidence: '99.1%',
    description: 'Checking whether the detected face matches the photo shown on the document.',
    data: [
      { label: 'FACE POINTS',      value: '68 POINTS' },
      { label: 'FACE MATCH',       value: '99.1%' },
      { label: 'FAKE PHOTO CHECK', value: 'NO FAKE PHOTO DETECTED' },
    ],
  },
  {
    id: 'verified',
    mode: 'verified',
    number: '06',
    label: 'VERIFIED RESULT',
    Icon: CheckCircle2,
    eyebrow: 'VERIFICATION COMPLETE',
    headline: 'Document Verified',
    statusText: 'STAGE 06 · VERIFIED RESULT · ACTIVE',
    confidence: '98.4%',
    description: 'Combining all checks to determine whether the document passes verification.',
    data: [
      { label: 'ALL CHECKS',     value: 'PASSED' },
      { label: 'SECURITY CHECK', value: 'PASSED' },
      { label: 'CHECK TIME',     value: '142ms' },
    ],

  },
];

export const PipelineStackScroll: React.FC = () => {
  const [activeStageId, setActiveStageId] = useState('verified'); // Default to Stage 06

  const activeStage = STAGES.find((s) => s.id === activeStageId) || STAGES[5];
  const activeStageIndex = STAGES.findIndex((s) => s.id === activeStageId);

  const handleAdvance = () => {
    const nextIdx = (activeStageIndex + 1) % STAGES.length;
    setActiveStageId(STAGES[nextIdx].id);
  };

  const handleReset = () => {
    setActiveStageId(STAGES[0].id);
  };

  return (
    <section
      id="verification-pipeline"
      className="relative w-full py-28 sm:py-36 border-t border-white/[0.07] bg-[#07090e] overflow-hidden"
      aria-label="Verification Pipeline"
    >
      {/* ── Soft Deep Slate Ambient Lighting (Extremely Quiet & Restrained) ── */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] rounded-full blur-[160px] pointer-events-none z-0 opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(7,9,14,0) 70%)',
        }}
      />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-12 space-y-16 sm:space-y-20 relative z-10">

        {/* ── 1. Hero Headline & Section Meta (Editorial Discipline) ─────── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-2">
          <div className="space-y-4 max-w-3xl">
            <span className="text-[11px] font-mono tracking-[0.18em] text-[#71717a] uppercase block font-medium">
              [ 01 / VERIFICATION PIPELINE ]
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-medium tracking-[-0.048em] font-sans leading-[0.95] text-[#f8fafc]">
              <span className="font-semibold text-white">One document.</span>
              <br />
              <span className="text-[#71717a] font-normal">Six synchronized<br className="hidden sm:inline" /> inspection stages.</span>
            </h2>
          </div>

          {/* Minimal Live Status Indicator */}
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-xs font-mono text-[#94a3b8] shrink-0 self-start lg:self-end">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="tracking-[0.12em] uppercase text-[10.5px] font-medium text-[#cbd5e1]">
              {activeStage.statusText}
            </span>
          </div>
        </div>

        {/* ── 2. Editorial Timeline Navigation Bar (Unboxed & Continuous) ──── */}
        <div className="relative border-b border-white/[0.08] pb-1">
          <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto select-none scrollbar-none">
            {STAGES.map((stage) => {
              const isActive = stage.id === activeStageId;
              const IconComponent = stage.Icon;
              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStageId(stage.id)}
                  className={`group relative pb-4 px-2 sm:px-4 text-left transition-all duration-300 cursor-pointer flex items-center gap-2.5 sm:gap-3 shrink-0 ${
                    isActive
                      ? 'text-white'
                      : 'text-[#52525b] hover:text-[#a1a1aa]'
                  }`}
                >
                  <span
                    className={`text-[11px] font-mono transition-colors ${
                      isActive ? 'text-blue-400 font-medium' : 'text-[#52525b] group-hover:text-[#71717a]'
                    }`}
                  >
                    {stage.number}
                  </span>
                  <span className="text-xs sm:text-[13px] font-sans font-medium tracking-normal uppercase whitespace-nowrap">
                    {stage.label}
                  </span>

                  <IconComponent
                    className={`w-3.5 h-3.5 shrink-0 transition-all duration-300 ${
                      isActive ? 'text-blue-400 scale-105 opacity-100' : 'opacity-25 group-hover:opacity-60'
                    }`}
                  />

                  {/* Active Hairline Underline Bar (Precise & Spring-Animated) */}
                  {isActive && (
                    <motion.div
                      layoutId="editorialTimelineBar"
                      className="absolute inset-x-0 bottom-[-1px] h-[2px] bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                      transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. The Core Verification Experience: ONE LARGE PREMIUM OFF-WHITE PIPELINE SURFACE ── */}
        <div className="relative rounded-[28px] sm:rounded-[32px] bg-gradient-to-b from-[#F7F6F2] via-[#F4F3EF] to-[#ECEAE4] border border-black/[0.08] shadow-[0_36px_90px_-20px_rgba(0,0,0,0.85),0_16px_36px_-10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.9)] p-6 sm:p-10 lg:p-12 xl:p-16 transition-all duration-500">
          
          {/* Subtle Hairline Specular Sheen across top edge of the light canvas */}
          <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

          {/* 12-Column Grid inside the single light visual field */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">

            {/* LEFT 7 COLUMNS: Deep Matte Black Passport Specimen directly on the off-white sheet */}
            <div className="lg:col-span-7 flex justify-center items-center relative py-2 sm:py-4">
              <MasterPassportDocument
                mode={activeStage.mode}
                className="w-full max-w-[580px] relative z-10 transition-transform duration-700 ease-out"
                tiltEffect={true}
              />
            </div>

            {/* RIGHT 5 COLUMNS: Editorial Dark Typographic Composition */}
            <div className="lg:col-span-5 flex flex-col justify-center min-h-[440px]">
              <motion.div
                key={activeStage.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8"
              >
                {/* Understated Category Eyebrow */}
                <div className="flex items-center gap-2.5">
                  {activeStage.id === 'verified' ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                  <span className="text-xs font-mono font-medium tracking-[0.16em] text-[#6B6B6B] uppercase">
                    {activeStage.eyebrow}
                  </span>
                </div>

                {/* Main Stage Headline & Generous Description */}
                <div className="space-y-3">
                  <h3 className="text-3xl sm:text-4xl md:text-[2.65rem] font-semibold text-[#08090C] tracking-[-0.035em] font-sans leading-[1.08]">
                    {activeStage.headline}
                  </h3>
                  <p className="text-base sm:text-lg text-[#454545] font-normal leading-[1.55] max-w-lg">
                    {activeStage.description}
                  </p>
                </div>

                {/* Technical Annotations & Tabular Verification Confidence */}
                <div className="pt-6 border-t border-black/[0.10] space-y-6">
                  {/* Verification Confidence Row */}
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-mono tracking-[0.14em] text-[#6B6B6B] uppercase font-medium">
                      VERIFICATION CONFIDENCE
                    </span>
                    <span className="text-3xl sm:text-4xl font-mono font-semibold text-[#08090C] num-tabular tracking-tight">
                      {activeStage.confidence}
                    </span>
                  </div>

                  {/* Clean Hairline Key-Value Rows */}
                  <div className="space-y-3 pt-2">
                    {activeStage.data.map((item) => (
                      <div
                        key={item.label}
                        className="flex justify-between items-center py-2.5 border-b border-black/[0.08] transition-colors hover:border-black/[0.16]"
                      >
                        <span className="text-xs font-mono tracking-[0.1em] uppercase text-[#6B6B6B]">
                          {item.label}
                        </span>
                        <span className="text-sm font-sans font-medium text-[#08090C] num-tabular tracking-tight">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action CTA Buttons (Crafted Solid Dark Buttons with Light Text) */}
                <div className="pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
                  {/* Primary ADVANCE STAGE Button */}
                  <button
                    onClick={handleAdvance}
                    className="group relative px-8 py-3.5 rounded-full bg-[#08090C] text-white hover:bg-[#1c1e24] text-xs font-sans font-medium tracking-[0.08em] uppercase flex items-center gap-3 transition-all duration-300 cursor-pointer shadow-[0_4px_14px_-2px_rgba(0,0,0,0.35)] hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.45)] hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-400 transition-transform duration-500 group-hover:rotate-180" />
                    <span>{activeStageId === 'verified' ? 'CHECK AGAIN' : 'ADVANCE STAGE'}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 text-blue-400" />
                  </button>

                  {/* Secondary RE-EXAMINE Button */}
                  <button
                    onClick={handleReset}
                    className="px-6 py-3.5 rounded-full border border-black/[0.14] hover:border-black/[0.3] bg-transparent hover:bg-black/[0.04] text-xs font-sans font-medium tracking-[0.08em] text-[#454545] hover:text-[#08090C] uppercase transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                  >
                    RE-EXAMINE
                  </button>
                </div>
              </motion.div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};


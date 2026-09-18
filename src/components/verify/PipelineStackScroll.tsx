import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { MasterPassportDocument } from '../document/MasterPassportDocument';
import type { DocumentInspectionMode } from '../document/MasterPassportDocument';
import { ArtifactViewer } from './ArtifactViewer';
import { useDocprove } from '../../context/DocproveVerificationContext';
import { getArtifactUrl } from '../../services/api';
import type { ScanResult } from '../../types/scan';

// ─── 6 Stage Definitions ───────────────────────────────────────────────────

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
  showArtifacts?: boolean;
}

function buildStages(result: ScanResult | null): StageConfig[] {
  if (!result) {
    // Default demo stages when no scan result
    return [
      {
        id: 'optical',
        mode: 'optical',
        number: '01',
        label: 'DOCUMENT CHECK',
        Icon: Search,
        eyebrow: 'DOCUMENT QUALITY',
        headline: 'Document Alignment & Quality',
        statusText: 'STAGE 01 · DOCUMENT CHECK',
        confidence: '—',
        description: 'Upload a document to begin the verification pipeline.',
        data: [
          { label: 'STATUS', value: 'AWAITING DOCUMENT' },
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
        statusText: 'STAGE 02 · TEXT READING',
        confidence: '—',
        description: 'Upload a document to extract text information.',
        data: [],
      },
      {
        id: 'validation',
        mode: 'validation',
        number: '03',
        label: 'DETAIL CHECK',
        Icon: ShieldCheck,
        eyebrow: 'DOCUMENT DETAILS',
        headline: 'Checking Document Details',
        statusText: 'STAGE 03 · DETAIL CHECK',
        confidence: '—',
        description: 'Upload a document to validate document details.',
        data: [],
      },
      {
        id: 'tampering',
        mode: 'tampering',
        number: '04',
        label: 'TAMPERING CHECK',
        Icon: Binary,
        eyebrow: 'TAMPERING CHECK',
        headline: 'Checking for Alterations',
        statusText: 'STAGE 04 · TAMPERING CHECK',
        confidence: '—',
        description: 'Upload a document to check for tampering.',
        data: [],
      },
      {
        id: 'face',
        mode: 'face',
        number: '05',
        label: 'FACE MATCH',
        Icon: UserCheck,
        eyebrow: 'FACE MATCH',
        headline: 'Checking the Face',
        statusText: 'STAGE 05 · FACE MATCH',
        confidence: '—',
        description: 'Upload a document to check face verification.',
        data: [],
      },
      {
        id: 'verified',
        mode: 'verified',
        number: '06',
        label: 'VERIFIED RESULT',
        Icon: CheckCircle2,
        eyebrow: 'VERIFICATION RESULT',
        headline: 'Verification Result',
        statusText: 'STAGE 06 · RESULT',
        confidence: '—',
        description: 'Upload a document to see the final verification result.',
        data: [],
      },
    ];
  }

  // ── Build stages from real backend data ──

  const ex = result.extracted;
  const ocrFields: { label: string; value: string }[] = [];
  const fieldMapping: Record<string, string> = {
    surname: 'SURNAME',
    given_name: 'GIVEN NAMES',
    name: 'FULL NAME',
    passport_no: 'PASSPORT NO.',
    visa_no: 'VISA NO.',
    nationality: 'NATIONALITY',
    dob: 'DATE OF BIRTH',
    expiry: 'DATE OF EXPIRY',
    issue: 'DATE OF ISSUE',
    sex: 'SEX',
    place_of_birth: 'PLACE OF BIRTH',
    place_of_issue: 'PLACE OF ISSUE',
    visa_type: 'VISA TYPE',
    valid_from: 'VALID FROM',
    valid_until: 'VALID UNTIL',
  };

  for (const [key, label] of Object.entries(fieldMapping)) {
    if (ex[key]) {
      ocrFields.push({ label, value: ex[key] });
    }
  }
  if (ocrFields.length === 0) {
    ocrFields.push({ label: 'STATUS', value: 'NO FIELDS EXTRACTED' });
  }

  // Validation data
  const valChecks = result.validation?.checks || [];
  const valFailed = result.validation?.failed || 0;
  const valWarnings = result.validation?.warnings || 0;
  const valPassed = valChecks.filter(c => c.status === 'pass').length;

  const validationData: { label: string; value: string }[] = [
    { label: 'CHECKS PASSED', value: String(valPassed) },
    { label: 'CHECKS FAILED', value: String(valFailed) },
    { label: 'WARNINGS', value: String(valWarnings) },
  ];

  // MRZ data
  if (result.mrz.present) {
    validationData.push({
      label: 'MRZ STATUS',
      value: result.mrz.format_ok ? 'VALID FORMAT' : 'FORMAT ISSUE',
    });
    const mismatches = result.mrz.mismatches || [];
    if (mismatches.length > 0) {
      validationData.push({
        label: 'MRZ MISMATCHES',
        value: String(mismatches.length),
      });
    }
  } else {
    validationData.push({
      label: 'MRZ STATUS',
      value: result.doc_type === 'passport' ? 'NOT DETECTED' : 'NOT APPLICABLE',
    });
  }

  // Tampering data
  const tamperFindings = result.tampering?.findings || [];
  const tamperData: { label: string; value: string }[] = [
    { label: 'INTEGRITY', value: result.tampering.tampered ? 'FINDINGS DETECTED' : 'CLEAR' },
    { label: 'FINDINGS', value: String(tamperFindings.length) },
  ];
  for (const f of tamperFindings.slice(0, 2)) {
    tamperData.push({ label: f.label.toUpperCase(), value: f.severity.toUpperCase() });
  }

  // Face data
  const faceStatus = result.face?.status || 'not_attempted';
  const faceData: { label: string; value: string }[] = [];
  if (faceStatus === 'not_attempted') {
    faceData.push(
      { label: 'STATUS', value: 'NOT ATTEMPTED' },
      { label: 'REASON', value: 'No live capture provided' },
    );
  } else if (faceStatus === 'match') {
    faceData.push(
      { label: 'STATUS', value: 'MATCH' },
      { label: 'SCORE', value: `${result.face.score}/100` },
    );
  } else if (faceStatus === 'mismatch') {
    faceData.push(
      { label: 'STATUS', value: 'MISMATCH' },
      { label: 'SCORE', value: `${result.face.score}/100` },
    );
  } else {
    faceData.push(
      { label: 'STATUS', value: 'INCONCLUSIVE' },
      { label: 'SCORE', value: result.face.score ? `${result.face.score}/100` : 'N/A' },
    );
  }

  // Risk / Result data
  const checklist = result.risk?.checklist || {};
  const checklistLabels: Record<string, string> = {
    ocr_validation: 'OCR VALIDATION',
    mrz_validation: 'MRZ VALIDATION',
    tampering_detection: 'TAMPERING DETECTION',
    face_verification: 'FACE VERIFICATION',
    multiple_identity: 'MULTIPLE IDENTITY',
  };
  const resultData: { label: string; value: string }[] = [
    { label: 'STATUS', value: result.risk.status },
    { label: 'RISK SCORE', value: `${result.risk.score}/100` },
  ];
  for (const [key, label] of Object.entries(checklistLabels)) {
    if (checklist[key]) {
      resultData.push({ label, value: checklist[key] });
    }
  }

  return [
    {
      id: 'optical',
      mode: 'optical',
      number: '01',
      label: 'DOCUMENT CHECK',
      Icon: Search,
      eyebrow: 'DOCUMENT QUALITY',
      headline: 'Document Alignment & Quality',
      statusText: 'STAGE 01 · DOCUMENT CHECK',
      confidence: '100%',
      description: 'Document image loaded and quality verified for analysis.',
      data: [
        { label: 'DOCUMENT TYPE', value: result.doc_type.toUpperCase() },
        { label: 'IMAGE SIZE', value: `${result.image_size[0]} × ${result.image_size[1]}` },
        { label: 'SCAN ID', value: result.scan_id.toUpperCase() },
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
      statusText: 'STAGE 02 · TEXT READING',
      confidence: `${result.ocr.mean_confidence.toFixed(1)}%`,
      description: 'Extracted document text fields using neural OCR.',
      data: [
        { label: 'OCR CONFIDENCE', value: `${result.ocr.mean_confidence.toFixed(1)}%` },
        ...ocrFields.slice(0, 5),
      ],
    },
    {
      id: 'validation',
      mode: 'validation',
      number: '03',
      label: 'DETAIL CHECK',
      Icon: ShieldCheck,
      eyebrow: 'DOCUMENT DETAILS',
      headline: 'Checking Document Details',
      statusText: 'STAGE 03 · DETAIL CHECK',
      confidence: valFailed === 0 ? '100%' : `${Math.round((valPassed / Math.max(1, valChecks.length)) * 100)}%`,
      description: 'Validated document structure, field consistency, and MRZ check digits.',
      data: validationData,
    },
    {
      id: 'tampering',
      mode: 'tampering',
      number: '04',
      label: 'TAMPERING CHECK',
      Icon: Binary,
      eyebrow: 'TAMPERING CHECK',
      headline: 'Checking for Alterations',
      statusText: 'STAGE 04 · TAMPERING CHECK',
      confidence: result.tampering.tampered ? `${tamperFindings.length} FINDING${tamperFindings.length !== 1 ? 'S' : ''}` : 'CLEAR',
      description: 'Inspected document for ELA, noise, chroma, and re-compression anomalies.',
      data: tamperData,
      showArtifacts: true,
    },
    {
      id: 'face',
      mode: 'face',
      number: '05',
      label: 'FACE MATCH',
      Icon: UserCheck,
      eyebrow: 'FACE VERIFICATION',
      headline: 'Face Verification',
      statusText: 'STAGE 05 · FACE MATCH',
      confidence: faceStatus === 'match' ? `${result.face.score}%` : 'N/A',
      description: faceStatus === 'not_attempted'
        ? 'No live capture image was provided for face comparison.'
        : result.face.detail || 'Face verification completed.',
      data: faceData,
    },
    {
      id: 'verified',
      mode: 'verified',
      number: '06',
      label: 'VERIFIED RESULT',
      Icon: result.risk.status === 'CLEAR' ? CheckCircle2
        : result.risk.status === 'SUSPICIOUS' ? AlertTriangle
        : XCircle,
      eyebrow: 'AUTOMATED SCREENING COMPLETE',
      headline: result.risk.status === 'CLEAR' ? 'Screening Complete — Clear'
        : result.risk.status === 'SUSPICIOUS' ? 'Screening Complete — Review Recommended'
        : 'Screening Complete — High Risk',
      statusText: 'STAGE 06 · RESULT',
      confidence: `${result.risk.score}/100`,
      description: result.risk.summary || result.risk.action || 'Automated screening complete.',
      data: resultData,
    },
  ];
}

// ── Sub-component: Premium Individual Stage Navigation Card ─────────────
interface StageNavCardProps {
  stage: StageConfig;
  isActive: boolean;
  onClick: () => void;
}

const StageNavCard: React.FC<StageNavCardProps> = ({ stage, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [cursorOffset, setCursorOffset] = useState({ x: 0, y: 0 });
  const IconComponent = stage.Icon;

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setCursorOffset({
      x: Math.max(-1.5, Math.min(1.5, x * 1.5)),
      y: Math.max(-1.5, Math.min(1.5, y * 1.5)),
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCursorOffset({ x: 0, y: 0 });
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      title={stage.label}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        y: isHovered ? -2.5 + cursorOffset.y * 0.4 : 0,
        x: isHovered ? cursorOffset.x * 0.5 : 0,
      }}
      transition={{
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        backgroundColor: isActive
          ? 'var(--stage-active-bg, rgba(18, 24, 38, 0.95))'
          : isHovered
            ? 'var(--stage-hover-bg, rgba(16, 21, 33, 0.85))'
            : 'var(--stage-bg, rgba(11, 15, 23, 0.65))',
        borderColor: isActive
          ? '#3B82F6'
          : isHovered
            ? 'var(--border-highlight)'
            : 'var(--border-hairline)',
        boxShadow: isActive
          ? '0 6px 16px -4px rgba(0, 0, 0, 0.25)'
          : 'none',
      }}
      className={`group relative min-h-9 flex-1 min-w-0 py-2 px-1 sm:px-3.5 rounded-[12px] border text-left transition-all duration-300 cursor-pointer flex items-center justify-center sm:justify-start gap-1 sm:gap-2.5 overflow-hidden select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400/30 rainbow-hover-target ${
        isActive ? 'text-[#f8fafc] light:text-[#0f172a]' : 'text-[#71717a] light:text-[#475569] hover:text-[#d4d4d8] light:hover:text-[#0f172a]'
      }`}
    >
      {/* Subtle Light Sweep Across Surface on Hover */}
      <motion.div
        aria-hidden="true"
        initial={{ x: '-160%' }}
        animate={{ x: isHovered ? '240%' : '-160%' }}
        transition={{
          duration: 0.65,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute inset-0 w-12 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.075] to-transparent pointer-events-none"
      />

      {/* Active Stage Indicator Dot */}
      <span
        className={`text-[9px] sm:text-[11px] font-mono tracking-tight transition-colors duration-300 ${
          isActive
            ? 'text-blue-400 light:text-blue-600 font-semibold'
            : 'text-[#52525b] light:text-[#64748b] group-hover:text-[#8e95a5] light:group-hover:text-[#334155]'
        }`}
      >
        {stage.number}
      </span>

      <span className={`hidden sm:inline text-[11px] sm:text-xs font-sans font-medium tracking-normal uppercase whitespace-nowrap transition-colors duration-300 ${
        isActive ? 'text-white light:text-[#0f172a]' : 'text-[#a1a1aa] light:text-[#475569] group-hover:text-white light:group-hover:text-[#0f172a]'
      }`}>
        {stage.label}
      </span>

      <IconComponent
        className={`w-3.5 h-3.5 shrink-0 transition-all duration-300 ${
          isActive
            ? 'text-blue-400 light:text-blue-600 scale-105 opacity-100'
            : 'text-[#52525b] light:text-[#64748b] opacity-40 group-hover:opacity-80 group-hover:text-[#a1a1aa] light:group-hover:text-[#334155]'
        }`}
      />

      {/* Active Blue Specular Underline Glow Bar */}
      {isActive && (
        <motion.div
          layoutId="stageNavActiveIndicator"
          className="absolute inset-x-2 bottom-0 h-[2px] bg-gradient-to-r from-blue-500/30 via-blue-400 to-blue-500/30 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"
          transition={{ type: 'spring', stiffness: 450, damping: 36 }}
        />
      )}
    </motion.button>
  );
};

export const PipelineStackScroll: React.FC = () => {
  const { scanResult, resetVerification, selectedFile } = useDocprove();
  const [activeStageId, setActiveStageId] = useState('optical');

  const stages = useMemo(() => buildStages(scanResult), [scanResult]);
  const activeStage = stages.find((s) => s.id === activeStageId) || stages[0];
  const activeStageIndex = stages.findIndex((s) => s.id === activeStageId);

  const handleAdvance = () => {
    const nextIdx = (activeStageIndex + 1) % stages.length;
    setActiveStageId(stages[nextIdx].id);
  };

  const handleCheckAgain = () => {
    resetVerification();
    setActiveStageId('optical');
    // Scroll to document intake
    const el = document.getElementById('document-intake');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Determine the accent color for the result stage based on risk status
  const getResultAccent = () => {
    if (!scanResult) return '';
    if (scanResult.risk.status === 'CLEAR') return 'text-emerald-600';
    if (scanResult.risk.status === 'SUSPICIOUS') return 'text-amber-600';
    return 'text-red-600';
  };

  // Determine the document image URL for the left panel
  const documentImageUrl = scanResult?.artifacts?.original
    ? getArtifactUrl(scanResult.artifacts.original)
    : selectedFile?.previewUrl || undefined;

  return (
    <section
      id="verification-pipeline"
      className="relative w-full min-h-0 sm:min-h-[calc(100svh-4.5rem)] flex flex-col justify-center py-4 sm:py-6 lg:py-8 border-t border-white/[0.07] light:border-[#DDDCD7] bg-[#07090e] light:bg-[#F5F4F0] transition-colors duration-500 overflow-hidden"
      aria-label="Verification Pipeline"
    >
      {/* ── Soft Deep Slate Ambient Lighting (Dark Mode Only) ── */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] rounded-full blur-[160px] pointer-events-none z-0 opacity-15 light:hidden"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(7,9,14,0) 70%)',
        }}
      />

      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-8 lg:px-12 space-y-4 sm:space-y-6 lg:space-y-7 relative z-10">

        {/* ── 1. Hero Headline & Section Meta ─────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-6">
          <div className="space-y-1.5 max-w-3xl">
            <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.18em] text-[#71717a] light:text-[#64748b] uppercase block font-medium">
              [ 01 / VERIFICATION PIPELINE ]
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-medium tracking-[-0.04em] font-sans leading-[0.92] text-[#f8fafc] light:text-[#111318]">
              <span className="font-semibold text-white light:text-[#111318]">One document.</span>
              <br />
              <span className="text-[#71717a] light:text-[#555B66] font-normal">Six synchronized inspection stages.</span>
            </h2>
          </div>
        </div>

        {/* ── 2. Stage Navigation Bar ──── */}
        <div className="relative py-1">
          <div className="flex items-center justify-between gap-1 sm:gap-3 overflow-x-auto sm:overflow-visible select-none scrollbar-none py-1">
            {stages.map((stage) => (
              <StageNavCard
                key={stage.id}
                stage={stage}
                isActive={stage.id === activeStageId}
                onClick={() => setActiveStageId(stage.id)}
              />
            ))}
          </div>
        </div>

        {/* ── 3. Core Verification Surface (WARM IVORY #F1F0EB PHYSICAL MATERIAL SURFACE) ── */}
        <div className="relative rounded-2xl sm:rounded-[32px] bg-[#F1F0EB] border border-black/[0.08] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.55),0_12px_32px_-8px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.7)] p-4 sm:p-7 lg:p-8 xl:p-9 transition-colors duration-500 w-full min-h-0 lg:min-h-[560px] lg:h-[580px] flex flex-col justify-between overflow-hidden">

          {/* Extremely Subtle Mineral Paper Surface Sheen */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/[0.02] pointer-events-none" />

          {/* 12-Column Fixed Proportional Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 xl:gap-10 items-stretch h-auto lg:h-full flex-1 relative z-10 min-w-0">

            {/* LEFT 7 COLUMNS: Document Visualization */}
            <div className="lg:col-span-7 flex justify-center items-center relative py-2 h-auto lg:h-full min-h-[220px] sm:min-h-[340px] lg:min-h-[440px] min-w-0">
              {/* Show artifact viewer in tampering stage when artifacts are available */}
              {activeStage.showArtifacts && scanResult?.artifacts && Object.keys(scanResult.artifacts).length > 0 ? (
                <div className="w-[82%] sm:w-full max-w-[500px]">
                  <ArtifactViewer artifacts={scanResult.artifacts} />
                </div>
              ) : documentImageUrl && scanResult ? (
                /* Show the real document image after scan */
                <div className="w-[82%] sm:w-full max-w-[480px] lg:max-w-[500px] relative z-10">
                  <img
                    src={documentImageUrl}
                    alt="Uploaded document"
                    className="w-full h-auto object-contain rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.28)] transition-transform duration-700 ease-out"
                  />
                </div>
              ) : (
                /* Show the demo passport before scan */
                <MasterPassportDocument
                  mode={activeStage.mode}
                  className="w-[82%] sm:w-full max-w-[480px] lg:max-w-[500px] object-contain relative z-10 transition-transform duration-700 ease-out drop-shadow-[0_20px_40px_rgba(0,0,0,0.28)]"
                  tiltEffect={true}
                  scanResult={scanResult}
                />
              )}
            </div>

            {/* RIGHT 5 COLUMNS: Fixed Height Editorial Column with Anchored Controls */}
            <div className="lg:col-span-5 flex flex-col justify-start lg:justify-between h-auto lg:h-full min-h-0 py-0 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStage.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col justify-between h-auto lg:h-full flex-1 min-h-0"
                >
                  {/* Top & Middle Content Group */}
                  <div className="flex flex-col flex-1 min-h-0 gap-2 sm:gap-2.5 lg:gap-3">
                    {/* Understated Category Eyebrow */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {activeStage.id === 'verified' && scanResult ? (
                        scanResult.risk.status === 'CLEAR' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : scanResult.risk.status === 'SUSPICIOUS' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        )
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      )}
                      <span className="text-[10px] sm:text-xs font-mono font-medium tracking-[0.14em] text-[#6B6B6B] uppercase">
                        {activeStage.eyebrow}
                      </span>
                    </div>

                    {/* Main Stage Headline & Description */}
                    <div className="flex flex-col justify-start gap-1 shrink-0">
                      <h3 className={`text-[clamp(1.25rem,1.75vw,1.75rem)] font-semibold tracking-[-0.03em] font-sans leading-[1.05] ${
                        activeStage.id === 'verified' && scanResult ? getResultAccent() : 'text-[#111318]'
                      }`}>
                        {activeStage.headline}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-[#454545] font-normal leading-[1.4] max-w-[540px] break-words mt-0.5">
                        {activeStage.description}
                      </p>
                    </div>

                    {/* Technical Annotations & Tabular Verification Confidence */}
                    <div className="pt-2 sm:pt-2.5 border-t border-[#111318]/10 flex flex-col gap-1.5 sm:gap-2 min-h-0">
                      {/* Verification Confidence Row - Locked to Overall Final Risk Score */}
                      <div className="flex items-baseline justify-between shrink-0">
                        <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.14em] text-[#6B6B6B] uppercase font-medium">
                          RISK SCORE
                        </span>
                        <span className={`text-xl sm:text-2xl font-mono font-semibold num-tabular tracking-tight ${
                          scanResult ? getResultAccent() : 'text-[#111318]'
                        }`}>
                          {scanResult ? `${scanResult.risk.score}/100` : selectedFile ? 'ANALYZING' : '—'}
                        </span>
                      </div>

                      {/* Clean Hairline Key-Value Rows (Editorial Rules - Compact & Non-Clipping) */}
                      <div className="flex flex-col min-w-0">
                        {activeStage.data.map((item, idx) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.25, delay: 0.03 + idx * 0.02, ease: [0.22, 1, 0.36, 1] }}
                            className="flex justify-between items-center py-1 sm:py-1.5 border-b border-[#111318]/10 min-w-0 gap-2 transition-colors hover:border-[#111318]/20"
                          >
                            <span className="text-[9.5px] sm:text-[10.5px] font-mono tracking-[0.08em] uppercase text-[#6B6B6B] shrink-0">
                              {item.label}
                            </span>
                            <span className={`text-[11px] sm:text-xs font-sans font-medium num-tabular tracking-tight text-right min-w-0 break-words ${
                              item.value === 'FAIL' || item.value === 'HIGH' || item.value === 'MISMATCH' || item.value === 'HIGH RISK'
                                ? 'text-red-600'
                                : item.value === 'WARN' || item.value === 'SUSPICIOUS' || item.value === 'MEDIUM'
                                  ? 'text-amber-600'
                                  : 'text-[#111318]'
                            }`}>
                              {item.value}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action CTA Buttons (Anchored Controls) */}
                  <div className="pt-2.5 sm:pt-3 mt-auto flex items-center shrink-0">
                    {/* Primary Button */}
                    <motion.button
                      type="button"
                      onClick={activeStageId === 'verified' ? handleCheckAgain : handleAdvance}
                      whileTap={{ y: 1, scale: 0.985 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="group relative overflow-hidden px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#111318] text-white text-[10.5px] sm:text-[11px] font-sans font-medium tracking-[0.08em] uppercase flex items-center gap-2.5 cursor-pointer border border-white/10 shadow-[0_4px_14px_rgba(0,0,0,0.25)] active:shadow-[0_2px_6px_rgba(0,0,0,0.4)] rainbow-hover-target shrink-0"
                    >
                      {/* Surface Light Sweep Animation on Hover */}
                      <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer" />

                      <RefreshCw className="w-3 h-3 text-blue-400 transition-transform duration-500 group-hover:rotate-180" />
                      <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5">
                        {activeStageId === 'verified' ? 'CHECK AGAIN' : 'ADVANCE STAGE'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-400 transition-all duration-300 group-hover:translate-x-1" />
                    </motion.button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

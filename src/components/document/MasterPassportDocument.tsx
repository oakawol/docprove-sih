import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import fakePassportImg from '../../images/fakepassport.png';
import type { ScanResult } from '../../types/scan';

export type DocumentInspectionMode =
  | 'idle'
  | 'optical'
  | 'ocr'
  | 'validation'
  | 'tampering'
  | 'face'
  | 'verified';

export interface MasterPassportDocumentProps {
  mode?: DocumentInspectionMode;
  className?: string;
  tiltEffect?: boolean;
  scanResult?: ScanResult | null;
}

export const MasterPassportDocument: React.FC<MasterPassportDocumentProps> = ({
  mode = 'idle',
  className = '',
  tiltEffect = true,
  scanResult = null,
}) => {
  // Real data from backend, with fallback to demo values
  const ex = scanResult?.extracted;
  const surname = ex?.surname || 'SHUKLA';
  const givenName = ex?.given_name || 'AVIRAL';
  const passportNo = ex?.passport_no || 'Z48291048';
  const nationality = ex?.nationality || 'INDIAN';
  const dob = ex?.dob || '19 SEP 1998';
  const expiry = ex?.expiry || '11 JAN 2034';
  const mrzLine1 = scanResult?.ocr?.mrz_lines?.[0] || 'P<INDSHUKLA<<AVIRAL<<<<<<<<<<<<<<<<<<<<<<<<';
  const mrzLine2 = scanResult?.ocr?.mrz_lines?.[1] || 'Z482910484IND9809198M3201116<<<<<<<<<<<<<<02';
  const faceStatus = scanResult?.face?.status;
  const faceScore = scanResult?.face?.score;

  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse Coordinates for 3D Parallax (Bounded strictly to max ±2° rotation)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 26, stiffness: 220, mass: 0.7 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [2, -2]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-2, 2]), springConfig);

  // Internal layer differential parallax offsets for authentic optical depth
  const substrateX = useSpring(useTransform(x, [-0.5, 0.5], [-1.5, 1.5]), springConfig);
  const substrateY = useSpring(useTransform(y, [-0.5, 0.5], [-1.5, 1.5]), springConfig);

  const portraitX = useSpring(useTransform(x, [-0.5, 0.5], [-3.5, 3.5]), springConfig);
  const portraitY = useSpring(useTransform(y, [-0.5, 0.5], [-3.5, 3.5]), springConfig);

  const fieldsX = useSpring(useTransform(x, [-0.5, 0.5], [-2.5, 2.5]), springConfig);
  const fieldsY = useSpring(useTransform(y, [-0.5, 0.5], [-2.5, 2.5]), springConfig);

  const overlayX = useSpring(useTransform(x, [-0.5, 0.5], [-4, 4]), springConfig);
  const overlayY = useSpring(useTransform(y, [-0.5, 0.5], [-4, 4]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltEffect || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set((mouseX / rect.width) - 0.5);
    y.set((mouseY / rect.height) - 0.5);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  // Continuous subtle inspection sweep illumination cycle
  const [sweepZone, setSweepZone] = useState<'none' | 'portrait' | 'fields' | 'mrz'>('none');

  useEffect(() => {
    if (mode !== 'idle' && mode !== 'optical') {
      setSweepZone('none');
      return;
    }

    const cycle = setInterval(() => {
      setTimeout(() => setSweepZone('portrait'), 1200);
      setTimeout(() => setSweepZone('fields'), 2500);
      setTimeout(() => setSweepZone('mrz'), 3800);
      setTimeout(() => setSweepZone('none'), 4600);
    }, 5400);

    return () => clearInterval(cycle);
  }, [mode]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: tiltEffect ? '1400px' : 'none' }}
      className={`relative w-full max-w-[560px] mx-auto select-none ${className}`}
    >
      {/* ── DEEP MATTE BLACK PASSPORT DOCUMENT (HERO OBJECT) ── */}
      <motion.div
        style={tiltEffect ? { rotateX, rotateY } : {}}
        className="relative aspect-[1.42/1] rounded-xl sm:rounded-2xl overflow-hidden bg-[#090b10] bg-guilloche bg-passport-fine-print border border-black/50 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.35),0_10px_24px_-6px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.08)] p-4 sm:p-6 flex flex-col justify-between transition-shadow duration-500 hover:shadow-[0_32px_65px_-14px_rgba(0,0,0,0.45)]"
      >
        {/* Upper Specular Reflection Line on Document */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.22] to-transparent pointer-events-none z-30" />

        {/* Continuous Optical Laser Scanning Beam */}
        {(mode === 'idle' || mode === 'optical' || mode === 'tampering') && (
          <div className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-400/70 to-transparent opacity-60 animate-slow-optical-sweep pointer-events-none z-30 shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
        )}

        {/* ── STAGE 01: OPTICAL ALIGNMENT GUIDES ── */}
        <AnimatePresence>
          {mode === 'optical' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 pointer-events-none z-20"
            >
              <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-blue-400/60" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-blue-400/60" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-blue-400/60" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-blue-400/60" />
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-[1px] border-t border-dashed border-blue-400/25" />
              <div className="absolute right-4 top-1/2 -translate-y-6 text-[8px] font-mono text-blue-400/70 bg-black/60 px-1.5 py-0.5 rounded border border-blue-400/20">
                0.0° ALIGNED
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── HEADER BAND ── */}
        <motion.div
          style={tiltEffect ? { x: substrateX, y: substrateY } : {}}
          className="relative z-10 flex items-center justify-between pb-3.5 border-b border-white/[0.07]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-amber-400/25 bg-gradient-to-b from-amber-400/10 via-amber-400/5 to-transparent flex items-center justify-center shadow-inner shrink-0">
              <svg className="w-4 h-4 text-amber-300/80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                <path d="M12 3a9 9 0 0 1 0 18M12 3a9 9 0 0 0 0 18M3 12h18" strokeWidth="1" />
              </svg>
            </div>
            <svg width="22" height="14" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" aria-label="India flag" className="shrink-0" style={{ display: 'inline-block', marginLeft: 2 }}>
              <rect width="24" height="16" fill="#FF9933" />
              <rect y="5.333" width="24" height="5.333" fill="#FFFFFF" />
              <rect y="10.666" width="24" height="5.333" fill="#138A2B" />
              <circle cx="12" cy="8" r="3" fill="#054189" />
            </svg>
            <div>
              <p className="text-[9px] font-mono tracking-[0.2em] text-[#8e95a5] uppercase">REPUBLIC OF INDIA</p>
              <p className="text-xs font-semibold text-[#f5f5f7] tracking-wider">PASSPORT</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div title="ICAO Biometric Chip Specimen" className="w-5 h-3.5 rounded border border-amber-300/50 bg-gradient-to-r from-amber-300/20 via-amber-200/35 to-amber-400/20 relative flex items-center justify-center shadow-[0_0_6px_rgba(251,191,36,0.12)]">
              <div className="w-2.5 h-2.5 rounded-full border border-amber-300/70" />
              <div className="absolute inset-x-0 h-0.5 bg-amber-300/70" />
            </div>
            <span className="text-[9px] font-mono text-[#7d869a] tracking-wider">TYPE: P / IND</span>
          </div>
        </motion.div>

        {/* ── PASSPORT DATA BODY ── */}
        <div className="relative z-10 grid grid-cols-12 gap-4 sm:gap-6 items-center my-auto pt-2">
          {/* Portrait Column */}
          <div className="col-span-4">
            <motion.div
              style={tiltEffect ? { x: portraitX, y: portraitY } : {}}
              className={`relative aspect-[3/4] rounded-lg overflow-hidden bg-slate-950/90 border p-1 flex flex-col items-center justify-center transition-all duration-400 ${
                sweepZone === 'portrait' || mode === 'face'
                  ? 'border-teal-400/60 shadow-[0_0_16px_rgba(20,184,166,0.2)]'
                  : 'border-white/[0.12] shadow-[0_0_12px_rgba(0,0,0,0.4)]'
              }`}
            >
              <div className="absolute inset-0 bg-passport-fine-print opacity-20 pointer-events-none z-10" />
              <div className="relative w-full h-full rounded overflow-hidden bg-slate-950 flex items-center justify-center">
                <img src={fakePassportImg} alt="Uploaded Specimen" className="w-full h-full object-cover object-top transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/10 pointer-events-none" />
                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full border border-white/30 bg-black/40 opacity-70 flex items-center justify-center backdrop-blur-xs z-10">
                  <span className="text-[5px] font-mono text-white">IND</span>
                </div>
              </div>

              {/* FACE DETECTION OVERLAY */}
              <AnimatePresence>
                {(mode === 'face' || sweepZone === 'portrait') && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-1 border border-teal-400/70 rounded pointer-events-none flex flex-col justify-between p-1 bg-teal-500/5 z-20"
                  >
                    <div className="flex justify-between items-center text-[7px] font-mono text-teal-300 bg-black/70 px-1 py-0.5 rounded">
                      <span>{faceStatus === 'not_attempted' ? 'N/A' : 'DETECTED'}</span>
                      <span className="text-emerald-400 font-semibold">{faceScore ? `${faceScore}%` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-around items-center px-1 py-2 opacity-80">
                      <div className="w-1 h-1 rounded-full bg-teal-300" />
                      <div className="w-1 h-1 rounded-full bg-teal-300 animate-pulse" />
                      <div className="w-1 h-1 rounded-full bg-teal-300" />
                    </div>
                    <div className="text-center text-[7px] font-mono text-teal-300 font-medium tracking-wider bg-black/70 py-0.5 rounded">
                      {faceStatus === 'match' ? 'MATCH CONFIRMED' : faceStatus === 'not_attempted' ? 'NOT ATTEMPTED' : faceStatus?.toUpperCase() || 'DETECTING'}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Identity Fields Column */}
          <motion.div
            style={tiltEffect ? { x: fieldsX, y: fieldsY } : {}}
            className="col-span-8 space-y-2 text-[11px] font-sans"
          >
            {/* Surname */}
            <div className={`p-1.5 rounded transition-all duration-300 relative ${sweepZone === 'fields' || mode === 'ocr' ? 'bg-blue-500/10 border border-blue-400/40' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-mono text-[#7d869a] uppercase tracking-wider block">SURNAME</span>
                {mode === 'ocr' && <span className="text-[7px] font-mono text-blue-400">99.9%</span>}
              </div>
              <p className="font-bold text-slate-100 tracking-wider text-xs sm:text-sm">{surname}</p>
            </div>

            {/* Given Names */}
            <div className={`p-1.5 rounded transition-all duration-300 ${sweepZone === 'fields' || mode === 'ocr' ? 'bg-blue-500/10 border border-blue-400/40' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-mono text-[#7d869a] uppercase tracking-wider block">GIVEN NAMES</span>
                {mode === 'ocr' && <span className="text-[7px] font-mono text-blue-400">99.8%</span>}
              </div>
              <p className="font-semibold text-slate-200 tracking-wider">{givenName}</p>
            </div>

            {/* Document Number & Nationality */}
            <div className="grid grid-cols-2 gap-2">
              <div className={`p-1.5 rounded transition-all duration-300 ${sweepZone === 'fields' || mode === 'ocr' || mode === 'validation' ? 'bg-blue-500/10 border border-blue-400/40' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono text-[#7d869a] uppercase tracking-wider block">PASSPORT NO.</span>
                  {mode === 'validation' && <span className="text-[7px] font-mono text-emerald-400">VALID</span>}
                </div>
                <p className="font-mono font-semibold text-slate-100 text-xs">{passportNo}</p>
              </div>
              <div className="p-1.5">
                <span className="text-[8px] font-mono text-[#7d869a] uppercase tracking-wider block">NATIONALITY</span>
                <p className="font-semibold text-slate-200">{nationality}</p>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-2">
              <div className={`p-1.5 rounded transition-all duration-300 ${sweepZone === 'fields' || mode === 'ocr' ? 'bg-blue-500/10 border border-blue-400/35' : ''}`}>
                <span className="text-[8px] font-mono text-[#7d869a] uppercase tracking-wider block">DATE OF BIRTH</span>
                <p className="font-mono text-[10px] text-slate-300">{dob}</p>
              </div>
              <div className={`p-1.5 rounded transition-all duration-300 ${sweepZone === 'fields' || mode === 'ocr' || mode === 'validation' ? 'bg-blue-500/10 border border-blue-400/35' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono text-[#7d869a] uppercase tracking-wider block">DATE OF EXPIRY</span>
                  {mode === 'validation' && <span className="text-[7px] font-mono text-emerald-400">UNEXPIRED</span>}
                </div>
                <p className="font-mono text-[10px] text-emerald-400 font-medium">{expiry}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── FORENSIC TAMPERING INSPECTION ── */}
        <AnimatePresence>
          {mode === 'tampering' && (
            <motion.div
              style={tiltEffect ? { x: overlayX, y: overlayY } : {}}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px] p-6 z-25 flex flex-col justify-between border border-blue-400/20"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
                <span>SUBSTRATE ANALYSIS: NOMINAL</span>
                <span className="text-emerald-400">VARIANCE: 0.02%</span>
              </div>
              <div className="w-full h-24 border border-white/[0.08] rounded bg-white/[0.01] grid grid-cols-6 grid-rows-3 gap-1 p-1">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className="border border-white/[0.04] rounded flex items-center justify-center text-[7px] font-mono text-slate-400">
                    PASS
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono text-emerald-400">
                <span>ZERO FORGERY ARTIFACTS</span>
                <span>FONTS UNIFORM</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── VERIFIED AUTHENTICATION EMBOSS SEAL ── */}
        <AnimatePresence>
          {mode === 'verified' && (
            <motion.div
              style={tiltEffect ? { x: overlayX, y: overlayY } : {}}
              initial={{ scale: 1.15, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-1/3 right-8 z-30 px-4 py-2.5 rounded-lg border border-emerald-500/40 bg-black/85 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.15)] text-center pointer-events-none"
            >
              <p className="text-[11px] font-mono font-bold tracking-[0.2em] text-emerald-300 uppercase">
                DOCPROVE • AUTHENTICATED
              </p>
              <p className="text-[8px] font-mono text-emerald-400/80 mt-0.5 tracking-wider">
                ICAO DOC 9303 SECURE VERIFICATION
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── ICAO 9303 MACHINE READABLE ZONE (MRZ) ── */}
        <motion.div
          style={tiltEffect ? { x: fieldsX, y: fieldsY } : {}}
          className={`relative z-10 pt-3 border-t border-white/[0.08] bg-black/45 rounded-lg p-2 font-mono text-[8px] sm:text-[9px] tracking-[0.08em] sm:tracking-[0.2em] leading-relaxed text-slate-300/90 whitespace-pre overflow-x-auto select-all transition-all duration-300 ${
            sweepZone === 'mrz' || mode === 'validation' || mode === 'ocr'
              ? 'border-blue-400/40 bg-blue-950/20 text-blue-200'
              : ''
          }`}
        >
          {isHovered && (
            <span className="text-[7px] font-mono text-slate-500 block mb-0.5">
              [MRZ REGION / CHECKSUM 7-3-1]
            </span>
          )}
          {`${mrzLine1}\n${mrzLine2}`}
        </motion.div>
      </motion.div>
    </div>
  );
};

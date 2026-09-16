import React from 'react';
import { motion } from 'framer-motion';
import { Scan, ShieldAlert, CheckCircle2, UserCheck } from 'lucide-react';

interface HeroDocumentVisualProps {
  scrollYProgress?: any;
}

export const HeroDocumentVisual: React.FC<HeroDocumentVisualProps> = () => {
  return (
    <div className="relative w-full max-w-xl mx-auto select-none">
      {/* Ambient Backlight Glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/10 via-cyan-500/15 to-blue-600/10 rounded-3xl blur-2xl -z-10 opacity-70" />

      {/* Floating Tactical Labels */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="absolute -top-4 -left-4 sm:-left-8 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#080d1a]/90 backdrop-blur-md border border-cyan-500/30 text-[10px] font-mono text-cyan-300 shadow-[0_4px_16px_rgba(0,240,255,0.15)]"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>OCR READY</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="absolute top-12 -right-4 sm:-right-8 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#080d1a]/90 backdrop-blur-md border border-emerald-500/30 text-[10px] font-mono text-emerald-300 shadow-[0_4px_16px_rgba(16,185,129,0.15)]"
      >
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        <span>STRUCTURE CHECK</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="absolute -bottom-4 -left-2 sm:-left-6 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#080d1a]/90 backdrop-blur-md border border-sky-500/30 text-[10px] font-mono text-sky-300 shadow-[0_4px_16px_rgba(56,189,248,0.15)]"
      >
        <ShieldAlert className="w-3 h-3 text-sky-400" />
        <span>SECURITY ANALYSIS</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-10 -right-2 sm:-right-6 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#080d1a]/90 backdrop-blur-md border border-indigo-500/30 text-[10px] font-mono text-indigo-300 shadow-[0_4px_16px_rgba(99,102,241,0.15)]"
      >
        <UserCheck className="w-3 h-3 text-indigo-400" />
        <span>FACE DETECTED</span>
      </motion.div>

      {/* Main Glass Fictional Passport Document */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#0e1628]/95 via-[#0b1222]/95 to-[#070b16]/98 border border-white/[0.12] shadow-[0_24px_64px_-16px_rgba(0,0,0,0.8),0_0_40px_rgba(56,189,248,0.06)] p-6 sm:p-7"
      >
        {/* Document Boundary Detection Corner Reticles */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/80" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/80" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/80" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/80" />

        {/* Optical Forensic Scanning Beam */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f0ff] animate-laser-scan pointer-events-none z-20" />

        {/* Specimen Header Watermark */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
              <Scan className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">SPECIMEN DOCUMENT</p>
              <p className="text-xs font-semibold text-slate-200 tracking-wider">INTERNATIONAL TRAVEL DOCUMENT</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-cyan-300 border border-white/[0.1]">
              ICAO TYPE-3
            </span>
          </div>
        </div>

        {/* Document Body: Photo & Extracted OCR Matrix */}
        <div className="grid grid-cols-12 gap-5 items-center">
          {/* Fictional Portrait Area */}
          <div className="col-span-4 sm:col-span-4">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-900 border border-white/[0.15] flex flex-col items-center justify-center p-2 group">
              {/* Subtle Face Detection Bounding Box */}
              <div className="absolute inset-2 border border-dashed border-cyan-400/60 rounded-lg pointer-events-none" />
              <div className="absolute top-1 left-2 text-[8px] font-mono text-cyan-400 font-bold">
                FACE: 99.1%
              </div>

              {/* Minimal Silhouette Portrait */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-b from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center shadow-inner my-auto">
                <svg className="w-10 h-10 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>

              <div className="w-full text-center mt-1">
                <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block">
                  ALEX MORGAN
                </span>
              </div>
            </div>
          </div>

          {/* OCR Fields & Bounding Boxes */}
          <div className="col-span-8 sm:col-span-8 space-y-2.5">
            {/* Field 1: Full Name */}
            <div className="relative p-2 rounded-lg bg-white/[0.02] border border-cyan-500/20 hover:border-cyan-400/40 transition-colors">
              <span className="absolute -top-1.5 left-2 px-1 bg-[#0a1020] text-[8px] font-mono text-cyan-400">
                OCR_FIELD_NAME
              </span>
              <p className="text-[9px] font-mono text-slate-400 uppercase">FULL NAME</p>
              <p className="text-xs sm:text-sm font-mono font-semibold text-slate-100 tracking-wider">
                ALEX MORGAN
              </p>
            </div>

            {/* Field 2 & 3: Doc Number & Nationality */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative p-2 rounded-lg bg-white/[0.02] border border-white/[0.08]">
                <span className="text-[9px] font-mono text-slate-400 uppercase">DOC NUMBER</span>
                <p className="text-xs font-mono font-semibold text-cyan-200">PX0000000</p>
              </div>
              <div className="relative p-2 rounded-lg bg-white/[0.02] border border-white/[0.08]">
                <span className="text-[9px] font-mono text-slate-400 uppercase">NATIONALITY</span>
                <p className="text-xs font-mono font-semibold text-slate-200">EXAMPLE</p>
              </div>
            </div>

            {/* Field 4 & 5: Dates */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative p-2 rounded-lg bg-white/[0.02] border border-white/[0.08]">
                <span className="text-[9px] font-mono text-slate-400 uppercase">DATE OF BIRTH</span>
                <p className="text-xs font-mono text-slate-300">XX / XX / XXXX</p>
              </div>
              <div className="relative p-2 rounded-lg bg-white/[0.02] border border-white/[0.08]">
                <span className="text-[9px] font-mono text-slate-400 uppercase">EXPIRY DATE</span>
                <p className="text-xs font-mono text-emerald-300">XX / XX / XXXX</p>
              </div>
            </div>
          </div>
        </div>

        {/* MRZ Zone at Bottom */}
        <div className="mt-5 pt-3 border-t border-white/[0.08] bg-black/40 rounded-lg p-2.5 font-mono text-[10px] sm:text-[11px] text-cyan-300/80 tracking-widest leading-relaxed overflow-x-auto whitespace-pre select-all">
          {'P<EXPMORGAN<<ALEX<<<<<<<<<<<<<<<<<<<<<<<\nPX00000005EXP9405201M3405202<<<<<<<<<<<<<<08'}
        </div>

        {/* Micro Telemetry Bar */}
        <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>OPTICAL CALIBRATION: NORMAL</span>
          </div>
          <span>HASH: 8f4a...29c1</span>
        </div>
      </motion.div>
    </div>
  );
};

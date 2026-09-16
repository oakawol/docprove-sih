import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ShieldCheck } from 'lucide-react';
import { HeroDocumentVisual } from './HeroDocumentVisual';

interface HeroSectionProps {
  onStartVerification: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartVerification }) => {
  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Subtle Ambient Radial Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-sky-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Editorial Headline Column */}
        <div className="lg:col-span-6 flex flex-col items-start text-left z-10">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-cyan-300 mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="tracking-widest uppercase text-[11px]">AI POWERED VERIFICATION ENGINE</span>
          </motion.div>

          {/* Huge Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.04] mb-6"
          >
            VERIFY <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
              WHAT MATTERS.
            </span>
          </motion.h1>

          {/* Supporting Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl font-medium text-sky-300 tracking-wide mb-4"
          >
            AI powered passport and visa verification.
          </motion.h2>

          {/* Supporting Paragraph with Restraint */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed mb-8 font-normal"
          >
            Docprove brings OCR extraction, document validation, tampering analysis and face detection into one intelligent verification workflow.
          </motion.p>

          {/* Primary CTA & Secondary Microcopy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto"
          >
            <button
              onClick={onStartVerification}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white text-slate-950 font-semibold text-sm tracking-wider flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:bg-slate-100 hover:shadow-[0_0_35px_rgba(255,255,255,0.4)] transition-all duration-300 cursor-pointer active:scale-[0.98]"
            >
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>START VERIFICATION</span>
            </button>

            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 tracking-widest pl-1 sm:pl-2">
              <span>PASSPORT</span>
              <span>•</span>
              <span>VISA</span>
              <span>•</span>
              <span>IDENTITY DOCUMENTS</span>
            </div>
          </motion.div>
        </div>

        {/* Right Fictional Document Visualization Column */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <HeroDocumentVisual />
        </div>
      </div>

      {/* Subtle Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="mt-16 sm:mt-20 flex justify-center"
      >
        <button
          onClick={onStartVerification}
          className="flex flex-col items-center gap-2 text-slate-400 hover:text-slate-400 text-xs font-mono transition-colors group cursor-pointer"
        >
          <span className="tracking-widest uppercase text-[10px]">EXPLORE SYSTEM</span>
          <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-1 transition-transform text-cyan-400" />
        </button>
      </motion.div>
    </section>
  );
};

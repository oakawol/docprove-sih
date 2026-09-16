import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

interface BottomCTAProps {
  onStartVerification: () => void;
}

export const BottomCTA: React.FC<BottomCTAProps> = ({ onStartVerification }) => {
  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-white/[0.06] text-center overflow-hidden">
      {/* Dramatic Core Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-gradient-to-r from-sky-600/15 to-cyan-500/15 rounded-full blur-[100px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
          [ INITIATE VERIFICATION ]
        </span>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-none">
          READY TO VERIFY?
        </h2>

        <p className="text-base sm:text-lg text-slate-400 font-normal">
          Start with a document.
        </p>

        <div className="pt-4 flex justify-center">
          <button
            onClick={onStartVerification}
            className="px-8 py-4 rounded-xl bg-white text-slate-950 font-semibold text-sm tracking-wider uppercase flex items-center gap-2.5 shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:bg-slate-100 hover:shadow-[0_0_45px_rgba(255,255,255,0.4)] transition-all duration-300 cursor-pointer active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>START VERIFICATION</span>
          </button>
        </div>

        <p className="text-[11px] font-mono text-slate-400 pt-2">
          CLIENT-SIDE SECURE SIMULATION • ZERO DATA LOGGED
        </p>
      </motion.div>
    </section>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Info } from 'lucide-react';

export const SihSection: React.FC = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-white/[0.06]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="rounded-2xl bg-[#090e1c]/80 border border-white/[0.08] p-8 sm:p-10 text-center relative overflow-hidden"
      >
        {/* Subtle Accent Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-[80px] pointer-events-none -z-10" />

        <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sky-400 flex items-center justify-center mx-auto mb-5">
          <Award className="w-6 h-6 stroke-[1.5]" />
        </div>

        <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase block mb-2">
          INDEPENDENT PROTOTYPE
        </span>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">
          SMART INDIA HACKATHON
        </h3>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed mb-6 font-normal">
          Docprove is developed as an SIH project—created by student engineers exploring how artificial intelligence, computer vision, and modern forensic pipelines can streamline passport and visa authenticity verification.
        </p>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs font-mono text-slate-400">
          <Info className="w-3.5 h-3.5 text-sky-400" />
          <span>Factual Prototype Notice • No Official Endorsement Claimed</span>
        </div>
      </motion.div>
    </section>
  );
};

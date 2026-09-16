import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const MakersHero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-left">
      {/* Subtle Glow */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-sky-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-cyan-400 mb-6"
      >
        <Sparkles className="w-3 h-3" />
        <span className="tracking-widest uppercase">BUILT WITH PURPOSE.</span>
      </motion.div>

      {/* Large Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6"
      >
        Meet the makers <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300">
          behind Docprove.
        </span>
      </motion.h1>

      {/* Supporting Text */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal"
      >
        A student built project exploring how AI, computer vision and document intelligence can improve verification workflows.
      </motion.p>
    </section>
  );
};

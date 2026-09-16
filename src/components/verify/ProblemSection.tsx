import React from 'react';
import { motion } from 'framer-motion';

export const ProblemSection: React.FC = () => {
  const phrases = [
    'Modern identity fraud has evolved beyond surface-level visual reproduction.',
    'High-resolution re-encodings, altered micro-typographies, and synthetic facial injections evade casual inspection.',
    'True security requires cross-referencing multiple forensic signals simultaneously.',
  ];

  return (
    <section className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-white/[0.06]">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-sky-900/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
          [ 00 / THE REALITY ]
        </span>
      </motion.div>

      {/* Big Editorial Heading */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8 }}
        className="mb-14 sm:mb-16"
      >
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
          A document can look authentic.{' '}
          <span className="text-slate-400 block mt-2">That doesn't mean it is.</span>
        </h2>
      </motion.div>

      {/* Progressive Phrase Reveals */}
      <div className="space-y-8 sm:space-y-10 max-w-3xl border-l border-white/[0.1] pl-6 sm:pl-8">
        {phrases.map((phrase, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: idx * 0.2 }}
            className="group"
          >
            <p className="text-lg sm:text-xl font-normal text-slate-300 leading-relaxed group-hover:text-white transition-colors">
              {phrase}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Minimal Conclusion Metric Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-16 pt-8 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400"
      >
        <span className="text-cyan-400">MULTI-SIGNAL VERIFICATION PARADIGM</span>
        <span>OPTICAL • STRUCTURAL • FORENSIC • BIOMETRIC</span>
      </motion.div>
    </section>
  );
};

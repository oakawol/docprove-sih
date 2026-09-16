import React from 'react';
import { motion } from 'framer-motion';

export const TechStackSection: React.FC = () => {
  const technologies = [
    { name: 'React 19', domain: 'UI Engine' },
    { name: 'TypeScript', domain: 'Type Integrity' },
    { name: 'Tailwind CSS', domain: 'Design Tokens' },
    { name: 'Framer Motion', domain: 'Physics Motion' },
    { name: 'Lenis', domain: 'Cinematic Scroll' },
    { name: 'Vite', domain: 'Build System' },
    { name: 'Python', domain: 'Model Runtime' },
    { name: 'Computer Vision', domain: 'Edge & Contour' },
    { name: 'OCR Intelligence', domain: 'Glyph Extraction' },
    { name: 'Machine Learning', domain: 'Pattern Synthesis' },
    { name: 'ICAO 9303', domain: 'Document Specs' },
    { name: 'Biometric Vectors', domain: 'Facial Topology' },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-white/[0.06]">
      <div className="mb-12">
        <span className="text-xs font-mono tracking-widest text-slate-400 uppercase block mb-3">
          [ 03 / STACK & CAPABILITIES ]
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Technology & Tooling
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Modular technologies and foundational libraries utilized across research and prototype interfaces.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
        {technologies.map((tech, idx) => (
          <motion.div
            key={tech.name}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05, duration: 0.4 }}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.07] hover:border-sky-500/30 hover:bg-white/[0.04] transition-all flex flex-col justify-between group"
          >
            <span className="text-xs font-mono text-slate-400 group-hover:text-cyan-400 transition-colors uppercase">
              {tech.domain}
            </span>
            <span className="text-sm sm:text-base font-semibold text-white mt-1 group-hover:translate-x-0.5 transition-transform">
              {tech.name}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

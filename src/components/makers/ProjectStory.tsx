import React from 'react';
import { motion } from 'framer-motion';

export const ProjectStory: React.FC = () => {
  const storyPoints = [
    {
      label: 'THE PROBLEM',
      statement: 'Manual document verification can involve multiple fragmented inspection steps.',
      detail: 'Operators must inspect physical papers, manually transcribe details, calculate check digits, and cross-reference records across disparate systems.',
    },
    {
      label: 'THE IDEA',
      statement: 'Bring those steps into one unified intelligent workflow.',
      detail: 'Harness machine vision and neural models to orchestrate automated extraction, structural auditing, and forensic analysis in parallel.',
    },
    {
      label: 'THE SYSTEM',
      statement: 'OCR • VALIDATION • TAMPERING ANALYSIS • FACE DETECTION',
      detail: 'A cohesive four-stage architecture where each layer feeds structured telemetry into the next, generating a defensible authenticity rating.',
    },
    {
      label: 'THE GOAL',
      statement: 'Make document verification more structured, reliable, and efficient.',
      detail: 'Empower border authorities, financial institutions, and security operators with explainable verification signals rather than opaque black boxes.',
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-white/[0.06]">
      <div className="mb-14">
        <span className="text-xs font-mono tracking-widest text-slate-400 uppercase block mb-3">
          [ 01 / NARRATIVE ]
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Project Architecture Story
        </h2>
      </div>

      <div className="space-y-16">
        {storyPoints.map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: idx * 0.1 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-12 border-b border-white/[0.06] last:border-b-0"
          >
            <div className="md:col-span-3">
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                {item.label}
              </span>
            </div>

            <div className="md:col-span-9 space-y-3">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
                {item.statement}
              </h3>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
                {item.detail}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

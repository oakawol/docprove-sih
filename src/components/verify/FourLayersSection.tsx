import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ShieldCheck, Binary, UserCheck } from 'lucide-react';

interface LayerModule {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  signals: string[];
}

const LAYERS: LayerModule[] = [
  {
    number: '01',
    title: 'OCR EXTRACTION',
    subtitle: 'High-Precision Text Matrix',
    description: 'Neural character extraction parsing MRZ zones, visual inspection lines, and localized script fields.',
    icon: FileText,
    signals: ['MRZ Format', 'Visual Zone', 'Latin/Native Script'],
  },
  {
    number: '02',
    title: 'DOCUMENT VALIDATION',
    subtitle: 'Standard & Boundary Integrity',
    description: 'Structural checksum auditing compliant with ICAO 9303 standards and national document geometries.',
    icon: ShieldCheck,
    signals: ['ICAO 9303 Check', 'Check Digit Math', 'Field Parity'],
  },
  {
    number: '03',
    title: 'TAMPERING DETECTION',
    subtitle: 'Forensic Signal Analysis',
    description: 'Micro-structure anomaly detection for digital splicing, font alterations, and compression inconsistencies.',
    icon: Binary,
    signals: ['Font Uniformity', 'Error Level Analysis', 'Artifact Scan'],
  },
  {
    number: '04',
    title: 'FACE DETECTION',
    subtitle: 'Biometric Cross-Reference',
    description: 'Facial boundary localization, landmark extraction, and portrait integrity analysis to prevent photo swap.',
    icon: UserCheck,
    signals: ['Landmark Mesh', 'Portrait Quality', 'Boundary Check'],
  },
];

export const FourLayersSection: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-block px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-cyan-400 mb-4"
        >
          [ THE ARCHITECTURE ]
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white"
        >
          FOUR LAYERS.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-200">
            ONE VERIFICATION.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed max-w-xl mx-auto"
        >
          Every passport and visa is assessed through four synchronized analytical layers to establish verifiable authenticity.
        </motion.p>
      </div>

      {/* Modules Container with Horizontal Progress Line (Desktop) / Vertical (Mobile) */}
      <div className="relative">
        {/* Desktop Progress Line */}
        <div className="hidden lg:block absolute top-[52px] left-[5%] right-[5%] h-[1px] bg-gradient-to-r from-sky-500/20 via-cyan-400/40 to-indigo-500/20 z-0" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {LAYERS.map((layer, idx) => {
            const Icon = layer.icon;
            const isHighlighted = hoveredIdx === idx || (hoveredIdx === null && idx === 0);

            return (
              <motion.div
                key={layer.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`relative rounded-2xl p-6 sm:p-7 flex flex-col transition-all duration-300 ${
                  isHighlighted
                    ? 'bg-[#0c1426]/90 border border-sky-500/35 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(56,189,248,0.12)] -translate-y-1.5'
                    : 'bg-[#080d1a]/60 border border-white/[0.08] hover:border-white/[0.15]'
                }`}
              >
                {/* Node Dot / Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                      isHighlighted
                        ? 'bg-sky-500/20 border border-sky-400/40 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                        : 'bg-white/[0.04] border border-white/[0.08] text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400 tracking-wider">
                    LAYER_{layer.number}
                  </span>
                </div>

                {/* Layer Title */}
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide mb-1">
                  {layer.title}
                </h3>
                <p className="text-xs font-mono text-sky-400/90 mb-3">
                  {layer.subtitle}
                </p>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6 flex-1">
                  {layer.description}
                </p>

                {/* Signal Indicators */}
                <div className="pt-4 border-t border-white/[0.06] flex flex-wrap gap-1.5">
                  {layer.signals.map((sig, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-slate-400"
                    >
                      {sig}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

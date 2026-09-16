import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Code, Cpu, Database, Palette, Search, ExternalLink } from 'lucide-react';

interface MakerProfile {
  id: string;
  name: string;
  role: string;
  discipline: string;
  focus: string;
  icon: React.ElementType;
  initials: string;
}

const FEATURED_MAKER: MakerProfile = {
  id: 'maker-lead',
  name: 'Lead Architect & Systems Engineer',
  role: 'SYSTEMS ARCHITECTURE & PRODUCT DESIGN',
  discipline: 'CORE INFRASTRUCTURE',
  focus: 'Directs the overarching verification state machine, client-side motion physics, and cryptographic record generation.',
  icon: Code,
  initials: 'LA',
};

const STUDIO_MAKERS: MakerProfile[] = [
  {
    id: 'maker-ai',
    name: 'Computer Vision Engineer',
    role: 'AI / OCR INTELLIGENCE',
    discipline: 'OPTICAL RECOGNITION',
    focus: 'Designs neural bounding-box anchors, MRZ parsing parsers, and character confidence matrices.',
    icon: Cpu,
    initials: 'CV',
  },
  {
    id: 'maker-forensics',
    name: 'Forensic Research Specialist',
    role: 'SECURITY & TAMPERING ANALYSIS',
    discipline: 'IMAGE FORENSICS',
    focus: 'Researches error-level analysis, typographic glyph alignment, and compression noise signatures.',
    icon: Database,
    initials: 'FS',
  },
  {
    id: 'maker-standards',
    name: 'ICAO Standards Researcher',
    role: 'COMPLIANCE & SPECIFICATIONS',
    discipline: 'TRAVEL DOCUMENT STANDARDS',
    focus: 'Validates MRZ 7-3-1 weight algorithms against international civil aviation document criteria.',
    icon: Search,
    initials: 'IS',
  },
  {
    id: 'maker-ui',
    name: 'Interaction Designer',
    role: 'DESIGN SYSTEMS & MOTION',
    discipline: 'HUMAN INTERFACES',
    focus: 'Crafts spatial rhythm, dark luxury materials, micro-animations, and accessible tactile feedback.',
    icon: Palette,
    initials: 'ID',
  },
];

export const MakersPage: React.FC = () => {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setHoveredCardId(id);
  };

  return (
    <div className="w-full pt-28 sm:pt-36 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-36">
      {/* ──────────────────────────────────────────────────────────── */}
      {/* HERO: EDITORIAL STUDIO OPENING */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="text-left max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-[#8e95a5] mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400/80 animate-soft-pulse" />
          <span className="tracking-[0.2em] uppercase">STUDIO & PRODUCT TEAM</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.045em] text-[#f5f5f7] leading-[1.04] mb-6"
        >
          The people <br />
          behind Docprove.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg text-[#8e95a5] max-w-2xl leading-[1.55] font-normal"
        >
          An independent student engineering group researching how computer vision, forensic heuristics, and thoughtful design can eliminate friction in document security.
        </motion.p>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* VISUAL PROJECT STORY: EDITORIAL TYPOGRAPHY */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="pt-20 border-t border-white/[0.06] space-y-20">
        <div className="space-y-4">
          <span className="text-xs font-mono tracking-widest text-[#565f73] uppercase block">
            [ 01 / PROJECT PHILOSOPHY ]
          </span>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-3"
          >
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.04em] text-[#f5f5f7] leading-[1.05]">
              Documents are complicated.
            </h2>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.04em] text-slate-500 leading-[1.05]">
              Verification shouldn't be.
            </h2>
          </motion.div>
        </div>

        {/* The Docprove Four-Pillar System */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/[0.06]">
          {[
            { tag: '01', title: 'OCR', desc: 'Precise extraction of identity fields and machine-readable text.', color: 'text-cyan-400' },
            { tag: '02', title: 'VALIDATION', desc: 'Mathematical parity check digit auditing against ICAO standards.', color: 'text-blue-400' },
            { tag: '03', title: 'FORENSICS', desc: 'Micro-structural analysis of glyph weight and compression.', color: 'text-purple-400' },
            { tag: '04', title: 'FACE', desc: 'Biometric landmark localization and facial boundary integrity.', color: 'text-teal-400' },
          ].map((pillar) => (
            <div key={pillar.title} className="space-y-2 group cursor-default">
              <span className={`text-[10px] font-mono ${pillar.color} uppercase block`}>{pillar.tag}</span>
              <h3 className="text-lg sm:text-xl font-semibold text-white tracking-normal group-hover:text-white transition-colors">{pillar.title}</h3>
              <p className="text-xs text-[#8e95a5] leading-[1.5]">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* ASYMMETRIC TEAM SECTION: DESIGN STUDIO PROFILES */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="pt-20 border-t border-white/[0.06] space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono tracking-widest text-[#565f73] uppercase block mb-2">
              [ 02 / THE MAKERS ]
            </span>
            <h2 className="text-2xl sm:text-4xl font-semibold text-white tracking-[-0.03em]">
              Engineering & Design Studio
            </h2>
          </div>
          <p className="text-xs font-mono text-[#565f73]">PROTOTYPE CADRE • 2026</p>
        </div>

        {/* Asymmetrical Grid: Large Featured Card on Left/Top, Secondary on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Featured Lead Architect Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            onMouseMove={(e) => handleCardMouseMove(e, FEATURED_MAKER.id)}
            onMouseLeave={() => setHoveredCardId(null)}
            className="relative lg:col-span-5 surface-card rounded-3xl p-8 sm:p-10 flex flex-col justify-between border border-white/[0.08] hover:border-white/[0.16] transition-all duration-300 group overflow-hidden"
          >
            {/* Cursor-Following Radial Highlight */}
            {hoveredCardId === FEATURED_MAKER.id && (
              <div
                style={{
                  background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.06), transparent 80%)`,
                }}
                className="absolute inset-0 pointer-events-none z-0"
              />
            )}

            <div className="relative z-10">
              {/* Monochromatic Studio Portrait Placeholder Frame */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#090d18] border border-white/[0.08] mb-8 flex flex-col items-center justify-center group-hover:border-white/[0.15] transition-colors">
                <div className="w-20 h-20 rounded-full bg-white/[0.04] border border-white/[0.1] flex items-center justify-center text-slate-400 group-hover:scale-108 transition-transform duration-500">
                  <Code className="w-9 h-9 stroke-[1.5]" />
                </div>
                <span className="text-[10px] font-mono text-[#565f73] absolute bottom-4 tracking-widest">
                  [ PORTRAIT SPECIMEN • {FEATURED_MAKER.initials} ]
                </span>
              </div>

              <span className="text-[10px] font-mono text-blue-400 tracking-widest uppercase block mb-2">
                {FEATURED_MAKER.role}
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight mb-3">
                {FEATURED_MAKER.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#8e95a5] leading-relaxed mb-6">
                {FEATURED_MAKER.focus}
              </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-[#565f73]">
              <span>DISCIPLINE</span>
              <span className="text-slate-300">{FEATURED_MAKER.discipline}</span>
            </div>
          </motion.div>

          {/* Secondary Team Members Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {STUDIO_MAKERS.map((maker, idx) => {
              const Icon = maker.icon;
              const isHovered = hoveredCardId === maker.id;

              return (
                <motion.div
                  key={maker.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  onMouseMove={(e) => handleCardMouseMove(e, maker.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  className="relative surface-card rounded-2xl p-6 flex flex-col justify-between border border-white/[0.06] hover:border-white/[0.15] transition-all duration-300 group overflow-hidden"
                >
                  {/* Cursor-Following Radial Highlight */}
                  {isHovered && (
                    <div
                      style={{
                        background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.06), transparent 80%)`,
                      }}
                      className="absolute inset-0 pointer-events-none z-0"
                    />
                  )}

                  <div className="relative z-10">
                    {/* Compact Portrait Frame with scale on hover */}
                    <div className="aspect-video rounded-xl bg-[#090d18] border border-white/[0.06] mb-5 flex items-center justify-center overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-5 h-5 stroke-[1.5]" />
                      </div>
                    </div>

                    <span className="text-[9px] font-mono text-[#8e95a5] tracking-widest uppercase block mb-1.5">
                      {maker.role}
                    </span>
                    <h4 className="text-base font-bold text-white tracking-wide mb-2 flex items-center justify-between">
                      <span>{maker.name}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <p className="text-xs text-[#8e95a5] leading-relaxed mb-4">
                      {maker.focus}
                    </p>
                  </div>

                  <div className="relative z-10 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[9px] font-mono text-[#565f73]">
                    <span>DISCIPLINE</span>
                    <span className="text-slate-300">{maker.discipline}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MINIMAL HORIZONTAL TECHNOLOGY MARQUEE / LIST */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="pt-20 border-t border-white/[0.06] space-y-8">
        <div className="flex justify-between items-end">
          <span className="text-xs font-mono tracking-widest text-[#565f73] uppercase">
            [ 03 / TECHNOLOGY & SPECIFICATIONS ]
          </span>
          <span className="text-xs font-mono text-[#565f73]">MODULAR STACK</span>
        </div>

        <div className="py-6 border-y border-white/[0.06] flex flex-wrap items-center justify-between gap-6 text-xs font-mono text-[#7d869a]">
          {[
            'REACT 19',
            'TYPESCRIPT',
            'COMPUTER VISION',
            'ICAO 9303 STANDARDS',
            'NEURAL EMBEDDINGS',
            'FRAMER MOTION',
            'LENIS SCROLL',
            'VITE ENGINE',
          ].map((tech) => (
            <span key={tech} className="hover:text-white transition-colors duration-200 cursor-default">
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* SMART INDIA HACKATHON STATEMENT */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="pt-20 border-t border-white/[0.06]">
        <div className="surface-card rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto border border-white/[0.07] space-y-6">
          <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto text-slate-300">
            <Award className="w-5 h-5 stroke-[1.5]" />
          </div>

          <div>
            <span className="text-[10px] font-mono text-[#565f73] uppercase tracking-widest block mb-2">
              PROJECT CONTEXT
            </span>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Smart India Hackathon Prototype
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-[#8e95a5] leading-relaxed max-w-xl mx-auto font-normal">
            Docprove is developed as an independent prototype exploring modern computer vision and document intelligence heuristics. Built by student engineers without commercial or governmental endorsements.
          </p>

          <div className="pt-2 text-[10px] font-mono text-[#565f73]">
            AUTONOMOUS PROTOTYPE • OPEN SPECIFICATIONS
          </div>
        </div>
      </section>
    </div>
  );
};

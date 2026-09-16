import React from 'react';
import { motion } from 'framer-motion';
import { Code, Database, Cpu, Search, Palette } from 'lucide-react';

interface TeamMember {
  id: string;
  namePlaceholder: string;
  role: string;
  categoryIcon: React.ElementType;
  description: string;
  initials: string;
}

const MAKERS: TeamMember[] = [
  {
    id: 'member-1',
    namePlaceholder: 'Team Member 01',
    role: 'FRONTEND ENGINEER & UI/UX',
    categoryIcon: Code,
    description: 'Specializes in responsive frontend architecture, cinematic motion systems, and accessible client-side state design.',
    initials: 'FE',
  },
  {
    id: 'member-2',
    namePlaceholder: 'Team Member 02',
    role: 'AI / ML ENGINEER',
    categoryIcon: Cpu,
    description: 'Focuses on optical character recognition pipelines, neural boundary localization, and biometric landmark vectors.',
    initials: 'ML',
  },
  {
    id: 'member-3',
    namePlaceholder: 'Team Member 03',
    role: 'BACKEND & FORENSIC SYSTEMS',
    categoryIcon: Database,
    description: 'Researches document integrity algorithms, EXIF header verification, and micro-tampering anomaly detection.',
    initials: 'BE',
  },
  {
    id: 'member-4',
    namePlaceholder: 'Team Member 04',
    role: 'RESEARCH & COMPLIANCE',
    categoryIcon: Search,
    description: 'Investigates international travel document standards (ICAO 9303), MRZ syntax parity, and anti-spoofing criteria.',
    initials: 'RC',
  },
  {
    id: 'member-5',
    namePlaceholder: 'Team Member 05',
    role: 'PRODUCT & INTERACTION DESIGN',
    categoryIcon: Palette,
    description: 'Crafts design tokens, typographic hierarchy, spatial rhythm, and architectural glass interfaces for critical operators.',
    initials: 'PD',
  },
];

export const TeamSection: React.FC = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/[0.06]">
      <div className="mb-14">
        <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase block mb-3">
          [ 02 / THE BUILDERS ]
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          THE MAKERS
        </h2>
        <p className="text-sm text-slate-400 mt-2 max-w-xl">
          An engineering and research group focused on document intelligence, security heuristics, and modern human-computer interaction.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {MAKERS.map((maker, idx) => {
          const Icon = maker.categoryIcon;

          return (
            <motion.div
              key={maker.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group relative rounded-2xl bg-[#0a0f1d]/80 border border-white/[0.08] hover:border-sky-500/35 p-6 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8),0_0_25px_rgba(56,189,248,0.1)]"
            >
              {/* Photo / Avatar Placeholder */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gradient-to-b from-[#0e1628] to-[#080d1a] border border-white/[0.08] mb-5 flex flex-col items-center justify-center group-hover:border-cyan-500/30 transition-colors">
                {/* Background Pattern Grid */}
                <div className="absolute inset-0 bg-grid-cyber opacity-20" />

                {/* Avatar Icon */}
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-center text-slate-300 group-hover:scale-110 group-hover:text-cyan-300 group-hover:border-cyan-500/40 transition-all duration-300">
                  <Icon className="w-8 h-8 stroke-[1.5]" />
                </div>

                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/60 border border-white/[0.08] text-[9px] font-mono text-slate-400">
                  {maker.initials}
                </div>
              </div>

              {/* Name & Role */}
              <div className="space-y-1 mb-3">
                <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                  {maker.role}
                </span>
                <h3 className="text-lg font-bold text-white tracking-wide group-hover:text-cyan-200 transition-colors">
                  {maker.namePlaceholder}
                </h3>
              </div>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed flex-1">
                {maker.description}
              </p>

              {/* Bottom Card Footer */}
              <div className="mt-5 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>DOCPROVE CORE</span>
                <span className="text-emerald-400/80">ACTIVE</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

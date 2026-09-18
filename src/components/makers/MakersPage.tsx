import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import aviralImage from '../../images/aviral.jpg';
import ritikImage from '../../images/ritik.jpg';
import sanaImage from '../../images/sana.jpg';
import nishiImage from '../../images/nishi.jpg';
import shreemaiImage from '../../images/shreemai.jpg';
import bhuvanImage from '../../images/bhuvan.jpg';
import makersBgImage from '../../images/makersbg.jpeg';

interface MakerMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  specialties: string[];
  linkedin: string;
  github?: string;
  githubUsername?: string;
  commitsEstimate: number;
  featuredContribution: string;
  imagePath: string;
}

const MAKERS: MakerMember[] = [
  {
    id: 'aviral',
    name: 'Aviral',
    role: 'Lead Systems Architect & Core ML',
    department: 'CORE ARCHITECTURE',
    bio: 'Pioneered the multi-engine document screening pipeline, real-time forensic tampering detection, and cloud microservices.',
    specialties: ['Distributed Systems', 'Computer Vision', 'PyTorch / OpenCV', 'FastAPI'],
    linkedin: 'https://www.linkedin.com/in/oakawol/',
    github: 'https://github.com/toodos',
    githubUsername: 'toodos',
    commitsEstimate: 148,
    featuredContribution: 'Designed multi-signal risk heuristic engine & pipeline orchestrator',
    imagePath: aviralImage,
  },
  {
    id: 'ritik',
    name: 'Ritik',
    role: 'Security & Forensics Engineer',
    department: 'DOCUMENT FORENSICS',
    bio: 'Specialized in Error Level Analysis (ELA), frequency domain discrete cosine transforms, and physical forgery detection.',
    specialties: ['ELA Forensics', 'Image Processing', 'Tampering Models', 'ICAO 9303'],
    linkedin: 'https://www.linkedin.com/in/ritik-sharma-8105853a6/',
    commitsEstimate: 86,
    featuredContribution: 'Authored copy-move & font anomaly detection matrices',
    imagePath: ritikImage,
  },
  {
    id: 'sana',
    name: 'Sana',
    role: 'Biometric AI & Face Verification',
    department: 'BIOMETRIC INTELLIGENCE',
    bio: 'Architected facial landmark extraction, facial embedding clustering, and multi-identity conflict resolution.',
    specialties: ['Facial Landmarks', 'Biometric Matching', 'Cosine Similarity', 'Python ML'],
    linkedin: 'https://www.linkedin.com/in/sana-khan-1267a8365?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    github: 'https://github.com/sanakhan-197',
    githubUsername: 'sanakhan-197',
    commitsEstimate: 74,
    featuredContribution: 'Built portrait extraction and real-time probe-to-document biometric aligner',
    imagePath: sanaImage,
  },
  {
    id: 'nishi',
    name: 'Nishi',
    role: 'Product Designer & UX Architect',
    department: 'PRODUCT EXPERIENCE',
    bio: 'Crafted the editorial dark visual identity, precision forensic HUD overlays, and human-in-the-loop inspector workflows.',
    specialties: ['Design Systems', 'Forensic Data Viz', 'Interaction Design', 'Figma / Micro-UX'],
    linkedin: 'https://www.linkedin.com/in/nishi-mehra-46b87035b/',
    github: 'https://github.com/nishimehra107-ux',
    githubUsername: 'nishimehra107-ux',
    commitsEstimate: 92,
    featuredContribution: 'Engineered high-density document inspection HUD and design tokens',
    imagePath: nishiImage,
  },
  {
    id: 'shreemai',
    name: 'Shreemai',
    role: 'Neural OCR & MRZ Parsing Lead',
    department: 'OCR & PARSING',
    bio: 'Engineered dual-pass character recognition algorithms, ICAO Doc 9303 checksum math, and fuzzy field normalization.',
    specialties: ['Tesseract Engine', 'MRZ Checksums', 'Regex Synthesizer', 'OCR Noise Filtering'],
    linkedin: 'https://www.linkedin.com/in/shreemayi-mungi-7a90b9379/',
    github: 'https://github.com/shree990',
    githubUsername: 'shree990',
    commitsEstimate: 110,
    featuredContribution: 'Created zero-error MRZ check digit calculator and passport field mapper',
    imagePath: shreemaiImage,
  },
  {
    id: 'bhuvan',
    name: 'Bhuvan',
    role: 'Full-Stack Performance & Infrastructure',
    department: 'CLOUD INFRASTRUCTURE',
    bio: 'Optimized high-throughput containerization, caching layers, and millisecond API performance across edge networks.',
    specialties: ['Containerization', 'Performance Tuning', 'Vite / React 19', 'Edge Routing'],
    linkedin: 'https://www.linkedin.com/in/bhuvan-yadav-0b0b633b5/',
    github: 'https://github.com/bhuvvann',
    githubUsername: 'bhuvvann',
    commitsEstimate: 68,
    featuredContribution: 'Reduced end-to-end cloud screening latency from 140s to < 700ms',
    imagePath: bhuvanImage,
  },
];

// ── Profile Detail Modal ────────────────────────────────────────────────────

const MakerDetailModal: React.FC<{
  member: MakerMember | null;
  onClose: () => void;
}> = ({ member, onClose }) => {
  if (!member) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/80 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#0b0f19] light:bg-[#ffffff] border border-white/15 light:border-black/10 rounded-3xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.85)] text-left"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-blue-500/15 via-cyan-500/5 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/10"
        >
          <svg className="w-4 h-4 stroke-[2.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="relative z-10 p-6 sm:p-8 space-y-6">
          {/* Header section with photo, name, role and social buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-white/10 light:border-black/10">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white/20 light:border-black/15 shadow-xl shrink-0">
              <img
                src={member.imagePath}
                alt={member.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-2xl pointer-events-none" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 light:text-blue-600 font-semibold">
                  {member.department}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white light:text-slate-900 font-sans">
                {member.name}
              </h2>
              <p className="text-xs sm:text-sm text-[#8e95a5] light:text-[#555B66] mt-0.5">
                {member.role}
              </p>

              {/* Social Link Badges */}
              <div className="flex items-center gap-2.5 mt-3.5">
                {member.github && (
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-mono text-white border border-white/15 transition-all shadow-sm group"
                  >
                    <svg className="w-3.5 h-3.5 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>@{member.githubUsername || 'github'}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-60" />
                  </a>
                )}

                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/35 active:scale-95 text-xs font-mono text-blue-300 border border-blue-500/30 transition-all shadow-sm group"
                >
                  <svg className="w-3.5 h-3.5 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span>Connect on LinkedIn</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              </div>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] light:bg-black/[0.02] border border-white/[0.08] light:border-black/[0.08]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8e95a5] light:text-[#737781] block">
                Contributions
              </span>
              <span className="text-xl font-mono font-bold text-white light:text-[#111318] mt-0.5 block">
                {member.commitsEstimate}+
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Code commits & PRs</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] light:bg-black/[0.02] border border-white/[0.08] light:border-black/[0.08]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8e95a5] light:text-[#737781] block">
                Review Status
              </span>
              <span className="text-xl font-mono font-bold text-blue-400 light:text-blue-600 mt-0.5 block">
                Verified
              </span>
              <span className="text-[10px] text-[#8e95a5] light:text-[#737781] font-mono">Docprove Core</span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white/[0.03] light:bg-black/[0.02] border border-white/[0.08] light:border-black/[0.08]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8e95a5] light:text-[#737781] block">
                Activity Pulse
              </span>
              <div className="flex items-center gap-1 mt-2">
                {[4, 8, 5, 9, 7, 10, 8, 12, 11, 14, 10, 13].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h * 1.5}px` }}
                    className="w-1.5 rounded-full bg-blue-500/70 light:bg-blue-600/70"
                  />
                ))}
              </div>
              <span className="text-[10px] text-[#8e95a5] light:text-[#737781] font-mono mt-1.5 block">High frequency</span>
            </div>
          </div>

          {/* Bio statement */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8e95a5] light:text-[#737781] block mb-1.5">
              Mission Statement
            </span>
            <p className="text-xs sm:text-sm text-white/90 light:text-slate-800 leading-relaxed font-sans">
              {member.bio}
            </p>
          </div>

          {/* Featured Contribution */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/30 to-indigo-950/20 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-300 font-semibold">
                Key Deliverable
              </span>
            </div>
            <p className="text-xs font-mono text-white/90 leading-snug">
              {member.featuredContribution}
            </p>
          </div>

          {/* Specialties Pills */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8e95a5] light:text-[#737781] block mb-2">
              Domain Expertise
            </span>
            <div className="flex flex-wrap gap-1.5">
              {member.specialties.map((spec) => (
                <span
                  key={spec}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/[0.05] light:bg-black/[0.04] border border-white/[0.1] light:border-black/[0.08] text-white/90 light:text-slate-700"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Uniform Member Card ─────────────────────────────────────────────────────

const UniformMemberCard: React.FC<{
  member: MakerMember;
  index: number;
  onOpenModal: (member: MakerMember) => void;
}> = ({ member, index, onOpenModal }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 16;
    setCursorPos({
      x: Math.max(-8, Math.min(8, x)),
      y: Math.max(-8, Math.min(8, y)),
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCursorPos({ x: 0, y: 0 });
  };

  return (
    <motion.div
      onClick={() => onOpenModal(member)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      animate={{
        y: isHovered ? -8 : 0,
      }}
      style={{
        boxShadow: isHovered
          ? '0 28px 60px -15px rgba(0, 0, 0, 0.75), 0 0 40px -10px rgba(59, 130, 246, 0.2)'
          : '0 6px 18px -4px rgba(0, 0, 0, 0.25)',
      }}
      className="group relative flex flex-col justify-end overflow-hidden rounded-3xl bg-[#090d16] light:bg-[#ffffff] border border-white/[0.08] light:border-black/[0.1] hover:border-blue-400/40 light:hover:border-blue-500/40 transition-all duration-550 ease-[cubic-bezier(0.22,1,0.36,1)] select-none cursor-pointer"
    >
      {/* 4:5 Uniform Portrait Frame */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#060911] light:bg-[#F5F4F0]">
        <motion.img
          src={member.imagePath}
          alt={member.name}
          animate={{
            scale: isHovered ? 1.08 : 1,
            x: isHovered ? cursorPos.x : 0,
            y: isHovered ? cursorPos.y : 0,
          }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-full object-cover filter contrast-[1.04] transition-all duration-550"
        />

        {/* Diagonal Light Sweep Beam */}
        <motion.div
          aria-hidden="true"
          initial={{ x: '-160%' }}
          animate={{ x: isHovered ? '260%' : '-160%' }}
          transition={{
            duration: 0.85,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute inset-0 w-32 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none z-10"
        />

        {/* Cinematic Multi-stop Dark Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-550 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none z-0" />

        {/* Top Badges: Role Department & View Card Hint */}
        <div className="absolute inset-x-0 top-0 p-4 sm:p-5 flex items-center justify-between z-20 pointer-events-none">
          <span className="text-[9px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/80 font-medium">
            {member.department}
          </span>
          <motion.span
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : -4,
            }}
            transition={{ duration: 0.25 }}
            className="text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full bg-blue-500/80 text-white font-bold backdrop-blur-sm shadow-md"
          >
            CLICK TO INSPECT
          </motion.span>
        </div>

        {/* Bottom Bar: Name, Subtitle, & Direct Action Links */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 z-20">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <motion.h3
                animate={{
                  y: isHovered ? -2 : 0,
                }}
                transition={{ duration: 0.4 }}
                className="text-2xl sm:text-3xl font-semibold tracking-tight text-white font-sans truncate"
              >
                {member.name}
              </motion.h3>
              <p className="text-[11px] text-white/70 font-mono truncate mt-0.5">
                {member.role}
              </p>
            </div>

            {/* Direct Quick Action Social Links */}
            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              {member.github && (
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${member.name}'s GitHub`}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 backdrop-blur-md border border-white/20 text-white shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center group/btn"
                >
                  <svg
                    className="w-4 h-4 fill-current transition-transform duration-300 group-hover/btn:scale-115"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </a>
              )}

              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                title={`${member.name}'s LinkedIn`}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 backdrop-blur-md border border-white/20 text-white shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center group/btn"
              >
                <svg
                  className="w-4 h-4 fill-current transition-transform duration-300 group-hover/btn:scale-115"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main Makers Page ────────────────────────────────────────────────────────

export const MakersPage: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState<MakerMember | null>(null);

  return (
    <div
      className="relative w-full min-h-screen bg-[#07090e] light:bg-[#F5F4F0] bg-no-repeat bg-cover bg-center md:bg-center transition-colors duration-500 overflow-hidden"
      style={{
        backgroundImage: `url(${makersBgImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Subtle legibility overlay */}
      <div
        className="absolute inset-0 pointer-events-none bg-[#07090e]/80 light:bg-[#F5F4F0]/70 transition-colors duration-500"
        aria-hidden="true"
      />

      {/* Detail Pop-up Modal */}
      {selectedMember && (
        <MakerDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}

      {/* Content Container */}
      <div className="relative z-10 w-full pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-20">
        {/* ──────────────────────────────────────────────────────────── */}
        {/* EDITORIAL INTRO */}
        {/* ──────────────────────────────────────────────────────────── */}
        <section className="text-left max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            <span className="text-[11px] font-mono tracking-[0.2em] text-[#8e95a5] uppercase">
              [ 02 / THE MAKERS ]
            </span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.045em] text-[#f5f5f7] light:text-[#111318] leading-[1.02] font-sans"
          >
            ENGINEERING &amp; <br />
            DESIGN STUDIO
          </motion.h1>

          <p className="mt-5 text-sm sm:text-base text-[#8e95a5] light:text-[#555B66] max-w-2xl leading-relaxed">
            The team behind Docprove — combining computer vision, biometric security, and full-stack engineering to build world-class document verification.
          </p>
        </section>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* PERFECT RESPONSIVE GRID: 3x2 DESKTOP, 2x3 TABLET, 1x6 MOBILE */}
        {/* ──────────────────────────────────────────────────────────── */}
        <section className="pt-8 border-t border-white/[0.08] light:border-black/[0.08]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {MAKERS.map((member, idx) => (
              <UniformMemberCard
                key={member.id}
                member={member}
                index={idx}
                onOpenModal={setSelectedMember}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};


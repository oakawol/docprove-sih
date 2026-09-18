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
  linkedin: string;
  github?: string;
  imagePath: string;
}

const MAKERS: MakerMember[] = [
  {
    id: 'aviral',
    name: 'Aviral',
    linkedin: 'https://www.linkedin.com/in/oakawol/',
    github: 'https://github.com/toodos',
    imagePath: aviralImage,
  },
  {
    id: 'ritik',
    name: 'Ritik',
    linkedin: 'https://www.linkedin.com/in/ritik-sharma-8105853a6/',
    imagePath: ritikImage,
  },
  {
    id: 'sana',
    name: 'Sana',
    linkedin: 'https://www.linkedin.com/in/sana-khan-1267a8365?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    github: 'https://github.com/sanakhan-197',
    imagePath: sanaImage,
  },
  {
    id: 'nishi',
    name: 'Nishi',
    linkedin: 'https://www.linkedin.com/in/nishi-mehra-46b87035b/',
    github: 'https://github.com/nishimehra107-ux',
    imagePath: nishiImage,
  },
  {
    id: 'shreemai',
    name: 'Shreemai',
    linkedin: 'https://www.linkedin.com/in/shreemayi-mungi-7a90b9379/',
    github: 'https://github.com/shree990',
    imagePath: shreemaiImage,
  },
  {
    id: 'bhuvan',
    name: 'Bhuvan',
    linkedin: 'https://www.linkedin.com/in/bhuvan-yadav-0b0b633b5/',
    github: 'https://github.com/bhuvvann',
    imagePath: bhuvanImage,
  },
];

const UniformMemberCard: React.FC<{ member: MakerMember; index: number }> = ({ member, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Normalize -0.5 to 0.5 and scale to max 8px shift
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      animate={{
        y: isHovered ? -5 : 0,
      }}
      style={{
        boxShadow: isHovered
          ? '0 20px 40px -15px rgba(0, 0, 0, 0.65)'
          : '0 4px 12px -2px rgba(0, 0, 0, 0.2)',
      }}
      className="group relative flex flex-col justify-end overflow-hidden rounded-2xl bg-[#090d16] light:bg-[#ffffff] border border-white/[0.08] light:border-black/[0.1] hover:border-white/25 light:hover:border-black/25 transition-all duration-550 ease-[cubic-bezier(0.22,1,0.36,1)] select-none"
    >
      {/* 4:5 Uniform Portrait Frame */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#060911] light:bg-[#F5F4F0]">
        <motion.img
          src={member.imagePath}
          alt={member.name}
          animate={{
            scale: isHovered ? 1.06 : 1,
            x: isHovered ? cursorPos.x : 0,
            y: isHovered ? cursorPos.y : 0,
          }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-full object-cover filter contrast-[1.03] transition-all duration-550"
        />

        {/* Subtle Single White Light Sweep on Hover */}
        <motion.div
          aria-hidden="true"
          initial={{ x: '-160%' }}
          animate={{ x: isHovered ? '260%' : '-160%' }}
          transition={{
            duration: 0.85,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute inset-0 w-24 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10"
        />

        {/* Subtle Dark Cinematic Gradient (Transparent at Top -> Darker at Bottom) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-550 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none z-0" />

        {/* Minimal Bottom Bar: Name + Social Links (LinkedIn & GitHub) */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex items-end justify-between z-20">
          <motion.h3
            animate={{
              y: isHovered ? -4 : 0,
            }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="text-2xl sm:text-3xl font-semibold tracking-tight text-white font-sans transition-colors duration-300"
          >
            {member.name}
          </motion.h3>

          {/* Social Icons Container */}
          <div className="flex items-center gap-2">
            {/* GitHub Icon */}
            {member.github && (
              <a
                href={member.github}
                target="_blank"
                rel="noopener noreferrer"
                title={`${member.name}'s GitHub`}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 backdrop-blur-md border border-white/20 text-white shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center group/icon"
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  className="w-4 h-4 fill-current transition-transform duration-300 group-hover/icon:scale-110"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            )}

            {/* LinkedIn Icon */}
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              title={`${member.name}'s LinkedIn`}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 backdrop-blur-md border border-white/20 text-white shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center group/icon"
              onClick={(e) => e.stopPropagation()}
            >
              <svg
                className="w-4 h-4 fill-current transition-transform duration-300 group-hover/icon:scale-110"
                viewBox="0 0 24 24"
              >
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const MakersPage: React.FC = () => {
  return (
    <div
      className="relative w-full min-h-screen bg-[#07090e] light:bg-[#F5F4F0] bg-no-repeat bg-cover bg-center md:bg-center transition-colors duration-500 overflow-hidden"
      style={{
        backgroundImage: `url(${makersBgImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Subtle legibility overlay to ensure team cards and typography remain crisp and readable above doodles */}
      <div
        className="absolute inset-0 pointer-events-none bg-[#07090e]/75 light:bg-[#F5F4F0]/65 transition-colors duration-500"
        aria-hidden="true"
      />

      {/* Content Container */}
      <div className="relative z-10 w-full pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-20">
        {/* ──────────────────────────────────────────────────────────── */}
        {/* EDITORIAL INTRO */}
        {/* ──────────────────────────────────────────────────────────── */}
        <section className="text-left max-w-4xl">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-xs font-mono tracking-[0.2em] text-[#565f73] light:text-[#737781] uppercase block mb-3 font-medium"
          >
            [ 02 / THE MAKERS ]
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.045em] text-[#f5f5f7] light:text-[#111318] leading-[1.02] font-sans"
          >
            ENGINEERING &amp; <br />
            DESIGN STUDIO
          </motion.h1>
        </section>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* PERFECT RESPONSIVE GRID: 3x2 DESKTOP, 2x3 TABLET, 1x6 MOBILE */}
        {/* ──────────────────────────────────────────────────────────── */}
        <section className="pt-8 border-t border-white/[0.08] light:border-black/[0.08]">
          {/* Responsive Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {MAKERS.map((member, idx) => (
              <UniformMemberCard key={member.id} member={member} index={idx} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};


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
  imagePath: string;
}

const MAKERS: MakerMember[] = [
  {
    id: 'aviral',
    name: 'Aviral',
    linkedin: 'https://www.linkedin.com/in/oakawol/',
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
    imagePath: sanaImage,
  },
  {
    id: 'nishi',
    name: 'Nishi',
    linkedin: 'https://www.linkedin.com/in/nishi-mehra-46b87035b/',
    imagePath: nishiImage,
  },
  {
    id: 'shreemai',
    name: 'Shreemai',
    linkedin: 'https://www.linkedin.com/in/shreemayi-mungi-7a90b9379/',
    imagePath: shreemaiImage,
  },
  {
    id: 'bhuvan',
    name: 'Bhuvan',
    linkedin: 'https://www.linkedin.com/in/bhuvan-yadav-0b0b633b5/',
    imagePath: bhuvanImage,
  },
];

const UniformMemberCard: React.FC<{ member: MakerMember; index: number }> = ({ member, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
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
    <motion.a
      href={member.linkedin}
      target="_blank"
      rel="noopener noreferrer"
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
      className="group relative flex flex-col justify-end overflow-hidden rounded-2xl bg-[#090d16] light:bg-[#ffffff] border border-white/[0.08] light:border-black/[0.1] hover:border-white/25 light:hover:border-black/25 transition-all duration-550 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer select-none"
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

        {/* Minimal Bottom Bar: Name + Rotating Arrow Icon */}
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7 flex items-end justify-between z-20">
          <motion.h3
            animate={{
              y: isHovered ? -6 : 0,
            }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="text-2xl sm:text-3xl font-semibold tracking-tight text-white font-sans transition-colors duration-300"
          >
            {member.name}
          </motion.h3>

          <motion.div
            animate={{
              opacity: isHovered ? 1 : 0.65,
              x: isHovered ? 4 : 0,
              rotate: isHovered ? 8 : 0,
            }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-md"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[2]" />
          </motion.div>
        </div>
      </div>
    </motion.a>
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


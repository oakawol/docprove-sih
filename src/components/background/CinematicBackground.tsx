import React, { useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import backgroundImage from '../../images/background.jpeg';
import whiteBackgroundImage from '../../images/whitebg.jpeg';

// ── Particle Types & Structure ──────────────────────────────────────────
type ParticleType = 'dot' | 'passport' | 'visa';

interface ParticleData {
  id: number;
  type: ParticleType;
  top: number; // percentage 0-100%
  left: number; // percentage 0-100%
  size: number; // px
  opacity: number;
  duration: number; // seconds
  delay: number; // seconds
  driftX: number; // px movement
  driftY: number; // px movement
  rotate: number; // deg
  color?: string;
}

/**
 * Passport Silhouette SVG Particle
 */
const PassportParticleSVG: React.FC<{ size: number; opacity: number; color?: string }> = ({
  size,
  opacity,
  color = '#F8FAFC',
}) => {
  const width = size;
  const height = size * 1.33;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <rect x="1" y="1" width="22" height="30" rx="2" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.08" />
      <line x1="3.5" y1="1" x2="3.5" y2="31" stroke={color} strokeWidth="1.2" strokeOpacity="0.7" />
      <line x1="7" y1="6" x2="17" y2="6" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.85" />
      <circle cx="12" cy="14" r="3.8" stroke={color} strokeWidth="1.3" strokeOpacity="0.85" />
      <circle cx="12" cy="14" r="1.6" stroke={color} strokeWidth="1.0" strokeOpacity="0.65" />
      <line x1="7" y1="22" x2="17" y2="22" stroke={color} strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.75" />
      <line x1="9" y1="25.5" x2="15" y2="25.5" stroke={color} strokeWidth="1.0" strokeLinecap="round" strokeOpacity="0.6" />
    </svg>
  );
};

/**
 * Visa Sticker Silhouette SVG Particle
 */
const VisaParticleSVG: React.FC<{ size: number; opacity: number; color?: string }> = ({
  size,
  opacity,
  color = '#F8FAFC',
}) => {
  const width = size * 1.35;
  const height = size * 0.85;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32.4 20.4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <rect x="1" y="1" width="30.4" height="18.4" rx="2" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.06" />
      <line x1="4" y1="5" x2="28.4" y2="5" stroke={color} strokeWidth="1.3" strokeOpacity="0.8" />
      <line x1="4" y1="9.5" x2="16" y2="9.5" stroke={color} strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.7" />
      <line x1="4" y1="13" x2="14" y2="13" stroke={color} strokeWidth="1.0" strokeLinecap="round" strokeOpacity="0.6" />
      <line x1="4" y1="16" x2="18" y2="16" stroke={color} strokeWidth="0.9" strokeLinecap="round" strokeOpacity="0.45" />
      <circle cx="23.5" cy="12.5" r="4.2" stroke={color} strokeWidth="1.2" strokeDasharray="3 1.5" strokeOpacity="0.8" />
      <circle cx="23.5" cy="12.5" r="1.8" stroke={color} strokeWidth="0.9" strokeOpacity="0.5" />
    </svg>
  );
};

export const CinematicBackground: React.FC = () => {
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 3000], [0, -60]);

  // Generate 55 deterministic floating particles evenly distributed across the full viewport
  const particles: ParticleData[] = useMemo(() => {
    const list: ParticleData[] = [];
    const total = 55;

    for (let i = 0; i < total; i++) {
      const rand = (i * 1.618033) % 1;
      let type: ParticleType = 'dot';
      if (rand > 0.72) type = 'passport';
      else if (rand > 0.52) type = 'visa';

      const sector = i % 9;
      const row = Math.floor(sector / 3);
      const col = sector % 3;

      const top = Math.min(92, Math.max(5, (row * 30) + ((i * 17) % 28)));
      const left = Math.min(94, Math.max(4, (col * 31) + ((i * 23) % 30)));

      let size = type === 'dot' ? 2.5 + (i % 3) * 0.8 : 12 + (i % 5) * 2.2;
      if (type !== 'dot' && i % 7 === 0) size = 20;

      const opacity =
        type === 'dot'
          ? 0.14 + (i % 4) * 0.04
          : type === 'passport'
          ? 0.10 + (i % 5) * 0.03
          : 0.09 + (i % 4) * 0.03;

      const duration = 12 + (i % 8) * 1.5;
      const delay = (i * 0.4) % 6;
      const driftX = (i % 2 === 0 ? 1 : -1) * (8 + (i % 12));
      const driftY = (i % 3 === 0 ? -1 : 1) * (14 + (i % 16));
      const rotate = (i % 2 === 0 ? 1 : -1) * (3 + (i % 6));

      let color: string | undefined = undefined;
      if (i % 11 === 0) color = '#E03131';
      else if (i % 7 === 0) color = '#3B82F6';

      list.push({
        id: i,
        type,
        top,
        left,
        size,
        opacity,
        duration,
        delay,
        driftX,
        driftY,
        rotate,
        color,
      });
    }

    return list;
  }, []);

  return (
    <>
      <style>{`
        @keyframes floatParticle {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(var(--drift-x), var(--drift-y), 0) rotate(var(--drift-rot));
          }
        }
      `}</style>

      {/* ── FIXED BACKGROUND WRAPPER ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0">
        
        {/* ── DARK MODE ONLY BACKGROUND SYSTEM ── */}
        <div className="absolute inset-0 transition-opacity duration-500 block light:hidden">
          {/* Deep Obsidian Base Canvas */}
          <div className="absolute inset-0 bg-[#07090e]" />

          {/* Dark Mode Background Artwork */}
          <motion.div style={{ y: yParallax }} className="absolute inset-0 pointer-events-none">
            <img
              src={backgroundImage}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover object-center filter grayscale contrast-[1.2] brightness-[0.45] opacity-[0.10]"
            />
          </motion.div>

          {/* Dark Radial Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 80% 70% at 50% 40%, rgba(7, 9, 14, 0.40) 0%, rgba(7, 9, 14, 0.85) 70%, #07090e 100%)',
            }}
          />

          {/* Dark Ambient Lighting */}
          <div
            className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] pointer-events-none opacity-60"
            style={{
              background: 'radial-gradient(circle, rgba(30, 58, 138, 0.08) 0%, rgba(7, 9, 14, 0) 70%)',
              filter: 'blur(100px)',
            }}
          />
        </div>

        {/* ── LIGHT MODE ONLY BACKGROUND SYSTEM ── */}
        <div className="absolute inset-0 transition-opacity duration-500 hidden light:block">
          {/* Base Warm Ivory Canvas */}
          <div className="absolute inset-0 bg-[#F5F4F0]" />

          {/* Full Page whitebg.jpeg Background Artwork with Parallax */}
          <motion.div style={{ y: yParallax }} className="absolute inset-0 pointer-events-none">
            <img
              src={whiteBackgroundImage}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover object-top opacity-35 mix-blend-multiply transition-opacity duration-500"
            />
          </motion.div>

          <div className="absolute inset-0 bg-[#F7F6F2]/70 pointer-events-none" />
        </div>

        {/* ── GUARANTEED HTML/SVG PARTICLE FIELD LAYER ── */}
        <div
          className="fixed inset-0 pointer-events-none w-screen h-screen overflow-hidden z-[2]"
          aria-hidden="true"
        >
          {particles.map((p) => {
            const style: React.CSSProperties & { [key: string]: string | number } = {
              position: 'absolute',
              top: `${p.top}%`,
              left: `${p.left}%`,
              opacity: p.opacity,
              animation: `floatParticle ${p.duration}s ease-in-out ${p.delay}s infinite`,
              '--drift-x': `${p.driftX}px`,
              '--drift-y': `${p.driftY}px`,
              '--drift-rot': `${p.rotate}deg`,
              willChange: 'transform',
            };

            const strokeColor = p.color || 'var(--particle-color, #F8FAFC)';

            if (p.type === 'dot') {
              return (
                <div
                  key={p.id}
                  style={{
                    ...style,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    borderRadius: '50%',
                    backgroundColor: strokeColor,
                  }}
                />
              );
            }

            if (p.type === 'passport') {
              return (
                <div key={p.id} style={style}>
                  <PassportParticleSVG size={p.size} opacity={1} color={strokeColor} />
                </div>
              );
            }

            return (
              <div key={p.id} style={style}>
                <VisaParticleSVG size={p.size} opacity={1} color={strokeColor} />
              </div>
            );
          })}
        </div>

        {/* Minimal Hairline Grid Texture */}
        <div
          className="absolute inset-0 z-[4] opacity-[0.018] light:opacity-[0.035] pointer-events-none transition-opacity duration-500"
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--text-muted) 1px, transparent 1px), linear-gradient(to bottom, var(--text-muted) 1px, transparent 1px)',
            backgroundSize: '120px 120px',
          }}
        />

        {/* Film Grain Texture */}
        <div className="absolute inset-0 z-[5] bg-noise opacity-[0.025] light:opacity-[0.012] pointer-events-none" />
      </div>
    </>
  );
};




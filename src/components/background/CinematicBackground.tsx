import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import backgroundImage from '../../images/background.jpeg';

/**
 * Atmospheric Document Intelligence Background.
 * Strictly adheres to editorial art direction:
 * - Uses official /images/background.jpeg as an atmospheric texture.
 * - Heavily desaturated, low opacity, and deeply vignetted so it never competes
 *   with typography, the passport, or verification data.
 * - Zero sci-fi HUD reticles, coordinates, or rainbow gradient blobs.
 */
export const CinematicBackground: React.FC = () => {
  const { scrollY } = useScroll();

  // Gentle, restrained parallax drift across the page scroll
  const yParallax = useTransform(scrollY, [0, 3000], [0, -60]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-20 select-none">
      {/* 1. Deep Obsidian Base Canvas */}
      <div className="absolute inset-0 bg-[#07090e]" />

      {/* 2. Official Website Background Image (Atmospheric & Desaturated) */}
      <motion.div
        style={{ y: yParallax }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <img
          src={backgroundImage}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center filter grayscale contrast-[1.2] brightness-[0.45] opacity-[0.11]"
        />
      </motion.div>

      {/* 3. Deep Radial Vignette Mask (Leaves the center calm, matte and legible) */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 75% 65% at 50% 40%, rgba(7, 9, 14, 0.72) 0%, rgba(7, 9, 14, 0.94) 70%, #07090e 100%)',
        }}
      />

      {/* 4. Single Restrained Cool-Slate Atmospheric Accent (Punctuation, Not Wallpaper) */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] pointer-events-none z-[2]"
        style={{
          background:
            'radial-gradient(circle, rgba(30, 58, 138, 0.08) 0%, rgba(7, 9, 14, 0) 70%)',
          filter: 'blur(100px)',
        }}
      />

      {/* 5. Minimal Hairline Grid Texture (Subtle structural alignment, ultra-quiet) */}
      <div
        className="absolute inset-0 z-[3] opacity-[0.018] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '120px 120px',
        }}
      />

      {/* 6. Subtle Film Grain Texture */}
      <div className="absolute inset-0 z-[4] bg-noise opacity-[0.025] pointer-events-none" />
    </div>
  );
};


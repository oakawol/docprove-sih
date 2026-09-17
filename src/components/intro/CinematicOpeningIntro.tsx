import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../brand/Logo';

export const CinematicOpeningIntro: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Total sequence timing: 2.85s (unmounts cleanly before 3.0s)
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2850);

    return () => clearTimeout(timer);
  }, []);

  if (!showIntro) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="cinematic-split-intro-container"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[9999] pointer-events-none select-none overflow-hidden"
      >
        {/* TOP PANEL: Dark background curtain containing top half of logo */}
        <motion.div
          initial={{ y: '0%' }}
          animate={{ y: '-100%' }}
          transition={{
            duration: 1.3,
            delay: 0.9,
            ease: [0.16, 1, 0.3, 1], // cinematic smooth ease-out
          }}
          className="absolute top-0 left-0 right-0 h-[50vh] bg-[#07090e] border-b border-white/[0.05] overflow-hidden flex items-end justify-center z-10 shadow-2xl"
        >
          {/* Top Half of Centered Logo with soft initial fade-in (0.0s – 0.5s) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative w-full flex justify-center translate-y-[50%] pb-0"
          >
            <Logo size="lg" className="shadow-[0_0_40px_rgba(255,255,255,0.15)] scale-125 sm:scale-150" />
          </motion.div>
        </motion.div>

        {/* BOTTOM PANEL: Dark background curtain containing bottom half of logo */}
        <motion.div
          initial={{ y: '0%' }}
          animate={{ y: '100%' }}
          transition={{
            duration: 1.3,
            delay: 0.9,
            ease: [0.16, 1, 0.3, 1], // cinematic smooth ease-out
          }}
          className="absolute bottom-0 left-0 right-0 h-[50vh] bg-[#07090e] border-t border-white/[0.05] overflow-hidden flex items-start justify-center z-10 shadow-2xl"
        >
          {/* Bottom Half of Centered Logo with soft initial fade-in (0.0s – 0.5s) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative w-full flex justify-center -translate-y-[50%] pt-0"
          >
            <Logo size="lg" className="shadow-[0_0_40px_rgba(255,255,255,0.15)] scale-125 sm:scale-150" />
          </motion.div>
        </motion.div>

        {/* SUBTLE SPLIT SEAM LIGHT FLASH AT SPLIT START (0.9s – 1.3s) */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.2 }}
          animate={{ opacity: [0, 0.35, 0], scaleX: [0.2, 1.2, 1.5] }}
          transition={{
            duration: 0.5,
            delay: 0.88,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-md h-[1px] bg-gradient-to-r from-transparent via-blue-200/40 to-transparent z-20 pointer-events-none"
        />
      </motion.div>
    </AnimatePresence>
  );
};

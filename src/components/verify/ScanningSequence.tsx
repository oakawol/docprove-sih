import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocprove } from '../../context/DocproveVerificationContext';

interface StageItem {
  number: string;
  label: string;
  description: string;
}

const STAGES: StageItem[] = [
  { number: '01', label: 'DOCUMENT CHECK', description: 'Inspecting document structure' },
  { number: '02', label: 'TEXT READING', description: 'Extracting document text' },
  { number: '03', label: 'DETAIL CHECK', description: 'Cross-checking document details' },
  { number: '04', label: 'TAMPERING CHECK', description: 'Analyzing document integrity' },
  { number: '05', label: 'FACE MATCH', description: 'Checking portrait integrity' },
  { number: '06', label: 'VERIFIED RESULT', description: 'Compiling verification results' },
];

// Refined high-end easing
const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;

export const ScanningSequence: React.FC = () => {
  const { activeStageIndex, statusMessage } = useDocprove();

  // Track the stage transition sequence key to trigger the micro-highlight
  const [transitionKey, setTransitionKey] = useState(0);
  const prevStageRef = useRef(activeStageIndex);

  useEffect(() => {
    if (activeStageIndex !== prevStageRef.current && activeStageIndex >= 0) {
      prevStageRef.current = activeStageIndex;
      setTransitionKey((k) => k + 1);
    }
  }, [activeStageIndex]);

  if (activeStageIndex < 0) return null;

  const currentStage = STAGES[activeStageIndex] || STAGES[0];
  const progressRatio = (activeStageIndex + 1) / STAGES.length;

  return (
    <div className="w-full py-2 space-y-3.5 select-none font-sans">
      {/* ── 1. Continuous Floating Step Bar (Smooth Physical Pill Track) ── */}
      <div className="relative flex items-center justify-between gap-2 px-0.5">
        {/* Continuous background track */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/[0.07] light:bg-black/[0.08] rounded-full" />

        {/* Physical sliding active glow line across the track */}
        <motion.div
          className="absolute top-0 h-[2px] bg-blue-400 light:bg-blue-600 rounded-full pointer-events-none"
          initial={false}
          animate={{
            left: `${(activeStageIndex / (STAGES.length - 1)) * 82}%`,
            width: '18%',
          }}
          transition={{
            duration: 0.65,
            ease: PREMIUM_EASE,
          }}
        />

        {STAGES.map((s, idx) => {
          const isCompleted = idx < activeStageIndex;
          const isCurrent = idx === activeStageIndex;

          return (
            <div
              key={s.number}
              className="relative flex-1 flex flex-col items-center pt-2 gap-1 transition-colors duration-500"
            >
              {/* Discrete Step Dot on track */}
              <div
                className={`absolute -top-[1px] w-1 h-1 rounded-full transition-all duration-500 ${
                  isCompleted
                    ? 'bg-blue-400/60 light:bg-blue-600/60'
                    : isCurrent
                    ? 'bg-blue-400 light:bg-blue-600 scale-125'
                    : 'bg-white/20 light:bg-black/20'
                }`}
              />

              {/* Minimalist Micro Label */}
              <div className="flex items-center justify-center gap-1 font-mono text-[9px] tabular-nums tracking-wider leading-none">
                <span
                  className={`transition-colors duration-500 ${
                    isCurrent
                      ? 'text-blue-400 light:text-blue-600 font-semibold'
                      : isCompleted
                      ? 'text-[#8e95a5] light:text-[#555B66]'
                      : 'text-[#565f73]/40 light:text-[#737781]/40'
                  }`}
                >
                  {s.number}
                </span>

                {/* Subtle calm checkmark */}
                <motion.span
                  initial={false}
                  animate={{
                    opacity: isCompleted ? 1 : 0,
                    scale: isCompleted ? 1 : 0.6,
                  }}
                  transition={{ duration: 0.4, ease: PREMIUM_EASE }}
                  className="text-[8px] text-[#8e95a5] light:text-[#555B66] font-mono leading-none"
                >
                  ✓
                </motion.span>

                {/* Active pulse dot */}
                {isCurrent && (
                  <span className="w-1 h-1 rounded-full bg-blue-400 light:bg-blue-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 2. Fixed-Height Stage Viewport with Overlapping Cross-Fade ── */}
      <div className="relative w-full min-h-[108px] h-auto overflow-hidden rounded-2xl bg-white/[0.025] light:bg-[#F7F7F4]/90 border border-white/[0.06] light:border-[#D6D5D0]/80 px-4 sm:px-6 py-4 flex items-center justify-center">
        {/* Subtle Ambient Grain & Depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-black/[0.02] pointer-events-none" />

        {/* Micro-Interaction Highlight on Stage Change */}
        <motion.div
          key={`highlight-${transitionKey}`}
          initial={{ opacity: 0, x: '-100%' }}
          animate={{ opacity: [0, 0.25, 0], x: '100%' }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent pointer-events-none"
        />

        {/* 
          Overlapping Continuous Transition:
          mode="popLayout" allows outgoing and incoming stages to animate concurrently
          in the same space without waiting for exit completion.
        */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={currentStage.number}
            initial={{
              opacity: 0,
              y: 28,
              scale: 0.985,
              filter: 'blur(3px)',
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
            }}
            exit={{
              opacity: 0,
              y: -28,
              scale: 0.985,
              filter: 'blur(3px)',
            }}
            transition={{
              duration: 0.65,
              ease: PREMIUM_EASE,
            }}
            className="w-full flex flex-col items-center text-center space-y-1"
          >
            {/* ── Stage Counter Eyebrow with Vertical Morphing Number ── */}
            <div className="flex items-center justify-center gap-1.5 h-4 overflow-hidden">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-blue-400/90 light:text-blue-600/90 font-medium">
                STAGE
              </span>

              {/* Individual Vertical Sliding Number */}
              <div className="relative h-4 overflow-hidden flex items-center justify-center min-w-[2.2ch]">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={currentStage.number}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.45, ease: PREMIUM_EASE }}
                    className="font-mono text-[10px] uppercase tracking-[0.2em] text-blue-400/90 light:text-blue-600/90 font-medium tabular-nums"
                  >
                    {currentStage.number}
                  </motion.span>
                </AnimatePresence>
              </div>

              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-blue-400/70 light:text-blue-600/70 font-medium">
                / 06
              </span>
            </div>

            {/* ── Primary Focus: Stage Title with Staggered 50ms Entrance ── */}
            <motion.h4
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: 0.05,
                ease: PREMIUM_EASE,
              }}
              className="font-sans text-base sm:text-lg font-semibold tracking-[-0.025em] text-white light:text-[#111318] leading-tight"
            >
              {currentStage.label}
            </motion.h4>

            {/* ── Dynamic Status Sub-Copy with Staggered 90ms Entrance ── */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: 0.09,
                ease: PREMIUM_EASE,
              }}
              className="font-mono text-[10px] sm:text-[11px] text-[#8e95a5] light:text-[#555B66] tracking-wide text-center break-words max-w-full"
            >
              {statusMessage || currentStage.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── 3. Smooth Continuous Progress Line ── */}
      <div className="space-y-1 px-0.5">
        <div className="relative w-full h-[2px] bg-white/[0.06] light:bg-black/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 bottom-0 left-0 bg-blue-400 light:bg-blue-600 rounded-full"
            initial={false}
            animate={{ width: `${progressRatio * 100}%` }}
            transition={{ duration: 0.8, ease: PREMIUM_EASE }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[9.5px] font-mono tracking-wider text-[#565f73] light:text-[#737781]">
          <span className="min-w-0">FORENSIC VERIFICATION ACTIVE</span>
          <span className="tabular-nums">
            {Math.round(progressRatio * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};

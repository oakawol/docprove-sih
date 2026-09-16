import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface ProgressRingProps {
  value: number; // 0 to 100
  size?: number; // diameter in px
  strokeWidth?: number;
  color?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet';
  showLabel?: boolean;
  labelSuffix?: string;
  sublabel?: string;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 100,
  strokeWidth = 8,
  color = 'cyan',
  showLabel = true,
  labelSuffix = '%',
  sublabel,
  className,
}) => {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  const colorGradients = {
    cyan: {
      gradientId: 'grad-cyan',
      from: '#38bdf8',
      to: '#2563eb',
      glow: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.4))',
      text: 'text-cyan-400',
    },
    emerald: {
      gradientId: 'grad-emerald',
      from: '#34d399',
      to: '#059669',
      glow: 'drop-shadow(0 0 6px rgba(52, 211, 153, 0.4))',
      text: 'text-emerald-400',
    },
    amber: {
      gradientId: 'grad-amber',
      from: '#fbbf24',
      to: '#d97706',
      glow: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.4))',
      text: 'text-amber-400',
    },
    rose: {
      gradientId: 'grad-rose',
      from: '#f43f5e',
      to: '#be123c',
      glow: 'drop-shadow(0 0 6px rgba(244, 63, 94, 0.4))',
      text: 'text-rose-400',
    },
    violet: {
      gradientId: 'grad-violet',
      from: '#a78bfa',
      to: '#7c3aed',
      glow: 'drop-shadow(0 0 6px rgba(167, 139, 250, 0.4))',
      text: 'text-violet-400',
    },
  };

  const scheme = colorGradients[color];

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={scheme.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={scheme.from} />
            <stop offset="100%" stopColor={scheme.to} />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-white/10"
        />
        {/* Animated indicator */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${scheme.gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
          fill="none"
          style={{ filter: scheme.glow }}
        />
      </svg>

      {/* Center Label */}
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <span className="font-mono text-xl font-bold tracking-tight text-white">
            {clamped.toFixed(1)}
            <span className="text-xs text-slate-400 font-sans ml-0.5">{labelSuffix}</span>
          </span>
          {sublabel && (
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mt-0.5">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

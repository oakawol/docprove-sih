import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'subtle' | 'elevated' | 'interactive';
  glow?: 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose' | 'none';
  className?: string;
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'default',
  glow = 'none',
  className,
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'glass-panel',
    subtle: 'glass-panel-subtle',
    elevated: 'glass-panel-elevated',
    interactive: 'glass-panel-interactive cursor-pointer',
  };

  const glowStyles = {
    cyan: 'border-l-4 border-l-[#0a2540]',
    violet: 'border-l-4 border-l-blue-700',
    emerald: 'border-l-4 border-l-emerald-600',
    amber: 'border-l-4 border-l-amber-500',
    rose: 'border-l-4 border-l-red-600',
    none: '',
  };

  return (
    <motion.div
      className={cn(
        'relative rounded-2xl p-6 transition-all duration-300',
        variantClasses[variant],
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

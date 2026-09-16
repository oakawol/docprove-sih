import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
      md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
      lg: 'px-6 py-3.5 text-base rounded-xl gap-2.5 font-semibold',
    };

    const variantClasses = {
      primary:
        'bg-[#0a2540] hover:bg-[#133b68] text-white font-medium shadow-sm hover:shadow border border-[#0a2540]',
      secondary:
        'bg-white text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 shadow-sm',
      outline:
        'bg-transparent text-slate-700 hover:text-slate-900 border border-slate-300 hover:bg-slate-100',
      ghost:
        'bg-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent',
      danger:
        'bg-red-50 text-red-700 hover:text-red-800 border border-red-200 hover:bg-red-100 shadow-sm',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={disabled || isLoading ? undefined : { scale: 1.02 }}
        whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none cursor-pointer',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...(props as any)}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

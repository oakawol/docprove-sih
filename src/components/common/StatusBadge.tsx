import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export type StatusType =
  | 'verified'
  | 'passed'
  | 'review'
  | 'warning'
  | 'rejected'
  | 'failed'
  | 'processing'
  | 'pending'
  | 'low_risk'
  | 'medium_risk'
  | 'high_risk';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  showIcon = true,
  className,
}) => {
  const configs: Record<
    StatusType,
    {
      text: string;
      bg: string;
      border: string;
      textCol: string;
      dot: string;
      icon: React.ComponentType<{ className?: string }>;
    }
  > = {
    verified: {
      text: 'Verified / सत्यापित',
      bg: 'bg-emerald-50',
      border: 'border-emerald-300',
      textCol: 'text-emerald-800',
      dot: 'bg-emerald-600',
      icon: ShieldCheck,
    },
    passed: {
      text: 'Passed / उत्तीर्ण',
      bg: 'bg-emerald-50',
      border: 'border-emerald-300',
      textCol: 'text-emerald-800',
      dot: 'bg-emerald-600',
      icon: CheckCircle2,
    },
    review: {
      text: 'Review / समीक्षाधीन',
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      textCol: 'text-amber-800',
      dot: 'bg-amber-600',
      icon: AlertTriangle,
    },
    warning: {
      text: 'Warning / चेतावनी',
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      textCol: 'text-amber-800',
      dot: 'bg-amber-600',
      icon: AlertTriangle,
    },
    rejected: {
      text: 'Rejected / अस्वीकृत',
      bg: 'bg-red-50',
      border: 'border-red-300',
      textCol: 'text-red-800',
      dot: 'bg-red-600',
      icon: XCircle,
    },
    failed: {
      text: 'Failed / असफल',
      bg: 'bg-red-50',
      border: 'border-red-300',
      textCol: 'text-red-800',
      dot: 'bg-red-600',
      icon: XCircle,
    },
    processing: {
      text: 'Processing / प्रक्रियाधीन',
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      textCol: 'text-blue-800',
      dot: 'bg-blue-600 animate-pulse',
      icon: Clock,
    },
    pending: {
      text: 'Pending / लंबित',
      bg: 'bg-slate-100',
      border: 'border-slate-300',
      textCol: 'text-slate-700',
      dot: 'bg-slate-500',
      icon: Clock,
    },
    low_risk: {
      text: 'Low Risk / सुरक्षित',
      bg: 'bg-emerald-50',
      border: 'border-emerald-300',
      textCol: 'text-emerald-800',
      dot: 'bg-emerald-600',
      icon: ShieldCheck,
    },
    medium_risk: {
      text: 'Medium Risk / मध्यम',
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      textCol: 'text-amber-800',
      dot: 'bg-amber-600',
      icon: AlertTriangle,
    },
    high_risk: {
      text: 'High Risk / उच्च जोखिम',
      bg: 'bg-red-50',
      border: 'border-red-300',
      textCol: 'text-red-800',
      dot: 'bg-red-600',
      icon: ShieldAlert,
    },
  };

  const config = configs[status] || configs.pending;
  const IconComponent = config.icon;

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-medium rounded-md',
    md: 'text-xs px-2.5 py-1 gap-2 font-medium rounded-lg',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center border backdrop-blur-md select-none transition-colors',
        sizeStyles[size],
        config.bg,
        config.border,
        config.textCol,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span className="tracking-wide">{label || config.text}</span>
    </span>
  );
};

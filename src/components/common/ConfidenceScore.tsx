import React from 'react';
import { ProgressRing } from './ProgressRing';
import { cn } from '../../utils/cn';

interface ConfidenceScoreProps {
  score: number;
  label?: string;
  size?: number;
  showBreakdown?: boolean;
  className?: string;
}

export const ConfidenceScore: React.FC<ConfidenceScoreProps> = ({
  score,
  label = 'Authenticity Confidence',
  size = 80,
  showBreakdown = false,
  className,
}) => {
  const getColor = (val: number): 'emerald' | 'amber' | 'rose' => {
    if (val >= 90) return 'emerald';
    if (val >= 70) return 'amber';
    return 'rose';
  };

  const getAssessment = (val: number) => {
    if (val >= 95) return { text: 'High Confidence', desc: 'Exceeds standard threshold' };
    if (val >= 85) return { text: 'Reliable Match', desc: 'Acceptable parameters' };
    if (val >= 70) return { text: 'Requires Review', desc: 'Borderline confidence' };
    return { text: 'Critical Mismatch', desc: 'Below acceptable threshold' };
  };

  const color = getColor(score);
  const assessment = getAssessment(score);

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <ProgressRing value={score} size={size} strokeWidth={size > 70 ? 7 : 5} color={color} />
      <div>
        <div className="text-xs uppercase font-bold tracking-wider text-slate-500">
          {label}
        </div>
        <div className="text-base font-bold text-slate-900 flex items-center gap-2 mt-0.5">
          {assessment.text}
        </div>
        {showBreakdown && (
          <div className="text-xs text-slate-500 mt-0.5">{assessment.desc}</div>
        )}
      </div>
    </div>
  );
};

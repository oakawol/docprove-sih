import React from 'react';
import websiteLogo from '../../images/Create_Doc_Prove_logo_identity_2K_20260916231622-removebg-preview.png';

export interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

/**
 * Isolated Docprove Brand Logo Component.
 * Integrates the official Doc Prove identity logo from the images folder.
 */
export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  onClick,
}) => {
  const markDimensions = {
    sm: 22,
    md: 26,
    lg: 32,
  }[size];

  const titleSizes = {
    sm: 'text-xs tracking-[0.2em]',
    md: 'text-sm tracking-[0.2em]',
    lg: 'text-base tracking-[0.22em]',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 select-none px-3 py-1 rounded-full bg-white hover:bg-slate-100 transition-all duration-200 shadow-[0_2px_12px_rgba(0,0,0,0.35)] ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label="DOC PROVE Home"
    >
      {/* Official Doc Prove Logo Symbol in authentic dark tones */}
      <div
        className="relative overflow-hidden shrink-0 flex items-center justify-center rounded-sm"
        style={{
          width: `${markDimensions}px`,
          height: `${markDimensions}px`,
        }}
      >
        <img
          src={websiteLogo}
          alt="DOC PROVE Logo"
          className="absolute max-w-none pointer-events-none transition-transform duration-300 group-hover:scale-105"
          style={{
            width: `${(500 / 85) * markDimensions}px`,
            height: `${(500 / 87) * markDimensions}px`,
            left: `-${(59 / 85) * markDimensions}px`,
            top: `-${(207 / 87) * markDimensions}px`,
          }}
        />
      </div>

      {/* Typography: DOC in black and PROVE in blue like the img in images folder */}
      <div className="flex items-center gap-1 font-bold font-sans tracking-[0.14em]">
        <span className={`${titleSizes} text-[#0a1118]`}>
          DOC
        </span>
        <span className={`${titleSizes} text-[#4ba2c2]`}>
          PROVE
        </span>
      </div>
    </div>
  );
};

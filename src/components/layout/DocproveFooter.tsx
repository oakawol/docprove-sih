import React from 'react';
import { Logo } from '../brand/Logo';
import { type ActivePage } from './DocproveNavbar';

interface FooterProps {
  onSelectPage: (page: ActivePage) => void;
}

export const DocproveFooter: React.FC<FooterProps> = ({ onSelectPage }) => {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-[#05070c] pt-14 pb-12 text-slate-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-white/[0.06]">
          {/* Brand Info */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Logo
              size="md"
              onClick={() => {
                onSelectPage('verify');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <p className="text-[10px] font-mono tracking-[0.2em] text-slate-500 uppercase mt-1">
              AI POWERED DOCUMENT INTELLIGENCE
            </p>
          </div>

          {/* Minimal Links */}
          <div className="flex items-center gap-8 text-xs font-sans font-medium tracking-wider">
            <button
              onClick={() => {
                onSelectPage('verify');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              VERIFY
            </button>
            <button
              onClick={() => {
                onSelectPage('makers');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              MAKERS
            </button>
          </div>

          {/* SIH Factual Notice */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.06] text-[10px] font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>SMART INDIA HACKATHON PROTOTYPE</span>
          </div>
        </div>

        {/* Bottom Microcopy */}
        <div className="pt-6 flex items-center justify-center text-center gap-3 text-[10px] text-slate-500 font-mono">
          <p>© {new Date().getFullYear()} DOC PROVE. Independent Research Prototype.</p>
        </div>
      </div>
    </footer>
  );
};

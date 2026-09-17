import React from 'react';
import { type ActivePage } from './DocproveNavbar';

interface FooterProps {
  onSelectPage: (page: ActivePage) => void;
}

export const DocproveFooter: React.FC<FooterProps> = ({ onSelectPage }) => {
  return (
    <footer className="w-full border-t border-white/[0.08] light:border-black/[0.08] bg-[#07090e] light:bg-[#F5F4F0] pt-14 pb-14 text-xs relative z-10 select-none transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* CENTER: Central DocProve Signature Mark */}
          <div className="flex flex-col items-center sm:items-start group cursor-default">
            <div className="relative flex flex-col items-center sm:items-start transition-all duration-300 transform group-hover:-translate-y-0.5">
              <span className="font-sans font-bold text-lg sm:text-xl tracking-[0.2em] uppercase text-[#f8fafc] light:text-[#0f172a] opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                DOCPROVE
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-4 h-[1px] bg-white/20 light:bg-black/20 group-hover:w-6 transition-all duration-300" />
                <span className="font-mono text-[10px] tracking-[0.25em] text-[#a1a1aa] light:text-[#475569] uppercase font-semibold">
                  2026
                </span>
                <span className="w-4 h-[1px] bg-white/20 light:bg-black/20 group-hover:w-6 transition-all duration-300" />
              </div>
              <span className="mt-1 font-mono text-[9px] tracking-[0.18em] text-[#71717a] light:text-[#64748b] uppercase opacity-75">
                DOCUMENT VERIFICATION
              </span>
            </div>
          </div>

          {/* RIGHT: Simple Navigation Links */}
          <div className="flex items-center justify-center sm:justify-end gap-8 text-xs font-sans font-medium tracking-wider">
            <button
              onClick={() => {
                onSelectPage('verify');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group relative text-[#a1a1aa] light:text-[#475569] hover:text-[#f8fafc] light:hover:text-[#0f172a] transition-all duration-300 cursor-pointer py-1.5 transform hover:-translate-y-0.5"
            >
              <span className="relative z-10 uppercase tracking-widest text-[11px] font-semibold">VERIFY</span>
              <span className="absolute inset-x-0 bottom-0 h-[1.5px] bg-[#E03131] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </button>
            <button
              onClick={() => {
                onSelectPage('makers');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group relative text-[#a1a1aa] light:text-[#475569] hover:text-[#f8fafc] light:hover:text-[#0f172a] transition-all duration-300 cursor-pointer py-1.5 transform hover:-translate-y-0.5"
            >
              <span className="relative z-10 uppercase tracking-widest text-[11px] font-semibold">MAKERS</span>
              <span className="absolute inset-x-0 bottom-0 h-[1.5px] bg-[#E03131] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
};


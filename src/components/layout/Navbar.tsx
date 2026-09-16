import React from 'react';
import {
  LayoutDashboard,
  ScanLine,
  FileSearch,
  Archive,
  Phone,
  Globe,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../common/Button';
import { cn } from '../../utils/cn';

export type NavView = 'dashboard' | 'studio' | 'inspector' | 'records';

interface NavbarProps {
  activeView: NavView;
  onSelectView: (view: NavView) => void;
  onNewVerification: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onSelectView,
  onNewVerification,
}) => {
  const navItems: { id: NavView; labelEn: string; labelHi: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', labelEn: 'Dashboard', labelHi: 'डैशबोर्ड', icon: LayoutDashboard },
    { id: 'studio', labelEn: 'Verification Studio', labelHi: 'सत्यापन कक्ष', icon: ScanLine },
    { id: 'inspector', labelEn: 'Forensic Examination Desk', labelHi: 'फोरेंसिक जांच', icon: FileSearch },
    { id: 'records', labelEn: 'National Audit Archive', labelHi: 'अभिलेख भंडार', icon: Archive },
  ];

  return (
    <header className="sticky top-0 z-40 w-full shadow-md">
      {/* 1. Official Government Top Utility Bar */}
      <div className="bg-[#f1f5f9] border-b border-slate-200 text-[11px] text-slate-700 py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Ministry & Country Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-bold text-[#0a2540]">
              <span>भारत सरकार</span>
              <span className="text-slate-400">|</span>
              <span>Government of India</span>
            </div>
            <span className="hidden md:inline text-slate-400">|</span>
            <div className="hidden md:flex items-center gap-2 text-slate-600 font-medium">
              <span>विदेश मंत्रालय (MEA) एवं गृह मंत्रालय (MHA)</span>
            </div>
          </div>

          {/* Right: Helpline & Accessibility */}
          <div className="flex items-center gap-4 text-[11px]">
            <div className="hidden sm:flex items-center gap-1 text-slate-600">
              <Phone className="w-3 h-3 text-[#0a2540]" />
              <span>हेल्पलाइन / Toll-Free: <strong>1800-258-1800</strong></span>
            </div>
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-300">
              <Globe className="w-3 h-3 text-slate-500" />
              <button type="button" className="hover:text-[#0a2540] font-semibold cursor-pointer">English</button>
              <span className="text-slate-400">/</span>
              <button type="button" className="hover:text-[#0a2540] font-semibold cursor-pointer">हिन्दी</button>
            </div>
            <div className="hidden lg:flex items-center gap-1 text-[10px] font-mono bg-slate-200/80 px-1.5 py-0.5 rounded border border-slate-300">
              <button type="button" className="px-1 hover:bg-white rounded">A-</button>
              <button type="button" className="px-1 font-bold bg-white rounded shadow-2xs">A</button>
              <button type="button" className="px-1 hover:bg-white rounded">A+</button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Official National Tricolor Ribbon */}
      <div className="gov-tricolor-ribbon" />

      {/* 3. Main Portal Header with Emblem and Identity */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Ashoka Stambh Emblem Graphic */}
            <div className="w-12 h-14 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 120" className="w-full h-full text-[#0a2540]" fill="currentColor">
                <circle cx="50" cy="45" r="40" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.4" />
                <path d="M50,15 L56,36 L44,36 Z M30,30 L45,42 L38,50 Z M70,30 L55,42 L62,50 Z" />
                <rect x="30" y="58" width="40" height="8" rx="2" />
                <circle cx="50" cy="76" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M50,68 L50,84 M42,76 L58,76 M44,70 L56,82 M44,82 L56,70" stroke="currentColor" strokeWidth="1.5" />
                <text x="50" y="100" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">सत्यमेव जयते</text>
              </svg>
            </div>

            {/* Portal Title */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-[#0a2540] tracking-tight leading-tight">
                  राष्ट्रीय पहचान, पासपोर्ट एवं वीज़ा सत्यापन प्रणाली
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-orange-100 text-orange-800 border border-orange-300">
                  Govt of India
                </span>
              </div>
              <p className="text-xs text-slate-600 font-semibold tracking-wide">
                National Identity, Passport & Visa Verification Portal (NIPVVS)
              </p>
              <p className="hidden md:block text-[11px] text-slate-500">
                Passport Seva & Bureau of Immigration — Automated Anti-Spoofing & Forensic Detection Division
              </p>
            </div>
          </div>

          {/* Right Action: Official Verified Stamp & Trigger */}
          <div className="flex items-center gap-3">
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ICAO 9303 & MHA Certified</span>
            </div>

            <Button
              size="md"
              variant="primary"
              leftIcon={<PlusCircle className="w-4 h-4 text-orange-400" />}
              onClick={onNewVerification}
              className="bg-[#0a2540] hover:bg-[#133b68] border-[#0a2540] text-white text-xs sm:text-sm font-bold shadow-sm"
            >
              <span>नया सत्यापन / New Verification</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Official Navigation Ribbon */}
      <nav className="bg-[#0a2540] text-white px-4 sm:px-6 lg:px-8 border-b border-slate-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-1 py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectView(item.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer select-none whitespace-nowrap',
                    isActive
                      ? 'border-orange-400 text-orange-300 bg-white/10'
                      : 'border-transparent text-slate-200 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-orange-400' : 'text-slate-300')} />
                  <div className="text-left leading-tight">
                    <div className="text-[11px] opacity-90">{item.labelHi}</div>
                    <div className="text-[10px] uppercase tracking-wider font-semibold opacity-75">{item.labelEn}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>NIC Gateway: Online</span>
          </div>
        </div>
      </nav>
    </header>
  );
};

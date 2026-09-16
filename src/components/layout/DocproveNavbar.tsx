import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Logo } from '../brand/Logo';

export type ActivePage = 'verify' | 'makers';

interface NavbarProps {
  activePage: ActivePage;
  onSelectPage: (page: ActivePage) => void;
}

interface NavLinkBoxProps {
  tab: ActivePage;
  isActive: boolean;
  onClick: () => void;
}

const NavLinkBox: React.FC<NavLinkBoxProps> = ({ tab, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [cursorOffset, setCursorOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    // Strictly clamp to maximum 1px movement
    setCursorOffset({
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCursorOffset({ x: 0, y: 0 });
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        y: isHovered ? -1 + cursorOffset.y * 0.5 : 0,
        x: isHovered ? cursorOffset.x * 0.6 : 0,
      }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        backgroundColor: isHovered
          ? 'rgba(255, 255, 255, 0.055)'
          : isActive
          ? 'rgba(255, 255, 255, 0.04)'
          : 'rgba(255, 255, 255, 0.025)',
        borderColor: isHovered
          ? 'rgba(255, 255, 255, 0.18)'
          : isActive
          ? 'rgba(255, 255, 255, 0.13)'
          : 'rgba(255, 255, 255, 0.07)',
        boxShadow: isHovered
          ? '0 4px 12px -2px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : isActive
          ? '0 2px 6px -2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06)'
          : '0 1px 2px rgba(0, 0, 0, 0.2)',
      }}
      className="relative px-4 py-1.5 rounded-[8px] border transition-colors duration-300 overflow-hidden cursor-pointer flex items-center justify-center select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
    >
      {/* Subtle Light Sweep on Hover */}
      <motion.div
        aria-hidden="true"
        initial={{ x: '-160%' }}
        animate={{ x: isHovered ? '260%' : '-160%' }}
        transition={{
          duration: 0.65,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute inset-0 w-14 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.065] to-transparent pointer-events-none"
      />

      {/* Subtle Hairline Edge Illumination */}
      <div
        className={`absolute inset-0 rounded-[7px] pointer-events-none transition-opacity duration-300 ${
          isHovered
            ? 'opacity-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]'
            : isActive
            ? 'opacity-70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]'
            : 'opacity-0'
        }`}
      />

      {/* Text Label with smooth 250-350ms transition */}
      <span
        className={`relative z-10 text-[11px] font-sans font-medium tracking-[0.08em] uppercase transition-colors duration-300 ${
          isActive
            ? 'text-white'
            : isHovered
            ? 'text-[#f0f2f5]'
            : 'text-[#828c9e]'
        }`}
      >
        {tab}
      </span>
    </motion.button>
  );
};

export const DocproveNavbar: React.FC<NavbarProps> = ({
  activePage,
  onSelectPage,
}) => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    let lastScrollY = window.scrollY || 0;
    let accumulatedDelta = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY || 0;
      setScrollY(currentScrollY);

      // At the very top of the page, navbar is always forced visible
      if (currentScrollY <= 15) {
        setIsVisible(true);
        accumulatedDelta = 0;
        lastScrollY = currentScrollY;
        return;
      }

      const delta = currentScrollY - lastScrollY;

      // If scroll direction changed, reset the accumulator
      if ((delta > 0 && accumulatedDelta < 0) || (delta < 0 && accumulatedDelta > 0)) {
        accumulatedDelta = 0;
      }

      accumulatedDelta += delta;

      if (accumulatedDelta > 10) {
        // Scrolled DOWN more than 10px in current direction: smoothly hide
        setIsVisible(false);
      } else if (accumulatedDelta < -8) {
        // Scrolled UP more than 8px in current direction: elegantly return ("poof" back)
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isScrolled = scrollY > 20;

  const handleNavClick = (page: ActivePage) => {
    onSelectPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          y: isVisible || mobileMenuOpen ? '0%' : '-120%',
          opacity: isVisible || mobileMenuOpen ? 1 : 0,
          filter: isVisible || mobileMenuOpen ? 'blur(0px)' : 'blur(3px)',
        }}
        transition={{
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1], // exact cubic-bezier(0.22, 1, 0.36, 1)
        }}
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 transition-[padding] duration-500 pointer-events-none ${
          isScrolled ? 'pt-3 sm:pt-3.5' : 'pt-5 sm:pt-6'
        }`}
      >
        <nav
          aria-label="Main Navigation"
          style={{
            backgroundColor: isScrolled ? 'rgba(10, 13, 23, 0.88)' : 'rgba(10, 14, 25, 0.62)',
            backdropFilter: isScrolled ? 'blur(24px)' : 'blur(16px)',
            borderColor: isScrolled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.06)',
            pointerEvents: isVisible || mobileMenuOpen ? 'auto' : 'none',
          }}
          className={`w-full max-w-4xl rounded-full transition-all duration-500 flex items-center justify-between px-5 sm:px-7 border border-t-white/[0.14] shadow-[0_16px_36px_-10px_rgba(0,0,0,0.75)] ${
            isScrolled ? 'py-2.5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.9)]' : 'py-3.5'
          }`}
        >
          {/* Crisp Logo on Left */}
          <Logo
            size="sm"
            onClick={() => handleNavClick('verify')}
            className="focus:outline-none"
          />

          {/* Center Navigation: VERIFY & MAKERS subtle premium interactive boxes */}
          <div className="hidden md:flex items-center gap-2 relative">
            {(['verify', 'makers'] as const).map((tab) => (
              <NavLinkBox
                key={tab}
                tab={tab}
                isActive={activePage === tab}
                onClick={() => handleNavClick(tab)}
              />
            ))}
          </div>

          {/* Right Status: SYSTEM READY with soft breathing pulse */}
          <div className="hidden sm:flex items-center gap-2 text-[10.5px] font-sans text-slate-400 tracking-[0.08em] font-medium">
            <span className="relative flex h-1.5 w-1.5">
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400 animate-soft-pulse"></span>
            </span>
            <span>SYSTEM READY</span>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </nav>
      </motion.header>


      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-20 z-40 md:hidden rounded-2xl bg-[#0a0d17]/95 backdrop-blur-2xl border border-white/[0.1] p-5 shadow-2xl surface-control"
          >
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleNavClick('verify')}
                className={`flex items-center justify-between p-3 rounded-xl text-left font-medium transition-all ${
                  activePage === 'verify'
                    ? 'bg-white/[0.08] text-white'
                    : 'text-slate-400 hover:bg-white/[0.03]'
                }`}
              >
                <span className="tracking-wider text-xs font-mono">VERIFY</span>
                <span className="text-xs font-mono text-slate-500">01</span>
              </button>

              <button
                onClick={() => handleNavClick('makers')}
                className={`flex items-center justify-between p-3 rounded-xl text-left font-medium transition-all ${
                  activePage === 'makers'
                    ? 'bg-white/[0.08] text-white'
                    : 'text-slate-400 hover:bg-white/[0.03]'
                }`}
              >
                <span className="tracking-wider text-xs font-mono">MAKERS</span>
                <span className="text-xs font-mono text-slate-500">02</span>
              </button>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-soft-pulse" />
                  SYSTEM READY
                </span>
                <span className="text-[10px] text-slate-500">DOCPROVE 2.0</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

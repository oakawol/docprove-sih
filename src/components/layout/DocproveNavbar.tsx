import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
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
          ? 'var(--nav-item-hover-bg, rgba(255, 255, 255, 0.055))'
          : isActive
          ? 'var(--nav-item-active-bg, rgba(255, 255, 255, 0.04))'
          : 'var(--nav-item-bg, rgba(255, 255, 255, 0.025))',
        borderColor: isHovered
          ? 'var(--border-highlight)'
          : isActive
          ? 'var(--border-highlight)'
          : 'var(--border-hairline)',
        boxShadow: isHovered
          ? '0 4px 12px -2px rgba(0, 0, 0, 0.15)'
          : 'none',
      }}
      className="relative px-4 py-1.5 rounded-[8px] border transition-colors duration-300 overflow-hidden cursor-pointer flex items-center justify-center select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400/30 rainbow-hover-target"
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
        className="absolute inset-0 w-14 -skew-x-12 bg-gradient-to-r from-transparent via-current opacity-[0.06] to-transparent pointer-events-none"
      />

      {/* Text Label with smooth 250-350ms transition */}
      <span
        className={`relative z-10 text-[11px] font-sans font-medium tracking-[0.08em] uppercase transition-colors duration-300 ${
          isActive
            ? 'text-[#f8fafc] light:text-[#0f172a] font-semibold'
            : 'text-[#8e95a5] light:text-[#475569] hover:text-[#f8fafc] light:hover:text-[#0f172a]'
        }`}
      >
        {tab}
      </span>
    </motion.button>
  );
};

/**
 * Standalone API LIVE Interactive Control Box
 */
const ApiLiveBox: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ y: isHovered ? -1 : 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`relative px-3 py-1.5 rounded-[10px] border flex items-center gap-2 cursor-default select-none transition-all duration-300 rainbow-hover-target ${
        isHovered
          ? 'bg-[#101826] light:bg-[#f1f5f9] border-emerald-500/35 light:border-emerald-500/40 shadow-[0_4px_14px_-2px_rgba(0,0,0,0.3),0_0_12px_1px_rgba(16,185,129,0.12)]'
          : 'bg-[#0c101b]/55 light:bg-[#ffffff]/80 border-white/[0.08] light:border-black/[0.1] shadow-sm'
      }`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 light:bg-emerald-600 animate-soft-pulse" />
      </span>
      <span className={`text-[10.5px] font-sans font-medium tracking-[0.08em] uppercase transition-colors duration-300 ${
        isHovered ? 'text-white light:text-[#0f172a]' : 'text-[#94a3b8] light:text-[#475569]'
      }`}>
        API LIVE
      </span>
    </motion.div>
  );
};

/**
 * Dark / Light Mode Switch Pill Control
 */
interface ThemeToggleProps {
  theme: 'dark' | 'light';
  onToggle: () => void;
}

const ThemeToggleControl: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isDark = theme === 'dark';

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ y: isHovered ? -1 : 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        backgroundColor: isHovered
          ? isDark
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(0, 0, 0, 0.08)'
          : isDark
          ? 'rgba(255, 255, 255, 0.035)'
          : 'rgba(0, 0, 0, 0.04)',
        borderColor: isHovered
          ? isDark
            ? 'rgba(255, 255, 255, 0.2)'
            : 'rgba(0, 0, 0, 0.2)'
          : isDark
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.08)',
        boxShadow: isHovered
          ? '0 4px 12px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 2px 4px rgba(0, 0, 0, 0.2)',
      }}
      className="relative w-9 h-8 rounded-[10px] border flex items-center justify-center cursor-pointer transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400/40 rainbow-hover-target"
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="moon-icon"
            initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="w-3.5 h-3.5 text-slate-300 hover:text-white" />
          </motion.div>
        ) : (
          <motion.div
            key="sun-icon"
            initial={{ opacity: 0, rotate: 30, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -30, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="w-3.5 h-3.5 text-amber-600 hover:text-amber-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export const DocproveNavbar: React.FC<NavbarProps> = ({ activePage, onSelectPage }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavHovered, setIsNavHovered] = useState(false);

  // Theme State Machine with localStorage Persistence
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('docprove_theme') : null;
    const lightClassApplied = typeof document !== 'undefined' && document.documentElement.classList.contains('light');
    return saved === 'light' || lightClassApplied ? 'light' : 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('docprove_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    let lastScrollY = window.scrollY || 0;
    let accumulatedDelta = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY || 0;
      setIsScrolled(currentScrollY > 20);

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
      } else if (accumulatedDelta < -10) {
        // Scrolled UP more than 10px in current direction: elegantly return ("poof" back)
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (page: ActivePage) => {
    onSelectPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{
          y: isVisible || mobileMenuOpen ? (isNavHovered ? -1 : 0) : -120,
          opacity: isVisible || mobileMenuOpen ? 1 : 0,
          filter: isVisible || mobileMenuOpen ? 'blur(0px)' : 'blur(3px)',
        }}
        transition={{
          duration: 0.75,
          ease: [0.22, 1, 0.36, 1], // exact cubic-bezier(0.22, 1, 0.36, 1)
        }}
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 transition-[padding] duration-500 pointer-events-none ${
          isScrolled ? 'pt-3 sm:pt-3.5' : 'pt-5 sm:pt-6'
        }`}
      >
        <nav
          aria-label="Main Navigation"
          onMouseEnter={() => setIsNavHovered(true)}
          onMouseLeave={() => setIsNavHovered(false)}
          style={{
            backgroundColor: theme === 'light'
              ? isNavHovered
                ? 'rgba(255, 255, 255, 0.95)'
                : 'rgba(255, 255, 255, 0.82)'
              : isNavHovered
              ? isScrolled
                ? 'rgba(14, 18, 30, 0.95)'
                : 'rgba(14, 19, 32, 0.72)'
              : isScrolled
              ? 'rgba(10, 13, 23, 0.88)'
              : 'rgba(10, 14, 25, 0.62)',
            backdropFilter: isScrolled ? 'blur(24px)' : 'blur(16px)',
            borderColor: theme === 'light'
              ? isNavHovered
                ? 'rgba(0, 0, 0, 0.18)'
                : 'rgba(0, 0, 0, 0.12)'
              : isNavHovered
              ? 'rgba(255, 255, 255, 0.18)'
              : isScrolled
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(255, 255, 255, 0.06)',
            boxShadow: theme === 'light'
              ? isNavHovered
                ? '0 16px 36px -10px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 1)'
                : '0 12px 28px -10px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
              : isNavHovered
              ? '0 22px 48px -12px rgba(0, 0, 0, 0.85), 0 0 24px 2px rgba(255, 255, 255, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.16)'
              : isScrolled
              ? '0 20px 40px -10px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.10)'
              : '0 16px 36px -10px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
            transform: isNavHovered ? 'translateY(-1px)' : 'translateY(0px)',
            transition: 'all 450ms cubic-bezier(0.22, 1, 0.36, 1)',
            pointerEvents: isVisible || mobileMenuOpen ? 'auto' : 'none',
          }}
          className={`relative overflow-hidden w-full max-w-4xl rounded-full flex items-center justify-between px-5 sm:px-7 border border-t-white/[0.14] light:border-t-black/[0.1] rainbow-hover-target ${
            isScrolled ? 'py-2.5' : 'py-3.5'
          }`}
        >
          {/* Subtle Perimeter Edge Light Sweep Across Navbar Surface on Hover */}
          <motion.div
            aria-hidden="true"
            initial={{ x: '-150%' }}
            animate={{ x: isNavHovered ? '250%' : '-150%' }}
            transition={{
              duration: 0.85,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0 w-32 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.045] to-transparent pointer-events-none z-0"
          />

          {/* Crisp Logo on Left */}
          <Logo
            size="sm"
            onClick={() => handleNavClick('verify')}
            className={`relative z-10 focus:outline-none transition-opacity duration-300 ${
              isNavHovered ? 'opacity-100' : 'opacity-95'
            }`}
          />

          {/* Center Navigation: VERIFY & MAKERS subtle premium interactive boxes */}
          <div className="hidden md:flex items-center gap-2 relative z-10">
            {(['verify', 'makers'] as const).map((tab) => (
              <NavLinkBox
                key={tab}
                tab={tab}
                isActive={activePage === tab}
                onClick={() => handleNavClick(tab)}
              />
            ))}
          </div>

          {/* Right Controls: Standalone API LIVE Box + Theme Toggle Control */}
          <div className="relative z-10 hidden sm:flex items-center gap-2.5">
            <ApiLiveBox />
            <ThemeToggleControl theme={theme} onToggle={toggleTheme} />
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="relative z-10 md:hidden min-w-11 min-h-11 p-1.5 rounded-lg text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-950 transition-colors cursor-pointer flex items-center justify-center"
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
            className="fixed inset-x-4 top-20 z-40 md:hidden max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-2xl bg-[#0a0d17]/95 light:bg-white/95 backdrop-blur-2xl border border-white/[0.1] light:border-black/[0.1] p-5 shadow-2xl surface-control"
          >
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleNavClick('verify')}
                className={`flex items-center justify-between p-3 rounded-xl text-left font-medium transition-all ${
                  activePage === 'verify'
                    ? 'bg-white/[0.08] light:bg-black/[0.06]'
                    : 'text-slate-400 light:text-slate-600 hover:bg-white/[0.03] light:hover:bg-black/[0.03]'
                }`}
              >
                <span className="tracking-wider text-xs font-mono text-white light:text-slate-900">VERIFY</span>
                <span className="text-xs font-mono text-slate-500 light:text-slate-500">01</span>
              </button>

              <button
                onClick={() => handleNavClick('makers')}
                className={`flex items-center justify-between p-3 rounded-xl text-left font-medium transition-all ${
                  activePage === 'makers'
                    ? 'bg-white/[0.08] light:bg-black/[0.06]'
                    : 'text-slate-400 light:text-slate-600 hover:bg-white/[0.03] light:hover:bg-black/[0.03]'
                }`}
              >
                <span className="tracking-wider text-xs font-mono text-white light:text-slate-900">MAKERS</span>
                <span className="text-xs font-mono text-slate-500 light:text-slate-500">02</span>
              </button>

              <div className="pt-3 border-t border-white/[0.06] light:border-black/[0.08] flex items-center justify-between text-xs font-mono text-slate-400 light:text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-soft-pulse" />
                  API LIVE
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500">DOCPROVE 2.0</span>
                  <ThemeToggleControl theme={theme} onToggle={toggleTheme} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

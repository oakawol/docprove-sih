import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import { DocproveVerificationProvider } from './context/DocproveVerificationContext';
import { DocproveNavbar, type ActivePage } from './components/layout/DocproveNavbar';
import { DocproveFooter } from './components/layout/DocproveFooter';
import { VerifyPage } from './components/verify/VerifyPage';
import { MakersPage } from './components/makers/MakersPage';
import { CinematicBackground } from './components/background/CinematicBackground';

const AppContent: React.FC = () => {
  const [activePage, setActivePage] = useState<ActivePage>('verify');

  // Handle Hash Sync for direct bookmarking (#makers / #verify)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'makers') {
        setActivePage('makers');
      } else if (hash === 'verify') {
        setActivePage('verify');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectPage = (page: ActivePage) => {
    setActivePage(page);
    window.location.hash = page;
  };

  // Lenis Cinematic Smooth Scroll System
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-[#f5f5f7] selection:bg-white/20 selection:text-white relative overflow-x-hidden font-sans">
      {/* Cinematic Document Security & Optical Geometry Background */}
      <CinematicBackground />

      {/* Floating Island Control Navbar */}
      <DocproveNavbar
        activePage={activePage}
        onSelectPage={handleSelectPage}
      />

      {/* Main Page Content with Fluid Transitions */}
      <main className="flex-1 w-full relative z-10">
        <AnimatePresence mode="wait">
          {activePage === 'verify' ? (
            <motion.div
              key="verify-page"
              initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(3px)' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <VerifyPage />
            </motion.div>
          ) : (
            <motion.div
              key="makers-page"
              initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(3px)' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <MakersPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Minimal Footer */}
      <DocproveFooter onSelectPage={handleSelectPage} />
    </div>
  );
};

export function App() {
  return (
    <DocproveVerificationProvider>
      <AppContent />
    </DocproveVerificationProvider>
  );
}

export default App;

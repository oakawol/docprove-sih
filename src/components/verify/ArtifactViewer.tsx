import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getArtifactUrl } from '../../services/api';
import type { ArtifactPaths } from '../../types/scan';

interface ArtifactViewerProps {
  artifacts: ArtifactPaths;
  className?: string;
}

type ArtifactTab = 'original' | 'heatmap' | 'annotated';

const TABS: { key: ArtifactTab; label: string }[] = [
  { key: 'original', label: 'ORIGINAL' },
  { key: 'heatmap', label: 'HEATMAP' },
  { key: 'annotated', label: 'ANNOTATED' },
];

/**
 * Premium artifact image viewer for the tampering stage.
 * Shows Original / Heatmap / Annotated images from the backend.
 * Styled to match the warm ivory #F1F0EB verification surface.
 */
export const ArtifactViewer: React.FC<ArtifactViewerProps> = ({ artifacts, className = '' }) => {
  const availableTabs = TABS.filter((t) => artifacts[t.key]);
  const defaultTab = artifacts.heatmap ? 'heatmap' : (availableTabs[0]?.key || 'original');
  const [activeTab, setActiveTab] = useState<ArtifactTab>(defaultTab);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const currentUrl = artifacts[activeTab] ? getArtifactUrl(artifacts[activeTab]!) : null;

  if (availableTabs.length === 0) {
    return (
      <div className={`flex items-center justify-center text-xs font-mono text-[#6B6B6B] py-8 ${className}`}>
        NO ARTIFACTS AVAILABLE
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Segmented Control */}
      <div className="flex items-center gap-1 p-0.5 rounded-full bg-[#E8E7E2] border border-black/[0.06]">
        {availableTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              setIsLoading(true);
              setHasError(false);
            }}
            className={`relative flex-1 py-1.5 px-3 rounded-full text-[10px] font-mono tracking-[0.12em] uppercase transition-all duration-250 cursor-pointer ${
              activeTab === tab.key
                ? 'bg-[#111318] text-white shadow-sm'
                : 'text-[#6B6B6B] hover:text-[#111318]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Image Container */}
      <div className="relative rounded-xl overflow-hidden bg-[#E8E7E2] border border-black/[0.06] min-h-[180px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentUrl && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {isLoading && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <span className="text-[10px] font-mono text-[#6B6B6B] animate-pulse">
                    LOADING {activeTab.toUpperCase()}...
                  </span>
                </div>
              )}

              {hasError ? (
                <div className="flex items-center justify-center py-12">
                  <span className="text-[10px] font-mono text-[#999]">
                    ARTIFACT UNAVAILABLE
                  </span>
                </div>
              ) : (
                <img
                  src={currentUrl}
                  alt={`Document ${activeTab}`}
                  className={`w-full h-auto object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Thermal Heatmap Scale Legend */}
      {activeTab === 'heatmap' && (
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-[9px] font-mono tracking-wider text-[#6B6B6B] uppercase">Clean</span>
          <div className="flex-1 mx-3 h-1.5 rounded-full bg-gradient-to-r from-[#1d4ed8] via-[#06b6d4] via-[#eab308] to-[#dc2626] shadow-inner opacity-80" />
          <span className="text-[9px] font-mono tracking-wider text-[#dc2626] font-semibold uppercase">Anomaly</span>
        </div>
      )}
    </div>
  );
};

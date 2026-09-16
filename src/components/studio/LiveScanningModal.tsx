import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileUp,
  ScanText,
  ShieldCheck,
  SearchAlert,
  UserCheck,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { useVerification } from '../../context/VerificationContext';
import { ProgressRing } from '../common/ProgressRing';
import { cn } from '../../utils/cn';

export const LiveScanningModal: React.FC = () => {
  const { isProcessing, processingProgress, processingStage, processingLog } = useVerification();

  const stages = [
    { id: 'upload', labelEn: 'Ingest', labelHi: 'अंतर्ग्रहण', icon: FileUp },
    { id: 'ocr', labelEn: 'Neural OCR', labelHi: 'ऑप्टिकल पहचान', icon: ScanText },
    { id: 'validation', labelEn: 'Rules', labelHi: 'वैधानिक नियम', icon: ShieldCheck },
    { id: 'tampering', labelEn: 'Tampering', labelHi: 'फोरेंसिक जांच', icon: SearchAlert },
    { id: 'face', labelEn: 'Biometrics', labelHi: 'बायोमेट्रिक्स', icon: UserCheck },
    { id: 'result', labelEn: 'Verdict', labelHi: 'निर्णय', icon: CheckCircle2 },
  ];

  const currentStageIndex = stages.findIndex((s) => s.id === processingStage);

  return (
    <AnimatePresence>
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Frosted backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white rounded-xl p-6 sm:p-7 z-10 border-2 border-[#0a2540] shadow-2xl overflow-hidden"
          >
            {/* Top Tricolor Accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808]" />

            {/* Top Radar & Header */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <ProgressRing
                  value={processingProgress}
                  size={58}
                  strokeWidth={6}
                  color="cyan"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                    <h3 className="text-lg font-bold text-[#0a2540]">
                      राष्ट्रीय दस्तावेज़ सत्यापन प्रक्रियाधीन
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Government of India Immigration & Identity Verification Pipeline Active
                  </p>
                </div>
              </div>

              <div className="hidden sm:block text-right font-mono text-xs font-bold text-[#0a2540]">
                <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-300">
                  STAGE {Math.max(1, currentStageIndex + 1)} / 6
                </span>
              </div>
            </div>

            {/* Pipeline Stage Indicators */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 my-5">
              {stages.map((stg, idx) => {
                const Icon = stg.icon;
                const isCurrent = stg.id === processingStage;
                const isPassed = currentStageIndex > idx;

                return (
                  <div
                    key={stg.id}
                    className={cn(
                      'flex flex-col items-center text-center p-2 rounded-lg border transition-all duration-200',
                      isCurrent
                        ? 'bg-blue-50 border-[#0a2540] shadow-sm scale-105'
                        : isPassed
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    )}
                  >
                    <div
                      className={cn(
                        'w-7 h-7 rounded-md flex items-center justify-center mb-1',
                        isCurrent
                          ? 'bg-[#0a2540] text-white'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-bold leading-tight',
                        isCurrent
                          ? 'text-[#0a2540]'
                          : isPassed
                          ? 'text-emerald-800'
                          : 'text-slate-500'
                      )}
                    >
                      {stg.labelHi}
                    </span>
                    <span className="text-[9px] text-slate-400 leading-tight">
                      {stg.labelEn}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 p-0.5 overflow-hidden mb-5">
              <motion.div
                className="bg-gradient-to-r from-orange-500 via-[#0a2540] to-emerald-600 h-full rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${processingProgress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>

            {/* Live Streaming Terminal Log Output */}
            <div className="rounded-lg bg-slate-900 border border-slate-700 p-3.5 font-mono text-xs text-slate-300 shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700 text-slate-400 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-orange-400" />
                  <span>NIC SECURE GATEWAY TELEMETRY</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>STREAMING</span>
                </div>
              </div>

              <div className="space-y-1 min-h-[50px] flex flex-col justify-center">
                <div className="flex items-center gap-2 text-orange-300">
                  <span className="text-slate-500">&gt;</span>
                  <span className="font-semibold">{processingLog || 'Connecting to Central Passport & Visa Verification Service...'}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  [Node: New Delhi Gateway / MEA-ICP-01] Protocol: TLS 1.3 | SHA-256 HSM Cryptography
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, ArrowRight, ShieldCheck, CheckCircle2, FileUp, Sparkles } from 'lucide-react';
import { useDocprove } from '../../context/DocproveVerificationContext';
import { SimulationPipeline } from './SimulationPipeline';
import { VerificationResult } from './VerificationResult';

export const VerificationWorkspace: React.FC = () => {
  const {
    state,
    selectedFile,
    handleFileSelect,
    loadSampleDocument,
    clearFile,
    startVerification,
  } = useDocprove();

  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <section id="verification-workspace" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Background Lighting Anchor */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-cyan-400 mb-4"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>INTERACTIVE TERMINAL</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
        >
          Verify a document
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-sm sm:text-base text-slate-400 mt-3"
        >
          Upload a passport or visa and let Docprove analyze it.
        </motion.p>
      </div>

      {/* Dynamic View Transitions */}
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            {/* Hidden native input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={onFileInputChange}
              className="hidden"
            />

            {!selectedFile ? (
              /* Drag and Drop Zone */
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${
                  isDragOver
                    ? 'bg-sky-950/30 border-2 border-cyan-400 shadow-[0_0_40px_rgba(0,240,255,0.25)] scale-[1.01]'
                    : 'bg-[#0a0f1d]/75 backdrop-blur-2xl border border-white/[0.12] hover:border-cyan-500/40 hover:bg-[#0c1426]/90 shadow-[0_20px_50px_rgba(0,0,0,0.6)] group'
                }`}
              >
                {/* Minimal Document Icon */}
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 mb-6 group-hover:scale-110 group-hover:text-cyan-400 group-hover:border-cyan-500/40 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all duration-300">
                  <FileUp className="w-7 h-7 stroke-[1.75]" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide mb-2">
                  DROP YOUR DOCUMENT
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-sm mb-6">
                  Drag and drop your passport or visa here, or{' '}
                  <span className="text-cyan-400 font-semibold underline underline-offset-4">
                    BROWSE FILES
                  </span>
                </p>

                {/* Specs & Security Footnote */}
                <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono text-slate-400 border-t border-white/[0.08] pt-6 max-w-md w-full">
                  <span>SUPPORTED: PDF, JPG, JPEG, PNG</span>
                  <span>•</span>
                  <span>MAX: 10 MB</span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-emerald-400/90">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Processed securely.</span>
                </div>
              </div>
            ) : (
              /* Selected File Preview Box */
              <div className="rounded-3xl bg-[#0a0f1d]/90 backdrop-blur-2xl border border-cyan-500/30 p-8 shadow-[0_25px_60px_rgba(0,0,0,0.7),0_0_30px_rgba(0,240,255,0.1)] flex flex-col gap-6">
                <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                        DOCUMENT READY
                      </span>
                      <h4 className="text-base font-bold text-white tracking-wide truncate max-w-xs sm:max-w-md">
                        {selectedFile.name}
                      </h4>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">
                        {selectedFile.sizeFormatted} • {selectedFile.type}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={clearFile}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                    title="Remove file"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Integrity check ready. Click continue to initiate pipeline.</span>
                  </div>

                  <button
                    onClick={startVerification}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white text-slate-950 font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:bg-slate-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all cursor-pointer active:scale-95"
                  >
                    <span>CONTINUE</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Quick Demo Pre-loader Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className="text-xs font-mono text-slate-400">Or test with simulated specimen:</span>
              <button
                onClick={() => loadSampleDocument('passport')}
                className="px-3.5 py-1.5 rounded-full text-xs font-mono bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.1] hover:border-cyan-500/30 transition-all cursor-pointer"
              >
                + Demo Passport Specimen
              </button>
              <button
                onClick={() => loadSampleDocument('visa')}
                className="px-3.5 py-1.5 rounded-full text-xs font-mono bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.1] hover:border-cyan-500/30 transition-all cursor-pointer"
              >
                + Demo Visa Specimen
              </button>
            </div>
          </motion.div>
        )}

        {/* Verification Simulation Progress View */}
        {(state === 'scanning' ||
          state === 'ocrComplete' ||
          state === 'validationComplete' ||
          state === 'tamperingComplete' ||
          state === 'faceComplete') && (
          <motion.div
            key="simulation-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <SimulationPipeline />
          </motion.div>
        )}

        {/* Climax Final Result View */}
        {state === 'verified' && (
          <motion.div
            key="result-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <VerificationResult />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

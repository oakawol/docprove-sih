import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, CircleDot, Cpu } from 'lucide-react';
import { useDocprove, type StageProgress } from '../../context/DocproveVerificationContext';

export const SimulationPipeline: React.FC = () => {
  const { pipelineStages, statusMessage, selectedFile, cancelVerification } = useDocprove();

  const stagesList = [
    { key: 'ocr', label: 'OCR EXTRACTION', stage: pipelineStages.ocr },
    { key: 'validation', label: 'DOCUMENT VALIDATION', stage: pipelineStages.validation },
    { key: 'tampering', label: 'TAMPERING DETECTION', stage: pipelineStages.tampering },
    { key: 'face', label: 'FACE DETECTION', stage: pipelineStages.face },
  ];

  const renderStageIcon = (stage: StageProgress) => {
    switch (stage) {
      case 'completed':
        return (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </motion.div>
        );
      case 'processing':
        return (
          <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/50">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          </div>
        );
      case 'waiting':
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-white/[0.04] text-slate-400 flex items-center justify-center border border-white/[0.08]">
            <CircleDot className="w-3 h-3" />
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Active Scan Matrix Card */}
      <div className="w-full rounded-2xl bg-[#0a0f1d]/90 backdrop-blur-2xl border border-white/[0.12] p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]">
        {/* Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase">
                NEURAL FORENSIC ENGINE ACTIVE
              </span>
              <h3 className="text-lg font-bold text-white tracking-wide">
                Analyzing Document
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="tracking-wider">{statusMessage}</span>
            </div>

            <button
              onClick={cancelVerification}
              className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors px-2 py-1"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Center Document Scanning Visualization */}
        <div className="py-8 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-md aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 border border-cyan-500/30 shadow-[0_0_35px_rgba(0,240,255,0.12)] p-4 flex flex-col justify-between">
            {/* Realtime Laser Scanning Line */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#00f0ff] animate-laser-scan pointer-events-none z-30" />

            {/* Corner Reticles */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

            {/* Document Content Hologram Simulation */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/[0.08] pb-2">
              <span className="text-[10px] font-mono text-slate-400">PASSPORT_SPECIMEN_INGEST</span>
              <span className="text-[9px] font-mono text-cyan-400">{selectedFile?.name || 'document_stream'}</span>
            </div>

            <div className="grid grid-cols-12 gap-3 items-center py-2">
              <div className="col-span-4 aspect-[3/4] rounded-lg bg-slate-900 border border-cyan-500/20 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-1 border border-dashed border-cyan-400/40 rounded" />
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                  <span className="text-[10px] text-slate-400 font-mono">PORTRAIT</span>
                </div>
              </div>
              <div className="col-span-8 space-y-2">
                <div className="h-3 rounded bg-white/[0.06] w-3/4 animate-pulse" />
                <div className="h-3 rounded bg-white/[0.04] w-full" />
                <div className="h-3 rounded bg-white/[0.04] w-5/6" />
                <div className="h-2 rounded bg-cyan-500/20 w-1/2" />
              </div>
            </div>

            {/* MRZ Optical Band */}
            <div className="pt-2 border-t border-white/[0.08] font-mono text-[9px] text-cyan-300/70 tracking-widest truncate">
              P&lt;EXPMORGAN&lt;&lt;ALEX&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;PX00000005EXP9405201M3405202
            </div>
          </div>
        </div>

        {/* 4 Pipeline Stages: WAITING -> PROCESSING -> COMPLETED */}
        <div className="pt-6 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stagesList.map(({ key, label, stage }) => (
            <div
              key={key}
              className={`p-3.5 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                stage === 'completed'
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-white'
                  : stage === 'processing'
                  ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                  : 'bg-white/[0.02] border-white/[0.06] text-slate-400'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-[11px] font-bold tracking-wider">{label}</span>
                <span className="text-[10px] font-mono uppercase text-slate-400 mt-0.5">
                  {stage}
                </span>
              </div>
              {renderStageIcon(stage)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

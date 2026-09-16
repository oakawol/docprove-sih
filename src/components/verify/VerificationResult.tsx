import React from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, RefreshCw, Copy, CheckCheck } from 'lucide-react';
import { useDocprove } from '../../context/DocproveVerificationContext';

export const VerificationResult: React.FC = () => {
  const { documentData, resetVerification } = useDocprove();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(documentData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resultsList = [
    { label: 'OCR EXTRACTION', status: 'VERIFIED', color: 'text-emerald-400' },
    { label: 'DOCUMENT VALIDATION', status: 'VERIFIED', color: 'text-emerald-400' },
    { label: 'TAMPERING DETECTION', status: 'NO SUSPICIOUS ALTERATION INDICATORS', color: 'text-emerald-400' },
    { label: 'FACE DETECTION', status: 'MATCH DETECTED', color: 'text-emerald-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl mx-auto flex flex-col items-center"
    >
      <div className="w-full rounded-2xl bg-gradient-to-b from-[#0e1628]/95 via-[#0b1222]/95 to-[#070b16]/98 border border-white/[0.12] p-6 sm:p-10 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.8),0_0_50px_rgba(16,185,129,0.08)]">
        {/* Header Badge */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.25)]"
          >
            <Check className="w-8 h-8 stroke-[2.5]" />
          </motion.div>

          <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase">
            VERIFICATION COMPLETE
          </span>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
            DOCUMENT VERIFIED
          </h3>
          <p className="text-xs font-mono text-slate-400 mt-2">
            Cryptographic and biometric validation completed with zero critical anomalies.
          </p>
        </div>

        {/* Confidence Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-5 sm:p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              OVERALL AUTHENTICITY CONFIDENCE
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                98.4%
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                (Simulated Demo Evaluation)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>LOW FRAUD RISK INDEX</span>
          </div>
        </motion.div>

        {/* Four Sequential Layer Results */}
        <div className="space-y-3 mb-10">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-2">
            SECURITY LAYER BREAKDOWN
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resultsList.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + idx * 0.12, duration: 0.5 }}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-300">
                    {item.label}
                  </span>
                </div>
                <span className={`text-[10px] font-mono font-bold tracking-wider ${item.color} text-right`}>
                  {item.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Extracted Document Data Panel */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="rounded-xl bg-black/40 border border-white/[0.08] p-5 sm:p-6 mb-8"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
            <span className="text-xs font-mono font-semibold tracking-wider text-slate-300 uppercase">
              EXTRACTED DOCUMENT DATA
            </span>
            <button
              onClick={handleCopy}
              className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block mb-0.5">DOCUMENT TYPE</span>
              <span className="text-white font-semibold">{documentData.documentType}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block mb-0.5">FULL NAME</span>
              <span className="text-cyan-300 font-semibold">{documentData.fullName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block mb-0.5">DOCUMENT NUMBER</span>
              <span className="text-white font-semibold">{documentData.documentNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block mb-0.5">NATIONALITY</span>
              <span className="text-slate-300">{documentData.nationality}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block mb-0.5">DATE OF BIRTH</span>
              <span className="text-slate-300">{documentData.dateOfBirth}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block mb-0.5">DATE OF EXPIRY</span>
              <span className="text-emerald-400">{documentData.dateOfExpiry}</span>
            </div>
          </div>
        </motion.div>

        {/* Action Button: VERIFY ANOTHER DOCUMENT */}
        <div className="flex justify-center">
          <button
            onClick={resetVerification}
            className="px-6 py-3 rounded-xl bg-white text-slate-950 font-semibold text-xs tracking-wider uppercase flex items-center gap-2 shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:bg-slate-100 hover:shadow-[0_0_35px_rgba(255,255,255,0.35)] transition-all cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
            <span>VERIFY ANOTHER DOCUMENT</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldAlert, UserCheck, Grid } from 'lucide-react';

export const LayerShowcases: React.FC = () => {
  const [activeTamperTab, setActiveTamperTab] = useState<'integrity' | 'anomaly' | 'metadata'>('integrity');

  return (
    <div className="space-y-36 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
      {/* ──────────────────────────────────────────────────────────── */}
      {/* 01. OCR SECTION */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text / Info */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase block">
              [ 01 / OPTICAL CHARACTER INTELLIGENCE ]
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Neural text extraction with sub-millimeter precision.
            </h3>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Docprove isolates MRZ zones, visual reading lines, and localized stamps using neural edge detection—extracting critical identity metadata while maintaining checksum integrity.
            </p>

            {/* Extracted Data Card beside document */}
            <div className="rounded-xl bg-[#090e1c] border border-white/[0.1] p-5 space-y-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                EXTRACTED OCR PAYLOAD (DEMO SPECIMEN)
              </span>
              <div className="space-y-2.5 text-xs font-mono">
                {[
                  { label: 'FULL NAME', val: 'ALEX MORGAN' },
                  { label: 'DOCUMENT NUMBER', val: 'PX0000000' },
                  { label: 'NATIONALITY', val: 'EXAMPLE' },
                  { label: 'DATE OF BIRTH', val: 'XX / XX / XXXX' },
                  { label: 'DATE OF EXPIRY', val: 'XX / XX / XXXX' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i, duration: 0.5 }}
                    className="flex items-center justify-between py-1 border-b border-white/[0.04]"
                  >
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-cyan-300 font-semibold">{item.val}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Visual Document with OCR Bounding Boxes */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative rounded-2xl bg-[#0a0f1d] border border-white/[0.12] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden"
            >
              {/* Scan Beam */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f0ff] animate-laser-scan pointer-events-none z-20" />

              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
                <span className="text-xs font-mono text-cyan-400">PASSPORT_OCR_ACTIVE_MESH</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                  BOUNDING BOXES DETECTED: 14
                </span>
              </div>

              {/* Fictional Specimen with visual bounding boxes */}
              <div className="grid grid-cols-12 gap-5 items-center">
                <div className="col-span-4 aspect-[3/4] rounded-lg bg-slate-900 border border-cyan-500/30 p-2 flex flex-col items-center justify-center relative">
                  <span className="text-[9px] font-mono text-cyan-400 absolute top-1 left-2 font-bold">BB_PORTRAIT</span>
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-slate-400" />
                  </div>
                </div>

                <div className="col-span-8 space-y-3">
                  <div className="p-2 rounded bg-cyan-500/10 border border-cyan-400/50 relative">
                    <span className="text-[8px] font-mono text-cyan-300 absolute -top-2 left-2 bg-[#0a0f1d] px-1">
                      BB_SURNAME_GIVEN_NAMES
                    </span>
                    <p className="text-xs font-mono text-white font-bold tracking-wider">MORGAN &lt;&lt; ALEX</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-sky-500/10 border border-sky-400/40 relative">
                      <span className="text-[8px] font-mono text-sky-300 absolute -top-2 left-2 bg-[#0a0f1d] px-1">
                        BB_DOC_NO
                      </span>
                      <p className="text-xs font-mono text-white font-bold">PX0000000</p>
                    </div>
                    <div className="p-2 rounded bg-sky-500/10 border border-sky-400/40 relative">
                      <span className="text-[8px] font-mono text-sky-300 absolute -top-2 left-2 bg-[#0a0f1d] px-1">
                        BB_NATIONALITY
                      </span>
                      <p className="text-xs font-mono text-white font-bold">EXAMPLE</p>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-white/[0.04] border border-white/[0.1] relative">
                    <span className="text-[8px] font-mono text-slate-400 absolute -top-2 left-2 bg-[#0a0f1d] px-1">
                      BB_DATES_PARSED
                    </span>
                    <p className="text-xs font-mono text-slate-300">DOB: XX/XX/XXXX • EXPIRY: XX/XX/XXXX</p>
                  </div>
                </div>
              </div>

              {/* MRZ Band */}
              <div className="mt-5 p-3 rounded-lg bg-black/60 border border-cyan-500/20 font-mono text-[10px] text-cyan-300/80 tracking-widest leading-relaxed">
                P&lt;EXPMORGAN&lt;&lt;ALEX&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;PX00000005EXP9405201M3405202
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 02. DOCUMENT VALIDATION SECTION */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Checklist Visualization */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="rounded-2xl bg-[#0a0f1d] border border-white/[0.12] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono text-slate-300 font-semibold uppercase">
                    STRUCTURAL INSPECTION MATRIX
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">STATUS: 5/5 PASSED</span>
              </div>

              {/* Animated Validation Checklist */}
              <div className="space-y-3.5">
                {[
                  { title: 'DOCUMENT FORMAT', desc: 'Valid ICAO standard aspect ratio and dimension ratio' },
                  { title: 'REQUIRED FIELDS', desc: 'All mandated identity and issuing authority tags verified' },
                  { title: 'MRZ', desc: 'Checksum mathematics line 1 and line 2 calculate to exact hash' },
                  { title: 'DATE CONSISTENCY', desc: 'Issue date precedes expiration date without chronology overlap' },
                  { title: 'DOCUMENT STRUCTURE', desc: 'Geometric security boundaries and watermark zones intact' },
                ].map((item, idx) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.15, duration: 0.6 }}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 flex items-center justify-between gap-4 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">{item.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 shrink-0">
                      <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                      <span>CHECKED</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Text */}
          <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
            <span className="text-xs font-mono text-emerald-400 tracking-widest uppercase block">
              [ 02 / STRUCTURE & FORMAT AUDIT ]
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Instant verification of format, checksums, and MRZ integrity.
            </h3>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Every document type carries specific structural rules. Docprove verifies that optical reading zones align with international identity guidelines and that check digit math matches internal cryptographic rules.
            </p>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 03. TAMPERING DETECTION SECTION */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono text-sky-400 tracking-widest uppercase block">
              [ 03 / FORENSIC TAMPERING ANALYSIS ]
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Micro-inspection for alterations and digital splicing.
            </h3>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Docprove inspects font uniformity, compression artifact boundaries, and visual anomalies to identify potential alteration indicators without needing destructive tests.
            </p>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-slate-400">
              <ShieldAlert className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Flags potential alteration indicators across forensic noise spectra.</span>
            </div>
          </div>

          {/* Right Forensic Inspection Grid Card */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="rounded-2xl bg-[#0a0f1d] border border-white/[0.12] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
            >
              {/* Tab Selector */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
                <div className="flex items-center gap-2">
                  <Grid className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-mono text-white font-semibold">FORENSIC TELEMETRY</span>
                </div>

                <div className="flex gap-1 bg-white/[0.03] p-1 rounded-lg border border-white/[0.06] text-[10px] font-mono">
                  {(['integrity', 'anomaly', 'metadata'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTamperTab(tab)}
                      className={`px-2.5 py-1 rounded transition-colors uppercase ${
                        activeTamperTab === tab
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Forensic Metric Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    IMAGE INTEGRITY
                  </span>
                  <span className="text-xl font-bold font-mono text-white">99.4%</span>
                  <p className="text-[10px] text-slate-400 mt-1">Noise profile matches original camera capture</p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    TEXT CONSISTENCY
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-400">UNIFORM</span>
                  <p className="text-[10px] text-slate-400 mt-1">Typographic baseline and glyph weight aligned</p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    VISUAL ANOMALIES
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-400">0 DETECTED</span>
                  <p className="text-[10px] text-slate-400 mt-1">Zero edge cloning or patch blending detected</p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    METADATA SIGNALS
                  </span>
                  <span className="text-xl font-bold font-mono text-white">VALIDATED</span>
                  <p className="text-[10px] text-slate-400 mt-1">EXIF tags and byte stream headers verified</p>
                </div>
              </div>

              {/* Status Note */}
              <div className="p-3 rounded-lg bg-sky-950/20 border border-sky-500/20 flex items-center justify-between text-xs font-mono text-sky-300">
                <span>INDICATOR STATUS: NO TAMPER SIGNALS</span>
                <span className="text-emerald-400">CLEAR</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 04. FACE DETECTION SECTION */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Visual Portrait */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="rounded-2xl bg-[#0a0f1d] border border-white/[0.12] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
                <span className="text-xs font-mono text-indigo-400">FACIAL_BIOMETRIC_ISOLATION</span>
                <span className="text-[10px] font-mono text-emerald-400">CONFIDENCE: 98.9%</span>
              </div>

              <div className="grid grid-cols-12 gap-6 items-center">
                {/* Portrait Bounding Box */}
                <div className="col-span-5 relative aspect-[3/4] rounded-xl bg-slate-900 border border-indigo-500/40 p-3 flex flex-col items-center justify-center overflow-hidden">
                  {/* Facial landmark reticle box */}
                  <div className="absolute inset-3 border border-indigo-400/60 rounded-lg pointer-events-none">
                    {/* Crosshairs */}
                    <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-cyan-400" />
                  </div>

                  <div className="w-16 h-16 rounded-full bg-gradient-to-b from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center shadow-inner">
                    <UserCheck className="w-8 h-8 text-slate-400" />
                  </div>

                  <span className="text-[8px] font-mono text-indigo-300 absolute bottom-1 uppercase">
                    BIOMETRIC_PORTRAIT
                  </span>
                </div>

                {/* Match Analysis Details */}
                <div className="col-span-7 space-y-3">
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">FACE DETECTED</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">PRIMARY SUBJECT CONFIRMED</span>
                  </div>

                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">MATCH ANALYSIS</span>
                    <span className="text-xs font-mono text-slate-200">Standard 68-point facial geometry extracted</span>
                  </div>

                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">CONFIDENCE</span>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 w-[98%]" />
                      </div>
                      <span className="text-xs font-mono font-bold text-white">98.9%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Text */}
          <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
            <span className="text-xs font-mono text-indigo-400 tracking-widest uppercase block">
              [ 04 / BIOMETRIC FACE LOCALIZATION ]
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Geometric landmark validation prevents portrait substitution.
            </h3>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Docprove locates face coordinates in high density, measuring inter-pupillary distance, jawline symmetry, and photo-edge micro-banding to ensure portrait authenticity.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

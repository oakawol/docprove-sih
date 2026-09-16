import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Download,
  Printer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Scan,
  Edit3,
  Check,
  X,
  UserCheck,
  Layers,
  BadgeCheck,
} from 'lucide-react';
import { useVerification } from '../../context/VerificationContext';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';
import { ConfidenceScore } from '../common/ConfidenceScore';
import type { OcrField } from '../../types/verification';
import { cn } from '../../utils/cn';

export const ForensicInspectorView: React.FC = () => {
  const { currentRecord, updateField } = useVerification();

  const [activeTab, setActiveTab] = useState<'tampering' | 'ocr' | 'validation' | 'biometrics' | 'audit'>('tampering');
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [isSavingField, setIsSavingField] = useState<boolean>(false);

  if (!currentRecord) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
        <Layers className="w-14 h-14 mx-auto text-slate-400 mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No Forensic Dossier Active</h3>
        <p className="text-slate-500 text-xs mt-1">Please select or upload a document from the Verification Studio.</p>
      </div>
    );
  }

  const handleStartEdit = (field: OcrField) => {
    setEditingFieldId(field.id);
    setEditingValue(field.value);
  };

  const handleSaveEdit = async (fieldId: string) => {
    setIsSavingField(true);
    try {
      await updateField(fieldId, editingValue);
      setEditingFieldId(null);
    } finally {
      setIsSavingField(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingFieldId(null);
    setEditingValue('');
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentRecord, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Govt_of_India_${currentRecord.id}_Dossier.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrintReport = () => {
    window.print();
  };

  const tabs: { id: typeof activeTab; labelHi: string; labelEn: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'tampering', labelHi: 'फोरेंसिक जांच', labelEn: 'Tampering Forensics', icon: Scan },
    { id: 'ocr', labelHi: 'ऑप्टिकल डेटा', labelEn: 'Neural OCR & Fields', icon: Edit3 },
    { id: 'validation', labelHi: 'वैधानिक नियम', labelEn: 'Security Validation', icon: ShieldCheck },
    { id: 'biometrics', labelHi: 'बायोमेट्रिक्स', labelEn: 'Biometric Face Match', icon: UserCheck },
    { id: 'audit', labelHi: 'अभिलेख समय-सारणी', labelEn: 'Audit Timeline', icon: Clock },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-16">
      {/* Top Government Dossier Header Card */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 pb-5 border-b border-slate-200">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-[#0a2540] bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
                {currentRecord.id}
              </span>
              <StatusBadge status={currentRecord.status} size="md" />
              <StatusBadge
                status={
                  currentRecord.riskLevel === 'low'
                    ? 'low_risk'
                    : currentRecord.riskLevel === 'medium'
                    ? 'medium_risk'
                    : 'high_risk'
                }
                size="md"
              />
              <span className="text-xs font-mono text-slate-500">
                {new Date(currentRecord.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0a2540] tracking-tight">
                {currentRecord.documentName}
              </h1>
            </div>

            <p className="text-xs text-slate-600 mt-1">
              Document Classification:{' '}
              <strong className="capitalize text-slate-900">
                {currentRecord.documentType === 'visa' ? 'Indian e-Visa (Bureau of Immigration)' : currentRecord.documentType.replace('_', ' ')}
              </strong>{' '}
              • Verified under National Anti-Spoofing Protocol
            </p>
          </div>

          {/* Right Scores & Official Stamps */}
          <div className="flex flex-wrap items-center gap-4">
            <ConfidenceScore score={currentRecord.overallConfidence} size={68} showBreakdown />

            {/* Official Stamp Banner */}
            {currentRecord.status === 'verified' ? (
              <div className="border-2 border-emerald-600 bg-emerald-50/80 px-3.5 py-1.5 rounded-lg text-emerald-900 flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-emerald-700" />
                <div className="text-left leading-tight">
                  <div className="text-[10px] uppercase font-black tracking-wider">IMMIGRATION CLEARED</div>
                  <div className="text-[10px] text-emerald-800">सत्यापित एवं स्वीकृत</div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-red-600 bg-red-50/80 px-3.5 py-1.5 rounded-lg text-red-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-700" />
                <div className="text-left leading-tight">
                  <div className="text-[10px] uppercase font-black tracking-wider">FORGERY FLAGGED</div>
                  <div className="text-[10px] text-red-800">दस्तावेज़ संदिग्ध / जालसाजी</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={handleExportJson}
                className="text-xs font-bold"
              >
                Export Dossier
              </Button>
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={handlePrintReport}
                className="text-xs font-bold"
              >
                Print Official Certificate
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none border',
                  isActive
                    ? 'bg-[#0a2540] text-white border-[#0a2540] shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-orange-400' : 'text-slate-500')} />
                <span>{tab.labelHi}</span>
                <span className={cn('text-[10px] font-medium', isActive ? 'text-slate-300' : 'text-slate-400')}>
                  ({tab.labelEn})
                </span>
                {tab.id === 'tampering' && currentRecord.tampering.anomalies.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center font-bold">
                    {currentRecord.tampering.anomalies.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Tampering Forensics Workstation */}
      {activeTab === 'tampering' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Canvas: Document Preview with Bounding Box Overlays (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-300 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Scan className="w-4 h-4 text-[#0a2540]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Forensic Spectral & Anomaly Examination Canvas
                </h3>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOverlays}
                  onChange={(e) => setShowOverlays(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0a2540] accent-[#0a2540] cursor-pointer"
                />
                <span>Show Anomaly Overlays (दोष चिह्न दिखाएं)</span>
              </label>
            </div>

            {/* Document Interactive Container with Bounding Boxes */}
            <div className="relative rounded-lg overflow-hidden bg-slate-900 border border-slate-700 p-2 flex justify-center min-h-[360px]">
              <div className="relative max-w-full inline-block">
                <img
                  src={currentRecord.documentUrl}
                  alt={currentRecord.documentName}
                  className="w-full max-h-[480px] object-contain rounded shadow-lg"
                />

                {/* Laser scanline animation */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_8px_#f97316] animate-scanline pointer-events-none opacity-80" />

                {/* Tampering Anomaly Bounding Boxes */}
                {showOverlays &&
                  currentRecord.tampering.anomalies.map((anom) => {
                    if (!anom.boundingBox) return null;
                    const { x, y, width, height } = anom.boundingBox;
                    return (
                      <div
                        key={anom.id}
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          width: `${width}%`,
                          height: `${height}%`,
                        }}
                        className="absolute border-2 border-red-500 bg-red-500/30 rounded shadow-[0_0_12px_rgba(239,68,68,0.7)] animate-pulse group cursor-pointer"
                      >
                        <div className="absolute -top-6 left-0 bg-red-900 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap z-20">
                          ⚠ {anom.type}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {currentRecord.tampering.anomalies.length > 0 ? (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-300 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-red-900">
                    {currentRecord.tampering.anomalies.length} Tampering Violations Identified:{' '}
                  </span>
                  <span className="text-red-800">
                    Digital splicing perimeter discontinuities and typeface kerning alterations detected. Document detained under Passports / Foreigners Act.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <span className="text-xs text-emerald-900 font-semibold">
                  Zero forensic manipulation detected. State Emblem of India, Guilloche security lines, and compression artifacts match authentic factory baseline.
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Forensic Metrics & Anomalies Breakdown (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Integrity Metrics Card */}
            <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-200">
                Official Integrity Vectors / सत्यनिष्ठा सूचकांक
              </h3>

              <div className="space-y-2.5">
                {[
                  { label: 'Image Integrity', val: currentRecord.tampering.metrics.imageIntegrity },
                  { label: 'Text Consistency', val: currentRecord.tampering.metrics.textConsistency },
                  { label: 'Layout Alignment', val: currentRecord.tampering.metrics.layoutConsistency },
                  { label: 'Font Uniformity', val: currentRecord.tampering.metrics.fontUniformity },
                  { label: 'Compression Artifacts', val: currentRecord.tampering.metrics.compressionArtifacts },
                ].map((metric) => (
                  <div key={metric.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">{metric.label}</span>
                      <span className={cn('font-mono font-bold', metric.val >= 70 ? 'text-emerald-700' : 'text-red-700')}>
                        {metric.val}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-300', metric.val >= 70 ? 'bg-emerald-600' : 'bg-red-600')}
                        style={{ width: `${metric.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Anomalies List Card */}
            <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-200">
                Flagged Incidents / चिह्नित त्रुटियां
              </h3>

              {currentRecord.tampering.anomalies.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">
                  No forensic anomalies flagged for this credential.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {currentRecord.tampering.anomalies.map((anom) => (
                    <div
                      key={anom.id}
                      className="p-3 rounded-lg bg-red-50 border border-red-200 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-900">{anom.type}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-200 text-red-900 font-bold uppercase">
                          {anom.severity}
                        </span>
                      </div>
                      <p className="text-xs text-red-800 leading-relaxed">{anom.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Neural OCR & Field Extraction (Human-in-the-Loop) */}
      {activeTab === 'ocr' && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Neural OCR Extracted Data Grid (ऑप्टिकल डेटा तालिका)</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-[#0a2540] border border-slate-300 font-bold">
                  {currentRecord.ocr.fieldsExtracted} Fields Extracted
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bureau of Immigration verified extraction. Verification Officers can correct any misread character via human-in-the-loop review.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">Field Name / क्षेत्र</th>
                  <th className="py-2.5 px-4">Extracted Value / विवरण</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Confidence</th>
                  <th className="py-2.5 px-4 text-right">Human Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {currentRecord.ocr.fields.map((field) => {
                  const isEditing = editingFieldId === field.id;

                  return (
                    <tr key={field.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {field.label}
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              className="bg-white border-2 border-[#0a2540] rounded px-2.5 py-1 text-xs text-slate-900 focus:outline-none w-full max-w-xs shadow-xs"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(field.id)}
                              disabled={isSavingField}
                              className="p-1 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer border border-emerald-300"
                              title="Save change"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="p-1 rounded bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer border border-red-300"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-900 text-xs font-bold">
                              {field.value}
                            </span>
                            {field.isEdited && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                                Officer Corrected
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 capitalize text-slate-600 font-mono text-[11px]">
                        {field.category}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            'font-mono font-bold',
                            field.confidence >= 95 ? 'text-emerald-700' : 'text-amber-700'
                          )}
                        >
                          {field.confidence.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isEditing && (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(field)}
                            className="p-1 rounded text-slate-500 hover:text-[#0a2540] hover:bg-slate-200 transition-colors cursor-pointer"
                            title="Edit OCR Field"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Security Validation Rules */}
      {activeTab === 'validation' && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Cryptographic & Statutory Validation Rules (वैधानिक सत्यापन नियम)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated validation of ICAO 9303 standards, Bureau of Immigration digital signatures, and central database hash integrity.
              </p>
            </div>
            <StatusBadge status={currentRecord.validation.status} size="md" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {currentRecord.validation.checks.map((chk) => (
              <div
                key={chk.id}
                className={cn(
                  'p-3.5 rounded-lg border transition-all space-y-1.5',
                  chk.status === 'passed'
                    ? 'bg-emerald-50/50 border-emerald-300'
                    : chk.status === 'warning'
                    ? 'bg-amber-50/50 border-amber-300'
                    : 'bg-red-50/50 border-red-300'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {chk.status === 'passed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    ) : chk.status === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-700 shrink-0" />
                    )}
                    <h4 className="text-xs font-bold text-slate-900">{chk.name}</h4>
                  </div>
                  <StatusBadge status={chk.status} size="sm" />
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{chk.description}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="capitalize font-mono">Category: {chk.category}</span>
                  <span className="font-mono font-bold text-slate-700">Confidence: {chk.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Biometrics & Liveness */}
      {activeTab === 'biometrics' && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Biometric Facial Matching & 3D Liveness Detection (चेहरा मिलान)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Correlates facial embeddings from document portrait with the live traveler stream at the immigration e-Gate.
              </p>
            </div>
            <StatusBadge
              status={currentRecord.face.livenessStatus === 'passed' ? 'passed' : 'warning'}
              size="md"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Side-by-side Face Comparison (7 cols) */}
            <div className="lg:col-span-7 grid grid-cols-2 gap-4">
              {/* Document Face Crop */}
              <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-300 text-center space-y-2">
                <span className="text-[11px] uppercase font-bold text-slate-700">
                  Document Portrait Crop
                </span>
                <div className="relative w-32 h-40 mx-auto rounded overflow-hidden border-2 border-[#0a2540] bg-slate-900 shadow">
                  <img
                    src={currentRecord.face.documentFaceUrl}
                    alt="Document Portrait"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 inset-x-1 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white">
                    ICAO 9303
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 font-semibold">Quality: {currentRecord.face.imageQuality}</div>
              </div>

              {/* Live Selfie */}
              <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-300 text-center space-y-2">
                <span className="text-[11px] uppercase font-bold text-slate-700">
                  Live e-Gate Stream
                </span>
                <div className="relative w-32 h-40 mx-auto rounded overflow-hidden border-2 border-emerald-600 bg-slate-900 shadow">
                  <img
                    src={currentRecord.face.selfieUrl}
                    alt="Live Stream"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 inset-x-1 py-0.5 rounded bg-black/70 text-[9px] font-mono text-emerald-400">
                    3D LIVENESS
                  </div>
                </div>
                <div className="text-[10px] text-emerald-700 font-mono font-bold">
                  Liveness Score: {currentRecord.face.livenessScore}%
                </div>
              </div>
            </div>

            {/* Landmark Match Vectors (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-300 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-900 uppercase">
                    Facial Geometry Correlation
                  </span>
                  <span className="font-mono text-xs font-bold text-[#0a2540]">
                    {currentRecord.face.matchConfidence}% Match
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    { label: 'Ocular / Interpupillary Match', val: currentRecord.face.landmarks.eyesMatch },
                    { label: 'Nasion & Rhinion Curvature', val: currentRecord.face.landmarks.noseMatch },
                    { label: 'Cheilion & Lip Contour', val: currentRecord.face.landmarks.mouthMatch },
                    { label: 'Mandibular Jawline Silhouette', val: currentRecord.face.landmarks.jawlineMatch },
                  ].map((lm) => (
                    <div key={lm.label} className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 text-[11px]">{lm.label}</span>
                        <span className={cn('font-mono font-bold text-xs', lm.val >= 75 ? 'text-emerald-700' : 'text-red-700')}>
                          {lm.val}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', lm.val >= 75 ? 'bg-emerald-600' : 'bg-red-600')}
                          style={{ width: `${lm.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Audit Trail & Timeline */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Official Event Timeline & Processing Latencies (सत्यापन समय-सारणी)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Immutable audit trail tracking ingestion at Immigration Check Post, neural inference, and clearance verdict.
              </p>
            </div>
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-300">
            {currentRecord.timeline.map((event) => (
              <div key={event.id} className="relative group">
                <div
                  className={cn(
                    'absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white',
                    event.status === 'completed'
                      ? 'border-emerald-600 text-emerald-600'
                      : event.status === 'failed'
                      ? 'border-red-600 text-red-600'
                      : 'border-blue-600 text-blue-600'
                  )}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-xs font-bold text-slate-900">{event.title}</h4>
                    <span className="text-[11px] font-mono font-bold text-slate-600">
                      {event.durationMs ? `${event.durationMs}ms` : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{event.description}</p>
                  <div className="text-[10px] font-mono text-slate-400 pt-0.5">
                    Timestamp: {new Date(event.timestamp).toISOString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  ScanLine,
  TrendingUp,
  Layers,
  ArrowRight,
  Landmark,
  Plane,
} from 'lucide-react';

import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';
import { verificationService } from '../../services/verification';
import { useVerification } from '../../context/VerificationContext';
import type { DashboardMetrics, VerificationRecord } from '../../types/verification';

interface DashboardViewProps {
  onNavigateToStudio: () => void;
  onInspectRecord: (record: VerificationRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToStudio,
  onInspectRecord,
}) => {
  const { loadRecord } = useVerification();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentRecords, setRecentRecords] = useState<VerificationRecord[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [m, recs] = await Promise.all([
          verificationService.getDashboardMetrics(),
          verificationService.listVerifications({ limit: 6 }),
        ]);
        setMetrics(m);
        setRecentRecords(recs.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    }
    loadDashboardData();
  }, []);

  const handleInspect = (rec: VerificationRecord) => {
    loadRecord(rec);
    onInspectRecord(rec);
  };

  const passRate = metrics
    ? ((metrics.successfulVerifications / metrics.totalVerifications) * 100).toFixed(1)
    : '95.2';

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Official Welcome & Announcement Hero Banner */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[#0a2540] text-xs font-bold">
              <Landmark className="w-3.5 h-3.5 text-[#0a2540]" />
              <span>National Document & Visa Forensics Portal (भारत सरकार)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0a2540] tracking-tight leading-tight">
              राष्ट्रीय पहचान, पासपोर्ट एवं वीज़ा सत्यापन नियंत्रण कक्ष
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Automated optical character recognition, digital watermark inspection, and anti-spoofing verification for <strong>Republic of India Passports</strong>, <strong>Bureau of Immigration e-Visas</strong>, and <strong>State Driving Licences</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              variant="primary"
              leftIcon={<ScanLine className="w-5 h-5 text-orange-400" />}
              onClick={onNavigateToStudio}
              className="bg-[#0a2540] hover:bg-[#133b68] text-white px-5 font-bold text-sm shadow-sm"
            >
              सत्यापन शुरू करें / Launch Verification Kiosk
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Verifications */}
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-4 space-y-2 border-t-4 border-t-[#0a2540]">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">कुल प्रविष्टियां / Total Ingested</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0a2540] flex items-center justify-center border border-blue-200">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#0a2540] font-mono">
              {metrics ? metrics.totalVerifications.toLocaleString() : '28,490'}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 mt-0.5 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14.2% this month</span>
            </div>
          </div>
        </div>

        {/* Clean Pass Rate */}
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-4 space-y-2 border-t-4 border-t-emerald-600">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">स्वीकृत दर / Verified Clearance</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-800 font-mono">
              {passRate}%
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              ICAO 9303 MRZ Match: 99.4%
            </div>
          </div>
        </div>

        {/* Tampering Intercepted */}
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-4 space-y-2 border-t-4 border-t-red-600">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">जालसाजी रोकथाम / Fraud Intercepted</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center border border-red-200">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-red-700 font-mono">
              {metrics ? metrics.tamperingDetectedCount : '642'}
            </div>
            <div className="text-xs text-red-800 mt-0.5 font-semibold">
              Detained under Section 12 Passports Act
            </div>
          </div>
        </div>

        {/* Turnaround Time */}
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-4 space-y-2 border-t-4 border-t-purple-600">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">औसत अवधि / Mean Latency</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {metrics ? (metrics.averageProcessingTimeMs / 1000).toFixed(2) : '1.65'}s
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Multi-model neural pipeline
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Visuals: Weekly Trend & Immigration Ports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Weekly Trend Bar Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-300 shadow-sm p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Weekly Document Verification Velocity / साप्ताहिक सत्यापन दर
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily application load and Bureau of Immigration clearance rate
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#0a2540] bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              Central NIC Stream
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-3">
            {metrics?.weeklyTrend.map((item) => {
              const heightPercent = Math.min(100, Math.max(25, (item.count / 1300) * 100));
              return (
                <div key={item.day} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-mono text-slate-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}
                  </span>
                  <div className="w-full bg-slate-100 rounded h-full flex items-end p-0.5 border border-slate-200">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full rounded-xs bg-[#0a2540] group-hover:bg-[#1e3a8a] transition-colors shadow-2xs"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {item.day}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700">
                    {item.successRate}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ICP Ports & Risk Ratio (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-300 shadow-sm p-5 space-y-4">
          <div className="pb-2 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Plane className="w-4 h-4 text-[#0a2540]" />
              <span>Major Immigration Check Posts</span>
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { port: 'Delhi Airport (IGI - ICP)', count: '11,420 verifications', rate: '98.2%' },
              { port: 'Mumbai Airport (CSMIA - ICP)', count: '8,290 verifications', rate: '97.9%' },
              { port: 'Bengaluru Airport (KIA - ICP)', count: '4,840 verifications', rate: '98.5%' },
              { port: 'Attari Integrated Check Post', count: '1,120 verifications', rate: '95.1%' },
            ].map((icp) => (
              <div key={icp.port} className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-0.5">
                <div className="font-bold text-slate-900">{icp.port}</div>
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>{icp.count}</span>
                  <span className="font-bold text-emerald-700">{icp.rate} Cleared</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-[11px] text-blue-900">
            <strong>MHA Rule 2026: </strong> Travelers holding e-Visas must present credentials matching original passport data page at e-Gates.
          </div>
        </div>
      </div>

      {/* Recent Verifications Stream */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0a2540]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Recent National Verification Audits / हाल के सत्यापन
            </h3>
          </div>
          <span className="text-xs text-slate-500">Click any row to inspect official dossier</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4">Audit ID</th>
                <th className="py-2.5 px-4">Document Details</th>
                <th className="py-2.5 px-4">Classification</th>
                <th className="py-2.5 px-4">Authenticity</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentRecords.map((rec) => (
                <tr
                  key={rec.id}
                  onClick={() => handleInspect(rec)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-mono font-bold text-[#0a2540]">
                    {rec.id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 group-hover:text-[#0a2540] transition-colors">
                      {rec.documentName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {rec.ocr.fields.find((f) => f.label.includes('Name') || f.label.includes('नाम'))?.value || 'Holder Name Verified'}
                    </div>
                  </td>
                  <td className="py-3 px-4 capitalize text-slate-700 font-medium">
                    {rec.documentType === 'visa' ? 'Indian e-Visa' : rec.documentType.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900">
                      {rec.overallConfidence.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={rec.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[#0a2540] font-bold group-hover:translate-x-1 transition-transform">
                      <span>Inspect Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

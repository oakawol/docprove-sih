import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';
import { verificationService } from '../../services/verification';
import { useVerification } from '../../context/VerificationContext';
import type { VerificationRecord } from '../../types/verification';

interface RecordsArchiveViewProps {
  onInspectRecord: (record: VerificationRecord) => void;
}

export const RecordsArchiveView: React.FC<RecordsArchiveViewProps> = ({
  onInspectRecord,
}) => {
  const { loadRecord } = useVerification();
  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [docTypeFilter, setDocTypeFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const limit = 8;

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await verificationService.listVerifications({
        query: searchQuery,
        status: statusFilter,
        docType: docTypeFilter,
        page,
        limit,
      });
      setRecords(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [searchQuery, statusFilter, docTypeFilter, page]);

  const handleInspect = (rec: VerificationRecord) => {
    loadRecord(rec);
    onInspectRecord(rec);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  const statusOptions = [
    { id: 'all', label: 'All Statuses / सभी स्थितियां' },
    { id: 'verified', label: 'Verified / सत्यापित' },
    { id: 'review', label: 'Under Review / समीक्षाधीन' },
    { id: 'rejected', label: 'Rejected / अस्वीकृत' },
  ];

  const docTypeOptions = [
    { id: 'all', label: 'All Document Types / सभी प्रकार' },
    { id: 'passport', label: 'Indian Passport (भारतीय पासपोर्ट)' },
    { id: 'visa', label: 'Indian e-Visa (भारतीय वीज़ा)' },
    { id: 'driving_license', label: 'Driving Licence (ड्राइविंग लाइसेंस)' },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0a2540] tracking-tight">
            राष्ट्रीय अभिलेख भंडार (National Audit Archive)
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
            Centralized repository of all processed Republic of India Passports, Bureau of Immigration e-Visas, and anti-spoofing forensic decisions.
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          onClick={fetchRecords}
          className="text-xs font-bold"
        >
          Refresh / ताज़ा करें
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input (6 cols) */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by holder name, passport no, visa number, or audit ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0a2540] focus:border-[#0a2540] transition-all"
            />
          </div>

          {/* Status Filters (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a2540] cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Doc Type Filters (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={docTypeFilter}
              onChange={(e) => {
                setDocTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a2540] cursor-pointer"
            >
              {docTypeOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-5">Audit ID</th>
                <th className="py-3 px-5">Document & Holder</th>
                <th className="py-3 px-5">Type / प्रकार</th>
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5">Authenticity</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <Layers className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-60" />
                    <p className="text-sm font-bold text-slate-800">No Verification Records Found</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Adjust your search query or status filter.
                    </p>
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr
                    key={rec.id}
                    onClick={() => handleInspect(rec)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-5 font-mono font-bold text-[#0a2540]">
                      {rec.id}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900 group-hover:text-[#0a2540] transition-colors">
                        {rec.ocr.fields.find((f) => f.label.includes('Name') || f.label.includes('नाम'))?.value || rec.documentName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {rec.documentName}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 capitalize text-slate-700 font-medium">
                      {rec.documentType === 'visa' ? 'Indian e-Visa' : rec.documentType.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px]">
                      {new Date(rec.createdAt).toLocaleDateString()} {new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-mono font-bold text-slate-900">
                        {rec.overallConfidence.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={rec.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span className="inline-flex items-center gap-1 text-[#0a2540] font-bold group-hover:translate-x-1 transition-transform">
                        <span>Inspect</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between p-3.5 border-t border-slate-200 bg-slate-50 text-xs text-slate-600">
          <div>
            Showing <strong className="text-slate-900">{records.length}</strong> of{' '}
            <strong className="text-slate-900">{total}</strong> records
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold text-slate-700">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

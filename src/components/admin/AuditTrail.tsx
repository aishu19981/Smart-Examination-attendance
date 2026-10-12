import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { AuditCategory, AuditSeverity } from '../../types';
import { Badge } from '../common/Badge';
import { exportAuditLogsToExcel, exportAuditLogsToPDF } from '../../utils/exportUtils';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  Activity,
  Layers,
  FileText,
  AlertTriangle,
  Info,
  CheckCircle,
} from 'lucide-react';

export const AuditTrail: React.FC = () => {
  const { auditLogs } = useExam();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  const categories: AuditCategory[] = [
    'ROOM',
    'ALLOCATION',
    'DUTY',
    'EXAM',
    'STUDENT',
    'ATTENDANCE',
    'AUTH',
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.targetEntityId && log.targetEntityId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat = selectedCategory === 'ALL' || log.category === selectedCategory;
    const matchesSev = selectedSeverity === 'ALL' || log.severity === selectedSeverity;

    return matchesSearch && matchesCat && matchesSev;
  });

  const getSeverityBadge = (severity: AuditSeverity) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="danger" size="sm">CRITICAL</Badge>;
      case 'warning':
        return <Badge variant="warning" size="sm">WARNING</Badge>;
      case 'info':
      default:
        return <Badge variant="info" size="sm">INFO</Badge>;
    }
  };

  const getCategoryColor = (cat: AuditCategory) => {
    switch (cat) {
      case 'ROOM':
        return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'ALLOCATION':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'DUTY':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'EXAM':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'STUDENT':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'ATTENDANCE':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'AUTH':
        return 'text-teal-700 bg-teal-50 border-teal-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Institutional Audit Trail & Governance Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable tracking log recording room creations, candidate allocations, duty
            assignments, and attendance submissions with UTC timestamps and authorized user accounts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Tabular Register
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'timeline' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Timeline Stream
            </button>
          </div>

          <button
            onClick={() => exportAuditLogsToExcel(filteredLogs)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Excel</span>
          </button>
          <button
            onClick={() => exportAuditLogsToPDF(filteredLogs)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Audit PDF</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by actor username, action code, details or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 bg-white"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 bg-white"
          >
            <option value="ALL">All Severities</option>
            <option value="info">INFO</option>
            <option value="warning">WARNING</option>
            <option value="critical">CRITICAL</option>
          </select>
        </div>
      </div>

      {/* Tabular Register View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Audit Event Register ({filteredLogs.length} Events)
              </h3>
              <p className="text-xs text-slate-500">
                Chronological ledger of security and administrative operations
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Timestamp (UTC / Local)</th>
                  <th className="px-5 py-3.5">Authorized User</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Action Code</th>
                  <th className="px-5 py-3.5">Event Narrative & Audit Details</th>
                  <th className="px-5 py-3.5 text-center">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      No audit events matched the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-mono text-slate-800 text-[11px] font-semibold">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.actor}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 capitalize font-medium">
                          Role: {log.role}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryColor(
                            log.category
                          )}`}
                        >
                          {log.category}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-800 text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {log.action}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-slate-700 leading-relaxed max-w-xl">{log.details}</p>
                        {log.targetEntityId && (
                          <span className="text-[10px] font-mono text-slate-400">
                            Ref: {log.targetEntityId}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        {getSeverityBadge(log.severity)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Timeline View */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {filteredLogs.map((log) => (
              <div key={log.id} className="relative flex items-start gap-4">
                <div
                  className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-white ${
                    log.severity === 'critical'
                      ? 'bg-rose-500'
                      : log.severity === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-indigo-600'
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>

                <div className="flex-1 bg-slate-50/80 rounded-xl p-4 border border-slate-200/80">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryColor(
                          log.category
                        )}`}
                      >
                        {log.category}
                      </span>
                      <span className="font-mono font-bold text-xs text-slate-800">
                        {log.action}
                      </span>
                      {getSeverityBadge(log.severity)}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 mt-2 leading-relaxed">{log.details}</p>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Operator: <strong>{log.actor}</strong> ({log.role})
                    </span>
                    {log.targetEntityId && (
                      <span className="font-mono text-[10px] text-slate-400">
                        Target: {log.targetEntityId}
                      </span>
                    )}
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

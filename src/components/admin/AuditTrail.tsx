import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { AuditCategory, AuditSeverity } from '../../types';
import { Badge } from '../common/Badge';
import {
  exportAuditLogsToExcel,
  exportAuditLogsToPDF,
  exportAuditExecutiveReportPDF,
} from '../../utils/exportUtils';
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
  FileSpreadsheet,
  BarChart3,
  ShieldCheck,
  Armchair,
  UserCheck,
  Lock,
} from 'lucide-react';

export const AuditTrail: React.FC = () => {
  const { auditLogs } = useExam();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'timeline' | 'reports'>('table');
  const [selectedReportType, setSelectedReportType] = useState<string>('all');

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
            <button
              onClick={() => setViewMode('reports')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'reports' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Audit Reports</span>
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
            onClick={() => exportAuditExecutiveReportPDF(filteredLogs, 'Executive Governance & System Audit Report')}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            title="Download formatted official institutional audit report"
          >
            <FileText className="w-4 h-4" />
            <span>Executive Audit Report (.PDF)</span>
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
      ) : viewMode === 'timeline' ? (
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
      ) : (
        /* Reports & Governance Analytics View */
        <div className="space-y-6">
          {/* Executive KPI Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Audit Logs
                </span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900">{auditLogs.length}</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Immutable governance events</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Critical Alerts
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-rose-600">
                {auditLogs.filter((l) => l.severity === 'critical').length}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">High-priority security alerts</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Operational Warnings
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-amber-600">
                {auditLogs.filter((l) => l.severity === 'warning').length}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Deficits, unallocated seats, edits</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Authentication Events
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-emerald-600">
                {auditLogs.filter((l) => l.category === 'AUTH').length}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Logins, activations, security pins</p>
            </div>
          </div>

          {/* Pre-Compiled Executive Audit Reports */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Institutional Examination Audit Reports</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate and export official attested governance reports for internal inspection, accreditation, and administrative compliance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Report Card 1: Executive Governance */}
              <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/60 hover:bg-slate-50 hover:border-indigo-300 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">
                      1. Executive Governance & Master Audit Report
                    </span>
                    <Badge variant="info" size="sm">Comprehensive</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Complete chronological ledger of all {auditLogs.length} institutional events across halls, candidate allocations, faculty assignments, and security authorizations.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2">
                  <button
                    onClick={() => exportAuditExecutiveReportPDF(auditLogs, 'Executive Governance Master Audit Report')}
                    className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Report</span>
                  </button>
                  <button
                    onClick={() => exportAuditLogsToExcel(auditLogs)}
                    className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Excel</span>
                  </button>
                </div>
              </div>

              {/* Report Card 2: Authentication & Anti-Impersonation */}
              <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/60 hover:bg-slate-50 hover:border-indigo-300 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">
                      2. Authentication & Identity Integrity Audit Report
                    </span>
                    <Badge variant="success" size="sm">
                      {auditLogs.filter((l) => l.category === 'AUTH').length} Events
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Tracks candidate and faculty registrations, password activations, authorized logins, and rejected authentication attempts with full IP and role verification.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2">
                  <button
                    onClick={() =>
                      exportAuditExecutiveReportPDF(
                        auditLogs.filter((l) => l.category === 'AUTH'),
                        'Authentication & Security Incident Audit Report'
                      )
                    }
                    className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Report</span>
                  </button>
                  <button
                    onClick={() => exportAuditLogsToExcel(auditLogs.filter((l) => l.category === 'AUTH'))}
                    className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Excel</span>
                  </button>
                </div>
              </div>

              {/* Report Card 3: Seating Allocation & Malpractice Shuffle */}
              <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/60 hover:bg-slate-50 hover:border-indigo-300 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">
                      3. Seating Allocation & Shuffle Audit Report
                    </span>
                    <Badge variant="warning" size="sm">
                      {auditLogs.filter((l) => l.category === 'ALLOCATION').length} Events
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Audits automated hall mappings, randomized anti-cheating seat reshuffles, manual desk adjustments, and room capacity deficit notifications.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2">
                  <button
                    onClick={() =>
                      exportAuditExecutiveReportPDF(
                        auditLogs.filter((l) => l.category === 'ALLOCATION'),
                        'Seating Allocation & Anti-Malpractice Audit Report'
                      )
                    }
                    className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Report</span>
                  </button>
                  <button
                    onClick={() => exportAuditLogsToExcel(auditLogs.filter((l) => l.category === 'ALLOCATION'))}
                    className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Excel</span>
                  </button>
                </div>
              </div>

              {/* Report Card 4: Attendance Verification & Duty Deployments */}
              <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/60 hover:bg-slate-50 hover:border-indigo-300 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">
                      4. Invigilation & Attendance Integrity Audit Report
                    </span>
                    <Badge variant="neutral" size="sm">
                      {auditLogs.filter((l) => l.category === 'ATTENDANCE' || l.category === 'DUTY').length} Events
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Records invigilator duty assignments, hall superintendent roll calls, locked attendance register submissions, and administrative re-openings.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2">
                  <button
                    onClick={() =>
                      exportAuditExecutiveReportPDF(
                        auditLogs.filter((l) => l.category === 'ATTENDANCE' || l.category === 'DUTY'),
                        'Invigilation Duty & Attendance Audit Report'
                      )
                    }
                    className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Report</span>
                  </button>
                  <button
                    onClick={() =>
                      exportAuditLogsToExcel(
                        auditLogs.filter((l) => l.category === 'ATTENDANCE' || l.category === 'DUTY')
                      )
                    }
                    className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Excel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security Incident & Operational Alert Ledger */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Flagged Security Incidents & Warning Ledger
                  </h3>
                  <p className="text-xs text-slate-500">
                    Filtered view showing all events flagged with Warning or Critical severity
                  </p>
                </div>
              </div>
              <Badge variant="warning">
                {auditLogs.filter((l) => l.severity === 'warning' || l.severity === 'critical').length} Flagged Events
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-5 py-3">Actor</th>
                    <th className="px-5 py-3">Domain</th>
                    <th className="px-5 py-3">Action Code</th>
                    <th className="px-5 py-3">Incident Description</th>
                    <th className="px-5 py-3 text-center">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs
                    .filter((l) => l.severity === 'warning' || l.severity === 'critical')
                    .map((log) => (
                      <tr key={log.id} className="hover:bg-amber-50/30 transition">
                        <td className="px-5 py-3.5 font-mono text-slate-800 text-[11px] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap font-medium text-slate-900">
                          {log.actor} ({log.role})
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryColor(
                              log.category
                            )}`}
                          >
                            {log.category}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap font-mono font-bold text-slate-800 text-[11px]">
                          {log.action}
                        </td>
                        <td className="px-5 py-3.5 text-slate-700 leading-relaxed">
                          {log.details}
                        </td>
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          {getSeverityBadge(log.severity)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


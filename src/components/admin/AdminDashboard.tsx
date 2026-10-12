import React from 'react';
import { useExam } from '../../context/ExamContext';
import { Badge } from '../common/Badge';
import { exportAuditExecutiveReportPDF } from '../../utils/exportUtils';
import {
  Calendar,
  Building,
  Armchair,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  ShieldAlert,
  Download,
} from 'lucide-react';

interface AdminDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setActiveTab }) => {
  const {
    examinations,
    rooms,
    students,
    seatAllocations,
    attendanceRecords,
    attendanceSubmissions,
    dutyAssignments,
    auditLogs,
  } = useExam();

  // Metrics
  const totalExams = examinations.length;
  const publishedExams = examinations.filter((e) => e.isPublished).length;
  const totalRooms = rooms.length;
  const activeRooms = rooms.filter((r) => r.isAvailable).length;
  const totalCapacity = rooms.reduce((acc, r) => acc + (r.isAvailable ? r.capacity : 0), 0);
  const totalAllocatedSeats = seatAllocations.length;

  const totalPresent = attendanceRecords.filter((r) => r.status === 'present').length;
  const totalAbsent = attendanceRecords.filter((r) => r.status === 'absent').length;
  const totalUnmarked = attendanceRecords.filter((r) => r.status === 'unmarked').length;

  const completedSubmissions = attendanceSubmissions.filter((s) => s.isFinalSubmitted).length;
  const pendingSubmissions = attendanceSubmissions.filter((s) => !s.isFinalSubmitted).length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                Examination Cell Operations
              </span>
              <span className="text-xs text-slate-400">Academic Year 2026-27</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Controller of Examinations Command Center
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Automate room seating arrangements, oversee invigilator hall deployments, audit
              attendance verification registers, and govern student candidate access.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('allocations')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition cursor-pointer"
            >
              <Armchair className="w-4 h-4" />
              <span>Seating Allocation Engine</span>
            </button>
            <button
              onClick={() => setActiveTab('absentees')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Absentee Statements</span>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 rounded-xl text-xs font-semibold border border-indigo-700/60 shadow-xs transition cursor-pointer"
              title="Open Governance Audit Reports & Event Ledger"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Audit Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Exams Card */}
        <div
          onClick={() => setActiveTab('exams')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Exams
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{totalExams}</span>
            <span className="text-xs text-emerald-600 font-medium">
              {publishedExams} Published
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {totalExams - publishedExams} unpublished drafts
          </p>
        </div>

        {/* Rooms Card */}
        <div
          onClick={() => setActiveTab('rooms')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-sky-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Venues / Halls
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{totalRooms}</span>
            <span className="text-xs text-slate-500 font-medium">Halls</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {activeRooms} available for allocation
          </p>
        </div>

        {/* Seating Capacity Card */}
        <div
          onClick={() => setActiveTab('rooms')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Capacity
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
              <Armchair className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{totalCapacity}</span>
            <span className="text-xs text-slate-500 font-medium">Desks</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Across active examination blocks
          </p>
        </div>

        {/* Candidate Allocations */}
        <div
          onClick={() => setActiveTab('allocations')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Allocated Seats
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{totalAllocatedSeats}</span>
            <span className="text-xs text-slate-500 font-medium">Students</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {students.length} total enrolled candidates
          </p>
        </div>

        {/* Attendance Submissions */}
        <div
          onClick={() => setActiveTab('absentees')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-purple-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Submissions
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{completedSubmissions}</span>
            <span className="text-xs text-emerald-600 font-semibold">Finalized</span>
          </div>
          <p className="text-xs text-amber-600 font-medium mt-1">
            {pendingSubmissions > 0 ? `${pendingSubmissions} draft in-progress` : 'No pending drafts'}
          </p>
        </div>
      </div>

      {/* Attendance Metrics Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Live Attendance Reconciliation Overview
            </h2>
            <p className="text-xs text-slate-500">
              Aggregated across all scheduled venues and active examination halls
            </p>
          </div>
          <button
            onClick={() => setActiveTab('absentees')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Detailed Absentee Registry <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">Total Seated Desks</span>
              <p className="text-xl font-bold text-slate-800 mt-0.5">{attendanceRecords.length}</p>
            </div>
            <Armchair className="w-5 h-5 text-slate-400" />
          </div>

          <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-700 font-medium">Present Candidates</span>
              <p className="text-xl font-bold text-emerald-700 mt-0.5">{totalPresent}</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="bg-rose-50/60 rounded-xl p-3.5 border border-rose-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-rose-700 font-medium">Absent Candidates</span>
              <p className="text-xl font-bold text-rose-700 mt-0.5">{totalAbsent}</p>
            </div>
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>

          <div className="bg-amber-50/60 rounded-xl p-3.5 border border-amber-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-700 font-medium">Unmarked / Draft</span>
              <p className="text-xl font-bold text-amber-700 mt-0.5">{totalUnmarked}</p>
            </div>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        {/* Visual Progress Bar */}
        {attendanceRecords.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
              <span>Attendance Recording Progress</span>
              <span>
                {Math.round(((totalPresent + totalAbsent) / attendanceRecords.length) * 100)}%
                Reconciled
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                style={{
                  width: `${(totalPresent / attendanceRecords.length) * 100}%`,
                }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Present: ${totalPresent}`}
              />
              <div
                style={{
                  width: `${(totalAbsent / attendanceRecords.length) * 100}%`,
                }}
                className="bg-rose-500 transition-all duration-500"
                title={`Absent: ${totalAbsent}`}
              />
              <div
                style={{
                  width: `${(totalUnmarked / attendanceRecords.length) * 100}%`,
                }}
                className="bg-amber-400 transition-all duration-500"
                title={`Unmarked: ${totalUnmarked}`}
              />
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Present ({totalPresent})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Absent ({totalAbsent})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Unmarked ({totalUnmarked})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Two Column Layout: Upcoming Exams & Room Capacity Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Examinations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Scheduled Examinations</h2>
              <p className="text-xs text-slate-500">Master examination timetable and publish state</p>
            </div>
            <button
              onClick={() => setActiveTab('exams')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Manage Exams <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {examinations.map((exam) => {
              const allocatedCount = seatAllocations.filter((a) => a.examId === exam.id).length;
              const assignedDuties = dutyAssignments.filter((d) => d.examId === exam.id);

              return (
                <div
                  key={exam.id}
                  className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{exam.courseCode}</span>
                      <span className="text-xs text-slate-600 font-medium">{exam.name}</span>
                      {exam.isPublished ? (
                        <Badge variant="success" size="sm">Published</Badge>
                      ) : (
                        <Badge variant="warning" size="sm">Unpublished Draft</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{exam.date} ({exam.session === 'FN' ? 'Forenoon 09:30 AM' : 'Afternoon 02:00 PM'})</span>
                      <span>•</span>
                      <span>Dept: {exam.department}</span>
                      <span>•</span>
                      <span>Yr {exam.year}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-700">
                      {allocatedCount} Seated
                    </div>
                    <div className="text-xs text-slate-400">
                      {assignedDuties.length} In-Charges
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Room Capacity & Block Snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Halls & Venue Capacity</h2>
              <p className="text-xs text-slate-500">Configured examination spaces and availability</p>
            </div>
            <button
              onClick={() => setActiveTab('rooms')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View All Halls <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {rooms.map((room) => {
              const allocatedInRoom = seatAllocations.filter((a) => a.roomId === room.id).length;
              const utilization = Math.min(100, Math.round((allocatedInRoom / room.capacity) * 100));

              return (
                <div
                  key={room.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">
                          Room {room.roomNumber}
                        </span>
                        <span className="text-xs text-slate-500">{room.block}</span>
                        {room.isAvailable ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active Venue" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-rose-500" title="Unavailable" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Matrix: {room.rows} rows × {room.cols} cols | Max Capacity: {room.capacity} desks
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-700">
                        {allocatedInRoom} / {room.capacity} Occupied
                      </span>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                        <div
                          style={{ width: `${utilization}%` }}
                          className={`h-full ${
                            utilization > 90 ? 'bg-amber-500' : 'bg-indigo-600'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Institutional Audit Reports & Security Governance Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Institutional Audit Reports & Security Governance
              </h2>
              <p className="text-xs text-slate-500">
                Continuous compliance ledger tracking {auditLogs.length} events across candidate allocations, hall duties, logins, and attendance submissions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportAuditExecutiveReportPDF(auditLogs, 'Executive Governance Master Audit Report')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Executive Audit Report (.PDF)</span>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <span>View Audit Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Audit Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
              Total Logged Events
            </span>
            <span className="text-lg font-bold text-slate-900 mt-0.5 block">{auditLogs.length}</span>
            <span className="text-[10px] text-slate-400">All domains tracked</span>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-[10px] text-rose-600 uppercase tracking-wider block font-semibold">
              Critical Security Flags
            </span>
            <span className="text-lg font-bold text-rose-700 mt-0.5 block">
              {auditLogs.filter((l) => l.severity === 'critical').length}
            </span>
            <span className="text-[10px] text-slate-400">High priority alerts</span>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-[10px] text-amber-600 uppercase tracking-wider block font-semibold">
              Operational Warnings
            </span>
            <span className="text-lg font-bold text-amber-700 mt-0.5 block">
              {auditLogs.filter((l) => l.severity === 'warning').length}
            </span>
            <span className="text-[10px] text-slate-400">Capacity & changes</span>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-[10px] text-emerald-600 uppercase tracking-wider block font-semibold">
              Access & Auth Checks
            </span>
            <span className="text-lg font-bold text-emerald-700 mt-0.5 block">
              {auditLogs.filter((l) => l.category === 'AUTH').length}
            </span>
            <span className="text-[10px] text-slate-400">Anti-impersonation log</span>
          </div>
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { AVAILABLE_DEPARTMENTS } from '../../types';
import { Badge } from '../common/Badge';
import {
  exportAbsenteeStatementToExcel,
  exportAbsenteeStatementToPDF,
} from '../../utils/exportUtils';
import {
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Unlock,
  Printer,
} from 'lucide-react';

export const AbsenteeReports: React.FC = () => {
  const {
    examinations,
    rooms,
    students,
    seatAllocations,
    attendanceRecords,
    attendanceSubmissions,
    inCharges,
    reopenAttendance,
  } = useExam();

  const [selectedExamId, setSelectedExamId] = useState<string>('ALL');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Collect all absentees
  const absenteeList = attendanceRecords
    .filter((r) => r.status === 'absent')
    .map((rec) => {
      const student = students.find((s) => s.id === rec.studentId);
      const exam = examinations.find((e) => e.id === rec.examId);
      const room = rooms.find((r) => r.id === rec.roomId);
      const alloc = seatAllocations.find((a) => a.id === rec.allocationId);

      return {
        id: rec.id,
        examId: rec.examId,
        roomId: rec.roomId,
        rollNo: student?.rollNo || 'UNKNOWN',
        studentName: student?.name || 'Unknown Student',
        department: student?.department || '—',
        courseCode: exam?.courseCode || '—',
        examName: exam?.name || '—',
        roomNumber: room?.roomNumber || '—',
        deskNumber: alloc?.deskNumber || 0,
        remarks: rec.remarks || 'Absent / Not Reported',
      };
    })
    .filter((a) => {
      const matchesExam = selectedExamId === 'ALL' || a.examId === selectedExamId;
      const matchesRoom = selectedRoomId === 'ALL' || a.roomId === selectedRoomId;
      const matchesDept = selectedDept === 'ALL' || a.department === selectedDept;
      const matchesSearch =
        a.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.courseCode.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesExam && matchesRoom && matchesDept && matchesSearch;
    });

  // Track pending vs finalized submissions
  const pendingVenues = rooms
    .map((room) => {
      // Find all exams that have allocations in this room
      const examsInRoom = examinations.filter((exam) =>
        seatAllocations.some((a) => a.examId === exam.id && a.roomId === room.id)
      );

      return examsInRoom.map((exam) => {
        const sub = attendanceSubmissions.find(
          (s) => s.examId === exam.id && s.roomId === room.id
        );
        const records = attendanceRecords.filter(
          (r) => r.examId === exam.id && r.roomId === room.id
        );
        const unmarked = records.filter((r) => r.status === 'unmarked').length;
        const present = records.filter((r) => r.status === 'present').length;
        const absent = records.filter((r) => r.status === 'absent').length;

        return {
          room,
          exam,
          isSubmitted: sub?.isFinalSubmitted || false,
          total: records.length,
          unmarked,
          present,
          absent,
          submission: sub,
        };
      });
    })
    .flat()
    .filter((item) => item.total > 0);

  const handleExportExcel = () => {
    const title = `Absentee_Statement_${selectedExamId !== 'ALL' ? selectedExamId : 'Consolidated'}`;
    exportAbsenteeStatementToExcel(title, absenteeList);
  };

  const handleExportPDF = () => {
    const title = `Official Examination Absentee Statement`;
    const subtitle = `Filter: ${selectedExamId !== 'ALL' ? 'Selected Exam' : 'All Exams'} | Total Absent Candidates: ${absenteeList.length}`;
    exportAbsenteeStatementToPDF(title, subtitle, absenteeList);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Absentee Statements & Submission Audit
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidated candidate absentee statements, room-wise registers, and pending invigilation
            submission tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export Excel (.xlsx)</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Generate Official PDF</span>
          </button>
        </div>
      </div>

      {/* Pending Attendance Submissions Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900">
              Room-Wise Invigilator Attendance Submission Tracker
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Total Monitored Venues: <strong>{pendingVenues.length}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {pendingVenues.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                item.isSubmitted
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-amber-50/50 border-amber-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">
                    Room {item.room.roomNumber}
                  </span>
                  {item.isSubmitted ? (
                    <Badge variant="success" size="sm">
                      <CheckCircle2 className="w-3 h-3" /> Finalized
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      <Clock className="w-3 h-3" /> Draft Pending
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-slate-600 mt-1">
                  <strong>{item.exam.courseCode}</strong> - {item.exam.name}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Venue: {item.room.block}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-1 text-center bg-white/70 p-2 rounded-lg border border-slate-200/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Total</span>
                    <strong className="text-slate-800">{item.total}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-600 uppercase block">Present</span>
                    <strong className="text-emerald-700">{item.present}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-600 uppercase block">Absent</span>
                    <strong className="text-rose-700">{item.absent}</strong>
                  </div>
                </div>

                {!item.isSubmitted && item.unmarked > 0 && (
                  <p className="text-[11px] text-amber-700 mt-2 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {item.unmarked} candidates not yet marked
                  </p>
                )}
              </div>

              {item.isSubmitted && (
                <div className="mt-3 pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Submitted: {new Date(item.submission?.submittedAt || '').toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => reopenAttendance(item.exam.id, item.room.id)}
                    className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                    title="Unlock to allow in-charge corrections"
                  >
                    <Unlock className="w-3 h-3" /> Reopen Register
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by candidate name, roll number, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 bg-white"
          >
            <option value="ALL">All Examinations</option>
            {examinations.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.courseCode} ({ex.date})
              </option>
            ))}
          </select>

          <select
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 bg-white"
          >
            <option value="ALL">All Rooms</option>
            {rooms.map((rm) => (
              <option key={rm.id} value={rm.id}>
                Room {rm.roomNumber}
              </option>
            ))}
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 bg-white"
          >
            <option value="ALL">All Departments</option>
            {AVAILABLE_DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Official Absentee Statement Register */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Candidate Absentee Register ({absenteeList.length} Absentees Recorded)
            </h3>
            <p className="text-xs text-slate-500">
              Official roll call records marked as ABSENT by hall superintendents
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200">
            Total Absentees: {absenteeList.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Roll Number & Student</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Course Examination</th>
                <th className="px-5 py-3.5">Room & Allocated Desk</th>
                <th className="px-5 py-3.5">Absence Remarks / Reason</th>
                <th className="px-5 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {absenteeList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No absentee records found for the selected filter criteria.
                  </td>
                </tr>
              ) : (
                absenteeList.map((abs, idx) => (
                  <tr key={abs.id || idx} className="hover:bg-rose-50/30 transition">
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-slate-900 text-xs">
                        {abs.rollNo}
                      </div>
                      <div className="font-medium text-slate-800">{abs.studentName}</div>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-700">{abs.department}</td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 font-mono">{abs.courseCode}</div>
                      <div className="text-[11px] text-slate-500">{abs.examName}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800">Room {abs.roomNumber}</div>
                      <div className="text-[11px] text-slate-500">Desk D-{abs.deskNumber}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="italic text-slate-600">{abs.remarks}</span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <Badge variant="danger" size="sm">
                        ABSENT
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

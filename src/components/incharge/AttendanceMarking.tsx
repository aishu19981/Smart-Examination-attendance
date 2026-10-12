import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { Examination, Room, Student, SeatAllocation, AttendanceRecord } from '../../types';
import { Badge } from '../common/Badge';
import { AttendanceSheetModal } from './AttendanceSheetModal';
import { exportAbsenteeStatementToPDF } from '../../utils/exportUtils';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Armchair,
  Save,
  Printer,
  AlertTriangle,
  FileSpreadsheet,
  CheckCheck,
  RotateCcw,
  UserCheck,
  Search,
  MessageSquare,
  Shuffle,
  Grid,
  X,
} from 'lucide-react';

interface AttendanceMarkingProps {
  exam: Examination;
  room: Room;
  onBack: () => void;
}

export const AttendanceMarking: React.FC<AttendanceMarkingProps> = ({ exam, room, onBack }) => {
  const {
    students,
    seatAllocations,
    attendanceRecords,
    attendanceSubmissions,
    inCharges,
    currentInChargeId,
    markAttendance,
    batchMarkAttendance,
    submitAttendance,
    reopenAttendance,
    randomizeRoomSeats,
  } = useExam();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeRemarkAllocationId, setActiveRemarkAllocationId] = useState<string | null>(null);
  const [remarkInput, setRemarkInput] = useState('');
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);

  const activeInCharge = inCharges.find((i) => i.id === currentInChargeId);

  // Allocations for this room & exam
  const roomAllocations = seatAllocations
    .filter((a) => a.examId === exam.id && a.roomId === room.id)
    .sort((a, b) => a.deskNumber - b.deskNumber);

  const records = attendanceRecords.filter((r) => r.examId === exam.id && r.roomId === room.id);
  const submission = attendanceSubmissions.find(
    (s) => s.examId === exam.id && s.roomId === room.id
  );
  const isFinalSubmitted = submission?.isFinalSubmitted || false;

  // Real-time Counters
  const totalAllocated = roomAllocations.length;
  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const unmarkedCount = records.filter((r) => r.status === 'unmarked').length;

  const handleStatusClick = (allocationId: string, status: 'present' | 'absent') => {
    if (isFinalSubmitted) return;
    markAttendance(allocationId, status);
  };

  const handleOpenRemark = (allocationId: string, currentRemark?: string) => {
    setActiveRemarkAllocationId(allocationId);
    setRemarkInput(currentRemark || '');
  };

  const handleSaveRemark = (allocationId: string) => {
    const existing = records.find((r) => r.allocationId === allocationId);
    if (existing) {
      markAttendance(allocationId, existing.status, remarkInput.trim());
    }
    setActiveRemarkAllocationId(null);
  };

  const handleSubmit = () => {
    const result = submitAttendance(exam.id, room.id);
    if (result.success) {
      // Prompt option to view or download absentee statement immediately
    }
  };

  const handleGenerateRoomAbsenteeStatement = () => {
    const absentees = records
      .filter((r) => r.status === 'absent')
      .map((r) => {
        const student = students.find((s) => s.id === r.studentId);
        const alloc = roomAllocations.find((a) => a.id === r.allocationId);
        return {
          rollNo: student?.rollNo || '',
          studentName: student?.name || '',
          department: student?.department || '',
          courseCode: exam.courseCode,
          roomNumber: room.roomNumber,
          deskNumber: alloc?.deskNumber || 0,
          remarks: r.remarks || 'Absent',
        };
      });

    exportAbsenteeStatementToPDF(
      `Room ${room.roomNumber} Absentee Statement - ${exam.courseCode}`,
      `Date: ${exam.date} (${exam.session}) | Invigilator: ${activeInCharge?.name}`,
      absentees
    );
  };

  // Filter list
  const filteredAllocations = roomAllocations.filter((alloc) => {
    const student = students.find((s) => s.id === alloc.studentId);
    if (!student) return false;
    return (
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-1"
          >
            ← Return to In-Charge Duties
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Room {room.roomNumber} Attendance Register
            </h2>
            {isFinalSubmitted ? (
              <Badge variant="success">Finalized & Submitted</Badge>
            ) : (
              <Badge variant="warning">In-Progress Draft</Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {exam.courseCode} ({exam.name}) | {exam.date} | {exam.session === 'FN' ? 'Forenoon 09:30 AM' : 'Afternoon 02:00 PM'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seating Matrix Layout */}
          <button
            onClick={() => setIsMatrixModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition"
            title="View physical desk layout matrix"
          >
            <Grid className="w-4 h-4 text-indigo-600" />
            <span>Seating Layout</span>
          </button>

          {/* Randomize Seats button for faculty */}
          {!isFinalSubmitted && (
            <button
              onClick={() => {
                if (
                  confirm(
                    `Execute random anti-cheating reshuffle for Room ${room.roomNumber}? This will re-order all candidate desks randomly.`
                  )
                ) {
                  randomizeRoomSeats(exam.id, room.id);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition"
              title="Randomly shuffle and reallocate desks in this hall"
            >
              <Shuffle className="w-4 h-4 text-indigo-600" />
              <span>Randomize Seats</span>
            </button>
          )}

          <button
            onClick={() => setIsSheetModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Official Sheet</span>
          </button>

          {isFinalSubmitted && (
            <button
              onClick={handleGenerateRoomAbsenteeStatement}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Room Absentee Statement</span>
            </button>
          )}

          {!isFinalSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={unmarkedCount > 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition ${
                unmarkedCount > 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              title={
                unmarkedCount > 0
                  ? `Submission Blocked: ${unmarkedCount} candidates still unmarked`
                  : 'Finalize and submit attendance register'
              }
            >
              <Save className="w-4 h-4" />
              <span>Submit Final Attendance</span>
            </button>
          ) : (
            <button
              onClick={() => reopenAttendance(exam.id, room.id)}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reopen for Corrections</span>
            </button>
          )}
        </div>
      </div>

      {/* Submission Blocker Alert if any unmarked candidates remain */}
      {!isFinalSubmitted && unmarkedCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-amber-900">Final Submission Barrier Active</h4>
            <p className="mt-0.5 leading-relaxed">
              Every candidate must be verified and marked as either <strong>PRESENT</strong> or{' '}
              <strong>ABSENT</strong> before the final attendance register can be officially submitted
              to the Examination Section. There are currently{' '}
              <strong>{unmarkedCount} candidate(s)</strong> awaiting attendance marking.
            </p>
          </div>
          <button
            onClick={() => batchMarkAttendance(exam.id, room.id, 'present')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shrink-0"
          >
            Quick Mark All Present
          </button>
        </div>
      )}

      {/* Live Stat Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Allocated</span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalAllocated}</p>
          </div>
          <Armchair className="w-8 h-8 text-slate-300" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-600 uppercase">Present</span>
            <p className="text-2xl font-bold text-emerald-700 mt-0.5">{presentCount}</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-rose-600 uppercase">Absent</span>
            <p className="text-2xl font-bold text-rose-700 mt-0.5">{absentCount}</p>
          </div>
          <XCircle className="w-8 h-8 text-rose-400" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-amber-600 uppercase">Unmarked</span>
            <p className="text-2xl font-bold text-amber-700 mt-0.5">{unmarkedCount}</p>
          </div>
          <Clock className="w-8 h-8 text-amber-400" />
        </div>
      </div>

      {/* Quick Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Filter candidates in this room by roll number or student name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs py-1 focus:outline-none"
        />
      </div>

      {/* Candidate Roll Call Cards */}
      <div className="space-y-2.5">
        {filteredAllocations.map((alloc) => {
          const student = students.find((s) => s.id === alloc.studentId);
          const att = records.find((r) => r.allocationId === alloc.id);
          const status = att?.status || 'unmarked';
          const remarks = att?.remarks || '';
          const isEditingRemark = activeRemarkAllocationId === alloc.id;

          return (
            <div
              key={alloc.id}
              className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                status === 'present'
                  ? 'bg-emerald-50/30 border-emerald-200'
                  : status === 'absent'
                  ? 'bg-rose-50/30 border-rose-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center font-mono shrink-0">
                  <span className="text-[9px] text-slate-400 font-bold">DESK</span>
                  <span className="text-sm font-bold text-slate-900">{alloc.deskNumber}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {student?.rollNo}
                    </span>
                    <span className="font-semibold text-slate-900">{student?.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      ({alloc.seatCoordinate})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{student?.department}</span>
                    <span>•</span>
                    <span>Yr {student?.year} - Sec {student?.section}</span>
                    {remarks && (
                      <>
                        <span>•</span>
                        <span className="text-amber-800 font-medium italic">Note: "{remarks}"</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Remark trigger */}
                <button
                  onClick={() => handleOpenRemark(alloc.id, remarks)}
                  className={`p-2 rounded-xl text-xs border transition flex items-center gap-1 ${
                    remarks
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Add remarks / medical absence note"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{remarks ? 'Edit Note' : 'Remark'}</span>
                </button>

                <button
                  disabled={isFinalSubmitted}
                  onClick={() => handleStatusClick(alloc.id, 'present')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    status === 'present'
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                      : isFinalSubmitted
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Present</span>
                </button>

                <button
                  disabled={isFinalSubmitted}
                  onClick={() => handleStatusClick(alloc.id, 'absent')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    status === 'absent'
                      ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-500/20'
                      : isFinalSubmitted
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Absent</span>
                </button>
              </div>

              {/* Remark Input Drawer */}
              {isEditingRemark && (
                <div className="w-full mt-2 pt-2 border-t border-slate-200 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter remark (e.g. Reported sick with medical certificate, Late arrival)..."
                    value={remarkInput}
                    onChange={(e) => setRemarkInput(e.target.value)}
                    className="flex-1 text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => handleSaveRemark(alloc.id)}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
                  >
                    Save Note
                  </button>
                  <button
                    onClick={() => setActiveRemarkAllocationId(null)}
                    className="px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Attendance Sheet Modal */}
      {isSheetModalOpen && (
        <AttendanceSheetModal
          exam={exam}
          room={room}
          inchargeName={activeInCharge?.name || 'Hall Superintendent'}
          allocations={roomAllocations}
          attendanceRecords={records}
          students={students}
          onClose={() => setIsSheetModalOpen(false)}
        />
      )}

      {/* Visual Hall Seating Matrix Modal */}
      {isMatrixModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Room {room.roomNumber} - Randomized Seating Matrix Layout
                </h3>
                <p className="text-xs text-slate-500">
                  {room.block} | Capacity: {room.capacity} Desks ({room.rows} rows × {room.cols} cols)
                </p>
              </div>
              <button
                onClick={() => setIsMatrixModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Front of Hall */}
            <div className="mb-4 text-center">
              <div className="bg-slate-100 border border-slate-300 rounded-lg py-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                ▲ Front of Examination Hall (Blackboard & Invigilator Desk) ▲
              </div>
            </div>

            {/* Matrix Grid */}
            <div className="space-y-2.5 overflow-x-auto py-2">
              {Array.from({ length: room.rows }).map((_, rIdx) => {
                const rowNum = rIdx + 1;
                return (
                  <div key={rIdx} className="flex items-center gap-2 justify-center">
                    <span className="text-[11px] font-mono text-slate-400 w-8 text-right font-semibold">
                      R{rowNum}
                    </span>
                    <div className="flex gap-2">
                      {Array.from({ length: room.cols }).map((_, cIdx) => {
                        const colNum = cIdx + 1;
                        const deskNum = rIdx * room.cols + colNum;
                        const isWithinCapacity = deskNum <= room.capacity;

                        const alloc = roomAllocations.find((a) => a.deskNumber === deskNum);
                        const stu = alloc ? students.find((s) => s.id === alloc.studentId) : null;
                        const att = alloc ? records.find((r) => r.allocationId === alloc.id) : null;

                        return (
                          <div
                            key={cIdx}
                            className={`w-16 h-16 rounded-xl border flex flex-col items-center justify-center text-center p-1 transition ${
                              !isWithinCapacity
                                ? 'bg-slate-50 border-dashed border-slate-200 text-slate-300'
                                : alloc
                                ? att?.status === 'present'
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                                  : att?.status === 'absent'
                                  ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-xs'
                                  : 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                                : 'bg-white border-slate-200 text-slate-400'
                            }`}
                          >
                            <span className="text-[9px] font-bold text-slate-400">
                              D-{deskNum}
                            </span>
                            {stu ? (
                              <>
                                <span className="text-[10px] font-bold font-mono truncate max-w-full">
                                  {stu.rollNo}
                                </span>
                                <span className="text-[8px] text-slate-500 truncate max-w-full">
                                  {stu.name.split(' ')[0]}
                                </span>
                              </>
                            ) : (
                              <span className="text-[9px] text-slate-300">Vacant</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              {!isFinalSubmitted ? (
                <button
                  onClick={() => {
                    if (confirm(`Randomly re-shuffle candidate desks in Room ${room.roomNumber}?`)) {
                      randomizeRoomSeats(exam.id, room.id);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow transition"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Reshuffle Random Desks</span>
                </button>
              ) : (
                <span className="text-xs text-slate-400">Attendance submitted & finalized.</span>
              )}

              <button
                onClick={() => setIsMatrixModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
              >
                Close Layout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

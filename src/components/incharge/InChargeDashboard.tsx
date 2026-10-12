import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { Badge } from '../common/Badge';
import { AttendanceMarking } from './AttendanceMarking';
import { AttendanceSheetModal } from './AttendanceSheetModal';
import {
  UserCheck,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  Printer,
  FileEdit,
  Armchair,
  AlertCircle,
  Shuffle,
  Grid,
  X,
  Sparkles,
} from 'lucide-react';

export const InChargeDashboard: React.FC = () => {
  const {
    currentInChargeId,
    inCharges,
    dutyAssignments,
    examinations,
    rooms,
    seatAllocations,
    attendanceRecords,
    attendanceSubmissions,
    students,
    randomizeRoomSeats,
  } = useExam();

  const [activeSession, setActiveSession] = useState<{
    examId: string;
    roomId: string;
  } | null>(null);

  const [viewingSheetSession, setViewingSheetSession] = useState<{
    examId: string;
    roomId: string;
  } | null>(null);

  const [viewingMatrixSession, setViewingMatrixSession] = useState<{
    examId: string;
    roomId: string;
  } | null>(null);

  const currentFaculty = inCharges.find((i) => i.id === currentInChargeId);

  // Filter duties assigned specifically to this faculty member only
  const myDuties = dutyAssignments.filter((d) => d.inchargeId === currentInChargeId);

  // If a specific room marking session is active, render AttendanceMarking
  if (activeSession) {
    const exam = examinations.find((e) => e.id === activeSession.examId);
    const room = rooms.find((r) => r.id === activeSession.roomId);

    if (exam && room) {
      return (
        <AttendanceMarking
          exam={exam}
          room={room}
          onBack={() => setActiveSession(null)}
        />
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Faculty Profile Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center font-bold text-xl text-white shadow-inner">
              <UserCheck className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  Hall Superintendent Portal
                </span>
                <span className="text-xs text-slate-400">
                  Faculty ID: {currentFaculty?.facultyId}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {currentFaculty?.name}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Department of {currentFaculty?.department} | {currentFaculty?.email}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2 text-right">
              <span className="text-xs text-slate-400 block">Assigned Duty Venues</span>
              <span className="text-xl font-bold text-indigo-300">{myDuties.length} Halls</span>
            </div>
          </div>
        </div>
      </div>

      {/* Duty Assignments Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              My Assigned Examination Venues & Registers
            </h2>
            <p className="text-xs text-slate-500">
              Authorized access only. You can randomize student desks, view physical seating grids,
              print attendance registers, and submit roll calls.
            </p>
          </div>
        </div>

        {myDuties.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <Building className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <h3 className="font-bold text-slate-700 text-sm">No Duty Assignments Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              You are currently not deployed to any examination halls. The Examination Admin assigns
              faculty duties to specific courses and venues.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myDuties.map((duty) => {
              const exam = examinations.find((e) => e.id === duty.examId);
              const room = rooms.find((r) => r.id === duty.roomId);

              if (!exam || !room) return null;

              const roomAllocs = seatAllocations.filter(
                (a) => a.examId === exam.id && a.roomId === room.id
              );
              const records = attendanceRecords.filter(
                (r) => r.examId === exam.id && r.roomId === room.id
              );
              const submission = attendanceSubmissions.find(
                (s) => s.examId === exam.id && s.roomId === room.id
              );

              const isFinal = submission?.isFinalSubmitted || false;
              const present = records.filter((r) => r.status === 'present').length;
              const absent = records.filter((r) => r.status === 'absent').length;
              const unmarked = records.filter((r) => r.status === 'unmarked').length;

              return (
                <div
                  key={duty.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-slate-900">
                            Room {room.roomNumber}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">({room.block})</span>
                        </div>
                        <div className="font-semibold text-xs text-indigo-700 mt-1 font-mono">
                          {exam.courseCode} - {exam.name}
                        </div>
                      </div>

                      {isFinal ? (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="w-3 h-3" /> Submitted
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          <Clock className="w-3 h-3" /> In Progress
                        </Badge>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {exam.date}
                      </span>
                      <span>•</span>
                      <span>
                        {exam.session === 'FN'
                          ? 'Forenoon (09:30 AM)'
                          : 'Afternoon (02:00 PM)'}
                      </span>
                      <span>•</span>
                      <span>Capacity: {room.capacity} desks</span>
                    </div>

                    {/* Stats strip */}
                    <div className="mt-4 grid grid-cols-4 gap-2 text-center p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                          Seated
                        </span>
                        <strong className="text-slate-900">{roomAllocs.length}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-600 uppercase block font-semibold">
                          Present
                        </span>
                        <strong className="text-emerald-700">{present}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-rose-600 uppercase block font-semibold">
                          Absent
                        </span>
                        <strong className="text-rose-700">{absent}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-600 uppercase block font-semibold">
                          Unmarked
                        </span>
                        <strong className="text-amber-700">{unmarked}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Randomize Seats button for faculty */}
                      {!isFinal && roomAllocs.length > 1 && (
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Shuffle candidate seats randomly for Room ${room.roomNumber}? This will re-order desks unpredictably to prevent cheating.`
                              )
                            ) {
                              randomizeRoomSeats(exam.id, room.id);
                            }
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition"
                          title="Execute random seat shuffle for anti-cheating"
                        >
                          <Shuffle className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Randomize Seats</span>
                        </button>
                      )}

                      {/* Seating Matrix Layout */}
                      <button
                        onClick={() =>
                          setViewingMatrixSession({ examId: exam.id, roomId: room.id })
                        }
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                        title="View hall floor plan grid"
                      >
                        <Grid className="w-3.5 h-3.5 text-slate-500" />
                        <span>Layout</span>
                      </button>

                      {/* Print Register */}
                      <button
                        onClick={() =>
                          setViewingSheetSession({ examId: exam.id, roomId: room.id })
                        }
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Register</span>
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        setActiveSession({ examId: exam.id, roomId: room.id })
                      }
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>{isFinal ? 'Review Register' : 'Mark Attendance'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Attendance Sheet Modal from Dashboard */}
      {viewingSheetSession && (() => {
        const exam = examinations.find((e) => e.id === viewingSheetSession.examId);
        const room = rooms.find((r) => r.id === viewingSheetSession.roomId);
        if (!exam || !room) return null;

        const allocs = seatAllocations.filter(
          (a) => a.examId === exam.id && a.roomId === room.id
        );
        const records = attendanceRecords.filter(
          (r) => r.examId === exam.id && r.roomId === room.id
        );

        return (
          <AttendanceSheetModal
            exam={exam}
            room={room}
            inchargeName={currentFaculty?.name || 'Hall Superintendent'}
            allocations={allocs}
            attendanceRecords={records}
            students={students}
            onClose={() => setViewingSheetSession(null)}
          />
        );
      })()}

      {/* Seating Matrix Layout Modal from Dashboard */}
      {viewingMatrixSession && (() => {
        const exam = examinations.find((e) => e.id === viewingMatrixSession.examId);
        const room = rooms.find((r) => r.id === viewingMatrixSession.roomId);
        if (!exam || !room) return null;

        const roomAllocs = seatAllocations
          .filter((a) => a.examId === exam.id && a.roomId === room.id)
          .sort((a, b) => a.deskNumber - b.deskNumber);
        const records = attendanceRecords.filter(
          (r) => r.examId === exam.id && r.roomId === room.id
        );

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Grid className="w-5 h-5 text-indigo-600" />
                    <span>
                      Room {room.roomNumber} Physical Desk Seating Matrix
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {exam.courseCode} - {exam.name} • Grid: {room.rows} Rows × {room.cols} Columns ({room.capacity} Desks)
                  </p>
                </div>
                <button
                  onClick={() => setViewingMatrixSession(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Floor Plan Display */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="text-center py-1.5 mb-4 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                  👨‍🏫 Invigilator Podium / Front of Examination Hall
                </div>

                <div className="space-y-2">
                  {Array.from({ length: room.rows }).map((_, rIdx) => {
                    const rowNum = rIdx + 1;
                    return (
                      <div key={rowNum} className="flex items-center gap-2">
                        <span className="w-8 text-[11px] font-bold text-slate-400 font-mono">
                          R{rowNum}
                        </span>
                        <div
                          className="grid gap-2 flex-1"
                          style={{
                            gridTemplateColumns: `repeat(${room.cols}, minmax(0, 1fr))`,
                          }}
                        >
                          {Array.from({ length: room.cols }).map((_, cIdx) => {
                            const colNum = cIdx + 1;
                            const deskNum = (rowNum - 1) * room.cols + colNum;
                            if (deskNum > room.capacity) return null;

                            const alloc = roomAllocs.find((a) => a.deskNumber === deskNum);
                            const stu = alloc ? students.find((s) => s.id === alloc.studentId) : null;
                            const att = alloc ? records.find((rec) => rec.allocationId === alloc.id) : null;

                            return (
                              <div
                                key={colNum}
                                className={`p-2 rounded-xl border text-center transition flex flex-col justify-between min-h-[58px] ${
                                  stu
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
                                    <span className="text-[9px] text-slate-600 truncate max-w-full">
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
              </div>

              {/* Actions Footer */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (confirm(`Randomly re-shuffle candidate desks in Room ${room.roomNumber}?`)) {
                      randomizeRoomSeats(exam.id, room.id);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow transition"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Reshuffle Random Desks (Anti-Cheating)</span>
                </button>

                <button
                  onClick={() => setViewingMatrixSession(null)}
                  className="px-4 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

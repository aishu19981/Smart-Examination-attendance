import React from 'react';
import { useExam } from '../../context/ExamContext';
import { Badge } from '../common/Badge';
import { exportStudentHallTicketToPDF } from '../../utils/exportUtils';
import {
  GraduationCap,
  Calendar,
  Clock,
  Building,
  Armchair,
  Download,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { currentStudentId, students, examinations, rooms, seatAllocations, attendanceRecords } =
    useExam();

  const currentStudent = students.find((s) => s.id === currentStudentId);

  if (!currentStudent) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center text-slate-400">
        <User className="w-12 h-12 mx-auto text-slate-300 mb-2" />
        <h3 className="font-bold text-slate-700 text-sm">No Student Account Selected</h3>
        <p className="text-xs text-slate-500 mt-1">
          Select a candidate profile from the top navigation bar to view your personalized schedule.
        </p>
      </div>
    );
  }

  // Get all exams registered by this student or matching department/year
  const myExams = examinations.filter(
    (e) =>
      currentStudent.registeredCourses.includes(e.courseCode) ||
      (e.department === currentStudent.department && e.year === currentStudent.year)
  );

  // Map each exam with candidate's allocation (ONLY if published!)
  const scheduleData = myExams.map((exam) => {
    const allocation = seatAllocations.find(
      (a) => a.examId === exam.id && a.studentId === currentStudent.id
    );
    const room = allocation ? rooms.find((r) => r.id === allocation.roomId) : undefined;
    const attRecord = allocation
      ? attendanceRecords.find((r) => r.allocationId === allocation.id)
      : undefined;

    return {
      exam,
      allocation,
      room,
      attRecord,
      // Strict rule: Only published allocations are disclosed to student!
      isPublished: exam.isPublished,
    };
  });

  const handleDownloadHallTicket = () => {
    exportStudentHallTicketToPDF(
      currentStudent,
      scheduleData.map((d) => ({
        exam: d.exam,
        room: d.room,
        allocation: d.allocation,
      }))
    );
  };

  return (
    <div className="space-y-6">
      {/* Candidate Profile Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center font-bold text-xl text-white shadow-inner">
              <GraduationCap className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 font-mono">
                  Roll No: {currentStudent.rollNo}
                </span>
                <span className="text-xs text-slate-400">
                  Yr {currentStudent.year} • Sem {currentStudent.semester} • Sec {currentStudent.section}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {currentStudent.name}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Department of {currentStudent.department} | {currentStudent.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadHallTicket}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Official Hall Ticket (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security & Access Notice */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-sky-800">
        <Lock className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sky-900">Protected Student Portal</h4>
          <p className="mt-0.5 leading-relaxed text-sky-700">
            You are viewing your personal candidate examination schedule only. Seating venue and
            desk allocations are released strictly when officially published by the Controller of
            Examinations. Modifications are restricted to authorized administrators and hall
            superintendents.
          </p>
        </div>
      </div>

      {/* My Examinations Schedule */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Registered Examinations Schedule</h2>
            <p className="text-xs text-slate-500">
              Personal timetable, assigned venues, desk numbers, and session slots
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {scheduleData.length} Registered Courses
          </span>
        </div>

        <div className="space-y-3">
          {scheduleData.map(({ exam, allocation, room, attRecord, isPublished }) => {
            const hasSeat = !!allocation && !!room;

            return (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition hover:border-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-mono font-bold text-xs rounded border border-slate-200">
                      {exam.courseCode}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">{exam.name}</h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      {exam.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {exam.session === 'FN'
                        ? 'Forenoon (09:30 AM - 12:30 PM)'
                        : 'Afternoon (02:00 PM - 05:00 PM)'}
                    </span>
                    <span>•</span>
                    <span>Department: {exam.department}</span>
                  </div>
                </div>

                {/* Seating Venue & Desk Details */}
                <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 shrink-0">
                  {isPublished ? (
                    hasSeat ? (
                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Examination Hall
                          </span>
                          <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                            <Building className="w-4 h-4 text-indigo-600" />
                            <span>Room {room.roomNumber}</span>
                          </div>
                          <span className="text-[11px] text-slate-500">{room.block}</span>
                        </div>

                        <div className="h-8 w-px bg-slate-200" />

                        <div className="text-left">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Allocated Desk
                          </span>
                          <div className="flex items-center gap-1.5 font-mono font-bold text-base text-indigo-700">
                            <Armchair className="w-4 h-4 text-indigo-600" />
                            <span>Desk {allocation.deskNumber}</span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-500">
                            Seat: {allocation.seatCoordinate}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-amber-700 font-medium">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Seat allocation in progress by Exam Cell</span>
                      </div>
                    )
                  ) : (
                    /* Unpublished exam: hide seating from student */
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium py-1">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="font-semibold text-slate-700 block">
                          Schedule Announced
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Hall & desk allocation unpublished
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Attendance verified badge if marked */}
                  {attRecord && isPublished && (
                    <div className="ml-2 pl-3 border-l border-slate-200">
                      {attRecord.status === 'present' ? (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="w-3 h-3" /> Present Recorded
                        </Badge>
                      ) : attRecord.status === 'absent' ? (
                        <Badge variant="danger" size="sm">
                          Absent Recorded
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          Attendance Pending
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

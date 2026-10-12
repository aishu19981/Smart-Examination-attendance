import React from 'react';
import { Examination, Room, Student, SeatAllocation, AttendanceRecord } from '../../types';
import { exportAttendanceSheetToExcel, exportAttendanceSheetToPDF } from '../../utils/exportUtils';
import { Printer, Download, X, GraduationCap } from 'lucide-react';

interface AttendanceSheetModalProps {
  exam: Examination;
  room: Room;
  inchargeName: string;
  allocations: SeatAllocation[];
  attendanceRecords: AttendanceRecord[];
  students: Student[];
  onClose: () => void;
}

export const AttendanceSheetModal: React.FC<AttendanceSheetModalProps> = ({
  exam,
  room,
  inchargeName,
  allocations,
  attendanceRecords,
  students,
  onClose,
}) => {
  // Combine allocation with student and attendance
  const rows = allocations
    .map((alloc) => {
      const student = students.find((s) => s.id === alloc.studentId);
      const att = attendanceRecords.find((r) => r.allocationId === alloc.id);
      return {
        deskNumber: alloc.deskNumber,
        seatCoordinate: alloc.seatCoordinate,
        student: student!,
        status: att?.status || 'unmarked',
        remarks: att?.remarks,
      };
    })
    .filter((r) => r.student)
    .sort((a, b) => a.deskNumber - b.deskNumber);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    exportAttendanceSheetToPDF(exam, room, inchargeName, rows);
  };

  const handleExportExcel = () => {
    exportAttendanceSheetToExcel(exam, room, rows);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95">
        {/* Controls - Hidden in Print */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900">
              Printable Attendance Register & Signature Sheet
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Register Document */}
        <div className="printable-sheet bg-white p-2">
          {/* Institution Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 uppercase">
              Office of the Controller of Examinations
            </h1>
            <h2 className="text-sm font-semibold text-slate-700">
              Official Examination Hall Attendance Register & Signature Roster
            </h2>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-5">
            <div>
              <span className="text-slate-500 font-medium block">Course Examination:</span>
              <strong className="text-slate-900 text-sm">
                {exam.courseCode} - {exam.name}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 font-medium block">Date & Session:</span>
              <strong className="text-slate-900">
                {exam.date} | {exam.session === 'FN' ? 'Forenoon (09:30 AM)' : 'Afternoon (02:00 PM)'}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 font-medium block">Examination Venue:</span>
              <strong className="text-indigo-900 text-sm">
                Room {room.roomNumber} ({room.block})
              </strong>
            </div>

            <div>
              <span className="text-slate-500 font-medium block">Hall Superintendent:</span>
              <strong className="text-slate-900">{inchargeName}</strong>
            </div>

            <div>
              <span className="text-slate-500 font-medium block">Total Candidates Seated:</span>
              <strong className="text-slate-900">{rows.length} Candidates</strong>
            </div>

            <div>
              <span className="text-slate-500 font-medium block">Department Scope:</span>
              <strong className="text-slate-900">{exam.department}</strong>
            </div>
          </div>

          {/* Candidate Attendance Table */}
          <table className="w-full text-left text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                <th className="p-2 border border-slate-300 text-center w-8">#</th>
                <th className="p-2 border border-slate-300 w-28">Desk & Seat</th>
                <th className="p-2 border border-slate-300 w-24">Roll Number</th>
                <th className="p-2 border border-slate-300">Candidate Name</th>
                <th className="p-2 border border-slate-300 w-32">Department</th>
                <th className="p-2 border border-slate-300 text-center w-20">Status</th>
                <th className="p-2 border border-slate-300 w-28">Remarks</th>
                <th className="p-2 border border-slate-300 text-center w-28">Candidate's Sign</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.student.id} className="border-b border-slate-300">
                  <td className="p-2 border border-slate-300 text-center text-slate-500">{i + 1}</td>
                  <td className="p-2 border border-slate-300 font-mono font-semibold text-slate-800">
                    D-{r.deskNumber} ({r.seatCoordinate})
                  </td>
                  <td className="p-2 border border-slate-300 font-mono font-bold text-slate-900">
                    {r.student.rollNo}
                  </td>
                  <td className="p-2 border border-slate-300 font-medium text-slate-900">
                    {r.student.name}
                  </td>
                  <td className="p-2 border border-slate-300 text-slate-700">
                    {r.student.department}
                  </td>
                  <td className="p-2 border border-slate-300 text-center font-bold">
                    <span
                      className={
                        r.status === 'present'
                          ? 'text-emerald-700'
                          : r.status === 'absent'
                          ? 'text-rose-700'
                          : 'text-amber-600'
                      }
                    >
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-2 border border-slate-300 text-slate-600 text-[11px]">
                    {r.remarks || '—'}
                  </td>
                  <td className="p-2 border border-slate-300">
                    {/* Blank space for physical signing */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary & Invigilator Certification */}
          <div className="mt-8 pt-4 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-slate-700">
            <div>
              <p className="font-semibold mb-2">Hall Superintendent's Certification:</p>
              <p className="text-slate-600 leading-relaxed">
                I hereby certify that the attendance of all {rows.length} candidates allocated to Room{' '}
                {room.roomNumber} has been verified personally against their identity credentials and hall
                tickets.
              </p>
              <div className="mt-6">
                <span className="block font-bold">Signature of Hall Superintendent: _______________________</span>
                <span className="block text-[11px] text-slate-500 mt-1">Date & Time: _______________</span>
              </div>
            </div>

            <div className="text-right flex flex-col justify-between">
              <div>
                <p>
                  Total Present: <strong>{rows.filter((r) => r.status === 'present').length}</strong>
                </p>
                <p className="mt-1">
                  Total Absent: <strong>{rows.filter((r) => r.status === 'absent').length}</strong>
                </p>
                <p className="mt-1">
                  Unmarked: <strong>{rows.filter((r) => r.status === 'unmarked').length}</strong>
                </p>
              </div>

              <div>
                <span className="block font-bold">
                  Chief Superintendent / COE Seal: _______________________
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

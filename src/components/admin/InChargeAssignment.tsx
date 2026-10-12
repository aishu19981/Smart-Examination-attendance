import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { Badge } from '../common/Badge';
import {
  UserCheck,
  Plus,
  Trash2,
  Calendar,
  Building,
  Mail,
  Phone,
  ShieldCheck,
  X,
} from 'lucide-react';

export const InChargeAssignment: React.FC = () => {
  const {
    inCharges,
    examinations,
    rooms,
    dutyAssignments,
    assignDuty,
    removeDuty,
  } = useExam();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInChargeId, setSelectedInChargeId] = useState(inCharges[0]?.id || '');
  const [selectedExamId, setSelectedExamId] = useState(examinations[0]?.id || '');
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id || '');

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInChargeId || !selectedExamId || !selectedRoomId) {
      alert('Please select faculty in-charge, examination, and venue hall.');
      return;
    }

    assignDuty(selectedInChargeId, selectedExamId, selectedRoomId);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Hall Superintendents & Invigilator Deployment
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign designated faculty members as hall in-charges to conduct sessions and verify
            candidate attendance
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Deploy Hall In-Charge</span>
        </button>
      </div>

      {/* Faculty Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inCharges.map((inc) => {
          const assignedDuties = dutyAssignments.filter((d) => d.inchargeId === inc.id);

          return (
            <div
              key={inc.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                      {inc.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{inc.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-mono font-semibold text-slate-700">
                          {inc.facultyId}
                        </span>
                        <span>•</span>
                        <span>{inc.department}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="primary" size="sm">
                    {assignedDuties.length} Active Halls
                  </Badge>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{inc.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{inc.phone}</span>
                  </div>
                </div>
              </div>

              {assignedDuties.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Assigned Examination Venues:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {assignedDuties.map((d) => {
                      const exam = examinations.find((e) => e.id === d.examId);
                      const room = rooms.find((r) => r.id === d.roomId);
                      return (
                        <span
                          key={d.id}
                          className="px-2 py-0.5 bg-slate-100 rounded text-[11px] text-slate-700 font-medium border border-slate-200"
                        >
                          Room {room?.roomNumber} ({exam?.courseCode})
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Duty Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-bold text-sm text-slate-900">
            Official Examination Hall Duty Roster ({dutyAssignments.length} Assigned Venues)
          </h3>
          <p className="text-xs text-slate-500">
            Hall Superintendents hold sole authorization to mark attendance and finalize hall
            registers
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Assigned Hall In-Charge</th>
                <th className="px-5 py-3.5">Examination & Session</th>
                <th className="px-5 py-3.5">Allocated Venue / Block</th>
                <th className="px-5 py-3.5">Hall Desk Capacity</th>
                <th className="px-5 py-3.5">Deployment Timestamp</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dutyAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No invigilators deployed yet. Click "Deploy Hall In-Charge" to assign faculty.
                  </td>
                </tr>
              ) : (
                dutyAssignments.map((duty) => {
                  const inc = inCharges.find((i) => i.id === duty.inchargeId);
                  const exam = examinations.find((e) => e.id === duty.examId);
                  const room = rooms.find((r) => r.id === duty.roomId);

                  return (
                    <tr key={duty.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{inc?.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {inc?.facultyId} • {inc?.department}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 font-mono">
                          {exam?.courseCode} - {exam?.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {exam?.date} ({exam?.session === 'FN' ? 'Forenoon 09:30 AM' : 'Afternoon 02:00 PM'})
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-indigo-700">Room {room?.roomNumber}</div>
                        <div className="text-[11px] text-slate-500">{room?.block}</div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-800">{room?.capacity} desks</span>
                      </td>

                      <td className="px-5 py-4 text-slate-500 text-[11px]">
                        {new Date(duty.assignedAt).toLocaleString()}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Revoke duty assignment for ${inc?.name} in Room ${room?.roomNumber}?`
                              )
                            ) {
                              removeDuty(duty.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Revoke Duty"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deploy In-Charge Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Deploy Hall Superintendent / In-Charge
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Faculty Member <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedInChargeId}
                  onChange={(e) => setSelectedInChargeId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                >
                  {inCharges.map((inc) => (
                    <option key={inc.id} value={inc.id}>
                      {inc.name} ({inc.facultyId}) - {inc.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Examination <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {examinations.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.courseCode} - {e.name} ({e.date} {e.session})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Examination Hall / Room <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {rooms
                    .filter((r) => r.isAvailable)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        Room {r.roomNumber} ({r.block}) - Capacity: {r.capacity} desks
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow transition"
                >
                  Confirm Duty Deployment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

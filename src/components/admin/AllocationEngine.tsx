import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { Badge } from '../common/Badge';
import { exportToExcel } from '../../utils/exportUtils';
import {
  Armchair,
  Wand2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldAlert,
  Users,
  Grid,
  Download,
  PlusCircle,
  X,
} from 'lucide-react';

export const AllocationEngine: React.FC = () => {
  const {
    examinations,
    rooms,
    students,
    seatAllocations,
    autoAllocateSeats,
    randomizeRoomSeats,
    manualAllocateSeat,
    clearAllocations,
  } = useExam();

  const [selectedExamId, setSelectedExamId] = useState<string>(examinations[0]?.id || '');
  const [selectedRooms, setSelectedRooms] = useState<string[]>(
    rooms.filter((r) => r.isAvailable).slice(0, 2).map((r) => r.id)
  );
  const [strategy, setStrategy] = useState<'random' | 'alternating' | 'sequential'>('random');
  const [lastUnallocated, setLastUnallocated] = useState<typeof students>([]);

  // Manual allocation modal state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualRoomId, setManualRoomId] = useState<string>('');
  const [manualStudentId, setManualStudentId] = useState<string>('');
  const [manualDeskNumber, setManualDeskNumber] = useState<number>(1);

  const currentExam = examinations.find((e) => e.id === selectedExamId);

  // Eligible students for current exam
  const eligibleStudents = currentExam
    ? students.filter(
        (s) =>
          s.registeredCourses.includes(currentExam.courseCode) ||
          (s.department === currentExam.department && s.year === currentExam.year)
      )
    : [];

  const existingAllocations = seatAllocations.filter((a) => a.examId === selectedExamId);

  // Active usable capacity of selected rooms
  const selectedRoomsCapacity = rooms
    .filter((r) => selectedRooms.includes(r.id) && r.isAvailable)
    .reduce((acc, r) => acc + r.capacity, 0);

  const capacityDeficit = Math.max(0, eligibleStudents.length - selectedRoomsCapacity);

  const toggleRoomSelection = (roomId: string) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  };

  const handleRunAutoAllocation = () => {
    if (!selectedExamId) {
      alert('Please select an examination first.');
      return;
    }
    if (selectedRooms.length === 0) {
      alert('Please select at least one active examination hall.');
      return;
    }

    const result = autoAllocateSeats(selectedExamId, selectedRooms, strategy);
    setLastUnallocated(result.unallocatedStudents);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId || !manualRoomId || !manualStudentId) {
      alert('Please fill all fields for manual seat assignment.');
      return;
    }

    const success = manualAllocateSeat(
      selectedExamId,
      manualRoomId,
      manualStudentId,
      Number(manualDeskNumber)
    );
    if (success) {
      setIsManualModalOpen(false);
      setManualStudentId('');
    }
  };

  const handleExportAllocations = () => {
    if (!currentExam) return;

    const data = existingAllocations.map((a, idx) => {
      const stu = students.find((s) => s.id === a.studentId);
      const rm = rooms.find((r) => r.id === a.roomId);
      return {
        'S.No': idx + 1,
        'Course Code': currentExam.courseCode,
        'Examination': currentExam.name,
        'Room Number': rm?.roomNumber || '—',
        'Block': rm?.block || '—',
        'Desk Number': a.deskNumber,
        'Seat Coordinate': a.seatCoordinate,
        'Candidate Roll No': stu?.rollNo || '—',
        'Candidate Name': stu?.name || '—',
        'Department': stu?.department || '—',
      };
    });

    exportToExcel(data, `Seat_Allocations_${currentExam.courseCode}`, 'Allocations');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Seating Allocation Engine & Optimization
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automate hall seat mapping with anti-cheating alternating strategies or assign desks manually
          </p>
        </div>

        <div className="flex items-center gap-2">
          {existingAllocations.length > 0 && (
            <>
              <button
                onClick={handleExportAllocations}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export Plan (.xlsx)</span>
              </button>
              <button
                onClick={() => {
                  if (
                    confirm(
                      `Clear all ${existingAllocations.length} seat allocations for ${currentExam?.courseCode}?`
                    )
                  ) {
                    clearAllocations(selectedExamId);
                    setLastUnallocated([]);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Allocations</span>
              </button>
            </>
          )}

          <button
            onClick={() => {
              if (rooms.length > 0) setManualRoomId(rooms[0].id);
              setIsManualModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manual Seat Assign</span>
          </button>
        </div>
      </div>

      {/* Main Allocation Setup Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        {/* Step 1: Select Examination */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Step 1: Select Target Examination Course
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {examinations.map((exam) => {
              const isSelected = exam.id === selectedExamId;
              const count = seatAllocations.filter((a) => a.examId === exam.id).length;

              return (
                <div
                  key={exam.id}
                  onClick={() => {
                    setSelectedExamId(exam.id);
                    setLastUnallocated([]);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 font-mono">
                      {exam.courseCode}
                    </span>
                    {count > 0 ? (
                      <Badge variant="success" size="sm">
                        {count} Seated
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        Unallocated
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 font-medium mt-1 truncate">{exam.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {exam.date} ({exam.session}) • {exam.department}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Examination Halls & Calculate Capacity */}
        <div className="border-t border-slate-100 pt-5">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Step 2: Choose Halls for Allocation & Check Capacity
            </label>
            <span className="text-xs text-slate-500">
              Eligible Candidates: <strong className="text-slate-800">{eligibleStudents.length}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {rooms.map((room) => {
              const isChecked = selectedRooms.includes(room.id);
              const isRoomAvailable = room.isAvailable;

              return (
                <label
                  key={room.id}
                  className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition ${
                    !isRoomAvailable
                      ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200'
                      : isChecked
                      ? 'border-indigo-600 bg-indigo-50/40'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Room {room.roomNumber}</span>
                    <input
                      type="checkbox"
                      disabled={!isRoomAvailable}
                      checked={isChecked}
                      onChange={() => toggleRoomSelection(room.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 truncate">{room.block}</span>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Capacity:</span>
                    <span className="font-bold text-slate-800">{room.capacity} desks</span>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Capacity Diagnostic Bar */}
          <div className="mt-4 p-4 rounded-xl border bg-slate-50 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-4">
                <span>
                  Selected Venues Capacity: <strong className="text-slate-900">{selectedRoomsCapacity} desks</strong>
                </span>
                <span>
                  Registered Candidates: <strong className="text-slate-900">{eligibleStudents.length} students</strong>
                </span>
              </div>
              {capacityDeficit > 0 ? (
                <p className="text-amber-700 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  Capacity Deficit Warning: You need {capacityDeficit} more desk(s). Either select
                  additional examination halls or unallocated candidates will be flagged.
                </p>
              ) : (
                <p className="text-emerald-700 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  Sufficient Capacity: Selected halls can accommodate all {eligibleStudents.length}{' '}
                  candidates with {selectedRoomsCapacity - eligibleStudents.length} buffer seats.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 font-medium">Arrangement:</span>
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value as 'random' | 'alternating' | 'sequential')}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="random">🎲 Randomized Seating (Anti-Malpractice Shuffle)</option>
                  <option value="alternating">Alternating Departments (Anti-Cheating)</option>
                  <option value="sequential">Strict Roll Number Order</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setStrategy('random');
                  const result = autoAllocateSeats(selectedExamId, selectedRooms, 'random');
                  setLastUnallocated(result.unallocatedStudents);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs transition cursor-pointer"
                title="Execute cryptographically randomized seating shuffle across selected halls"
              >
                <Wand2 className="w-4 h-4" />
                <span>🎲 Randomize All Desks</span>
              </button>

              <button
                onClick={handleRunAutoAllocation}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition cursor-pointer"
              >
                <span>Execute Allocation ({strategy})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Unallocated Candidates Alert if capacity was insufficient */}
      {lastUnallocated.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <span>Unallocated Candidates List ({lastUnallocated.length} Students Remaining)</span>
          </div>
          <p className="text-xs text-amber-700">
            Due to insufficient room capacity, the following candidates could not be accommodated in
            the selected venues. Please register or select additional rooms to seat them:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
            {lastUnallocated.map((s) => (
              <div
                key={s.id}
                className="bg-white p-2.5 rounded-lg border border-amber-200 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-mono font-bold text-slate-900">{s.rollNo}</span>
                  <p className="text-slate-600">{s.name}</p>
                </div>
                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {s.department}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Seating Allocation Roster */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Allocated Seating Plan ({existingAllocations.length} Candidates Seated)
            </h3>
            <p className="text-xs text-slate-500">
              Assigned desks for {currentExam?.courseCode} - {currentExam?.name}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {rooms
              .filter((r) => existingAllocations.some((a) => a.roomId === r.id))
              .map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    if (
                      confirm(
                        `Randomly re-shuffle candidate desks in Room ${r.roomNumber} (${r.block})?`
                      )
                    ) {
                      randomizeRoomSeats(selectedExamId, r.id);
                    }
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition"
                  title={`Randomly re-shuffle desks for Room ${r.roomNumber}`}
                >
                  <Wand2 className="w-3 h-3 text-purple-600" />
                  <span>Shuffle Room {r.roomNumber}</span>
                </button>
              ))}

            {currentExam?.isPublished ? (
              <Badge variant="success">Status: Published (Live to Students)</Badge>
            ) : (
              <Badge variant="warning">Status: Unpublished Draft</Badge>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Desk & Seat Coordinate</th>
                <th className="px-5 py-3.5">Venue Hall</th>
                <th className="px-5 py-3.5">Roll Number & Candidate Name</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Class / Section</th>
                <th className="px-5 py-3.5 text-right">Allocation Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {existingAllocations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No seat allocations generated yet for this examination. Run auto allocation above
                    or use manual seat assignment.
                  </td>
                </tr>
              ) : (
                existingAllocations.map((alloc) => {
                  const stu = students.find((s) => s.id === alloc.studentId);
                  const room = rooms.find((r) => r.id === alloc.roomId);

                  return (
                    <tr key={alloc.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-mono text-xs">
                            Desk {alloc.deskNumber}
                          </span>
                          <span className="text-slate-500 font-mono text-[11px]">
                            ({alloc.seatCoordinate})
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        Room {room?.roomNumber} ({room?.block})
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 font-mono">{stu?.rollNo}</div>
                        <div className="text-slate-600 font-medium">{stu?.name}</div>
                      </td>

                      <td className="px-5 py-3.5 text-slate-700">{stu?.department}</td>

                      <td className="px-5 py-3.5 text-slate-600">
                        Yr {stu?.year} - Sec {stu?.section}
                      </td>

                      <td className="px-5 py-3.5 text-right text-slate-400 text-[11px]">
                        {new Date(alloc.allocatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Seat Assignment Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                Manual Desk Assignment / Reallocation
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Examination Course
                </label>
                <input
                  type="text"
                  disabled
                  value={`${currentExam?.courseCode} - ${currentExam?.name}`}
                  className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Examination Hall <span className="text-rose-500">*</span>
                </label>
                <select
                  value={manualRoomId}
                  onChange={(e) => setManualRoomId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {rooms
                    .filter((r) => r.isAvailable)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        Room {r.roomNumber} ({r.block}) - Cap: {r.capacity}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Desk Number (1 to Room Capacity) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={rooms.find((r) => r.id === manualRoomId)?.capacity || 100}
                  required
                  value={manualDeskNumber}
                  onChange={(e) => setManualDeskNumber(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Candidate to Seat <span className="text-rose-500">*</span>
                </label>
                <select
                  value={manualStudentId}
                  onChange={(e) => setManualStudentId(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                >
                  <option value="">-- Choose Candidate --</option>
                  {students.map((s) => {
                    const alreadySeated = existingAllocations.some((a) => a.studentId === s.id);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.rollNo} - {s.name} ({s.department}) {alreadySeated ? '[Already Seated]' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow transition"
                >
                  Assign Desk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

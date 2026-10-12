import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { Room } from '../../types';
import { Badge } from '../common/Badge';
import {
  Building,
  Plus,
  Edit,
  Trash2,
  Armchair,
  Grid,
  CheckCircle,
  XCircle,
  Eye,
  X,
  AlertCircle,
} from 'lucide-react';

export const RoomManagement: React.FC = () => {
  const { rooms, addRoom, updateRoom, deleteRoom, toggleRoomAvailability, seatAllocations } =
    useExam();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [viewingMatrixRoom, setViewingMatrixRoom] = useState<Room | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    roomNumber: '',
    block: '',
    capacity: 20,
    rows: 4,
    cols: 5,
    isAvailable: true,
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      roomNumber: '',
      block: '',
      capacity: 20,
      rows: 4,
      cols: 5,
      isAvailable: true,
      notes: '',
    });
    setEditingRoomId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoomId(room.id);
    setFormData({
      roomNumber: room.roomNumber,
      block: room.block,
      capacity: room.capacity,
      rows: room.rows,
      cols: room.cols,
      isAvailable: room.isAvailable,
      notes: room.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.roomNumber.trim() || !formData.block.trim()) {
      alert('Room Number and Block name are mandatory.');
      return;
    }

    if (formData.capacity <= 0) {
      alert('Seating capacity must be greater than zero.');
      return;
    }

    if (formData.rows * formData.cols < formData.capacity) {
      alert(
        `Matrix grid (${formData.rows} rows × ${formData.cols} cols = ${formData.rows * formData.cols} spots) cannot hold ${formData.capacity} desks. Increase rows or columns.`
      );
      return;
    }

    if (editingRoomId) {
      updateRoom(editingRoomId, {
        roomNumber: formData.roomNumber.trim(),
        block: formData.block.trim(),
        capacity: Number(formData.capacity),
        rows: Number(formData.rows),
        cols: Number(formData.cols),
        isAvailable: formData.isAvailable,
        notes: formData.notes.trim(),
      });
      setIsModalOpen(false);
      resetForm();
    } else {
      const ok = addRoom({
        roomNumber: formData.roomNumber.trim(),
        block: formData.block.trim(),
        capacity: Number(formData.capacity),
        rows: Number(formData.rows),
        cols: Number(formData.cols),
        isAvailable: formData.isAvailable,
        notes: formData.notes.trim(),
      });
      if (ok) {
        setIsModalOpen(false);
        resetForm();
      }
    }
  };

  const totalUsableCapacity = rooms
    .filter((r) => r.isAvailable)
    .reduce((acc, r) => acc + r.capacity, 0);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Halls & Seating Capacity Architecture
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure examination blocks, desk capacities, and visual seating row/column layout
            matrices
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Examination Hall</span>
        </button>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Configured Venues</span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{rooms.length} Halls</p>
          </div>
          <Building className="w-8 h-8 text-indigo-500/30" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Active Usable Capacity</span>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">{totalUsableCapacity} Desks</p>
          </div>
          <Armchair className="w-8 h-8 text-emerald-500/30" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Available vs Maintenance</span>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">
              {rooms.filter((r) => r.isAvailable).length} Active /{' '}
              {rooms.filter((r) => !r.isAvailable).length} Disabled
            </p>
          </div>
          <Grid className="w-8 h-8 text-sky-500/30" />
        </div>
      </div>

      {/* Room Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Venue / Hall No</th>
                <th className="px-5 py-3.5">Block / Location</th>
                <th className="px-5 py-3.5">Seating Capacity</th>
                <th className="px-5 py-3.5">Desk Matrix (Rows × Cols)</th>
                <th className="px-5 py-3.5 text-center">Operational Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rooms.map((room) => {
                const activeOccupancy = seatAllocations.filter((a) => a.roomId === room.id).length;

                return (
                  <tr key={room.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200 font-mono text-xs">
                          Room {room.roomNumber}
                        </span>
                        {room.notes && (
                          <span className="text-[11px] text-slate-400 italic">
                            ({room.notes})
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-800">{room.block}</td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{room.capacity}</span>
                        <span className="text-slate-400 text-xs">desks</span>
                        {activeOccupancy > 0 && (
                          <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                            {activeOccupancy} allocated
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 text-[11px]">
                          {room.rows} rows × {room.cols} cols ({room.rows * room.cols} spots)
                        </span>
                        <button
                          onClick={() => setViewingMatrixRoom(room)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Matrix
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => toggleRoomAvailability(room.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                          room.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Click to toggle availability"
                      >
                        {room.isAvailable ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" /> Active Available
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Disabled / Maintenance
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(room)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Hall"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Delete Room ${room.roomNumber}? This will remove any active seat allocations and in-charge duties in this hall.`
                              )
                            ) {
                              deleteRoom(room.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Hall"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Desk Layout Matrix Modal */}
      {viewingMatrixRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Room {viewingMatrixRoom.roomNumber} - Physical Seating Layout
                </h3>
                <p className="text-xs text-slate-500">
                  {viewingMatrixRoom.block} | Capacity: {viewingMatrixRoom.capacity} Desks (Grid:{' '}
                  {viewingMatrixRoom.rows} rows × {viewingMatrixRoom.cols} cols)
                </p>
              </div>
              <button
                onClick={() => setViewingMatrixRoom(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Front of Hall indicator */}
            <div className="mb-4 text-center">
              <div className="bg-slate-100 border border-slate-300 rounded-lg py-2 text-xs font-semibold text-slate-600 tracking-wider uppercase">
                ▲ Front of Examination Hall (Blackboard & Invigilator's Desk) ▲
              </div>
            </div>

            {/* Matrix Grid */}
            <div className="space-y-2.5 overflow-x-auto py-2">
              {Array.from({ length: viewingMatrixRoom.rows }).map((_, rIdx) => {
                const rowNum = rIdx + 1;
                return (
                  <div key={rIdx} className="flex items-center gap-2 justify-center">
                    <span className="text-[11px] font-mono text-slate-400 w-8 text-right font-semibold">
                      Row {rowNum}
                    </span>
                    <div className="flex gap-2">
                      {Array.from({ length: viewingMatrixRoom.cols }).map((_, cIdx) => {
                        const colNum = cIdx + 1;
                        const deskNum = rIdx * viewingMatrixRoom.cols + colNum;
                        const isWithinCapacity = deskNum <= viewingMatrixRoom.capacity;

                        // Check if seat is currently occupied by an allocation
                        const allocation = seatAllocations.find(
                          (a) =>
                            a.roomId === viewingMatrixRoom.id &&
                            a.seatCoordinate === `R${rowNum}-C${colNum}`
                        );

                        return (
                          <div
                            key={cIdx}
                            className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center text-center p-1 transition ${
                              !isWithinCapacity
                                ? 'bg-slate-50 border-dashed border-slate-200 text-slate-300'
                                : allocation
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                            }`}
                          >
                            <span className="text-[10px] font-semibold text-slate-400">
                              D-{deskNum}
                            </span>
                            <span className="text-xs font-bold font-mono">
                              R{rowNum}C{colNum}
                            </span>
                            {allocation && (
                              <span className="text-[8px] bg-indigo-600 text-white px-1 rounded truncate max-w-full">
                                Seated
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hall Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded border border-slate-200 bg-white" />
                <span>Available Desk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded border border-indigo-300 bg-indigo-50" />
                <span>Occupied / Allocated</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded border-dashed border-slate-200 bg-slate-50" />
                <span>Unused Grid Buffer</span>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setViewingMatrixRoom(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
              >
                Close Layout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingRoomId ? 'Edit Hall Details' : 'Register Examination Hall'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hall / Room No <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 101, 204, Audit-B"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Desk Capacity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={500}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Block / Location Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramanujan Block (North Wing)"
                  value={formData.block}
                  onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Matrix Rows
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={25}
                    value={formData.rows}
                    onChange={(e) => setFormData({ ...formData, rows: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Matrix Columns
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={25}
                    value={formData.cols}
                    onChange={(e) => setFormData({ ...formData, cols: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                <span>Total Matrix Spots:</span>
                <span className="font-bold text-slate-800">
                  {formData.rows * formData.cols} spots ({formData.capacity} will be active desks)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Venue Notes / Facilities
                </label>
                <input
                  type="text"
                  placeholder="e.g. Air-conditioned, CCTV installed, wheelchair accessible"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Mark as active & available for allocation
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
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
                  {editingRoomId ? 'Save Changes' : 'Register Hall'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

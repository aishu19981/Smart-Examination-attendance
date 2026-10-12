import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { Examination, Department, SessionType, AVAILABLE_DEPARTMENTS } from '../../types';
import { Badge } from '../common/Badge';
import {
  Calendar,
  Plus,
  Search,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Clock,
  BookOpen,
  Filter,
  Check,
  X,
} from 'lucide-react';

export const ExamManagement: React.FC = () => {
  const { examinations, addExamination, updateExamination, deleteExamination, toggleExamPublish } =
    useExam();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    courseCode: '',
    date: new Date().toISOString().split('T')[0],
    session: 'FN' as SessionType,
    department: 'Computer Science & Engineering' as Department,
    year: 3,
    section: 'A',
    isPublished: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      courseCode: '',
      date: new Date().toISOString().split('T')[0],
      session: 'FN',
      department: 'Computer Science & Engineering',
      year: 3,
      section: 'A',
      isPublished: true,
    });
    setEditingExamId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam: Examination) => {
    setEditingExamId(exam.id);
    setFormData({
      name: exam.name,
      courseCode: exam.courseCode,
      date: exam.date,
      session: exam.session,
      department: exam.department,
      year: exam.year,
      section: exam.section,
      isPublished: exam.isPublished,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mandatory validation
    if (!formData.name.trim() || !formData.courseCode.trim() || !formData.date) {
      alert('Please fill in all mandatory fields (Course Code, Name, Date).');
      return;
    }

    if (editingExamId) {
      updateExamination(editingExamId, {
        name: formData.name.trim(),
        courseCode: formData.courseCode.trim().toUpperCase(),
        date: formData.date,
        session: formData.session,
        department: formData.department,
        year: Number(formData.year),
        section: formData.section.trim(),
        isPublished: formData.isPublished,
      });
      setIsModalOpen(false);
      resetForm();
    } else {
      const success = addExamination({
        name: formData.name.trim(),
        courseCode: formData.courseCode.trim().toUpperCase(),
        date: formData.date,
        session: formData.session,
        department: formData.department,
        year: Number(formData.year),
        section: formData.section.trim(),
        isPublished: formData.isPublished,
      });
      if (success) {
        setIsModalOpen(false);
        resetForm();
      }
    }
  };

  // Filtered list
  const filteredExams = examinations.filter((exam) => {
    const matchesSearch =
      exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || exam.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Examination Schedule & Governance</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, schedule, and control publishing status of institute examinations
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Examination</span>
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Course Code or Examination Title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 bg-white"
          >
            <option value="ALL">All Departments ({AVAILABLE_DEPARTMENTS.length})</option>
            {AVAILABLE_DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Examinations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Course Code & Name</th>
                <th className="px-5 py-3.5">Department & Year</th>
                <th className="px-5 py-3.5">Exam Date & Session</th>
                <th className="px-5 py-3.5">Section</th>
                <th className="px-5 py-3.5 text-center">Student Visibility</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No examination records found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono">
                          {exam.courseCode}
                        </span>
                        <span className="font-medium text-slate-800">{exam.name}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800">{exam.department}</div>
                      <div className="text-[11px] text-slate-400">Academic Year {exam.year}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{exam.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>
                          {exam.session === 'FN'
                            ? 'FN (09:30 AM - 12:30 PM)'
                            : 'AN (02:00 PM - 05:00 PM)'}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded font-semibold text-[11px]">
                        Sec {exam.section}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => toggleExamPublish(exam.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                          exam.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        }`}
                        title={
                          exam.isPublished
                            ? 'Allocations published: Students can view venue & desk'
                            : 'Draft: Seating details hidden from students'
                        }
                      >
                        {exam.isPublished ? (
                          <>
                            <Eye className="w-3.5 h-3.5" /> Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> Unpublished Draft
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(exam)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Examination"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Delete examination ${exam.courseCode}? This will remove all seat allocations, attendance records, and duty assignments for this exam.`
                              )
                            ) {
                              deleteExamination(exam.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Examination"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Examination Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">
                  {editingExamId ? 'Edit Examination Schedule' : 'Schedule New Examination'}
                </h3>
              </div>
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
                    Course Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS301, ME302"
                    value={formData.courseCode}
                    onChange={(e) =>
                      setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Exam Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Course Examination Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures & Algorithms"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Session Slot <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.session}
                    onChange={(e) =>
                      setFormData({ ...formData, session: e.target.value as SessionType })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="FN">Forenoon (09:30 AM - 12:30 PM)</option>
                    <option value="AN">Afternoon (02:00 PM - 05:00 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value as Department })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {AVAILABLE_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Year <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value={1}>1st Year (B.Tech / B.E.)</option>
                    <option value={2}>2nd Year (B.Tech / B.E.)</option>
                    <option value={3}>3rd Year (B.Tech / B.E.)</option>
                    <option value={4}>4th Year (B.Tech / B.E.)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Section Scope <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A, B, or All"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Publish Seating to Student Portals immediately
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
                  {editingExamId ? 'Save Changes' : 'Confirm & Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

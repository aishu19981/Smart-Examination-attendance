import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { Student, Department, AVAILABLE_DEPARTMENTS } from '../../types';
import { Badge } from '../common/Badge';
import { exportToExcel } from '../../utils/exportUtils';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Trash2,
  Edit,
  GraduationCap,
  Mail,
  Download,
  CheckCircle2,
  X,
  BookOpen,
} from 'lucide-react';

export const StudentManagement: React.FC = () => {
  const { students, addStudent, updateStudent, removeStudent, examinations, seatAllocations } =
    useExam();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    rollNo: '',
    name: '',
    department: 'Computer Science & Engineering' as Department,
    year: 3,
    semester: 5,
    section: 'A',
    email: '',
    registeredCourses: [] as string[],
  });

  const resetForm = () => {
    setFormData({
      rollNo: '',
      name: '',
      department: 'Computer Science & Engineering',
      year: 3,
      semester: 5,
      section: 'A',
      email: '',
      registeredCourses: examinations.map((e) => e.courseCode).slice(0, 1),
    });
    setEditingStudentId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudentId(student.id);
    setFormData({
      rollNo: student.rollNo,
      name: student.name,
      department: student.department,
      year: student.year,
      semester: student.semester,
      section: student.section,
      email: student.email,
      registeredCourses: student.registeredCourses,
    });
    setIsModalOpen(true);
  };

  const toggleCourseReg = (courseCode: string) => {
    setFormData((prev) => {
      const exists = prev.registeredCourses.includes(courseCode);
      return {
        ...prev,
        registeredCourses: exists
          ? prev.registeredCourses.filter((c) => c !== courseCode)
          : [...prev.registeredCourses, courseCode],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.rollNo.trim() || !formData.name.trim() || !formData.email.trim()) {
      alert('Please fill in Roll Number, Full Name, and Email.');
      return;
    }

    if (editingStudentId) {
      updateStudent(editingStudentId, {
        rollNo: formData.rollNo.trim().toUpperCase(),
        name: formData.name.trim(),
        department: formData.department,
        year: Number(formData.year),
        semester: Number(formData.semester),
        section: formData.section.trim(),
        email: formData.email.trim(),
        registeredCourses: formData.registeredCourses,
      });
      setIsModalOpen(false);
      resetForm();
    } else {
      const ok = addStudent({
        rollNo: formData.rollNo.trim().toUpperCase(),
        name: formData.name.trim(),
        department: formData.department,
        year: Number(formData.year),
        semester: Number(formData.semester),
        section: formData.section.trim(),
        email: formData.email.trim(),
        registeredCourses: formData.registeredCourses,
      });
      if (ok) {
        setIsModalOpen(false);
        resetForm();
      }
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || s.department === selectedDept;
    const matchesYear = selectedYear === 'ALL' || s.year.toString() === selectedYear;

    return matchesSearch && matchesDept && matchesYear;
  });

  const handleExportStudents = () => {
    const data = filteredStudents.map((s, idx) => ({
      'S.No': idx + 1,
      'Roll Number': s.rollNo,
      'Candidate Name': s.name,
      'Department': s.department,
      'Academic Year': `Year ${s.year}`,
      'Semester': `Sem ${s.semester}`,
      'Section': s.section,
      'Email': s.email,
      'Registered Courses': s.registeredCourses.join(', '),
    }));
    exportToExcel(data, `Candidates_Roster_${new Date().toISOString().split('T')[0]}`, 'Students');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Candidate Directory & Student Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Enroll and maintain student records, departmental affiliations, and course examination
            eligibilities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportStudents}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Roster (.xlsx)</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll New Candidate</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by candidate name, roll number, or institutional email..."
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

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 bg-white"
          >
            <option value="ALL">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Roll Number & Name</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Class / Year / Sec</th>
                <th className="px-5 py-3.5">Institutional Email</th>
                <th className="px-5 py-3.5">Registered Course Examinations</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No candidate records found matching the query.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const allocationsForStudent = seatAllocations.filter(
                    (a) => a.studentId === student.id
                  );

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded font-mono text-xs border border-slate-200">
                            {student.rollNo}
                          </span>
                          <span className="font-semibold text-slate-900">{student.name}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-medium text-slate-800">{student.department}</span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-slate-700 font-medium">
                          Yr {student.year} / Sem {student.semester} - Sec {student.section}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{student.email}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {student.registeredCourses.length > 0 ? (
                            student.registeredCourses.map((code) => {
                              const isSeated = allocationsForStudent.some((a) => {
                                const ex = examinations.find((e) => e.id === a.examId);
                                return ex?.courseCode === code;
                              });

                              return (
                                <span
                                  key={code}
                                  className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold border ${
                                    isSeated
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}
                                  title={isSeated ? 'Seat allocated' : 'Awaiting allocation'}
                                >
                                  {code} {isSeated ? '✓' : ''}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-slate-400 italic">None registered</span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit Candidate"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Are you sure you want to remove candidate ${student.name} (${student.rollNo})? Any active seat allocations and attendance logs will be permanently deleted.`
                                )
                              ) {
                                removeStudent(student.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Remove Candidate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Candidate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">
                  {editingStudentId ? 'Modify Candidate Record' : 'Enroll New Examination Candidate'}
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
                    Roll Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 24ME105, 24CS115"
                    value={formData.rollNo}
                    onChange={(e) =>
                      setFormData({ ...formData, rollNo: e.target.value.toUpperCase() })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Candidate Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Verma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
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
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                >
                  {AVAILABLE_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Year <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        year: Number(e.target.value),
                        semester: Number(e.target.value) * 2 - 1,
                      })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Semester <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={8}
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Section <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="A or B"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institutional Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul.me105@univ.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Course Examination Registrations
                </label>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 max-h-36 overflow-y-auto">
                  {examinations.map((exam) => {
                    const isChecked = formData.registeredCourses.includes(exam.courseCode);
                    return (
                      <label
                        key={exam.id}
                        className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 hover:text-slate-900"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCourseReg(exam.courseCode)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                        />
                        <span className="font-mono font-bold text-slate-900">{exam.courseCode}</span>
                        <span>- {exam.name}</span>
                        <span className="text-[10px] text-slate-400">({exam.department})</span>
                      </label>
                    );
                  })}
                </div>
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
                  {editingStudentId ? 'Save Changes' : 'Enroll Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

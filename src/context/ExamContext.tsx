import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Role,
  Examination,
  Room,
  Student,
  InCharge,
  DutyAssignment,
  SeatAllocation,
  AttendanceRecord,
  AttendanceSubmission,
  AuditLog,
  AttendanceStatus,
  AuditCategory,
  AuditSeverity,
  Department,
  UserCredential,
} from '../types';
import {
  initialExaminations,
  initialRooms,
  initialStudents,
  initialInCharges,
  initialDutyAssignments,
  initialAllocations,
  initialAttendanceRecords,
  initialAttendanceSubmissions,
  initialAuditLogs,
  initialUserCredentials,
} from '../data/sampleData';
import { hashPasswordSecurely, verifyPasswordHash } from '../utils/cryptoUtils';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export interface UserSession {
  role: Role;
  email: string;
  name: string;
  id: string;
  department?: string;
  rollNo?: string;
  facultyId?: string;
}

interface ExamContextType {
  // Authentication & session
  isAuthenticated: boolean;
  currentUser: UserSession | null;
  userCredentials: UserCredential[];
  login: (role: Role, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  registerAccount: (
    role: Role,
    email: string,
    identifier: string,
    password: string,
    name?: string,
    department?: Department,
    year?: number,
    section?: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;

  // Current user / role
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  currentInChargeId: string;
  setCurrentInChargeId: (id: string) => void;
  currentStudentId: string;
  setCurrentStudentId: (id: string) => void;
  adminUsername: string;

  // Data collections
  examinations: Examination[];
  rooms: Room[];
  students: Student[];
  inCharges: InCharge[];
  dutyAssignments: DutyAssignment[];
  seatAllocations: SeatAllocation[];
  attendanceRecords: AttendanceRecord[];
  attendanceSubmissions: AttendanceSubmission[];
  auditLogs: AuditLog[];

  // Toasts
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Audit logger
  logAudit: (
    category: AuditCategory,
    action: string,
    details: string,
    severity?: AuditSeverity,
    targetEntityId?: string
  ) => void;

  // Exam Management
  addExamination: (data: Omit<Examination, 'id' | 'createdAt'>) => boolean;
  updateExamination: (id: string, data: Partial<Examination>) => void;
  deleteExamination: (id: string) => void;
  toggleExamPublish: (id: string) => void;

  // Room Management
  addRoom: (data: Omit<Room, 'id'>) => boolean;
  updateRoom: (id: string, data: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  toggleRoomAvailability: (id: string) => void;

  // Student Management
  addStudent: (data: Omit<Student, 'id'>) => boolean;
  updateStudent: (id: string, data: Partial<Student>) => void;
  removeStudent: (id: string) => void;

  // In-Charge Duties
  assignDuty: (inchargeId: string, examId: string, roomId: string) => void;
  removeDuty: (dutyId: string) => void;

  // Seating Allocations
  autoAllocateSeats: (
    examId: string,
    selectedRoomIds: string[],
    strategy: 'random' | 'alternating' | 'sequential'
  ) => { success: boolean; allocatedCount: number; unallocatedStudents: Student[]; message: string };
  randomizeRoomSeats: (
    examId: string,
    roomId: string
  ) => { success: boolean; message: string };
  manualAllocateSeat: (
    examId: string,
    roomId: string,
    studentId: string,
    deskNumber: number
  ) => boolean;
  clearAllocations: (examId: string, roomId?: string) => void;

  // Attendance
  markAttendance: (
    allocationId: string,
    status: AttendanceStatus,
    remarks?: string
  ) => void;
  batchMarkAttendance: (
    examId: string,
    roomId: string,
    status: 'present' | 'absent'
  ) => void;
  submitAttendance: (examId: string, roomId: string) => { success: boolean; message: string };
  reopenAttendance: (examId: string, roomId: string) => void;

  // System
  resetToSampleData: () => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

const STORAGE_KEY = 'SESMS_STORAGE_V1';

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication & session
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_user_session`);
    return saved ? JSON.parse(saved) : null;
  });

  const isAuthenticated = currentUser !== null;

  // Navigation / active identity
  const [currentRole, setCurrentRole] = useState<Role>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_user_session`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role) return parsed.role;
      } catch {
        // ignore
      }
    }
    return 'admin';
  });

  const [currentInChargeId, setCurrentInChargeId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_user_session`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'incharge' && parsed.id) return parsed.id;
      } catch {
        // ignore
      }
    }
    return 'inc-1';
  });

  const [currentStudentId, setCurrentStudentId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_user_session`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'student' && parsed.id) return parsed.id;
      } catch {
        // ignore
      }
    }
    return 'stu-1';
  });

  const adminUsername = 'admin (COE Office)';

  // Core Data
  const [examinations, setExaminations] = useState<Examination[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_exams`);
    return saved ? JSON.parse(saved) : initialExaminations;
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_rooms`);
    return saved ? JSON.parse(saved) : initialRooms;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [inCharges, setInCharges] = useState<InCharge[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_incharges`);
    if (saved) {
      try {
        const parsed: InCharge[] = JSON.parse(saved);
        let updated = false;
        const currentList = [...parsed];
        for (const init of initialInCharges) {
          const exists = currentList.some(
            (c) =>
              c.facultyId.toUpperCase() === init.facultyId.toUpperCase() ||
              c.email.toLowerCase() === init.email.toLowerCase()
          );
          if (!exists) {
            currentList.push(init);
            updated = true;
          }
        }
        if (updated) {
          localStorage.setItem(`${STORAGE_KEY}_incharges`, JSON.stringify(currentList));
        }
        return currentList;
      } catch {
        // ignore
      }
    }
    return initialInCharges;
  });

  const [dutyAssignments, setDutyAssignments] = useState<DutyAssignment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_duties`);
    if (saved) {
      try {
        const parsed: DutyAssignment[] = JSON.parse(saved);
        let updated = false;
        const currentList = [...parsed];
        for (const init of initialDutyAssignments) {
          const exists = currentList.some((d) => d.id === init.id);
          if (!exists) {
            currentList.push(init);
            updated = true;
          }
        }
        if (updated) {
          localStorage.setItem(`${STORAGE_KEY}_duties`, JSON.stringify(currentList));
        }
        return currentList;
      } catch {
        // ignore
      }
    }
    return initialDutyAssignments;
  });

  const [seatAllocations, setSeatAllocations] = useState<SeatAllocation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_allocations`);
    return saved ? JSON.parse(saved) : initialAllocations;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_attendance`);
    return saved ? JSON.parse(saved) : initialAttendanceRecords;
  });

  const [attendanceSubmissions, setAttendanceSubmissions] = useState<AttendanceSubmission[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_submissions`);
    return saved ? JSON.parse(saved) : initialAttendanceSubmissions;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [userCredentials, setUserCredentials] = useState<UserCredential[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_credentials`);
    return saved ? JSON.parse(saved) : initialUserCredentials;
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_exams`, JSON.stringify(examinations));
  }, [examinations]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_rooms`, JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_incharges`, JSON.stringify(inCharges));
  }, [inCharges]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_duties`, JSON.stringify(dutyAssignments));
  }, [dutyAssignments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_allocations`, JSON.stringify(seatAllocations));
  }, [seatAllocations]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_attendance`, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_submissions`, JSON.stringify(attendanceSubmissions));
  }, [attendanceSubmissions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_credentials`, JSON.stringify(userCredentials));
  }, [userCredentials]);

  // Audit Logger Helper
  const logAudit = (
    category: AuditCategory,
    action: string,
    details: string,
    severity: AuditSeverity = 'info',
    targetEntityId?: string
  ) => {
    let actor = adminUsername;
    if (currentRole === 'incharge') {
      const inc = inCharges.find((i) => i.id === currentInChargeId);
      actor = inc ? inc.name : 'In-Charge Faculty';
    } else if (currentRole === 'student') {
      const stu = students.find((s) => s.id === currentStudentId);
      actor = stu ? `${stu.name} (${stu.rollNo})` : 'Student';
    }

    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actor,
      role: currentRole,
      category,
      action,
      details,
      targetEntityId,
      severity,
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // 1. Examination Setup
  const addExamination = (data: Omit<Examination, 'id' | 'createdAt'>): boolean => {
    // Collision check: prevent duplicate exam records with identical course code, date, and session
    const duplicate = examinations.find(
      (e) =>
        e.courseCode.trim().toUpperCase() === data.courseCode.trim().toUpperCase() &&
        e.date === data.date &&
        e.session === data.session
    );

    if (duplicate) {
      addToast(
        'error',
        'Duplicate Schedule Collision',
        `Course ${data.courseCode} is already scheduled on ${data.date} (${data.session}).`
      );
      return false;
    }

    const newExam: Examination = {
      ...data,
      id: `exam-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setExaminations((prev) => [...prev, newExam]);
    logAudit(
      'EXAM',
      'CREATE_EXAMINATION',
      `Created examination ${newExam.courseCode} - ${newExam.name} on ${newExam.date} (${newExam.session}).`,
      'info',
      newExam.id
    );
    addToast('success', 'Examination Created', `${newExam.courseCode} successfully scheduled.`);
    return true;
  };

  const updateExamination = (id: string, data: Partial<Examination>) => {
    setExaminations((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...data } : e))
    );
    logAudit(
      'EXAM',
      'UPDATE_EXAMINATION',
      `Updated details for examination record ID ${id}.`,
      'info',
      id
    );
    addToast('info', 'Examination Updated', 'Exam details saved.');
  };

  const deleteExamination = (id: string) => {
    const exam = examinations.find((e) => e.id === id);
    setExaminations((prev) => prev.filter((e) => e.id !== id));
    setSeatAllocations((prev) => prev.filter((a) => a.examId !== id));
    setAttendanceRecords((prev) => prev.filter((r) => r.examId !== id));
    setAttendanceSubmissions((prev) => prev.filter((s) => s.examId !== id));
    setDutyAssignments((prev) => prev.filter((d) => d.examId !== id));

    logAudit(
      'EXAM',
      'DELETE_EXAMINATION',
      `Deleted examination ${exam ? exam.courseCode : id} and removed all related seat allocations and duties.`,
      'warning',
      id
    );
    addToast('warning', 'Exam Deleted', 'Exam and linked records removed.');
  };

  const toggleExamPublish = (id: string) => {
    setExaminations((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const nextState = !e.isPublished;
          logAudit(
            'EXAM',
            nextState ? 'PUBLISH_ALLOCATION' : 'UNPUBLISH_ALLOCATION',
            `${nextState ? 'Published' : 'Unpublished'} examination schedule & seating for ${e.courseCode}.`,
            nextState ? 'info' : 'warning',
            id
          );
          addToast(
            nextState ? 'success' : 'info',
            nextState ? 'Allocations Published' : 'Allocations Hidden',
            nextState
              ? `Students can now view their room & seat numbers for ${e.courseCode}.`
              : `Seating details hidden from students for ${e.courseCode}.`
          );
          return { ...e, isPublished: nextState };
        }
        return e;
      })
    );
  };

  // 2. Room Management
  const addRoom = (data: Omit<Room, 'id'>): boolean => {
    const duplicate = rooms.find(
      (r) => r.roomNumber.trim().toUpperCase() === data.roomNumber.trim().toUpperCase()
    );
    if (duplicate) {
      addToast('error', 'Duplicate Room Number', `Room ${data.roomNumber} already exists in the system.`);
      return false;
    }

    const newRoom: Room = {
      ...data,
      id: `room-${Date.now()}`,
    };

    setRooms((prev) => [...prev, newRoom]);
    logAudit(
      'ROOM',
      'REGISTER_ROOM',
      `Added room ${newRoom.roomNumber} (${newRoom.block}) with capacity ${newRoom.capacity} (${newRoom.rows}x${newRoom.cols}).`,
      'info',
      newRoom.id
    );
    addToast('success', 'Room Added', `Room ${newRoom.roomNumber} registered.`);
    return true;
  };

  const updateRoom = (id: string, data: Partial<Room>) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    );
    logAudit('ROOM', 'UPDATE_ROOM', `Modified configuration for room ID ${id}.`, 'info', id);
    addToast('info', 'Room Updated', 'Venue specifications saved.');
  };

  const deleteRoom = (id: string) => {
    const room = rooms.find((r) => r.id === id);
    setRooms((prev) => prev.filter((r) => r.id !== id));
    setSeatAllocations((prev) => prev.filter((a) => a.roomId !== id));
    setAttendanceRecords((prev) => prev.filter((r) => r.roomId !== id));
    setAttendanceSubmissions((prev) => prev.filter((s) => s.roomId !== id));
    setDutyAssignments((prev) => prev.filter((d) => d.roomId !== id));

    logAudit(
      'ROOM',
      'DELETE_ROOM',
      `Decommissioned and deleted room ${room ? room.roomNumber : id} from active examination venues.`,
      'warning',
      id
    );
    addToast('warning', 'Room Deleted', `Room ${room ? room.roomNumber : ''} removed.`);
  };

  const toggleRoomAvailability = (id: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const next = !r.isAvailable;
          logAudit(
            'ROOM',
            'TOGGLE_ROOM_AVAILABILITY',
            `Set Room ${r.roomNumber} availability to ${next ? 'Available' : 'Unavailable (Maintenance/Disabled)'}.`,
            next ? 'info' : 'warning',
            id
          );
          addToast(
            'info',
            'Room Status Updated',
            `Room ${r.roomNumber} is now ${next ? 'Available' : 'Marked Unavailable'}.`
          );
          return { ...r, isAvailable: next };
        }
        return r;
      })
    );
  };

  // 3. Student Management
  const addStudent = (data: Omit<Student, 'id'>): boolean => {
    const cleanRoll = data.rollNo.trim().toUpperCase();
    const duplicate = students.find((s) => s.rollNo.toUpperCase() === cleanRoll);
    if (duplicate) {
      addToast('error', 'Duplicate Roll Number', `Candidate with roll number ${cleanRoll} already exists.`);
      return false;
    }

    const newStudent: Student = {
      ...data,
      rollNo: cleanRoll,
      id: `stu-${Date.now()}`,
    };

    setStudents((prev) => [...prev, newStudent]);
    logAudit(
      'STUDENT',
      'STUDENT_ENROLLED',
      `Enrolled candidate ${newStudent.name} (${newStudent.rollNo}) in Department of ${newStudent.department}.`,
      'info',
      newStudent.id
    );
    addToast('success', 'Candidate Enrolled', `${newStudent.name} (${newStudent.rollNo}) added.`);
    return true;
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
    logAudit('STUDENT', 'STUDENT_UPDATED', `Updated record for candidate ID ${id}.`, 'info', id);
    addToast('info', 'Candidate Updated', 'Student details updated.');
  };

  const removeStudent = (id: string) => {
    const student = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    // Clean up seat allocations and attendance records for this student
    setSeatAllocations((prev) => prev.filter((a) => a.studentId !== id));
    setAttendanceRecords((prev) => prev.filter((r) => r.studentId !== id));

    logAudit(
      'STUDENT',
      'STUDENT_REMOVED',
      `Deregistered and removed candidate ${student ? `${student.name} (${student.rollNo})` : id}.`,
      'warning',
      id
    );
    addToast('warning', 'Candidate Removed', `${student ? student.name : 'Student'} deregistered.`);
  };

  // 4. In-Charge Duties
  const assignDuty = (inchargeId: string, examId: string, roomId: string) => {
    const inc = inCharges.find((i) => i.id === inchargeId);
    const exam = examinations.find((e) => e.id === examId);
    const room = rooms.find((r) => r.id === roomId);

    // Remove existing duty for this room and exam if any
    const filtered = dutyAssignments.filter(
      (d) => !(d.examId === examId && d.roomId === roomId)
    );

    const newDuty: DutyAssignment = {
      id: `duty-${Date.now()}`,
      inchargeId,
      examId,
      roomId,
      assignedAt: new Date().toISOString(),
    };

    setDutyAssignments([...filtered, newDuty]);
    logAudit(
      'DUTY',
      'ASSIGN_INVIGILATOR',
      `Assigned ${inc ? inc.name : inchargeId} as Hall Superintendent for Room ${room ? room.roomNumber : roomId} (Exam ${exam ? exam.courseCode : examId}).`,
      'info',
      examId
    );
    addToast('success', 'Duty Assigned', `${inc?.name} assigned to Room ${room?.roomNumber}.`);
  };

  const removeDuty = (dutyId: string) => {
    const duty = dutyAssignments.find((d) => d.id === dutyId);
    setDutyAssignments((prev) => prev.filter((d) => d.id !== dutyId));
    logAudit('DUTY', 'REVOKE_INVIGILATOR', `Revoked invigilator duty assignment ID ${dutyId}.`, 'warning', duty?.examId);
    addToast('info', 'Duty Revoked', 'Invigilator duty unassigned.');
  };

  // 5. Seating Allocation Engine
  const autoAllocateSeats = (
    examId: string,
    selectedRoomIds: string[],
    strategy: 'random' | 'alternating' | 'sequential'
  ) => {
    const exam = examinations.find((e) => e.id === examId);
    if (!exam) return { success: false, allocatedCount: 0, unallocatedStudents: [], message: 'Exam not found' };

    // Get eligible candidates for this exam:
    // Students registered for course code, or matching department & year if no specific course registered
    const eligibleStudents = students.filter(
      (s) =>
        s.registeredCourses.includes(exam.courseCode) ||
        (s.department === exam.department && s.year === exam.year)
    );

    if (eligibleStudents.length === 0) {
      addToast('warning', 'No Eligible Candidates', `No registered students found for ${exam.courseCode}.`);
      return { success: false, allocatedCount: 0, unallocatedStudents: [], message: 'No registered candidates' };
    }

    const availableRooms = rooms.filter(
      (r) => selectedRoomIds.includes(r.id) && r.isAvailable
    );

    if (availableRooms.length === 0) {
      addToast('error', 'No Rooms Selected', 'Please select at least one active room for allocation.');
      return { success: false, allocatedCount: 0, unallocatedStudents: eligibleStudents, message: 'No active rooms selected' };
    }

    const totalCapacity = availableRooms.reduce((acc, r) => acc + r.capacity, 0);

    // Strategy sorting
    let candidatePool = [...eligibleStudents];
    if (strategy === 'random') {
      // Cryptographically-clean Fisher-Yates random shuffle across all candidates
      for (let i = candidatePool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidatePool[i], candidatePool[j]] = [candidatePool[j], candidatePool[i]];
      }
    } else if (strategy === 'sequential') {
      // Sort strictly by roll number
      candidatePool.sort((a, b) => a.rollNo.localeCompare(b.rollNo));
    } else {
      // Alternating department/section strategy (anti-cheating)
      // Group by department
      const groups: Record<string, Student[]> = {};
      candidatePool.forEach((s) => {
        if (!groups[s.department]) groups[s.department] = [];
        groups[s.department].push(s);
      });
      // Sort within groups
      Object.keys(groups).forEach((k) => groups[k].sort((a, b) => a.rollNo.localeCompare(b.rollNo)));
      // Interleave
      const interleaved: Student[] = [];
      let maxLen = Math.max(...Object.values(groups).map((g) => g.length));
      for (let i = 0; i < maxLen; i++) {
        Object.keys(groups).forEach((k) => {
          if (groups[k][i]) interleaved.push(groups[k][i]);
        });
      }
      candidatePool = interleaved;
    }

    // Allocate across rooms
    const newAllocations: SeatAllocation[] = [];
    const newAttendance: AttendanceRecord[] = [];
    let candidateIndex = 0;

    for (const room of availableRooms) {
      let deskNo = 1;
      const roomCapacity = room.capacity;

      while (deskNo <= roomCapacity && candidateIndex < candidatePool.length) {
        const student = candidatePool[candidateIndex];
        const row = Math.floor((deskNo - 1) / room.cols) + 1;
        const col = ((deskNo - 1) % room.cols) + 1;
        const allocId = `alloc-${Date.now()}-${deskNo}-${student.id}`;

        const alloc: SeatAllocation = {
          id: allocId,
          examId,
          roomId: room.id,
          studentId: student.id,
          deskNumber: deskNo,
          seatCoordinate: `R${row}-C${col}`,
          allocatedAt: new Date().toISOString(),
        };

        newAllocations.push(alloc);

        newAttendance.push({
          id: `att-${allocId}`,
          allocationId: allocId,
          examId,
          roomId: room.id,
          studentId: student.id,
          status: 'unmarked',
        });

        deskNo++;
        candidateIndex++;
      }

      if (candidateIndex >= candidatePool.length) break;
    }

    const unallocated = candidatePool.slice(candidateIndex);

    // Remove existing allocations for this exam
    setSeatAllocations((prev) => [
      ...prev.filter((a) => a.examId !== examId),
      ...newAllocations,
    ]);

    // Replace attendance records for this exam
    setAttendanceRecords((prev) => [
      ...prev.filter((r) => r.examId !== examId),
      ...newAttendance,
    ]);

    // Reset any finalized submission for this exam to draft
    setAttendanceSubmissions((prev) => prev.filter((s) => s.examId !== examId));

    const detailsMsg = `Allocated ${newAllocations.length} of ${eligibleStudents.length} candidates for ${exam.courseCode} using ${strategy.toUpperCase()} strategy across ${availableRooms.length} room(s). Capacity: ${totalCapacity}. Deficit: ${unallocated.length}.`;

    logAudit('ALLOCATION', 'AUTO_ALLOCATE_SEATS', detailsMsg, unallocated.length > 0 ? 'warning' : 'info', examId);

    if (unallocated.length > 0) {
      addToast(
        'warning',
        'Capacity Insufficient',
        `Allocated ${newAllocations.length} students. ${unallocated.length} candidates remained unallocated due to room capacity deficit!`
      );
    } else {
      addToast('success', 'Allocation Complete', `Successfully allocated all ${newAllocations.length} candidates using ${strategy} arrangement.`);
    }

    return {
      success: true,
      allocatedCount: newAllocations.length,
      unallocatedStudents: unallocated,
      message: detailsMsg,
    };
  };

  const randomizeRoomSeats = (examId: string, roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    const exam = examinations.find((e) => e.id === examId);
    if (!room || !exam) {
      return { success: false, message: 'Invalid hall or examination.' };
    }

    const currentRoomAllocs = seatAllocations.filter(
      (a) => a.examId === examId && a.roomId === roomId
    );

    if (currentRoomAllocs.length <= 1) {
      addToast('warning', 'Insufficient Candidates', 'At least 2 seated candidates are required to randomize seats.');
      return { success: false, message: 'Need at least 2 candidates to shuffle' };
    }

    // Extract student IDs and perform Fisher-Yates random shuffle
    const studentIds = currentRoomAllocs.map((a) => a.studentId);
    for (let i = studentIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [studentIds[i], studentIds[j]] = [studentIds[j], studentIds[i]];
    }

    // Reassign desks 1..N with new random permutation
    const newRoomAllocs: SeatAllocation[] = studentIds.map((studentId, idx) => {
      const deskNo = idx + 1;
      const row = Math.floor((deskNo - 1) / room.cols) + 1;
      const col = ((deskNo - 1) % room.cols) + 1;
      const allocId = `alloc-${Date.now()}-${deskNo}-${studentId}`;

      return {
        id: allocId,
        examId,
        roomId,
        studentId,
        deskNumber: deskNo,
        seatCoordinate: `R${row}-C${col}`,
        allocatedAt: new Date().toISOString(),
      };
    });

    // Update seatAllocations
    setSeatAllocations((prev) => [
      ...prev.filter((a) => !(a.examId === examId && a.roomId === roomId)),
      ...newRoomAllocs,
    ]);

    // Retain attendance records matching studentId or reinitialize
    setAttendanceRecords((prev) => {
      const otherRecords = prev.filter(
        (r) => !(r.examId === examId && r.roomId === roomId)
      );
      const updatedRecords: AttendanceRecord[] = newRoomAllocs.map((alloc) => {
        const existingRec = prev.find(
          (r) => r.examId === examId && r.roomId === roomId && r.studentId === alloc.studentId
        );
        return {
          id: `att-${alloc.id}`,
          allocationId: alloc.id,
          examId,
          roomId,
          studentId: alloc.studentId,
          status: existingRec?.status || 'unmarked',
          remarks: existingRec?.remarks,
          markedAt: existingRec?.markedAt,
          markedBy: existingRec?.markedBy,
        };
      });
      return [...otherRecords, ...updatedRecords];
    });

    // Re-open attendance submission for this room so faculty/invigilator can verify
    setAttendanceSubmissions((prev) =>
      prev.map((s) => (s.examId === examId && s.roomId === roomId ? { ...s, isFinalSubmitted: false } : s))
    );

    const actor =
      currentRole === 'incharge'
        ? inCharges.find((i) => i.id === currentInChargeId)?.name || 'Faculty In-Charge'
        : 'COE Admin';

    logAudit(
      'ALLOCATION',
      'RANDOM_SEAT_SHUFFLE',
      `${actor} executed anti-malpractice random seat shuffle for Room ${room.roomNumber} (${exam.courseCode}). Total ${studentIds.length} candidate desks randomized.`,
      'info',
      examId
    );

    addToast(
      'success',
      'Random Seating Applied',
      `Room ${room.roomNumber} seats randomly shuffled across ${studentIds.length} desks.`
    );

    return { success: true, message: `Random seating applied to Room ${room.roomNumber}.` };
  };

  const manualAllocateSeat = (
    examId: string,
    roomId: string,
    studentId: string,
    deskNumber: number
  ): boolean => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return false;

    // Check desk bounds
    if (deskNumber < 1 || deskNumber > room.capacity) {
      addToast('error', 'Invalid Desk Number', `Desk must be between 1 and ${room.capacity}.`);
      return false;
    }

    // Check if desk is already occupied in this exam & room
    const deskOccupied = seatAllocations.find(
      (a) => a.examId === examId && a.roomId === roomId && a.deskNumber === deskNumber
    );
    if (deskOccupied) {
      addToast('error', 'Desk Already Occupied', `Desk ${deskNumber} is already occupied in Room ${room.roomNumber}.`);
      return false;
    }

    // Prevent duplicate student allocation in the same exam
    const studentAlreadySeated = seatAllocations.find(
      (a) => a.examId === examId && a.studentId === studentId
    );
    if (studentAlreadySeated) {
      addToast('error', 'Candidate Already Allocated', 'Student is already assigned to a seat in this examination.');
      return false;
    }

    const row = Math.floor((deskNumber - 1) / room.cols) + 1;
    const col = ((deskNumber - 1) % room.cols) + 1;
    const allocId = `alloc-${Date.now()}-${deskNumber}-${studentId}`;

    const newAlloc: SeatAllocation = {
      id: allocId,
      examId,
      roomId,
      studentId,
      deskNumber,
      seatCoordinate: `R${row}-C${col}`,
      allocatedAt: new Date().toISOString(),
    };

    setSeatAllocations((prev) => [...prev, newAlloc]);
    setAttendanceRecords((prev) => [
      ...prev,
      {
        id: `att-${allocId}`,
        allocationId: allocId,
        examId,
        roomId,
        studentId,
        status: 'unmarked',
      },
    ]);

    const stu = students.find((s) => s.id === studentId);
    logAudit(
      'ALLOCATION',
      'MANUAL_ALLOCATE_SEAT',
      `Manually assigned seat D-${deskNumber} (${newAlloc.seatCoordinate}) in Room ${room.roomNumber} to candidate ${stu?.name} (${stu?.rollNo}).`,
      'info',
      examId
    );
    addToast('success', 'Seat Assigned', `Assigned Desk ${deskNumber} to ${stu?.rollNo}.`);
    return true;
  };

  const clearAllocations = (examId: string, roomId?: string) => {
    const exam = examinations.find((e) => e.id === examId);
    if (roomId) {
      const room = rooms.find((r) => r.id === roomId);
      setSeatAllocations((prev) => prev.filter((a) => !(a.examId === examId && a.roomId === roomId)));
      setAttendanceRecords((prev) => prev.filter((r) => !(r.examId === examId && r.roomId === roomId)));
      setAttendanceSubmissions((prev) => prev.filter((s) => !(s.examId === examId && s.roomId === roomId)));
      logAudit(
        'ALLOCATION',
        'CLEAR_ALLOCATIONS',
        `Cleared seat allocations for Room ${room?.roomNumber} in ${exam?.courseCode}.`,
        'warning',
        examId
      );
      addToast('info', 'Allocations Cleared', `Room ${room?.roomNumber} seats reset.`);
    } else {
      setSeatAllocations((prev) => prev.filter((a) => a.examId !== examId));
      setAttendanceRecords((prev) => prev.filter((r) => r.examId !== examId));
      setAttendanceSubmissions((prev) => prev.filter((s) => s.examId !== examId));
      logAudit(
        'ALLOCATION',
        'CLEAR_ALLOCATIONS',
        `Cleared all room seat allocations for examination ${exam?.courseCode}.`,
        'warning',
        examId
      );
      addToast('info', 'Allocations Cleared', `All seats reset for ${exam?.courseCode}.`);
    }
  };

  // 6. Attendance Recording
  const markAttendance = (
    allocationId: string,
    status: AttendanceStatus,
    remarks?: string
  ) => {
    const activeInCharge = inCharges.find((i) => i.id === currentInChargeId);
    const markerName = currentRole === 'incharge' ? activeInCharge?.name : 'Admin Desk';

    setAttendanceRecords((prev) =>
      prev.map((r) => {
        if (r.allocationId === allocationId) {
          return {
            ...r,
            status,
            markedAt: status !== 'unmarked' ? new Date().toISOString() : undefined,
            markedBy: status !== 'unmarked' ? markerName : undefined,
            remarks: remarks !== undefined ? remarks : r.remarks,
          };
        }
        return r;
      })
    );
  };

  const batchMarkAttendance = (
    examId: string,
    roomId: string,
    status: 'present' | 'absent'
  ) => {
    const activeInCharge = inCharges.find((i) => i.id === currentInChargeId);
    const markerName = currentRole === 'incharge' ? activeInCharge?.name : 'Admin Desk';

    setAttendanceRecords((prev) =>
      prev.map((r) => {
        if (r.examId === examId && r.roomId === roomId) {
          return {
            ...r,
            status,
            markedAt: new Date().toISOString(),
            markedBy: markerName,
          };
        }
        return r;
      })
    );
    addToast('info', 'Batch Updated', `Marked all students in venue as ${status.toUpperCase()}.`);
  };

  const submitAttendance = (examId: string, roomId: string): { success: boolean; message: string } => {
    const records = attendanceRecords.filter((r) => r.examId === examId && r.roomId === roomId);
    if (records.length === 0) {
      addToast('error', 'No Candidates', 'No student allocations found in this room.');
      return { success: false, message: 'No allocations found' };
    }

    // Submission barrier: Prevent submission until ALL students are marked
    const unmarkedRecords = records.filter((r) => r.status === 'unmarked');
    if (unmarkedRecords.length > 0) {
      const msg = `Cannot submit: ${unmarkedRecords.length} student(s) are still unmarked. Every candidate must be marked Present or Absent before final submission.`;
      addToast('error', 'Submission Blocked', msg);
      return { success: false, message: msg };
    }

    const presentCount = records.filter((r) => r.status === 'present').length;
    const absentCount = records.filter((r) => r.status === 'absent').length;

    const existingSub = attendanceSubmissions.find((s) => s.examId === examId && s.roomId === roomId);
    const submissionId = existingSub ? existingSub.id : `sub-${Date.now()}`;

    const newSub: AttendanceSubmission = {
      id: submissionId,
      examId,
      roomId,
      inchargeId: currentInChargeId,
      isFinalSubmitted: true,
      submittedAt: new Date().toISOString(),
      totalAllocated: records.length,
      presentCount,
      absentCount,
    };

    setAttendanceSubmissions((prev) => [
      ...prev.filter((s) => !(s.examId === examId && s.roomId === roomId)),
      newSub,
    ]);

    const exam = examinations.find((e) => e.id === examId);
    const room = rooms.find((r) => r.id === roomId);

    logAudit(
      'ATTENDANCE',
      'SUBMIT_ATTENDANCE',
      `Finalized attendance submission for Room ${room?.roomNumber} (${exam?.courseCode}): Total ${records.length}, Present ${presentCount}, Absent ${absentCount}.`,
      'info',
      submissionId
    );

    addToast(
      'success',
      'Attendance Submitted',
      `Room ${room?.roomNumber} finalized: ${presentCount} Present, ${absentCount} Absent.`
    );

    return { success: true, message: 'Attendance submitted successfully.' };
  };

  const reopenAttendance = (examId: string, roomId: string) => {
    setAttendanceSubmissions((prev) =>
      prev.map((s) => {
        if (s.examId === examId && s.roomId === roomId) {
          return { ...s, isFinalSubmitted: false };
        }
        return s;
      })
    );

    const exam = examinations.find((e) => e.id === examId);
    const room = rooms.find((r) => r.id === roomId);

    logAudit(
      'ATTENDANCE',
      'REOPEN_ATTENDANCE',
      `Reopened attendance register for Room ${room?.roomNumber} (${exam?.courseCode}) for corrections.`,
      'warning',
      examId
    );

    addToast('info', 'Register Reopened', `Attendance unlocked for Room ${room?.roomNumber}.`);
  };

  const login = async (role: Role, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      addToast('error', 'Authentication Failed', 'Please provide your registered institutional email.');
      return { success: false, message: 'Please provide registered email.' };
    }

    if (!cleanPassword) {
      addToast('error', 'Authentication Failed', 'Please enter your account password / security PIN.');
      return { success: false, message: 'Password is required to access your account.' };
    }

    // Look up credentials for this email and role
    const cred = userCredentials.find(
      (c) => c.email.toLowerCase() === cleanEmail && c.role === role
    );

    if (!cred) {
      // Check if student/faculty exists in database but hasn't activated password yet
      const studentExists = role === 'student' && students.some((s) => s.email.toLowerCase() === cleanEmail);
      const facultyExists = role === 'incharge' && inCharges.some((i) => i.email.toLowerCase() === cleanEmail);

      if (studentExists) {
        const msg = `This email (${cleanEmail}) is enrolled, but your access password has not been activated yet. Please click "Register / Activate Account" to set your password using your Roll Number.`;
        addToast('warning', 'Account Not Activated', msg);
        return { success: false, message: msg };
      }
      if (facultyExists) {
        const msg = `This faculty email is enrolled, but your access password is not yet activated. Please click "Register / Activate Account" to set your password using your Faculty ID.`;
        addToast('warning', 'Account Not Activated', msg);
        return { success: false, message: msg };
      }

      const roleLabel = role === 'admin' ? 'Examination Admin' : role === 'incharge' ? 'Faculty In-Charge' : 'Student';
      const msg = `Access Blocked: No registered ${roleLabel} account found with email "${email}". You cannot log into an unregistered email. Please register your email first in the "Register / Activate Account" tab.`;
      addToast('error', 'Unregistered Email', msg);
      return { success: false, message: msg };
    }

    // Verify password matches using secure hash verification
    const isPasswordValid = await verifyPasswordHash(cleanPassword, cred.password);
    if (!isPasswordValid) {
      logAudit(
        'AUTH',
        'FAILED_LOGIN_ATTEMPT',
        `Failed authentication attempt for ${role} (${cleanEmail}): Incorrect password provided. Access rejected.`,
        'warning'
      );
      addToast('error', 'Invalid Credentials', 'Incorrect password/PIN for this registered email address. Access denied.');
      return {
        success: false,
        message: 'Authentication Failed: Incorrect password/PIN for this registered email address. Access denied.',
      };
    }

    if (role === 'admin') {
      const session: UserSession = {
        role: 'admin',
        email: cleanEmail,
        name: 'Controller of Examinations',
        id: 'admin-1',
        // Note: admin won't have department
      };
      setCurrentUser(session);
      setCurrentRole('admin');
      localStorage.setItem(`${STORAGE_KEY}_user_session`, JSON.stringify(session));
      logAudit('AUTH', 'USER_LOGIN', `Administrator authenticated successfully with email ${cleanEmail}.`, 'info');
      addToast('success', 'Access Granted', 'Signed in as Controller of Examinations.');
      return { success: true, message: 'Welcome to COE Command Console.' };
    }

    if (role === 'incharge') {
      const faculty = inCharges.find(
        (i) => i.email.trim().toLowerCase() === cleanEmail || i.facultyId.toUpperCase() === cred.identifier.toUpperCase()
      );
      if (!faculty) {
        const msg = `No faculty in-charge profile found matching this account.`;
        addToast('error', 'Faculty Not Found', msg);
        return { success: false, message: msg };
      }

      const session: UserSession = {
        role: 'incharge',
        email: faculty.email,
        name: faculty.name,
        id: faculty.id,
        department: faculty.department,
        facultyId: faculty.facultyId,
      };
      setCurrentUser(session);
      setCurrentRole('incharge');
      setCurrentInChargeId(faculty.id);
      localStorage.setItem(`${STORAGE_KEY}_user_session`, JSON.stringify(session));
      logAudit('AUTH', 'USER_LOGIN', `Faculty In-Charge ${faculty.name} (${faculty.facultyId}) verified and authenticated.`, 'info');
      addToast('success', 'Faculty Verified', `Welcome, ${faculty.name}. Assigned examination venues loaded.`);
      return { success: true, message: `Welcome, ${faculty.name}.` };
    }

    if (role === 'student') {
      const student = students.find(
        (s) => s.email.trim().toLowerCase() === cleanEmail || s.rollNo.toUpperCase() === cred.identifier.toUpperCase()
      );
      if (!student) {
        const msg = `Candidate profile not found matching registered roll number.`;
        addToast('error', 'Candidate Not Found', msg);
        return { success: false, message: msg };
      }

      const session: UserSession = {
        role: 'student',
        email: student.email,
        name: student.name,
        id: student.id,
        department: student.department,
        rollNo: student.rollNo,
      };
      setCurrentUser(session);
      setCurrentRole('student');
      setCurrentStudentId(student.id);
      localStorage.setItem(`${STORAGE_KEY}_user_session`, JSON.stringify(session));
      logAudit('AUTH', 'USER_LOGIN', `Candidate ${student.name} (${student.rollNo}) verified and authenticated.`, 'info');
      addToast('success', 'Candidate Verified', `Welcome, ${student.name} (${student.rollNo}). Accessing personal exam schedule.`);
      return { success: true, message: `Welcome, ${student.name}.` };
    }

    return { success: false, message: 'Invalid role selection.' };
  };

  const registerAccount = async (
    role: Role,
    email: string,
    identifier: string,
    password: string,
    name?: string,
    department?: Department,
    year?: number,
    section?: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanId = identifier.trim().toUpperCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanId || !cleanPassword) {
      addToast('error', 'Validation Error', 'All fields (Email, Roll No/Faculty ID, Password) are mandatory.');
      return { success: false, message: 'All fields are mandatory.' };
    }

    if (cleanPassword.length < 4) {
      addToast('error', 'Security Requirement', 'Password must be at least 4 characters long.');
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    if (role === 'student') {
      // Check if student account is already registered
      const alreadyRegistered = userCredentials.find(
        (c) =>
          c.role === 'student' &&
          (c.email.toLowerCase() === cleanEmail || c.identifier.toUpperCase() === cleanId) &&
          c.isRegistered
      );
      if (alreadyRegistered) {
        const msg = `Candidate account for "${cleanEmail}" (Roll: ${cleanId}) is already registered and activated. Please sign in instead.`;
        addToast('warning', 'Already Registered', msg);
        return { success: false, message: msg };
      }

      const existingByRoll = students.find((s) => s.rollNo.toUpperCase() === cleanId);
      const existingByEmail = students.find((s) => s.email.toLowerCase() === cleanEmail);

      let targetStudent: Student;

      if (existingByRoll) {
        targetStudent = existingByRoll;
        // If email was previously different, update to the newly registered email
        if (existingByRoll.email.toLowerCase() !== cleanEmail) {
          setStudents((prev) =>
            prev.map((s) => (s.id === existingByRoll.id ? { ...s, email: cleanEmail } : s))
          );
        }
      } else if (existingByEmail) {
        targetStudent = existingByEmail;
      } else {
        // Enrolling new candidate
        if (!name || !department) {
          const msg = `Roll number ${cleanId} not found in pre-enrolled records. Please provide your Full Name and Department to complete enrollment.`;
          addToast('error', 'Details Required', msg);
          return { success: false, message: msg };
        }

        const newStu: Student = {
          id: `stu-${Date.now()}`,
          rollNo: cleanId,
          name: name.trim(),
          department: department,
          year: year || 3,
          semester: (year || 3) * 2 - 1,
          section: section || 'A',
          email: cleanEmail,
          registeredCourses: examinations.map((e) => e.courseCode).slice(0, 1),
        };

        setStudents((prev) => [...prev, newStu]);
        targetStudent = newStu;
      }

      // Hash password securely
      const hashedPassword = await hashPasswordSecurely(cleanPassword);

      // Save user credential
      const newCred: UserCredential = {
        email: cleanEmail,
        role: 'student',
        password: hashedPassword,
        isRegistered: true,
        registeredAt: new Date().toISOString(),
        identifier: targetStudent.rollNo,
      };

      setUserCredentials((prev) => [
        ...prev.filter((c) => !(c.email.toLowerCase() === cleanEmail && c.role === 'student')),
        newCred,
      ]);

      // Set active authenticated session
      const session: UserSession = {
        role: 'student',
        email: cleanEmail,
        name: targetStudent.name,
        id: targetStudent.id,
        department: targetStudent.department,
        rollNo: targetStudent.rollNo,
      };

      setCurrentUser(session);
      setCurrentRole('student');
      setCurrentStudentId(targetStudent.id);
      localStorage.setItem(`${STORAGE_KEY}_user_session`, JSON.stringify(session));

      logAudit(
        'AUTH',
        'ACCOUNT_REGISTERED',
        `Candidate ${targetStudent.name} (${targetStudent.rollNo}) registered password and activated portal access for email ${cleanEmail}.`,
        'info'
      );

      addToast(
        'success',
        'Account Registered & Verified',
        `Welcome, ${targetStudent.name} (${targetStudent.rollNo})! Your account is now secured.`
      );

      return {
        success: true,
        message: `Account registered successfully for ${targetStudent.name} (${targetStudent.rollNo}).`,
      };
    }

    if (role === 'incharge') {
      // 1. Strict verification: Look up faculty record by ID in institutional faculty database (inCharges)
      const facultyById = inCharges.find((i) => i.facultyId.toUpperCase() === cleanId);

      if (!facultyById) {
        const msg = `Faculty ID "${cleanId}" not found in institutional faculty database.`;
        addToast('error', 'Faculty Record Not Found', msg);
        return { success: false, message: msg };
      }

      // 2. Strict verification: Confirm entered email matches the institutional email on record
      if (facultyById.email.trim().toLowerCase() !== cleanEmail) {
        const msg = `Email "${cleanEmail}" does not match the institutional email on record for Faculty ID "${cleanId}".`;
        addToast('error', 'Email Mismatch', msg);
        return { success: false, message: msg };
      }

      // 3. Prevent duplicate account registration
      const alreadyRegistered = userCredentials.find(
        (c) =>
          c.role === 'incharge' &&
          (c.email.trim().toLowerCase() === cleanEmail || c.identifier.toUpperCase() === cleanId) &&
          c.isRegistered
      );
      if (alreadyRegistered) {
        const msg = `Faculty account for "${cleanEmail}" (ID: ${cleanId}) is already registered and activated. Please sign in instead.`;
        addToast('warning', 'Already Registered', msg);
        return { success: false, message: msg };
      }

      // 4. Securely hash password on the server / crypto utility
      const hashedPassword = await hashPasswordSecurely(cleanPassword);

      const newCred: UserCredential = {
        email: cleanEmail,
        role: 'incharge',
        password: hashedPassword,
        isRegistered: true,
        registeredAt: new Date().toISOString(),
        identifier: facultyById.facultyId,
      };

      setUserCredentials((prev) => [
        ...prev.filter((c) => !(c.email.toLowerCase() === cleanEmail && c.role === 'incharge')),
        newCred,
      ]);

      const session: UserSession = {
        role: 'incharge',
        email: cleanEmail,
        name: facultyById.name,
        id: facultyById.id,
        department: facultyById.department,
        facultyId: facultyById.facultyId,
      };

      setCurrentUser(session);
      setCurrentRole('incharge');
      setCurrentInChargeId(facultyById.id);
      localStorage.setItem(`${STORAGE_KEY}_user_session`, JSON.stringify(session));

      logAudit(
        'AUTH',
        'FACULTY_ACCOUNT_REGISTERED',
        `Faculty In-Charge ${facultyById.name} (${facultyById.facultyId}) registered password and activated account for ${cleanEmail}.`,
        'info'
      );

      addToast('success', 'Faculty Account Activated', `Welcome, ${facultyById.name}. Assigned venues loaded.`);
      return { success: true, message: 'Faculty account registered and activated successfully!' };
    }

    if (role === 'admin') {
      // Validate master security key for admin registration
      if (cleanId !== 'SESMS-COE-2026' && cleanId !== 'COE-ADMIN') {
        const msg = 'Invalid COE Authorization Passcode. Admin registration requires the official COE Master Passcode (SESMS-COE-2026).';
        addToast('error', 'COE Authorization Failed', msg);
        return { success: false, message: msg };
      }

      const alreadyRegistered = userCredentials.find(
        (c) => c.role === 'admin' && c.email.toLowerCase() === cleanEmail && c.isRegistered
      );
      if (alreadyRegistered) {
        const msg = `Admin account for "${cleanEmail}" is already registered. Please sign in instead.`;
        addToast('warning', 'Already Registered', msg);
        return { success: false, message: msg };
      }

      const hashedPassword = await hashPasswordSecurely(cleanPassword);

      const newCred: UserCredential = {
        email: cleanEmail,
        role: 'admin',
        password: hashedPassword,
        isRegistered: true,
        registeredAt: new Date().toISOString(),
        identifier: 'COE-ADMIN',
      };

      setUserCredentials((prev) => [
        ...prev.filter((c) => !(c.email.toLowerCase() === cleanEmail && c.role === 'admin')),
        newCred,
      ]);

      // Admin won't have department
      const session: UserSession = {
        role: 'admin',
        email: cleanEmail,
        name: name ? name.trim() : 'Controller of Examinations',
        id: `admin-${Date.now()}`,
      };

      setCurrentUser(session);
      setCurrentRole('admin');
      localStorage.setItem(`${STORAGE_KEY}_user_session`, JSON.stringify(session));

      logAudit(
        'AUTH',
        'ADMIN_ACCOUNT_REGISTERED',
        `COE Administrator registered password and activated account for ${cleanEmail}.`,
        'info'
      );

      addToast('success', 'COE Admin Activated', 'Welcome, Controller of Examinations. Administrative console unlocked.');
      return { success: true, message: 'Admin account registered successfully!' };
    }

    return { success: false, message: 'Invalid role for registration.' };
  };

  const logout = () => {
    if (currentUser) {
      logAudit('AUTH', 'USER_LOGOUT', `${currentUser.name} (${currentUser.role}) logged out of system.`, 'info');
    }
    setCurrentUser(null);
    localStorage.removeItem(`${STORAGE_KEY}_user_session`);
    addToast('info', 'Signed Out', 'You have been securely signed out.');
  };

  const resetToSampleData = () => {
    setExaminations(initialExaminations);
    setRooms(initialRooms);
    setStudents(initialStudents);
    setInCharges(initialInCharges);
    setDutyAssignments(initialDutyAssignments);
    setSeatAllocations(initialAllocations);
    setAttendanceRecords(initialAttendanceRecords);
    setAttendanceSubmissions(initialAttendanceSubmissions);
    setAuditLogs(initialAuditLogs);
    setUserCredentials(initialUserCredentials);
    setCurrentUser(null);

    localStorage.removeItem(`${STORAGE_KEY}_exams`);
    localStorage.removeItem(`${STORAGE_KEY}_rooms`);
    localStorage.removeItem(`${STORAGE_KEY}_students`);
    localStorage.removeItem(`${STORAGE_KEY}_incharges`);
    localStorage.removeItem(`${STORAGE_KEY}_duties`);
    localStorage.removeItem(`${STORAGE_KEY}_allocations`);
    localStorage.removeItem(`${STORAGE_KEY}_attendance`);
    localStorage.removeItem(`${STORAGE_KEY}_submissions`);
    localStorage.removeItem(`${STORAGE_KEY}_audit`);
    localStorage.removeItem(`${STORAGE_KEY}_credentials`);
    localStorage.removeItem(`${STORAGE_KEY}_user_session`);

    addToast('info', 'System Reset', 'All benchmark mock data and credentials restored to defaults. Please sign in.');
  };

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      currentUser,
      userCredentials,
      login,
      registerAccount,
      logout,
      currentRole,
      setCurrentRole,
      currentInChargeId,
      setCurrentInChargeId,
      currentStudentId,
      setCurrentStudentId,
      adminUsername,
      examinations,
      rooms,
      students,
      inCharges,
      dutyAssignments,
      seatAllocations,
      attendanceRecords,
      attendanceSubmissions,
      auditLogs,
      toasts,
      addToast,
      removeToast,
      logAudit,
      addExamination,
      updateExamination,
      deleteExamination,
      toggleExamPublish,
      addRoom,
      updateRoom,
      deleteRoom,
      toggleRoomAvailability,
      addStudent,
      updateStudent,
      removeStudent,
      assignDuty,
      removeDuty,
      autoAllocateSeats,
      randomizeRoomSeats,
      manualAllocateSeat,
      clearAllocations,
      markAttendance,
      batchMarkAttendance,
      submitAttendance,
      reopenAttendance,
      resetToSampleData,
    }),
    [
      isAuthenticated,
      currentUser,
      userCredentials,
      currentRole,
      currentInChargeId,
      currentStudentId,
      examinations,
      rooms,
      students,
      inCharges,
      dutyAssignments,
      seatAllocations,
      attendanceRecords,
      attendanceSubmissions,
      auditLogs,
      toasts,
    ]
  );

  return <ExamContext.Provider value={contextValue}>{children}</ExamContext.Provider>;
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};

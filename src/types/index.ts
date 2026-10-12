export type Role = 'admin' | 'incharge' | 'student';

export type Department =
  | 'Computer Science & Engineering'
  | 'Information technology'
  | 'ECE'
  | 'EEE'
  | 'AIML/AIDS'
  | 'Mechanical';

export const AVAILABLE_DEPARTMENTS: Department[] = [
  'Computer Science & Engineering',
  'Information technology',
  'ECE',
  'EEE',
  'AIML/AIDS',
  'Mechanical',
];

export type SessionType = 'FN' | 'AN'; // Forenoon or Afternoon

export interface Examination {
  id: string;
  name: string;
  courseCode: string;
  date: string; // YYYY-MM-DD
  session: SessionType; // FN: 09:30 AM - 12:30 PM, AN: 02:00 PM - 05:00 PM
  department: Department;
  year: number; // 1, 2, 3, 4
  section: string; // 'A', 'B', 'All'
  isPublished: boolean; // Only published exams show seating to students
  createdAt: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  block: string;
  capacity: number;
  rows: number;
  cols: number;
  isAvailable: boolean;
  notes?: string;
}

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  department: Department;
  year: number;
  semester: number;
  section: string;
  email: string;
  registeredCourses: string[]; // course codes e.g. ['CS301', 'EC204']
}

export interface SeatAllocation {
  id: string;
  examId: string;
  roomId: string;
  studentId: string;
  deskNumber: number; // 1 to Room Capacity
  seatCoordinate: string; // e.g. "R1-C2"
  allocatedAt: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'unmarked';

export interface AttendanceRecord {
  id: string;
  allocationId: string;
  examId: string;
  roomId: string;
  studentId: string;
  status: AttendanceStatus;
  markedAt?: string;
  markedBy?: string; // incharge faculty ID/name
  remarks?: string;
}

export interface AttendanceSubmission {
  id: string;
  examId: string;
  roomId: string;
  inchargeId: string;
  isFinalSubmitted: boolean;
  submittedAt?: string;
  totalAllocated: number;
  presentCount: number;
  absentCount: number;
}

export interface InCharge {
  id: string;
  facultyId: string;
  name: string;
  department: Department;
  email: string;
  phone: string;
}

export interface DutyAssignment {
  id: string;
  inchargeId: string;
  examId: string;
  roomId: string;
  assignedAt: string;
}

export type AuditCategory =
  | 'ROOM'
  | 'ALLOCATION'
  | 'DUTY'
  | 'EXAM'
  | 'STUDENT'
  | 'ATTENDANCE'
  | 'AUTH';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string; // Username or Name
  role: Role;
  category: AuditCategory;
  action: string;
  details: string;
  targetEntityId?: string;
  severity: AuditSeverity;
}

export interface UserCredential {
  email: string;
  role: Role;
  password: string;
  isRegistered: boolean;
  registeredAt: string;
  identifier: string; // Roll number for student, Faculty ID for in-charge, or COE-ADMIN
}

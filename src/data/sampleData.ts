import {
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
  UserCredential,
} from '../types';

export const initialExaminations: Examination[] = [
  {
    id: 'exam-1',
    name: 'Data Structures & Algorithms',
    courseCode: 'CS301',
    date: '2026-10-15',
    session: 'FN',
    department: 'Computer Science & Engineering',
    year: 3,
    section: 'A',
    isPublished: true,
    createdAt: '2026-10-01T09:00:00.000Z',
  },
  {
    id: 'exam-2',
    name: 'Digital Signal Processing',
    courseCode: 'EC204',
    date: '2026-10-16',
    session: 'AN',
    department: 'ECE',
    year: 2,
    section: 'All',
    isPublished: true,
    createdAt: '2026-10-02T10:15:00.000Z',
  },
  {
    id: 'exam-3',
    name: 'Thermodynamics & Heat Transfer',
    courseCode: 'ME302',
    date: '2026-10-18',
    session: 'FN',
    department: 'Mechanical',
    year: 3,
    section: 'All',
    isPublished: false, // Unpublished demo exam
    createdAt: '2026-10-05T14:30:00.000Z',
  },
];

export const initialRooms: Room[] = [
  {
    id: 'room-1',
    roomNumber: '101',
    block: 'Ramanujan Block (North Wing)',
    capacity: 20,
    rows: 4,
    cols: 5,
    isAvailable: true,
    notes: 'Ground floor, CCTV monitored, equipped with clock',
  },
  {
    id: 'room-2',
    roomNumber: '102',
    block: 'Ramanujan Block (North Wing)',
    capacity: 15,
    rows: 3,
    cols: 5,
    isAvailable: true,
    notes: 'Well ventilated, wheelchair accessible',
  },
  {
    id: 'room-3',
    roomNumber: '201',
    block: 'Aryabhata Block (East Wing)',
    capacity: 25,
    rows: 5,
    cols: 5,
    isAvailable: true,
    notes: 'Second floor, air-conditioned hall',
  },
  {
    id: 'room-4',
    roomNumber: '202',
    block: 'Aryabhata Block (East Wing)',
    capacity: 12,
    rows: 3,
    cols: 4,
    isAvailable: true,
    notes: 'Sound-proofed smart tutorial room',
  },
  {
    id: 'room-5',
    roomNumber: 'Audit-A',
    block: 'Central Academic Block',
    capacity: 40,
    rows: 5,
    cols: 8,
    isAvailable: true,
    notes: 'Tiered auditorium seating, high-density hall',
  },
];

export const initialInCharges: InCharge[] = [
  {
    id: 'inc-1',
    facultyId: 'FAC-1001',
    name: 'Dr. Anand Ramanathan',
    department: 'Computer Science & Engineering',
    email: 'anand.ramanathan@univ.edu',
    phone: '+91 98450 12345',
  },
  {
    id: 'inc-2',
    facultyId: 'FAC-1002',
    name: 'Prof. Sunita Deshmukh',
    department: 'ECE',
    email: 'sunita.deshmukh@univ.edu',
    phone: '+91 98765 43210',
  },
  // Development-Only Test Faculty Record for testing registration & activation flow
  {
    id: 'inc-3',
    facultyId: 'FAC-1003',
    name: 'Dr. R. K. Suresh (Dev Test Faculty)',
    department: 'Information technology',
    email: 'faculty@test.example',
    phone: '+91 98765 10003',
  },
];

export const initialDutyAssignments: DutyAssignment[] = [
  {
    id: 'duty-1',
    inchargeId: 'inc-1',
    examId: 'exam-1',
    roomId: 'room-1',
    assignedAt: '2026-10-06T10:00:00.000Z',
  },
  {
    id: 'duty-2',
    inchargeId: 'inc-2',
    examId: 'exam-1',
    roomId: 'room-2',
    assignedAt: '2026-10-06T10:05:00.000Z',
  },
  {
    id: 'duty-3',
    inchargeId: 'inc-1',
    examId: 'exam-2',
    roomId: 'room-3',
    assignedAt: '2026-10-07T11:00:00.000Z',
  },
  {
    id: 'duty-4',
    inchargeId: 'inc-3',
    examId: 'exam-1',
    roomId: 'room-3',
    assignedAt: '2026-10-07T11:30:00.000Z',
  },
];

export const initialStudents: Student[] = [
  // Computer Science & Engineering (14 students)
  { id: 'stu-1', rollNo: '24CS101', name: 'Aarav Sharma', department: 'Computer Science & Engineering', year: 3, semester: 5, section: 'A', email: 'aarav.cs101@univ.edu', registeredCourses: ['CS301'] },
  { id: 'stu-2', rollNo: '24CS102', name: 'Aditi Patel', department: 'Computer Science & Engineering', year: 3, semester: 5, section: 'A', email: 'aditi.cs102@univ.edu', registeredCourses: ['CS301'] },
  { id: 'stu-3', rollNo: '24CS103', name: 'Ananya Iyer', department: 'Computer Science & Engineering', year: 3, semester: 5, section: 'A', email: 'ananya.cs103@univ.edu', registeredCourses: ['CS301'] },
  { id: 'stu-4', rollNo: '24CS104', name: 'Arjun Nair', department: 'Computer Science & Engineering', year: 3, semester: 5, section: 'A', email: 'arjun.cs104@univ.edu', registeredCourses: ['CS301'] },
  { id: 'stu-5', rollNo: '24CS105', name: 'Bhavya Rao', department: 'Computer Science & Engineering', year: 3, semester: 5, section: 'A', email: 'bhavya.cs105@univ.edu', registeredCourses: ['CS301'] },
  { id: 'stu-6', rollNo: '24CS106', name: 'Chetan Kumar', department: 'Computer Science & Engineering', year: 3, semester: 5, section: 'A', email: 'chetan.cs106@univ.edu', registeredCourses: ['CS301'] },
  { id: 'stu-7', rollNo: '24CS107', name: 'Divya Reddy', department: 'Computer Science & Engineering', year: 3, semester: 5, section: 'A', email: 'divya.cs107@univ.edu', registeredCourses: ['CS301'] },
  { id: 'stu-8', rollNo: '24CS108', name: 'Farhan Akhtar', department: 'Computer Science & Engineering', year: 3, semester: 5, section: 'A', email: 'farhan.cs108@univ.edu', registeredCourses: ['CS301'] },
  { id: 'stu-9', rollNo: '24CS109', name: 'Gayatri Pillai', department: 'Computer Science & Engineering', year: 3, semester: 5, section: 'A', email: 'gayatri.cs109@univ.edu', registeredCourses: ['CS301'] },
  { id: 'stu-10', rollNo: '24CS110', name: 'Harsh Vardhan', department: 'Computer Science & Engineering', year: 3, semester: 5, section: 'A', email: 'harsh.cs110@univ.edu', registeredCourses: ['CS301'] },
  { id: 'stu-11', rollNo: '24CS111', name: 'Ishaan Gupta', department: 'Computer Science & Engineering', year: 3, semester: 5, section: 'A', email: 'ishaan.cs111@univ.edu', registeredCourses: ['CS301'] },
  { id: 'stu-12', rollNo: '24CS112', name: 'Jaya Krishna', department: 'Computer Science & Engineering', year: 3, semester: 5, section: 'A', email: 'jaya.cs112@univ.edu', registeredCourses: ['CS301'] },
  { id: 'stu-13', rollNo: '24CS113', name: 'Karthik Raja', department: 'Computer Science & Engineering', year: 3, semester: 5, section: 'A', email: 'karthik.cs113@univ.edu', registeredCourses: ['CS301'] },
  { id: 'stu-14', rollNo: '24CS114', name: 'Lavanya Sundar', department: 'Computer Science & Engineering', year: 3, semester: 5, section: 'A', email: 'lavanya.cs114@univ.edu', registeredCourses: ['CS301'] },

  // ECE (8 students)
  { id: 'stu-15', rollNo: '24EC201', name: 'Manish Verma', department: 'ECE', year: 2, semester: 3, section: 'A', email: 'manish.ec201@univ.edu', registeredCourses: ['EC204', 'CS301'] },
  { id: 'stu-16', rollNo: '24EC202', name: 'Neha Chawla', department: 'ECE', year: 2, semester: 3, section: 'A', email: 'neha.ec202@univ.edu', registeredCourses: ['EC204', 'CS301'] },
  { id: 'stu-17', rollNo: '24EC203', name: 'Omkar Shinde', department: 'ECE', year: 2, semester: 3, section: 'A', email: 'omkar.ec203@univ.edu', registeredCourses: ['EC204', 'CS301'] },
  { id: 'stu-18', rollNo: '24EC204', name: 'Pooja Hegde', department: 'ECE', year: 2, semester: 3, section: 'A', email: 'pooja.ec204@univ.edu', registeredCourses: ['EC204', 'CS301'] },
  { id: 'stu-19', rollNo: '24EC205', name: 'Pranav Joshi', department: 'ECE', year: 2, semester: 3, section: 'B', email: 'pranav.ec205@univ.edu', registeredCourses: ['EC204', 'CS301'] },
  { id: 'stu-20', rollNo: '24EC206', name: 'Ritu Sen', department: 'ECE', year: 2, semester: 3, section: 'B', email: 'ritu.ec206@univ.edu', registeredCourses: ['EC204', 'CS301'] },
  { id: 'stu-21', rollNo: '24EC207', name: 'Rohit Khandelwal', department: 'ECE', year: 2, semester: 3, section: 'B', email: 'rohit.ec207@univ.edu', registeredCourses: ['EC204', 'CS301'] },
  { id: 'stu-22', rollNo: '24EC208', name: 'Sanjana Singh', department: 'ECE', year: 2, semester: 3, section: 'B', email: 'sanjana.ec208@univ.edu', registeredCourses: ['EC204', 'CS301'] },

  // Information Technology (3 students)
  { id: 'stu-23', rollNo: '24IT301', name: 'Siddharth Menon', department: 'Information technology', year: 3, semester: 5, section: 'A', email: 'siddharth.it301@univ.edu', registeredCourses: ['CS301'] },
  { id: 'stu-24', rollNo: '24IT302', name: 'Tanvi Agarwal', department: 'Information technology', year: 3, semester: 5, section: 'A', email: 'tanvi.it302@univ.edu', registeredCourses: ['CS301'] },
  { id: 'stu-25', rollNo: '24IT303', name: 'Utkarsh Trivedi', department: 'Information technology', year: 3, semester: 5, section: 'A', email: 'utkarsh.it303@univ.edu', registeredCourses: ['CS301'] },

  // EEE (2 students)
  { id: 'stu-26', rollNo: '24EE401', name: 'Vaibhav Deshpande', department: 'EEE', year: 2, semester: 3, section: 'A', email: 'vaibhav.ee401@univ.edu', registeredCourses: ['EC204'] },
  { id: 'stu-27', rollNo: '24EE402', name: 'Varun Swaminathan', department: 'EEE', year: 2, semester: 3, section: 'A', email: 'varun.ee402@univ.edu', registeredCourses: ['EC204'] },

  // AIML/AIDS (2 students)
  { id: 'stu-28', rollNo: '24AI501', name: 'Yashaswini Bhat', department: 'AIML/AIDS', year: 3, semester: 5, section: 'A', email: 'yashaswini.ai501@univ.edu', registeredCourses: ['CS301'] },
  { id: 'stu-29', rollNo: '24AI502', name: 'Zeeshan Ali', department: 'AIML/AIDS', year: 3, semester: 5, section: 'A', email: 'zeeshan.ai502@univ.edu', registeredCourses: ['CS301'] },

  // Mechanical (4 students)
  { id: 'stu-30', rollNo: '24ME101', name: 'Rahul Verma', department: 'Mechanical', year: 3, semester: 5, section: 'A', email: 'rahul.me101@univ.edu', registeredCourses: ['ME302'] },
  { id: 'stu-31', rollNo: '24ME102', name: 'Sneha Kulkarni', department: 'Mechanical', year: 3, semester: 5, section: 'A', email: 'sneha.me102@univ.edu', registeredCourses: ['ME302'] },
  { id: 'stu-32', rollNo: '24ME103', name: 'Vivek Sharma', department: 'Mechanical', year: 3, semester: 5, section: 'A', email: 'vivek.me103@univ.edu', registeredCourses: ['ME302'] },
  { id: 'stu-33', rollNo: '24ME104', name: 'Pooja Nair', department: 'Mechanical', year: 3, semester: 5, section: 'A', email: 'pooja.me104@univ.edu', registeredCourses: ['ME302'] },
];

// Seed Allocations for CS301:
// Room 1 (capacity 20): allocated 14 students (stu-1 to stu-14)
// Room 2 (capacity 15): allocated 12 students (stu-15 to stu-25, stu-28)
export const initialAllocations: SeatAllocation[] = [
  // Room 1 (14 seats)
  ...Array.from({ length: 14 }).map((_, i) => ({
    id: `alloc-1-${i + 1}`,
    examId: 'exam-1',
    roomId: 'room-1',
    studentId: initialStudents[i].id,
    deskNumber: i + 1,
    seatCoordinate: `R${Math.floor(i / 5) + 1}-C${(i % 5) + 1}`,
    allocatedAt: '2026-10-05T12:00:00.000Z',
  })),

  // Room 2 (12 seats)
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: `alloc-2-${i + 1}`,
    examId: 'exam-1',
    roomId: 'room-2',
    studentId: initialStudents[14 + i].id,
    deskNumber: i + 1,
    seatCoordinate: `R${Math.floor(i / 5) + 1}-C${(i % 5) + 1}`,
    allocatedAt: '2026-10-05T12:05:00.000Z',
  })),
];

// Attendance Records:
// Room 1: Fully marked (12 Present, 2 Absent) -> Finalized Submission
// Room 2: Incomplete draft (8 Present, 1 Absent, 3 Unmarked) -> Demonstrates submission blocker
export const initialAttendanceRecords: AttendanceRecord[] = [
  // Room 1 Records (all 14 marked)
  ...initialAllocations
    .filter((a) => a.roomId === 'room-1')
    .map((a, idx) => ({
      id: `att-${a.id}`,
      allocationId: a.id,
      examId: a.examId,
      roomId: a.roomId,
      studentId: a.studentId,
      status: (idx === 4 || idx === 11 ? 'absent' : 'present') as AttendanceStatus,
      markedAt: '2026-10-15T09:45:00.000Z',
      markedBy: 'Dr. Anand Ramanathan',
      remarks: idx === 4 ? 'Reported sick' : idx === 11 ? 'Unexcused absentee' : undefined,
    })),

  // Room 2 Records (12 seats: 8 present, 1 absent, 3 unmarked)
  ...initialAllocations
    .filter((a) => a.roomId === 'room-2')
    .map((a, idx) => {
      let status: AttendanceStatus = 'unmarked';
      if (idx < 8) status = 'present';
      else if (idx === 8) status = 'absent';
      return {
        id: `att-${a.id}`,
        allocationId: a.id,
        examId: a.examId,
        roomId: a.roomId,
        studentId: a.studentId,
        status,
        markedAt: status !== 'unmarked' ? '2026-10-15T09:50:00.000Z' : undefined,
        markedBy: status !== 'unmarked' ? 'Prof. Sunita Deshmukh' : undefined,
        remarks: status === 'absent' ? 'Candidate not reported' : undefined,
      };
    }),
];

export const initialAttendanceSubmissions: AttendanceSubmission[] = [
  {
    id: 'sub-1',
    examId: 'exam-1',
    roomId: 'room-1',
    inchargeId: 'inc-1',
    isFinalSubmitted: true,
    submittedAt: '2026-10-15T10:15:00.000Z',
    totalAllocated: 14,
    presentCount: 12,
    absentCount: 2,
  },
  {
    id: 'sub-2',
    examId: 'exam-1',
    roomId: 'room-2',
    inchargeId: 'inc-2',
    isFinalSubmitted: false, // Incomplete draft!
    totalAllocated: 12,
    presentCount: 8,
    absentCount: 1,
  },
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    timestamp: '2026-10-01T09:00:00.000Z',
    actor: 'admin (COE Office)',
    role: 'admin',
    category: 'EXAM',
    action: 'CREATE_EXAMINATION',
    details: 'Scheduled examination CS301 (Data Structures & Algorithms) for 2026-10-15 Forenoon.',
    targetEntityId: 'exam-1',
    severity: 'info',
  },
  {
    id: 'audit-2',
    timestamp: '2026-10-02T10:30:00.000Z',
    actor: 'admin (COE Office)',
    role: 'admin',
    category: 'ROOM',
    action: 'REGISTER_ROOM',
    details: 'Configured examination venue Room 101 in Ramanujan Block with capacity 20 desks (4x5 matrix).',
    targetEntityId: 'room-1',
    severity: 'info',
  },
  {
    id: 'audit-3',
    timestamp: '2026-10-04T11:15:00.000Z',
    actor: 'admin (COE Office)',
    role: 'admin',
    category: 'STUDENT',
    action: 'STUDENT_ENROLLED',
    details: 'Enrolled candidates 24ME101 through 24ME104 under Mechanical Department.',
    severity: 'info',
  },
  {
    id: 'audit-4',
    timestamp: '2026-10-05T12:05:00.000Z',
    actor: 'admin (COE Office)',
    role: 'admin',
    category: 'ALLOCATION',
    action: 'AUTO_ALLOCATE_SEATS',
    details: 'Executed anti-cheating alternating seating allocation for CS301 across Room 101 (14 seats) and Room 102 (12 seats). Total 26 students allocated.',
    targetEntityId: 'exam-1',
    severity: 'info',
  },
  {
    id: 'audit-5',
    timestamp: '2026-10-06T10:05:00.000Z',
    actor: 'admin (COE Office)',
    role: 'admin',
    category: 'DUTY',
    action: 'ASSIGN_INVIGILATOR',
    details: 'Assigned Dr. Anand Ramanathan (FAC-1001) to Room 101 and Prof. Sunita Deshmukh (FAC-1002) to Room 102 for exam CS301.',
    targetEntityId: 'exam-1',
    severity: 'info',
  },
  {
    id: 'audit-6',
    timestamp: '2026-10-07T08:00:00.000Z',
    actor: 'admin (COE Office)',
    role: 'admin',
    category: 'EXAM',
    action: 'PUBLISH_ALLOCATION',
    details: 'Published hall seating plan for CS301. Seating details now live on candidate portals.',
    targetEntityId: 'exam-1',
    severity: 'info',
  },
  {
    id: 'audit-7',
    timestamp: '2026-10-15T10:15:00.000Z',
    actor: 'Dr. Anand Ramanathan',
    role: 'incharge',
    category: 'ATTENDANCE',
    action: 'SUBMIT_ATTENDANCE',
    details: 'Finalized and submitted Room 101 attendance register: 12 Present, 2 Absent (Rolls: 24CS105, 24CS112).',
    targetEntityId: 'sub-1',
    severity: 'info',
  },
];

export const initialUserCredentials: UserCredential[] = [
  // Admin Credentials
  {
    email: 'admin@univ.edu',
    role: 'admin',
    password: 'Admin@2026',
    isRegistered: true,
    registeredAt: '2026-09-01T08:00:00.000Z',
    identifier: 'COE-ADMIN',
  },

  // Faculty In-Charges
  {
    email: 'anand.ramanathan@univ.edu',
    role: 'incharge',
    password: 'Faculty@1001',
    isRegistered: true,
    registeredAt: '2026-09-10T09:00:00.000Z',
    identifier: 'FAC-1001',
  },
  {
    email: 'sunita.deshmukh@univ.edu',
    role: 'incharge',
    password: 'Faculty@1002',
    isRegistered: true,
    registeredAt: '2026-09-10T09:15:00.000Z',
    identifier: 'FAC-1002',
  },

  // Students - Pre-activated Sample Accounts
  {
    email: 'rahul.me101@univ.edu',
    role: 'student',
    password: 'Student@101',
    isRegistered: true,
    registeredAt: '2026-09-15T10:00:00.000Z',
    identifier: '24ME101',
  },
  {
    email: 'aarav.cs101@univ.edu',
    role: 'student',
    password: 'Student@101',
    isRegistered: true,
    registeredAt: '2026-09-15T10:10:00.000Z',
    identifier: '24CS101',
  },
  {
    email: 'aditi.cs102@univ.edu',
    role: 'student',
    password: 'Student@102',
    isRegistered: true,
    registeredAt: '2026-09-15T10:15:00.000Z',
    identifier: '24CS102',
  },
  {
    email: 'manish.ec201@univ.edu',
    role: 'student',
    password: 'Student@201',
    isRegistered: true,
    registeredAt: '2026-09-15T10:20:00.000Z',
    identifier: '24EC201',
  },
];


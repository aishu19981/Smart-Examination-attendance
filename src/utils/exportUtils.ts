import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Examination,
  Room,
  Student,
  SeatAllocation,
  AttendanceRecord,
  AuditLog,
} from '../types';

export function exportToExcel(data: Record<string, unknown>[], fileName: string, sheetName = 'Sheet1') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

// 1. Export Attendance Sheet to Excel
export function exportAttendanceSheetToExcel(
  exam: Examination,
  room: Room,
  records: {
    deskNumber: number;
    seatCoordinate: string;
    student: Student;
    status: string;
    remarks?: string;
  }[]
) {
  const formattedData = records.map((r) => ({
    'Desk No': r.deskNumber,
    'Seat Coordinate': r.seatCoordinate,
    'Roll Number': r.student.rollNo,
    'Candidate Name': r.student.name,
    'Department': r.student.department,
    'Year / Sem': `Yr ${r.student.year} / Sem ${r.student.semester}`,
    'Course Code': exam.courseCode,
    'Attendance Status': r.status.toUpperCase(),
    'Remarks': r.remarks || '',
    'Candidate Signature': '',
  }));

  const fileName = `Attendance_Sheet_${exam.courseCode}_Room_${room.roomNumber}_${exam.date}`;
  exportToExcel(formattedData, fileName, `Room ${room.roomNumber}`);
}

// 2. Export Attendance Sheet to PDF
export function exportAttendanceSheetToPDF(
  exam: Examination,
  room: Room,
  inchargeName: string,
  records: {
    deskNumber: number;
    seatCoordinate: string;
    student: Student;
    status: string;
    remarks?: string;
  }[]
) {
  const doc = new jsPDF('p', 'mm', 'a4');

  // Title Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICE OF THE CONTROLLER OF EXAMINATIONS', 105, 14, { align: 'center' });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Examination Attendance Register & Signature Sheet', 105, 20, { align: 'center' });

  // Metadata Box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.rect(14, 25, 182, 22, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Course:`, 18, 30);
  doc.setFont('helvetica', 'normal');
  doc.text(`${exam.courseCode} - ${exam.name}`, 35, 30);

  doc.setFont('helvetica', 'bold');
  doc.text(`Date & Session:`, 18, 36);
  doc.setFont('helvetica', 'normal');
  doc.text(`${exam.date} | ${exam.session === 'FN' ? 'Forenoon (09:30 AM - 12:30 PM)' : 'Afternoon (02:00 PM - 05:00 PM)'}`, 45, 36);

  doc.setFont('helvetica', 'bold');
  doc.text(`Room / Hall:`, 18, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(`Room ${room.roomNumber} (${room.block})`, 42, 42);

  doc.setFont('helvetica', 'bold');
  doc.text(`Invigilator:`, 120, 30);
  doc.setFont('helvetica', 'normal');
  doc.text(`${inchargeName}`, 142, 30);

  doc.setFont('helvetica', 'bold');
  doc.text(`Total Allocated:`, 120, 36);
  doc.setFont('helvetica', 'normal');
  doc.text(`${records.length} Candidates`, 148, 36);

  // Table Body
  const tableData = records.map((r, i) => [
    (i + 1).toString(),
    `D-${r.deskNumber} (${r.seatCoordinate})`,
    r.student.rollNo,
    r.student.name,
    r.student.department,
    r.status.toUpperCase(),
    r.remarks || '—',
    '', // Signature blank space
  ]);

  autoTable(doc, {
    startY: 51,
    head: [['#', 'Desk/Seat', 'Roll No', 'Candidate Name', 'Department', 'Status', 'Remarks', "Student's Sign"]],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 26 },
      2: { cellWidth: 22, fontStyle: 'bold' },
      3: { cellWidth: 38 },
      4: { cellWidth: 32 },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 20 },
      7: { cellWidth: 18 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        if (data.cell.raw === 'PRESENT') {
          data.cell.styles.textColor = [22, 101, 52];
          data.cell.styles.fontStyle = 'bold';
        } else if (data.cell.raw === 'ABSENT') {
          data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // Footer & Signatures
  // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 16 : 240;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Present Count: __________', 16, finalY);
  doc.text('Absent Count: __________', 60, finalY);
  doc.text('Total Answer Booklets Handed Over: __________', 105, finalY);

  doc.text("Hall Superintendent's Signature", 140, finalY + 18);
  doc.setDrawColor(100, 100, 100);
  doc.line(140, finalY + 14, 190, finalY + 14);

  doc.save(`Attendance_Sheet_${exam.courseCode}_Room_${room.roomNumber}.pdf`);
}

// 3. Export Absentee Statement to Excel & PDF
export function exportAbsenteeStatementToExcel(
  title: string,
  absentees: {
    rollNo: string;
    studentName: string;
    department: string;
    courseCode: string;
    examName: string;
    roomNumber: string;
    deskNumber: number;
    remarks: string;
  }[]
) {
  const data = absentees.map((a, i) => ({
    'S.No': i + 1,
    'Roll Number': a.rollNo,
    'Student Name': a.studentName,
    'Department': a.department,
    'Course Code': a.courseCode,
    'Examination': a.examName,
    'Room Number': a.roomNumber,
    'Desk No': a.deskNumber,
    'Remarks / Reason': a.remarks || 'Absent',
  }));

  exportToExcel(data, title.replace(/\s+/g, '_'), 'Absentee Report');
}

export function exportAbsenteeStatementToPDF(
  title: string,
  subtitle: string,
  absentees: {
    rollNo: string;
    studentName: string;
    department: string;
    courseCode: string;
    roomNumber: string;
    deskNumber: number;
    remarks: string;
  }[]
) {
  const doc = new jsPDF('p', 'mm', 'a4');

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICE OF THE CONTROLLER OF EXAMINATIONS', 105, 14, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(185, 28, 28);
  doc.text(title.toUpperCase(), 105, 21, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, 105, 27, { align: 'center' });

  const tableData = absentees.map((a, i) => [
    (i + 1).toString(),
    a.rollNo,
    a.studentName,
    a.department,
    a.courseCode,
    `Room ${a.roomNumber} (Desk ${a.deskNumber})`,
    a.remarks || 'Absent',
  ]);

  autoTable(doc, {
    startY: 34,
    head: [['#', 'Roll Number', 'Student Name', 'Department', 'Course', 'Room / Seat', 'Remarks']],
    body: tableData.length > 0 ? tableData : [['—', '—', 'Nil Absentees Recorded', '—', '—', '—', '—']],
    theme: 'striped',
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: [185, 28, 28], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 25, fontStyle: 'bold' },
      2: { cellWidth: 42 },
      3: { cellWidth: 38 },
      4: { cellWidth: 20 },
      5: { cellWidth: 30 },
      6: { cellWidth: 22 },
    },
  });

  // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 230;
  doc.setFontSize(9);
  doc.text(`Total Absentees: ${absentees.length}`, 16, finalY);
  doc.text('Verified by Hall Superintendent / In-Charge: ______________________', 16, finalY + 10);
  doc.text('Controller of Examinations (Sign): ______________________', 110, finalY + 10);

  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
}

// 4. Export Student Hall Ticket (Admit Card) to PDF
export function exportStudentHallTicketToPDF(
  student: Student,
  schedules: {
    exam: Examination;
    room?: Room;
    allocation?: SeatAllocation;
  }[]
) {
  const doc = new jsPDF('p', 'mm', 'a4');

  // Institution Banner
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(30, 41, 59);
  doc.rect(14, 12, 182, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INSTITUTE OF HIGHER TECHNOLOGY & SCIENCES', 105, 21, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL CANDIDATE EXAMINATION HALL TICKET / ADMIT CARD', 105, 28, { align: 'center' });

  // Student Profile Card
  doc.setTextColor(30, 41, 59);
  doc.setFillColor(248, 250, 252);
  doc.rect(14, 40, 182, 34, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Candidate Name:', 18, 48);
  doc.setFont('helvetica', 'normal');
  doc.text(student.name, 48, 48);

  doc.setFont('helvetica', 'bold');
  doc.text('Roll Number:', 18, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(student.rollNo, 48, 55);

  doc.setFont('helvetica', 'bold');
  doc.text('Department:', 18, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(student.department, 48, 62);

  doc.setFont('helvetica', 'bold');
  doc.text('Academic Year / Sem:', 18, 69);
  doc.setFont('helvetica', 'normal');
  doc.text(`Year ${student.year} | Semester ${student.semester} | Section ${student.section}`, 55, 69);

  // Photo placeholder box
  doc.setDrawColor(180, 180, 180);
  doc.setFillColor(235, 238, 243);
  doc.rect(155, 43, 35, 28, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('AFFIX PASSPORT', 172.5, 54, { align: 'center' });
  doc.text('PHOTOGRAPH', 172.5, 59, { align: 'center' });
  doc.setTextColor(30, 41, 59);

  // Examination Schedule Table
  const tableData = schedules.map((item, idx) => {
    const isAllocated = !!item.allocation && !!item.room && item.exam.isPublished;
    return [
      (idx + 1).toString(),
      item.exam.courseCode,
      item.exam.name,
      item.exam.date,
      item.exam.session === 'FN' ? '09:30 AM - 12:30 PM (FN)' : '02:00 PM - 05:00 PM (AN)',
      isAllocated ? `Room ${item.room?.roomNumber}` : 'Pending Publication',
      isAllocated ? `Desk ${item.allocation?.deskNumber} (${item.allocation?.seatCoordinate})` : '—',
    ];
  });

  autoTable(doc, {
    startY: 80,
    head: [['#', 'Code', 'Course Title', 'Exam Date', 'Timing Slot', 'Hall / Room', 'Allocated Seat']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 18, fontStyle: 'bold' },
      2: { cellWidth: 50 },
      3: { cellWidth: 22 },
      4: { cellWidth: 38 },
      5: { cellWidth: 22, fontStyle: 'bold' },
      6: { cellWidth: 24, fontStyle: 'bold' },
    },
  });

  // Candidate Instructions
  // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
  const instructionsY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : 160;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('MANDATORY CANDIDATE INSTRUCTIONS:', 16, instructionsY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('1. Candidates must occupy their designated desk at least 15 minutes prior to commencement.', 16, instructionsY + 5);
  doc.text('2. Possession of mobile phones, programmable calculators, or unauthorized materials is strictly prohibited.', 16, instructionsY + 10);
  doc.text('3. Students must produce this physical hall ticket along with their institute identity card to the invigilator.', 16, instructionsY + 15);
  doc.text('4. No candidate shall be permitted to enter the examination hall after 30 minutes of commencement.', 16, instructionsY + 20);

  // Signatures
  doc.text('Candidate Signature', 20, instructionsY + 40);
  doc.line(20, instructionsY + 36, 60, instructionsY + 36);

  doc.text('Controller of Examinations', 140, instructionsY + 40);
  doc.line(140, instructionsY + 36, 185, instructionsY + 36);

  doc.save(`Hall_Ticket_${student.rollNo}.pdf`);
}

// 5. Export Audit Trail to Excel & PDF
export function exportAuditLogsToExcel(logs: AuditLog[]) {
  const data = logs.map((log) => ({
    'Log ID': log.id,
    'Timestamp (UTC)': log.timestamp,
    'Actor': log.actor,
    'Role': log.role.toUpperCase(),
    'Category': log.category,
    'Action': log.action,
    'Severity': log.severity.toUpperCase(),
    'Description': log.details,
    'Entity Reference': log.targetEntityId || '—',
  }));
  exportToExcel(data, `Audit_Trail_${new Date().toISOString().split('T')[0]}`, 'Audit Logs');
}

export function exportAuditLogsToPDF(logs: AuditLog[]) {
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('EXAMINATION SECTION AUDIT TRAIL REGISTER', 148, 14, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleString()} | Total Events: ${logs.length}`, 148, 20, { align: 'center' });

  const tableData = logs.map((l, i) => [
    (i + 1).toString(),
    new Date(l.timestamp).toLocaleString(),
    l.actor,
    l.role.toUpperCase(),
    l.category,
    l.action,
    l.severity.toUpperCase(),
    l.details,
  ]);

  autoTable(doc, {
    startY: 25,
    head: [['#', 'Timestamp', 'Actor / User', 'Role', 'Category', 'Action Code', 'Severity', 'Details']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 35 },
      2: { cellWidth: 32 },
      3: { cellWidth: 16 },
      4: { cellWidth: 24 },
      5: { cellWidth: 36, fontStyle: 'bold' },
      6: { cellWidth: 18, halign: 'center' },
      7: { cellWidth: 100 },
    },
  });

  doc.save(`Audit_Trail_${new Date().toISOString().split('T')[0]}.pdf`);
}

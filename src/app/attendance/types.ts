import type { AttendanceStatus, StaffRole } from "@/generated/prisma";

export type AttendanceStudentStatus = AttendanceStatus | "NONE";

export type AttendanceStudentRow = {
  classId: string;
  className: string;
  classRoom: string | null;
  sessionId: string | null;
  studentId: string;
  studentName: string;
  grade: number;
  status: AttendanceStudentStatus;
};

export type AttendanceTutorRow = {
  classId: string | null;
  className: string | null;
  sessionId: string | null;
  tutorId: string;
  tutorName: string;
  role: StaffRole;
  status: "PRESENT" | "ABSENT";
};

export type AttendanceStaffTutor = {
  id: string;
  name: string;
  role: StaffRole;
};

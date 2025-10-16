import type { AttendanceStatus, StaffRole } from "@/generated/prisma";

export type AttendanceStudentStatus = AttendanceStatus | "NONE";

export type AttendanceStudent = {
  id: string;
  name: string;
  grade: number;
  status: AttendanceStudentStatus;
};

export type AttendanceClassData = {
  id: string;
  name: string;
  startsAt: string | null;
  endsAt: string | null;
  sessionId: string | null;
  tutors: AttendanceTutorSummary[];
  students: AttendanceStudent[];
};

export type AttendanceTutorSummary = {
  id: string;
  name: string;
  role: StaffRole;
};

export type AttendanceStaffTutor = AttendanceTutorSummary;

import type { ClassType, Status, Weekday } from "@/generated/prisma";

export type ClassStudent = {
  id: string;
  name: string;
  grade: number;
};

export type ClassTutor = {
  id: string;
  name: string;
  subjects: string[];
  wageAmount: number;
};

export type ClassDetail = {
  id: string;
  name: string;
  classType: ClassType;
  weekday: Weekday;
  classRoom: string;
  startsAt: string | null;
  endsAt: string | null;
  capacity: number | null;
  status: Status;
  studentUnitFee: number;
  students: ClassStudent[];
  tutors: ClassTutor[];
  createdAt: string;
  updatedAt: string;
};

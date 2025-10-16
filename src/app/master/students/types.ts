import type { Status } from "@/generated/prisma";

export type StudentListRow = {
  id: string;
  name: string;
  grade: number;
  generation: number;
  status: Status;
  report: string | null;
  classCount: number;
  billableCount: number;
  presentCount: number;
  absentCount: number;
  createdAt: string;
  updatedAt: string;
};

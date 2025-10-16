import type { StaffRole, Subject } from "@/generated/prisma";

export type TutorListRow = {
  id: string;
  name: string;
  email: string;
  needsPickup: boolean;
  subjects: Subject[];
  role: StaffRole;
  classCount: number;
  sessionsWorked: number;
  minutesWorked: number;
  opMinutes: number;
  createdAt: string;
  updatedAt: string;
};

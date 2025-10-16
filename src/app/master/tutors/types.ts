import type { Subject } from "@/generated/prisma";

export type TutorListRow = {
  id: string;
  name: string;
  email: string;
  needsPickup: boolean;
  subjects: Subject[];
  classCount: number;
  sessionsWorked: number;
  minutesWorked: number;
  opMinutes: number;
  createdAt: string;
  updatedAt: string;
};

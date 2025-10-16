// app/people/tutors/page.tsx
import prisma from "@/lib/prisma";
import TutorsPageClient from "./TutorsPageClient";
import type { TutorListRow } from "./types";

export default async function TutorsPage() {
  const tutors = await prisma.tutor.findMany({
    orderBy: { createdAt: "desc" },
  });

  const rows: TutorListRow[] = tutors.map((tutor) => ({
    id: tutor.id,
    name: tutor.name,
    email: tutor.email,
    needsPickup: tutor.needsPickup,
    subjects: tutor.subjects,
    classCount: 0,
    sessionsWorked: 0,
    minutesWorked: 0,
    opMinutes: 0,
    createdAt: tutor.createdAt.toISOString(),
    updatedAt: tutor.updatedAt.toISOString(),
  }));

  return <TutorsPageClient initialRows={rows} />;
}

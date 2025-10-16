// app/people/students/page.tsx
import prisma from "@/lib/prisma";
import StudentsPageClient from "./StudentsPageClient";
import type { StudentListRow } from "./types";

export default async function StudentsPage() {
  const students = await prisma.student.findMany({
    orderBy: { createdAt: "desc" },
  });

  const rows: StudentListRow[] = students.map((student) => ({
    id: student.id,
    name: student.name,
    grade: student.grade,
    generation: student.generation,
    status: student.status,
    report: student.report ?? null,
    classCount: 0,
    billableCount: 0,
    presentCount: 0,
    absentCount: 0,
    createdAt: student.createdAt.toISOString(),
    updatedAt: student.updatedAt.toISOString(),
  }));

  return <StudentsPageClient initialRows={rows} />;
}

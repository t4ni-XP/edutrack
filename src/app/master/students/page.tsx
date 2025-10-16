// app/people/students/page.tsx
import prisma from "@/lib/prisma";
import StudentsPageClient from "./StudentsPageClient";
import type { StudentListRow } from "./types";

export default async function StudentsPage() {
  const students = await prisma.student.findMany({
    select: {
      id: true,
      name: true,
      grade: true,
      generation: true,
      status: true,
      report: true,
      enrollments: {
        select: {
          classId: true,
          Attendance: {
            select: { status: true },
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedStudents: StudentListRow[] = students.map((student) => {
    const classCount = student.enrollments.length;
    const presentCount = student.enrollments.reduce((count, enrollment) => {
      return count + enrollment.Attendance.filter((att) => att.status === "PRESENT").length;
    }, 0);
    const absentCount = student.enrollments.reduce((count, enrollment) => {
      return count + enrollment.Attendance.filter((att) => att.status === "ABSENT").length;
    }, 0);
    const billableCount = presentCount + absentCount;

    return {
      id: student.id,
      name: student.name,
      grade: student.grade,
      generation: student.generation,
      status: student.status,
      report: student.report ?? null,
      classCount,
      billableCount,
      presentCount,
      absentCount,
      createdAt: student.createdAt.toISOString(),
      updatedAt: student.updatedAt.toISOString(),
    };
  });

  return <StudentsPageClient initialRows={formattedStudents} />;
}

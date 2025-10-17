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
    // 集計用のオブジェクトを用意
    const initialStats = {
      presentCount: 0,
      absentCount: 0,
    };

    // 一度のループで出席と欠席の両方をカウントする
    const stats = student.enrollments.reduce((acc, enrollment) => {
      for (const attendance of enrollment.Attendance) {
        if (attendance.status === "PRESENT") {
          acc.presentCount++;
        } else if (attendance.status === "ABSENT") {
          acc.absentCount++;
        }
      }
      return acc;
    }, initialStats);

    const billableCount = stats.presentCount + stats.absentCount;

    // enrollmentsを除いたstudentの情報を取得
    const { enrollments, ...studentData } = student;

    return {
      ...studentData,
      classCount: enrollments.length,
      billableCount,
      presentCount: stats.presentCount,
      absentCount: stats.absentCount,
      report: student.report ?? null,
      createdAt: student.createdAt.toISOString(),
      updatedAt: student.updatedAt.toISOString(),
    };
  });

  return <StudentsPageClient initialRows={formattedStudents} />;
}

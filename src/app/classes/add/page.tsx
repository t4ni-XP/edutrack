import { ClassType, Weekday } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import ClassCreateClient from "./ClassCreateClient";

export default async function ClassCreatePage() {
  const [students, tutors] = await Promise.all([
    prisma.student.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, grade: true },
    }),
    prisma.tutor.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, subjects: true },
    }),
  ]);

  const studentOptions = students.map((student) => ({
    id: student.id,
    name: student.name,
    grade: student.grade,
  }));

  const tutorOptions = tutors.map((tutor) => ({
    id: tutor.id,
    name: tutor.name,
    subjects: tutor.subjects,
  }));

  return (
    <ClassCreateClient
      students={studentOptions}
      tutors={tutorOptions}
      classTypes={Object.values(ClassType)}
      weekdays={Object.values(Weekday)}
    />
  );
}

import Header from "../_components/ui/Header";
import { Box } from "@mui/material";
import prisma from "@/lib/prisma";
import { ClassType, Weekday } from "@/generated/prisma";
import { serializeClass } from "@/lib/class-utils";
import ClassesPageClient from "./ClassesPageClient";
import type { ClassDetail } from "./types";

export default async function ClassesPage() {
  const [classes, students, tutors] = await Promise.all([
    prisma.class.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        enrollments: {
          include: { student: true },
          orderBy: { student: { name: "asc" } },
        },
        teachings: {
          include: { tutor: true },
          orderBy: { tutor: { name: "asc" } },
        },
      },
    }),
    prisma.student.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, grade: true },
    }),
    prisma.tutor.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, subjects: true },
    }),
  ]);

  const classDetails: ClassDetail[] = classes.map(serializeClass);
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
    <>
      <Header signInStatus />
      <Box sx={{ width: "80%", mx: "auto", my: 4 }}>
        <ClassesPageClient
          initialClasses={classDetails}
          students={studentOptions}
          tutors={tutorOptions}
          classTypes={Object.values(ClassType)}
          weekdays={Object.values(Weekday)}
        />
      </Box>
    </>
  );
}

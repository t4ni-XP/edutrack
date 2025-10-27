import Header from "../_components/ui/Header";
import { Box, Container } from "@mui/material";
import prisma from "@/lib/prisma";
import { ClassType, Weekday } from "@/generated/prisma";
import { serializeClass } from "@/lib/class-utils";
import ClassesPageClient from "./ClassesPageClient";
import type { ClassDetail } from "./types";
import { auth, isSessionAllowed } from "@/lib/auth";
import { notFound } from "next/navigation";

export default async function ClassesPage() {
  const session = await auth();
  if (!session || !isSessionAllowed(session)) notFound();

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
      <Header />
      <Box component="section" sx={{ py: 4 }}>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <ClassesPageClient
            initialClasses={classDetails}
            students={studentOptions}
            tutors={tutorOptions}
            classTypes={Object.values(ClassType)}
            weekdays={Object.values(Weekday)}
          />
        </Container>
      </Box>
    </>
  );
}

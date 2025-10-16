import Header from "../_components/ui/Header";
import { Box, Typography } from "@mui/material";
import prisma from "@/lib/prisma";
import AttendancePageClient from "./AttendancePageClient";
import type { AttendanceClassData, AttendanceStaffTutor } from "./types";
import { EnrollmentStatus, StaffRole, Weekday } from "@/generated/prisma";

const weekdayOrder: Weekday[] = [
  Weekday.SUNDAY,
  Weekday.MONDAY,
  Weekday.TUESDAY,
  Weekday.WEDNESDAY,
  Weekday.THURSDAY,
  Weekday.FRIDAY,
  Weekday.SATURDAY,
];

const weekdayLabel: Record<Weekday, string> = {
  [Weekday.MONDAY]: "月曜日",
  [Weekday.TUESDAY]: "火曜日",
  [Weekday.WEDNESDAY]: "水曜日",
  [Weekday.THURSDAY]: "木曜日",
  [Weekday.FRIDAY]: "金曜日",
  [Weekday.SATURDAY]: "土曜日",
  [Weekday.SUNDAY]: "日曜日",
};

function getWeekdayEnum(date: Date): Weekday {
  return weekdayOrder[date.getDay()];
}

function toDateOnly(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export default async function AttendancePage() {
  const today = new Date();
  const weekday = getWeekdayEnum(today);
  const dateOnly = toDateOnly(today);

  const classes = await prisma.class.findMany({
    where: { weekday },
    include: {
      teachings: {
        include: { tutor: true },
      },
      enrollments: {
        where: { status: EnrollmentStatus.ACTIVE },
        include: { student: true },
        orderBy: { student: { name: "asc" } },
      },
    },
    orderBy: [{ startsAt: "asc" }, { name: "asc" }],
  });

  const classIds = classes.map((cls) => cls.id);

  const sessions = classIds.length
    ? await prisma.classSession.findMany({
        where: {
          classId: { in: classIds },
          date: dateOnly,
        },
        include: { Attendance: true },
      })
    : [];

  const sessionByClass = new Map(sessions.map((session) => [session.classId, session]));

  const classesData: AttendanceClassData[] = classes.map((cls) => {
    const session = sessionByClass.get(cls.id) ?? null;
    const attendanceByStudent = new Map(
      session?.Attendance.map((record) => [record.studentId, record.status]) ?? [],
    );

    const students = cls.enrollments
      .map((enrollment) => ({
        id: enrollment.student.id,
        name: enrollment.student.name,
        grade: enrollment.student.grade,
        status: (attendanceByStudent.get(enrollment.student.id) ?? "NONE") as
          | AttendanceStatus
          | "NONE",
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "ja"));

    const tutors = cls.teachings.map((teaching) => ({
      id: teaching.tutor.id,
      name: teaching.tutor.name,
      role: teaching.tutor.role,
    }));

    return {
      id: cls.id,
      name: cls.name,
      startsAt: cls.startsAt ?? null,
      endsAt: cls.endsAt ?? null,
      sessionId: session?.id ?? null,
      tutors,
      students,
    };
  });

  const staffTutors: AttendanceStaffTutor[] = await prisma.tutor
    .findMany({
      where: { role: StaffRole.STAFF },
      orderBy: { name: "asc" },
    })
    .then((result) => result.map((tutor) => ({ id: tutor.id, name: tutor.name, role: tutor.role })));

  return (
    <>
      <Header signInStatus />
      <Box sx={{ width: "80%", mx: "auto", my: 4 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          出席管理（{weekdayLabel[weekday]}）
        </Typography>
        <AttendancePageClient
          dateIso={today.toISOString()}
          classes={classesData}
          staffTutors={staffTutors}
        />
      </Box>
    </>
  );
}

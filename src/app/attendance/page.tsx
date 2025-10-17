import Header from "../_components/ui/Header";
import { Box, Typography } from "@mui/material";
import prisma from "@/lib/prisma";
import AttendancePageClient from "./AttendancePageClient";
import type { AttendanceStudentRow, AttendanceTutorRow } from "./types";
import { AttendanceStatus, EnrollmentStatus, StaffRole, Weekday } from "@/generated/prisma";

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

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

export default async function AttendancePage() {
  const today = new Date();
  const weekday = getWeekdayEnum(today);
  const dayLabel = weekdayLabel[weekday];
  const dayStart = startOfDay(today);
  const dayEnd = endOfDay(today);

  const classes = await prisma.class.findMany({
    where: { weekday },
    include: {
      teachings: {
        include: { tutor: true },
        orderBy: { tutor: { name: "asc" } },
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
  const tutorIdsForClasses = Array.from(
    new Set(classes.flatMap((cls) => cls.teachings.map((teach) => teach.tutorId))),
  );

  const staffTutors = await prisma.tutor.findMany({
    where: { role: StaffRole.STAFF },
    orderBy: { name: "asc" },
  });

  const sessions = classIds.length
    ? await prisma.classSession.findMany({
        where: {
          classId: { in: classIds },
          date: { gte: dayStart, lt: dayEnd },
        },
        include: { Attendance: true },
      })
    : [];

  const sessionByClass = new Map(sessions.map((session) => [session.classId, session]));

  const tutorIdSet = new Set([...tutorIdsForClasses, ...staffTutors.map((tutor) => tutor.id)]);

  const workLogs = await prisma.workLog.findMany({
    where: {
      tutorId: { in: Array.from(tutorIdSet) },
      date: { gte: dayStart, lt: dayEnd },
    },
    select: {
      id: true,
      tutorId: true,
      classId: true,
      sessionId: true,
    },
  });

  const workLogMap = new Map<string, { id: string; sessionId: string | null }>();
  workLogs.forEach((log) => {
    const key = `${log.tutorId}::${log.classId ?? "__staff__"}`;
    workLogMap.set(key, { id: log.id, sessionId: log.sessionId });
  });

  const studentRows: AttendanceStudentRow[] = classes.flatMap((cls) => {
    const session = sessionByClass.get(cls.id);
    const attendanceByStudent = new Map(
      session?.Attendance.map((record) => [record.studentId, record.status]) ?? [],
    );

    return cls.enrollments.map((enrollment) => ({
      classId: cls.id,
      className: cls.name,
      sessionId: session?.id ?? null,
      studentId: enrollment.student.id,
      studentName: enrollment.student.name,
      grade: enrollment.student.grade,
      status: (attendanceByStudent.get(enrollment.student.id) ?? "NONE") as
        | AttendanceStatus
        | "NONE",
    }));
  });

  const tutorRows: AttendanceTutorRow[] = [
    ...classes.flatMap((cls) =>
      cls.teachings.map((teach) => {
        const key = `${teach.tutorId}::${cls.id}`;
        const log = workLogMap.get(key);
        return {
          classId: cls.id,
          className: cls.name,
          sessionId: log?.sessionId ?? sessionByClass.get(cls.id)?.id ?? null,
          tutorId: teach.tutor.id,
          tutorName: teach.tutor.name,
          role: teach.tutor.role,
          status: log ? "PRESENT" : "ABSENT",
        } satisfies AttendanceTutorRow;
      }),
    ),
    ...staffTutors.map((tutor) => {
      const key = `${tutor.id}::__staff__`;
      const log = workLogMap.get(key);
      return {
        classId: null,
        className: null,
        sessionId: log?.sessionId ?? null,
        tutorId: tutor.id,
        tutorName: tutor.name,
        role: tutor.role,
        status: log ? "PRESENT" : "ABSENT",
      } satisfies AttendanceTutorRow;
    }),
  ];

  return (
    <>
      <Header signInStatus />
      <Box sx={{ width: "80%", mx: "auto", my: 4 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          出席管理（{dayLabel}）
        </Typography>
        <AttendancePageClient
          dateIso={today.toISOString()}
          students={studentRows}
          tutors={tutorRows}
        />
      </Box>
    </>
  );
}

import { Box, Card, CardContent, Typography } from "@mui/material";
import prisma from "@/lib/prisma";
import ClassesTable, { ClassesTableRow } from "./tables/ClassesTable";
import PrimaryButton from "./ui/PrimaryButton";
import { EnrollmentStatus, Weekday } from "@/generated/prisma";

interface DashboardProps {
  showAttendanceButton?: boolean;
}

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

function getWeekday(date: Date): Weekday {
  return weekdayOrder[date.getDay()];
}

function formatTime(value: string | null) {
  if (!value) return null;
  return value.length === 5 ? value : value.slice(0, 5);
}

export default async function Dashboard({ showAttendanceButton = false }: DashboardProps) {
  const today = new Date();
  const weekday = getWeekday(today);

  const classes = await prisma.class.findMany({
    where: { weekday },
    include: {
      enrollments: {
        where: { status: EnrollmentStatus.ACTIVE },
        include: { student: true },
        orderBy: { student: { name: "asc" } },
      },
      teachings: {
        include: { tutor: true },
        orderBy: { tutor: { name: "asc" } },
      },
    },
    orderBy: [{ startsAt: "asc" }, { name: "asc" }],
  });

  const rows: ClassesTableRow[] = classes.map((cls) => ({
    id: cls.id,
    name: cls.name,
    classType: cls.classType,
    weekday: weekdayLabel[cls.weekday],
    classRoom: cls.classRoom,
    startsAt: formatTime(cls.startsAt),
    endsAt: formatTime(cls.endsAt),
    tutors: cls.teachings.map((teach) => teach.tutor.name),
    students: cls.enrollments.map((enrollment) => enrollment.student.name),
  }));

  return (
    <Box
    component="section"
      sx={{
        py: 4,
        my: 4,
        mx: "auto",
        width: "80%",
        display: "flex",
        alignItems: "flex-start",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Typography variant="h4">今日のクラス（{weekdayLabel[weekday]}）</Typography>
      <Card variant="outlined" sx={{ width: "100%", borderRadius: "30px" }}>
        <CardContent sx={{ p: 3 }}>
          <ClassesTable rows={rows} />
        </CardContent>
      </Card>
      {showAttendanceButton && (
        <Box alignSelf="flex-end">
          <PrimaryButton href="/attendance" label="出席入力" />
        </Box>
      )}
    </Box>
  );
}

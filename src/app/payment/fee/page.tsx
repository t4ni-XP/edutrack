import { Card, CardContent, Stack, Typography } from "@mui/material";
import prisma from "@/lib/prisma";
import StudentFeeTable from "./StudentFeeTable";
import MonthSelector from "./MonthSelector";
import type { StudentFeeRow } from "./types";

const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
});

type FeePageSearchParams = Promise<{
  month?: string;
}>;

export default async function PaymentFeePage({
  searchParams,
}: {
  searchParams?: FeePageSearchParams;
}) {
  const resolvedParams = (searchParams && (await searchParams)) ?? {};
  const { startDate, endDate, label, value } = getMonthRange(resolvedParams.month);
  const rows = await fetchStudentFeeRows(startDate, endDate);
  const total = rows.reduce((sum, row) => sum + row.totalFee, 0);

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
      >
        <Stack spacing={0.5}>
          <Typography variant="h4">受講料</Typography>
          <Typography color="text.secondary">対象月の生徒別料金サマリー</Typography>
        </Stack>
        <MonthSelector value={value} />
      </Stack>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary">
            {label}の合計
          </Typography>
          <Typography variant="h5">{currencyFormatter.format(total)}</Typography>
        </CardContent>
      </Card>
      <StudentFeeTable rows={rows} monthValue={value} />
    </Stack>
  );
}

async function fetchStudentFeeRows(startDate: Date, endDate: Date): Promise<StudentFeeRow[]> {
  const students = await prisma.student.findMany({
    select: {
      id: true,
      name: true,
      grade: true,
      enrollments: {
        select: {
          class: {
            select: {
              id: true,
              studentUnitFee: true,
            },
          },
          Attendance: {
            where: {
              session: {
                date: {
                  gte: startDate,
                  lt: endDate,
                },
              },
            },
            select: {
              status: true,
            },
          },
        },
      },
    },
    orderBy: [{ grade: "asc" }, { name: "asc" }],
  });

  return students.map((student) => {
    let openedCount = 0;
    let presentCount = 0;
    let absentCount = 0;
    let excusedCount = 0;
    let totalFee = 0;

    for (const enrollment of student.enrollments) {
      let enrollmentPresent = 0;
      let enrollmentAbsent = 0;
      let enrollmentExcused = 0;

      for (const attendance of enrollment.Attendance) {
        if (attendance.status === "PRESENT") enrollmentPresent += 1;
        else if (attendance.status === "ABSENT") enrollmentAbsent += 1;
        else if (attendance.status === "EXCUSED") enrollmentExcused += 1;
      }

      const classOpened = enrollmentPresent + enrollmentAbsent + enrollmentExcused;
      openedCount += classOpened;
      presentCount += enrollmentPresent;
      absentCount += enrollmentAbsent;
      excusedCount += enrollmentExcused;

      const unitFee = enrollment.class?.studentUnitFee ?? 0;
      totalFee += (enrollmentPresent + enrollmentAbsent) * unitFee;
    }

    return {
      id: student.id,
      name: student.name,
      grade: student.grade,
      openedCount,
      presentCount,
      absentCount,
      excusedCount,
      totalFee,
    };
  });
}

function getMonthRange(input?: string) {
  const parsed = parseYearMonth(input);
  const now = new Date();
  const year = parsed?.year ?? now.getFullYear();
  const month = parsed?.month ?? now.getMonth() + 1;
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));
  const label = `${year}年${month}月`;
  const value = `${year}-${String(month).padStart(2, "0")}`;
  return { startDate, endDate, label, value };
}

function parseYearMonth(value?: string) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null;
  if (month < 1 || month > 12) return null;
  return { year, month };
}

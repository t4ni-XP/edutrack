import { Card, CardContent, Stack, Typography } from "@mui/material";
import prisma from "@/lib/prisma";
import MonthSelector from "../_components/MonthSelector";
import TutorWageTable from "./TutorWageTable";
import type { TutorWageRow } from "./types";
import { getMonthRange } from "../utils/month";
import { WageUnit } from "@/generated/prisma";

const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
});

type WagePageSearchParams = Promise<{
  month?: string;
}>;

export default async function PaymentWagePage({
  searchParams,
}: {
  searchParams?: WagePageSearchParams;
}) {
  const resolvedParams = (searchParams && (await searchParams)) ?? {};
  const { startDate, endDate, label, value } = getMonthRange(resolvedParams.month);
  const rows = await fetchTutorWageRows(startDate, endDate);
  const total = rows.reduce((sum, row) => sum + row.totalWage, 0);

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
      >
        <Stack spacing={0.5}>
          <Typography variant="h4">講師賃金</Typography>
          <Typography color="text.secondary">対象月の講師別賃金サマリー</Typography>
        </Stack>
        <MonthSelector value={value} basePath="/payment/wage" />
      </Stack>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary">
            {label}の合計
          </Typography>
          <Typography variant="h5">{currencyFormatter.format(total)}</Typography>
        </CardContent>
      </Card>
      <TutorWageTable rows={rows} monthValue={value} />
    </Stack>
  );
}

async function fetchTutorWageRows(startDate: Date, endDate: Date): Promise<TutorWageRow[]> {
  const tutors = await prisma.tutor.findMany({
    select: {
      id: true,
      name: true,
      teachings: {
        select: {
          classId: true,
          wageUnit: true,
          wageAmount: true,
        },
      },
      WorkLog: {
        where: {
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
        select: {
          date: true,
          minutes: true,
          classId: true,
        },
      },
    },
    orderBy: [{ name: "asc" }],
  });

  return tutors.map((tutor) => {
    const teachingMap = new Map(
      tutor.teachings.map((teaching) => [teaching.classId, teaching]),
    );

    let openedCount = 0;
    const weekdayCounts = {
      mondayCount: 0,
      tuesdayCount: 0,
      wednesdayCount: 0,
      thursdayCount: 0,
      fridayCount: 0,
      saturdayCount: 0,
      sundayCount: 0,
    };
    let totalWage = 0;

    for (const log of tutor.WorkLog) {
      openedCount += 1;
      const weekdayKey = weekdayKeyFromDate(log.date);
      weekdayCounts[weekdayKey] += 1;

      if (log.classId) {
        const teaching = teachingMap.get(log.classId);
        if (teaching) {
          const amount = teaching.wageAmount ?? 0;
          if (teaching.wageUnit === WageUnit.PER_SESSION) {
            totalWage += amount;
          } else if (teaching.wageUnit === WageUnit.PER_HOUR) {
            const minutes = log.minutes ?? 0;
            totalWage += (minutes / 60) * amount;
          }
        }
      }
    }

    return {
      id: tutor.id,
      name: tutor.name,
      openedCount,
      mondayCount: weekdayCounts.mondayCount,
      tuesdayCount: weekdayCounts.tuesdayCount,
      wednesdayCount: weekdayCounts.wednesdayCount,
      thursdayCount: weekdayCounts.thursdayCount,
      fridayCount: weekdayCounts.fridayCount,
      saturdayCount: weekdayCounts.saturdayCount,
      sundayCount: weekdayCounts.sundayCount,
      totalWage,
    };
  });
}

type WeekdayCountKey =
  | "mondayCount"
  | "tuesdayCount"
  | "wednesdayCount"
  | "thursdayCount"
  | "fridayCount"
  | "saturdayCount"
  | "sundayCount";

const weekdayKeyMap: Record<number, WeekdayCountKey> = {
  0: "sundayCount",
  1: "mondayCount",
  2: "tuesdayCount",
  3: "wednesdayCount",
  4: "thursdayCount",
  5: "fridayCount",
  6: "saturdayCount",
};

function weekdayKeyFromDate(date: Date): WeekdayCountKey {
  return weekdayKeyMap[date.getUTCDay()];
}

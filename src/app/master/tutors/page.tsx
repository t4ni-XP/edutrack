// app/people/tutors/page.tsx
import prisma from "@/lib/prisma";
import TutorsPageClient from "./TutorsPageClient";
import type { TutorListRow } from "./types";

export default async function TutorsPage() {
  const tutors = await prisma.tutor.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      needsPickup: true,
      subjects: true,
      role: true,
      createdAt: true,
      updatedAt: true,

      WorkLog: {
        select: {
          session: {
            select: {
              status: true,
              startAt: true,
              endAt: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedTutors: TutorListRow[] = tutors.map((tutor) => {
    const totalWorkedLogs = tutor.WorkLog.length;
    const classCount = tutor.WorkLog.filter((log) => log.session).length;
    const sessionsWorked = tutor.WorkLog.filter(
      (log) => log.session && log.session.status === "HELD",
    ).length;
    const minutesWorked = tutor.WorkLog.reduce((total, log) => {
      if (log.session && log.session.startAt && log.session.endAt) {
        const start = log.session.startAt;
        const end = log.session.endAt;
        const diff = (end.getTime() - start.getTime()) / (1000 * 60); // 分単位の差分
        total += diff;
        return total;
      } else {
        return total;
      }
    }, 0);
    const opMinutes = totalWorkedLogs - classCount;

    return {
      ...tutor,
      classCount,
      sessionsWorked,
      minutesWorked,
      opMinutes,
      createdAt: tutor.createdAt.toISOString(),
      updatedAt: tutor.updatedAt.toISOString(),
    };
  });

  return <TutorsPageClient initialRows={formattedTutors} />;
}

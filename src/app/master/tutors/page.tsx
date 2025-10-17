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
    // 集計用のオブジェクトを用意
    const initialStats = {
      classCount: 0,
      sessionsWorked: 0,
      minutesWorked: 0,
    };

    // 一度のループで全ての値を集計する
    const stats = tutor.WorkLog.reduce((acc, log) => {
      if (log.session) {
        acc.classCount++;
        if (log.session.status === "HELD") {
          acc.sessionsWorked++;
        }
        if (log.session.startAt && log.session.endAt) {
          const start = log.session.startAt;
          const end = log.session.endAt;
          const diff = (end.getTime() - start.getTime()) / (1000 * 60);
          acc.minutesWorked += diff;
        }
      }
      return acc;
    }, initialStats);

    const { WorkLog, ...tutorData } = tutor;

    const opCount = WorkLog.length - stats.classCount;

    return {
      ...tutorData,
      ...stats,
      opCount, // opMinutesからリネーム
      createdAt: tutor.createdAt.toISOString(),
      updatedAt: tutor.updatedAt.toISOString(),
    };
  });

  return <TutorsPageClient initialRows={formattedTutors} />;
}

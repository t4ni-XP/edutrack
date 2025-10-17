import { NextResponse } from "next/server";
import { AttendanceStatus, SessionStatus } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { auth, isSessionAllowed, isSessionStaff } from "@/lib/auth";

const studentStatuses = new Set<AttendanceStatus | "NONE">([
  AttendanceStatus.PRESENT,
  AttendanceStatus.ABSENT,
  AttendanceStatus.EXCUSED,
  "NONE",
]);

const tutorStatuses = new Set<"PRESENT" | "ABSENT">(["PRESENT", "ABSENT"]);

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !isSessionAllowed(session) || !isSessionStaff(session)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const { entity, status, date } = payload as Record<string, unknown>;

  if (entity !== "student" && entity !== "tutor") {
    return NextResponse.json({ message: "entity is invalid." }, { status: 400 });
  }

  const now = typeof date === "string" ? new Date(date) : new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  if (entity === "student") {
    const { classId, studentId } = payload as Record<string, unknown>;
    if (typeof classId !== "string" || !classId) {
      return NextResponse.json({ message: "classId is required." }, { status: 400 });
    }
    if (typeof studentId !== "string" || !studentId) {
      return NextResponse.json({ message: "studentId is required." }, { status: 400 });
    }
    if (typeof status !== "string" || !studentStatuses.has(status as AttendanceStatus | "NONE")) {
      return NextResponse.json({ message: "status is invalid." }, { status: 400 });
    }

    try {
      const session = await prisma.classSession.upsert({
        where: {
          classId_date: {
            classId,
            date: dayStart,
          },
        },
        update: {},
        create: {
          classId,
          date: dayStart,
          status: SessionStatus.HELD,
        },
      });

      if (status === "NONE") {
        await prisma.attendance.deleteMany({
          where: {
            classId,
            studentId,
            sessionId: session.id,
          },
        });
        return NextResponse.json({ status: "NONE", sessionId: session.id });
      }

      const updated = await prisma.attendance.upsert({
        where: {
          studentId_classId_sessionId: {
            studentId,
            classId,
            sessionId: session.id,
          },
        },
        update: {
          status: status as AttendanceStatus,
        },
        create: {
          studentId,
          classId,
          sessionId: session.id,
          status: status as AttendanceStatus,
        },
      });

      return NextResponse.json({ status: updated.status, sessionId: session.id });
    } catch (error) {
      console.error("[POST /api/attendance] student", error);
      return NextResponse.json({ message: "出席情報の更新に失敗しました。" }, { status: 500 });
    }
  }

  // tutor handling
  const { tutorId } = payload as Record<string, unknown>;
  const classIdValue = (payload as Record<string, unknown>).classId;
  const classId = typeof classIdValue === "string" && classIdValue !== "" ? classIdValue : null;

  if (typeof tutorId !== "string" || !tutorId) {
    return NextResponse.json({ message: "tutorId is required." }, { status: 400 });
  }
  if (typeof status !== "string" || !tutorStatuses.has(status as "PRESENT" | "ABSENT")) {
    return NextResponse.json({ message: "status is invalid." }, { status: 400 });
  }

  try {
    let sessionId: string | null = null;
    if (classId) {
      const session = await prisma.classSession.upsert({
        where: {
          classId_date: {
            classId,
            date: dayStart,
          },
        },
        update: {},
        create: {
          classId,
          date: dayStart,
          status: SessionStatus.HELD,
        },
      });
      sessionId = session.id;
    }

    const baseWhere = {
      tutorId,
      classId: classId ?? null,
      date: {
        gte: dayStart,
        lt: dayEnd,
      },
    } as const;

    if (status === "ABSENT") {
      await prisma.workLog.deleteMany({ where: baseWhere });
      return NextResponse.json({ status: "ABSENT", sessionId });
    }

    const existing = await prisma.workLog.findFirst({ where: baseWhere });
    if (existing) {
      return NextResponse.json({ status: "PRESENT", sessionId: existing.sessionId ?? sessionId });
    }

    const created = await prisma.workLog.create({
      data: {
        tutorId,
        date: now,
        classId,
        sessionId,
        minutes: 0,
      },
    });

    return NextResponse.json({ status: "PRESENT", sessionId: created.sessionId ?? sessionId });
  } catch (error) {
    console.error("[POST /api/attendance] tutor", error);
    return NextResponse.json({ message: "出席情報の更新に失敗しました。" }, { status: 500 });
  }
}

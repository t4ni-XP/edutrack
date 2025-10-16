import { NextResponse } from "next/server";
import { AttendanceStatus, SessionStatus } from "@/generated/prisma";
import prisma from "@/lib/prisma";

const allowedStatuses = new Set<AttendanceStatus | "NONE">([
  AttendanceStatus.PRESENT,
  AttendanceStatus.ABSENT,
  AttendanceStatus.EXCUSED,
  "NONE",
]);

function toDateOnly(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const { classId, studentId, status, date } = payload as Record<string, unknown>;

  if (typeof classId !== "string" || !classId) {
    return NextResponse.json({ message: "classId is required." }, { status: 400 });
  }
  if (typeof studentId !== "string" || !studentId) {
    return NextResponse.json({ message: "studentId is required." }, { status: 400 });
  }
  if (typeof status !== "string" || !allowedStatuses.has(status as AttendanceStatus | "NONE")) {
    return NextResponse.json({ message: "status is invalid." }, { status: 400 });
  }

  const now = typeof date === "string" ? new Date(date) : new Date();
  const dateOnly = toDateOnly(now);

  try {
    const session = await prisma.classSession.upsert({
      where: {
        classId_date: {
          classId,
          date: dateOnly,
        },
      },
      update: {},
      create: {
        classId,
        date: dateOnly,
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
    console.error("[POST /api/attendance]", error);
    return NextResponse.json({ message: "出席情報の更新に失敗しました。" }, { status: 500 });
  }
}

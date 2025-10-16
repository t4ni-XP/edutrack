import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  classInclude,
  isRecordNotFound,
  isUniqueClassConstraintError,
  normalizeClassPayload,
  serializeClass,
} from "@/lib/class-utils";

interface Params {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: Params) {
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ message: "クラスIDが不正です。" }, { status: 400 });
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

  const normalized = normalizeClassPayload(payload as Record<string, unknown>);
  if ("error" in normalized) {
    return NextResponse.json({ message: normalized.error }, { status: 400 });
  }

  const { data } = normalized;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.class.update({
        where: { id },
        data: {
          name: data.name,
          classType: data.classType,
          weekday: data.weekday,
          classRoom: data.classRoom,
          startsAt: data.startsAt,
          endsAt: data.endsAt,
          capacity: data.capacity,
          studentUnitFee: data.studentUnitFee,
        },
      });

      const existingEnrollments = await tx.enrollment.findMany({
        where: { classId: id },
        select: { studentId: true },
      });
      const existingStudentIds = new Set(existingEnrollments.map((e) => e.studentId));
      const desiredStudentIds = new Set(data.studentIds);

      const studentIdsToDelete = existingEnrollments
        .map((e) => e.studentId)
        .filter((studentId) => !desiredStudentIds.has(studentId));
      if (studentIdsToDelete.length > 0) {
        await tx.enrollment.deleteMany({
          where: { classId: id, studentId: { in: studentIdsToDelete } },
        });
      }

      const studentIdsToAdd = data.studentIds.filter((studentId) => !existingStudentIds.has(studentId));
      if (studentIdsToAdd.length > 0) {
        await tx.enrollment.createMany({
          data: studentIdsToAdd.map((studentId) => ({ classId: id, studentId })),
          skipDuplicates: true,
        });
      }

      const existingTeachings = await tx.teaching.findMany({
        where: { classId: id },
        select: { tutorId: true, wageAmount: true },
      });
      const existingTeachingMap = new Map(existingTeachings.map((t) => [t.tutorId, t.wageAmount]));
      const desiredTutorIds = new Set(data.tutorAssignments.map((t) => t.tutorId));

      const tutorIdsToDelete = existingTeachings
        .map((t) => t.tutorId)
        .filter((tutorId) => !desiredTutorIds.has(tutorId));
      if (tutorIdsToDelete.length > 0) {
        await tx.teaching.deleteMany({
          where: { classId: id, tutorId: { in: tutorIdsToDelete } },
        });
      }

      for (const assignment of data.tutorAssignments) {
        if (existingTeachingMap.has(assignment.tutorId)) {
          const currentWage = existingTeachingMap.get(assignment.tutorId);
          if (currentWage !== assignment.wageAmount) {
            await tx.teaching.update({
              where: { tutorId_classId: { tutorId: assignment.tutorId, classId: id } },
              data: { wageAmount: assignment.wageAmount },
            });
          }
        } else {
          await tx.teaching.create({
            data: {
              class: { connect: { id } },
              tutor: { connect: { id: assignment.tutorId } },
              wageAmount: assignment.wageAmount,
            },
          });
        }
      }

      const refreshed = await tx.class.findUnique({
        where: { id },
        include: classInclude,
      });
      if (!refreshed) throw new Error("クラスが見つかりませんでした。");
      return refreshed;
    });

    return NextResponse.json(serializeClass(updated));
  } catch (error) {
    if (isRecordNotFound(error)) {
      return NextResponse.json({ message: "対象のクラス、講師、または生徒が見つかりませんでした。" }, { status: 404 });
    }
    if (isUniqueClassConstraintError(error)) {
      return NextResponse.json(
        { message: "同じ曜日・教室・開始時間のクラスが既に存在します。" },
        { status: 409 },
      );
    }
    console.error(`[PATCH /api/classes/${id}]`, error);
    return NextResponse.json({ message: "クラス情報の更新に失敗しました。" }, { status: 500 });
  }
}

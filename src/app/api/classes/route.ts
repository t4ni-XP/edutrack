import { NextResponse } from "next/server";
import { Status } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import {
  classInclude,
  isRecordNotFound,
  isUniqueClassConstraintError,
  normalizeClassPayload,
  serializeClass,
} from "@/lib/class-utils";
	export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      orderBy: { createdAt: "desc" },
      include: classInclude,
    });
    return NextResponse.json(classes.map(serializeClass));
  } catch (error) {
    console.error("[GET /api/classes]", error);
    return NextResponse.json({ message: "クラス情報の取得に失敗しました。" }, { status: 500 });
  }
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

  const normalized = normalizeClassPayload(payload as Record<string, unknown>);
  if ("error" in normalized) {
    return NextResponse.json({ message: normalized.error }, { status: 400 });
  }

  const { data } = normalized;

  try {
    const created = await prisma.class.create({
      data: {
        name: data.name,
        classType: data.classType,
        weekday: data.weekday,
        classRoom: data.classRoom,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        capacity: data.capacity,
        studentUnitFee: data.studentUnitFee,
        status: Status.ACTIVE,
        enrollments: {
          create: data.studentIds.map((studentId) => ({
            student: { connect: { id: studentId } },
          })),
        },
        teachings: {
          create: data.tutorAssignments.map((assignment) => ({
            tutor: { connect: { id: assignment.tutorId } },
            wageAmount: assignment.wageAmount,
          })),
        },
      },
      include: classInclude,
    });

    return NextResponse.json(serializeClass(created), { status: 201 });
  } catch (error) {
    if (isUniqueClassConstraintError(error)) {
      return NextResponse.json(
        { message: "同じ曜日・教室・開始時間のクラスが既に存在します。" },
        { status: 409 },
      );
    }
    if (isRecordNotFound(error)) {
      return NextResponse.json({ message: "選択された生徒または講師が見つかりませんでした。" }, { status: 404 });
    }
    console.error("[POST /api/classes]", error);
    return NextResponse.json({ message: "クラスの作成に失敗しました。" }, { status: 500 });
  }
}

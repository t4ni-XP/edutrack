import { NextResponse } from "next/server";
import { ClassType, Prisma, Status, Weekday } from "@/generated/prisma";
import prisma from "@/lib/prisma";

type TutorAssignment = {
  tutorId: string;
  wageAmount: number;
};

type Payload = {
  name?: unknown;
  classType?: unknown;
  weekday?: unknown;
  classRoom?: unknown;
  startsAt?: unknown;
  endsAt?: unknown;
  capacity?: unknown;
  studentUnitFee?: unknown;
  studentIds?: unknown;
  tutorAssignments?: unknown;
};

const classTypeSet = new Set<string>(Object.values(ClassType));
const weekdaySet = new Set<string>(Object.values(Weekday));

function parsePositiveInt(value: unknown, allowZero = false) {
  if (typeof value === "number") {
    const num = Math.trunc(value);
    if (Number.isNaN(num)) return null;
    if (!allowZero && num <= 0) return null;
    if (allowZero && num < 0) return null;
    return num;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const num = Number(value);
    if (!Number.isFinite(num)) return null;
    const intNum = Math.trunc(num);
    if (!allowZero && intNum <= 0) return null;
    if (allowZero && intNum < 0) return null;
    return intNum;
  }
  return null;
}

function parseString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseOptionalString(value: unknown) {
  if (value == null) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function parseStringArray(value: unknown): string[] | null {
  if (value == null) return [];
  if (Array.isArray(value)) {
    const list = value.filter((item): item is string => typeof item === "string");
    return list.length === value.length ? Array.from(new Set(list)) : null;
  }
  if (typeof value === "string") {
    return Array.from(new Set(value.split(",").map((item) => item.trim()).filter(Boolean)));
  }
  return null;
}

function parseTutorAssignments(value: unknown): TutorAssignment[] | null {
  if (!Array.isArray(value)) return null;
  const assignments: TutorAssignment[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const tutorId = parseString((item as Record<string, unknown>).tutorId);
    const wageAmount = parsePositiveInt((item as Record<string, unknown>).wageAmount);
    if (!tutorId || !wageAmount) return null;
    assignments.push({ tutorId, wageAmount });
  }
  return assignments;
}

export async function POST(request: Request) {
  let payload: Payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  const name = parseString(payload.name);
  if (!name) {
    return NextResponse.json({ message: "クラス名は必須です。" }, { status: 400 });
  }

  const classType = typeof payload.classType === "string" ? payload.classType : "";
  if (!classTypeSet.has(classType)) {
    return NextResponse.json({ message: "クラス種別が不正です。" }, { status: 400 });
  }

  const weekday = typeof payload.weekday === "string" ? payload.weekday : "";
  if (!weekdaySet.has(weekday)) {
    return NextResponse.json({ message: "曜日が不正です。" }, { status: 400 });
  }

  const classRoom = parseString(payload.classRoom);
  if (!classRoom) {
    return NextResponse.json({ message: "教室は必須です。" }, { status: 400 });
  }

  const startsAt = parseOptionalString(payload.startsAt);
  const endsAt = parseOptionalString(payload.endsAt);

  const capacity = payload.capacity == null || payload.capacity === ""
    ? null
    : parsePositiveInt(payload.capacity, true);
  if (capacity === null && payload.capacity != null && payload.capacity !== "") {
    return NextResponse.json({ message: "定員は 0 以上の数値で入力してください。" }, { status: 400 });
  }

  const studentUnitFee = parsePositiveInt(payload.studentUnitFee);
  if (!studentUnitFee) {
    return NextResponse.json({ message: "生徒単価は 1 以上の数値で入力してください。" }, { status: 400 });
  }

  const studentIds = parseStringArray(payload.studentIds);
  if (studentIds === null || studentIds.length === 0) {
    return NextResponse.json({ message: "生徒を1名以上選択してください。" }, { status: 400 });
  }

  const tutorAssignments = parseTutorAssignments(payload.tutorAssignments);
  if (!tutorAssignments || tutorAssignments.length === 0) {
    return NextResponse.json({ message: "講師を1名以上選択し賃金を入力してください。" }, { status: 400 });
  }

  try {
    const result = await prisma.class.create({
      data: {
        name,
        classType: classType as ClassType,
        weekday: weekday as Weekday,
        classRoom,
        startsAt,
        endsAt,
        capacity,
        studentUnitFee,
        status: Status.ACTIVE,
        enrollments: {
          create: studentIds.map((studentId) => ({
            student: { connect: { id: studentId } },
          })),
        },
        teachings: {
          create: tutorAssignments.map((assignment) => ({
            tutor: { connect: { id: assignment.tutorId } },
            wageAmount: assignment.wageAmount,
          })),
        },
      },
      include: {
        enrollments: true,
        teachings: true,
      },
    });

    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { message: "同じ曜日・教室・開始時間のクラスが既に存在します。" },
          { status: 409 },
        );
      }
      if (error.code === "P2025") {
        return NextResponse.json({ message: "選択された生徒または講師が見つかりませんでした。" }, { status: 404 });
      }
    }
    console.error("[POST /api/classes]", error);
    return NextResponse.json({ message: "クラスの作成に失敗しました。" }, { status: 500 });
  }
}

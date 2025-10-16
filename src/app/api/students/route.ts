import { NextResponse } from "next/server";
import { Status } from "@/generated/prisma";
import prisma from "@/lib/prisma";

const statusSet = new Set<Status>(Object.values(Status) as Status[]);

function parseNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? Math.trunc(value) : NaN;
  if (typeof value === "string" && value.trim() !== "") return Math.trunc(Number(value));
  return NaN;
}

function parseStatus(value: unknown): Status | null {
  if (value === undefined || value === null || value === "") return Status.ACTIVE;
  if (typeof value !== "string") return null;
  const normalized = value.toUpperCase() as Status;
  return statusSet.has(normalized) ? normalized : null;
}

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(students);
  } catch (error) {
    console.error("[GET /api/students]", error);
    return NextResponse.json({ message: "Failed to load students." }, { status: 500 });
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

  const { name, grade, generation, status, report } = payload as Record<string, unknown>;
  const trimmedName = typeof name === "string" ? name.trim() : "";
  const parsedGrade = parseNumber(grade);
  const parsedGeneration = parseNumber(generation);
  const parsedStatus = parseStatus(status);
  const normalizedReport =
    typeof report === "string" && report.trim() !== "" ? report.trim() : null;

  if (!trimmedName) {
    return NextResponse.json({ message: "名前は必須です。" }, { status: 400 });
  }
  if (!Number.isInteger(parsedGrade) || parsedGrade <= 0) {
    return NextResponse.json({ message: "学年は 1 以上の整数で指定してください。" }, { status: 400 });
  }
  if (!Number.isInteger(parsedGeneration) || parsedGeneration <= 0) {
    return NextResponse.json({ message: "期（世代）は 1 以上の整数で指定してください。" }, { status: 400 });
  }
  if (!parsedStatus) {
    return NextResponse.json({ message: "ステータスの値が不正です。" }, { status: 400 });
  }

  try {
    const created = await prisma.student.create({
      data: {
        name: trimmedName,
        grade: parsedGrade,
        generation: parsedGeneration,
        status: parsedStatus,
        report: normalizedReport,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[POST /api/students]", error);
    return NextResponse.json({ message: "登録に失敗しました。" }, { status: 500 });
  }
}

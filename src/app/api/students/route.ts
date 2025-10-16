import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeStudentPayload, serializeStudent } from "./utils";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
    });
    const rows = students.map(serializeStudent);
    return NextResponse.json(rows);
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

  const normalized = normalizeStudentPayload(payload as Record<string, unknown>);
  if ("error" in normalized) {
    return NextResponse.json({ message: normalized.error }, { status: 400 });
  }

  try {
    const created = await prisma.student.create({
      data: normalized.data,
    });
    return NextResponse.json(serializeStudent(created), { status: 201 });
  } catch (error) {
    console.error("[POST /api/students]", error);
    return NextResponse.json({ message: "登録に失敗しました。" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isUniqueConstraintError, normalizeTutorPayload, serializeTutor } from "./utils";

export async function GET() {
  try {
    const tutors = await prisma.tutor.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(tutors.map(serializeTutor));
  } catch (error) {
    console.error("[GET /api/tutors]", error);
    return NextResponse.json({ message: "講師情報の取得に失敗しました。" }, { status: 500 });
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

  const normalized = normalizeTutorPayload(payload as Record<string, unknown>);
  if ("error" in normalized) {
    return NextResponse.json({ message: normalized.error }, { status: 400 });
  }

  try {
    const created = await prisma.tutor.create({ data: normalized.data });
    return NextResponse.json(serializeTutor(created), { status: 201 });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ message: "同じメールアドレスの講師が既に存在します。" }, { status: 409 });
    }
    console.error("[POST /api/tutors]", error);
    return NextResponse.json({ message: "登録に失敗しました。" }, { status: 500 });
  }
}

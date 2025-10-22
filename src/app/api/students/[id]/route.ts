import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { normalizeStudentPayload, serializeStudent } from "../utils";

export async function PATCH(request: Request) {
  const id = new URL(request.url).pathname.split("/").pop() || "";
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

  const normalized = normalizeStudentPayload(payload as Record<string, unknown>);
  if ("error" in normalized) {
    return NextResponse.json({ message: normalized.error }, { status: 400 });
  }

  try {
    const updated = await prisma.student.update({
      where: { id },
      data: normalized.data,
    });
    return NextResponse.json(serializeStudent(updated));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "対象の生徒が見つかりませんでした。" }, { status: 404 });
    }
    console.error(`[PATCH /api/students/${id}]`, error);
    return NextResponse.json({ message: "更新に失敗しました。" }, { status: 500 });
  }
}

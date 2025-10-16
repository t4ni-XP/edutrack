import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { isUniqueConstraintError, normalizeTutorPayload, serializeTutor } from "../utils";

interface Params {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: Params) {
  const id = params?.id;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ message: "講師IDが不正です。" }, { status: 400 });
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

  const normalized = normalizeTutorPayload(payload as Record<string, unknown>);
  if ("error" in normalized) {
    return NextResponse.json({ message: normalized.error }, { status: 400 });
  }

  try {
    const updated = await prisma.tutor.update({
      where: { id },
      data: normalized.data,
    });
    return NextResponse.json(serializeTutor(updated));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "対象の講師が見つかりませんでした。" }, { status: 404 });
    }
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ message: "同じメールアドレスの講師が既に存在します。" }, { status: 409 });
    }
    console.error(`[PATCH /api/tutors/${id}]`, error);
    return NextResponse.json({ message: "更新に失敗しました。" }, { status: 500 });
  }
}

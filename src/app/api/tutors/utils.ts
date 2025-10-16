import { Prisma, Subject, type Tutor } from "@/generated/prisma";
import type { TutorListRow } from "@/app/master/tutors/types";

const subjectSet = new Set<Subject>(Object.values(Subject));

export type NormalizedTutorPayload = {
  name: string;
  email: string;
  needsPickup: boolean;
  subjects: Subject[];
};

function parseSubjects(value: unknown): Subject[] | null {
  if (value == null) return [];
  if (Array.isArray(value)) {
    const list = value.filter(
      (v): v is Subject => typeof v === "string" && subjectSet.has(v as Subject),
    );
    if (list.length !== value.length) return null;
    return list;
  }
  if (typeof value === "string") {
    const parts = value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    const list = parts.filter((v): v is Subject => subjectSet.has(v as Subject));
    return list.length === parts.length ? list : null;
  }
  return null;
}

function parseNeedsPickup(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return null;
}

export function normalizeTutorPayload(payload: Record<string, unknown>) {
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const pickup = parseNeedsPickup(payload.needsPickup);
  const subjects = parseSubjects(payload.subjects);

  if (!name) {
    return { error: "名前は必須です。" } as const;
  }
  if (!email) {
    return { error: "メールアドレスは必須です。" } as const;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "メールアドレスの形式が正しくありません。" } as const;
  }
  if (pickup === null) {
    return { error: "送迎の指定が不正です。" } as const;
  }
  if (subjects === null) {
    return { error: "担当科目の値が不正です。" } as const;
  }

  const data: NormalizedTutorPayload = {
    name,
    email,
    needsPickup: pickup,
    subjects,
  };

  return { data } as const;
}

export function serializeTutor(tutor: Tutor): TutorListRow {
  return {
    id: tutor.id,
    name: tutor.name,
    email: tutor.email,
    needsPickup: tutor.needsPickup,
    subjects: tutor.subjects,
    classCount: 0,
    sessionsWorked: 0,
    minutesWorked: 0,
    opMinutes: 0,
    createdAt:
      tutor.createdAt instanceof Date ? tutor.createdAt.toISOString() : String(tutor.createdAt),
    updatedAt:
      tutor.updatedAt instanceof Date ? tutor.updatedAt.toISOString() : String(tutor.updatedAt),
  };
}

export function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

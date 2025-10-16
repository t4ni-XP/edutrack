import { Status, type Student } from "@/generated/prisma";
import type { StudentListRow } from "@/app/master/students/types";

const statusSet = new Set<Status>(Object.values(Status) as Status[]);

export type NormalizedStudentPayload = {
  name: string;
  grade: number;
  generation: number;
  status: Status;
  report: string | null;
};

export function parseNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? Math.trunc(value) : NaN;
  if (typeof value === "string" && value.trim() !== "") return Math.trunc(Number(value));
  return NaN;
}

export function parseStatus(value: unknown): Status | null {
  if (value === undefined || value === null || value === "") return Status.ACTIVE;
  if (typeof value !== "string") return null;
  const normalized = value.toUpperCase() as Status;
  return statusSet.has(normalized) ? normalized : null;
}

export function normalizeStudentPayload(payload: Record<string, unknown>) {
  const trimmedName = typeof payload.name === "string" ? payload.name.trim() : "";
  const parsedGrade = parseNumber(payload.grade);
  const parsedGeneration = parseNumber(payload.generation);
  const parsedStatus = parseStatus(payload.status);
  const normalizedReport =
    typeof payload.report === "string" && payload.report.trim() !== ""
      ? payload.report.trim()
      : null;

  if (!trimmedName) {
    return { error: "名前は必須です。" } as const;
  }
  if (!Number.isInteger(parsedGrade) || parsedGrade <= 0) {
    return { error: "学年は 1 以上の整数で指定してください。" } as const;
  }
  if (!Number.isInteger(parsedGeneration) || parsedGeneration <= 0) {
    return { error: "期（世代）は 1 以上の整数で指定してください。" } as const;
  }
  if (!parsedStatus) {
    return { error: "ステータスの値が不正です。" } as const;
  }

  const data: NormalizedStudentPayload = {
    name: trimmedName,
    grade: parsedGrade,
    generation: parsedGeneration,
    status: parsedStatus,
    report: normalizedReport,
  };

  return { data } as const;
}

export function serializeStudent(student: Student): StudentListRow {
  return {
    id: student.id,
    name: student.name,
    grade: student.grade,
    generation: student.generation,
    status: student.status,
    report: student.report ?? null,
    classCount: 0,
    billableCount: 0,
    presentCount: 0,
    absentCount: 0,
    createdAt:
      student.createdAt instanceof Date
        ? student.createdAt.toISOString()
        : String(student.createdAt),
    updatedAt:
      student.updatedAt instanceof Date
        ? student.updatedAt.toISOString()
        : String(student.updatedAt),
  };
}

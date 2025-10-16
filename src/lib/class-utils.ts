import {
  ClassType,
  Prisma,
  Weekday,
  type Class,
  type Enrollment,
  type Student,
  type Teaching,
  type Tutor,
} from "@/generated/prisma";
import type { ClassDetail, ClassStudent, ClassTutor } from "@/app/classes/types";

const classTypeSet = new Set<string>(Object.values(ClassType));
const weekdaySet = new Set<string>(Object.values(Weekday));

type TutorAssignmentInput = {
  tutorId: string;
  wageAmount: number;
};

export type NormalizedClassPayload = {
  name: string;
  classType: ClassType;
  weekday: Weekday;
  classRoom: string;
  startsAt: string | null;
  endsAt: string | null;
  capacity: number | null;
  studentUnitFee: number;
  studentIds: string[];
  tutorAssignments: TutorAssignmentInput[];
};

type RawPayload = Record<string, unknown>;

function parsePositiveInt(value: unknown, { allowZero = false }: { allowZero?: boolean } = {}) {
  if (typeof value === "number") {
    const intVal = Math.trunc(value);
    if (!Number.isFinite(intVal)) return null;
    if (!allowZero && intVal <= 0) return null;
    if (allowZero && intVal < 0) return null;
    return intVal;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const num = Number(value);
    if (!Number.isFinite(num)) return null;
    const intVal = Math.trunc(num);
    if (!allowZero && intVal <= 0) return null;
    if (allowZero && intVal < 0) return null;
    return intVal;
  }
  return null;
}

function parseOptionalString(value: unknown) {
  if (value == null) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function parseRequiredString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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

function parseTutorAssignments(value: unknown): TutorAssignmentInput[] | null {
  if (!Array.isArray(value)) return null;
  const assignments: TutorAssignmentInput[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const tutorId = parseRequiredString((item as RawPayload).tutorId);
    if (!tutorId) return null;
    const wageAmount = parsePositiveInt((item as RawPayload).wageAmount);
    if (!wageAmount) return null;
    assignments.push({ tutorId, wageAmount });
  }
  return assignments;
}

export function normalizeClassPayload(payload: RawPayload) {
  const name = parseRequiredString(payload.name);
  if (!name) {
    return { error: "クラス名は必須です。" } as const;
  }

  const classTypeRaw = parseRequiredString(payload.classType);
  if (!classTypeSet.has(classTypeRaw)) {
    return { error: "クラス種別が不正です。" } as const;
  }

  const weekdayRaw = parseRequiredString(payload.weekday);
  if (!weekdaySet.has(weekdayRaw)) {
    return { error: "曜日が不正です。" } as const;
  }

  const classRoom = parseRequiredString(payload.classRoom);
  if (!classRoom) {
    return { error: "教室は必須です。" } as const;
  }

  const startsAt = parseOptionalString(payload.startsAt);
  const endsAt = parseOptionalString(payload.endsAt);

  let capacity: number | null = null;
  if (payload.capacity != null && payload.capacity !== "") {
    capacity = parsePositiveInt(payload.capacity, { allowZero: true });
    if (capacity === null) {
      return { error: "定員は 0 以上の数値で入力してください。" } as const;
    }
  }

  const studentUnitFee = parsePositiveInt(payload.studentUnitFee);
  if (!studentUnitFee) {
    return { error: "生徒単価は 1 以上の数値で入力してください。" } as const;
  }

  const studentIds = parseStringArray(payload.studentIds);
  if (!studentIds || studentIds.length === 0) {
    return { error: "生徒を1名以上選択してください。" } as const;
  }

  const tutorAssignments = parseTutorAssignments(payload.tutorAssignments);
  if (!tutorAssignments || tutorAssignments.length === 0) {
    return { error: "講師を1名以上選択し賃金を入力してください。" } as const;
  }

  const data: NormalizedClassPayload = {
    name,
    classType: classTypeRaw as ClassType,
    weekday: weekdayRaw as Weekday,
    classRoom,
    startsAt,
    endsAt,
    capacity,
    studentUnitFee,
    studentIds,
    tutorAssignments,
  };

  return { data } as const;
}

type ClassWithRelations = Class & {
  enrollments: (Enrollment & { student: Student })[];
  teachings: (Teaching & { tutor: Tutor })[];
};

function serializeStudent(enrollment: Enrollment & { student: Student }): ClassStudent {
  return {
    id: enrollment.studentId,
    name: enrollment.student.name,
    grade: enrollment.student.grade,
  };
}

function serializeTutor(teaching: Teaching & { tutor: Tutor }): ClassTutor {
  return {
    id: teaching.tutorId,
    name: teaching.tutor.name,
    subjects: teaching.tutor.subjects,
    wageAmount: teaching.wageAmount,
  };
}

export function serializeClass(cls: ClassWithRelations): ClassDetail {
  return {
    id: cls.id,
    name: cls.name,
    classType: cls.classType,
    weekday: cls.weekday,
    classRoom: cls.classRoom,
    startsAt: cls.startsAt ?? null,
    endsAt: cls.endsAt ?? null,
    capacity: cls.capacity,
    status: cls.status,
    studentUnitFee: cls.studentUnitFee,
    students: cls.enrollments.map(serializeStudent),
    tutors: cls.teachings.map(serializeTutor),
    createdAt: cls.createdAt instanceof Date ? cls.createdAt.toISOString() : String(cls.createdAt),
    updatedAt: cls.updatedAt instanceof Date ? cls.updatedAt.toISOString() : String(cls.updatedAt),
  };
}

export function isUniqueClassConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export function isRecordNotFound(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

export const classInclude = {
  enrollments: {
    include: { student: true },
    orderBy: { student: { name: "asc" } },
  },
  teachings: {
    include: { tutor: true },
    orderBy: { tutor: { name: "asc" } },
  },
} as const;

// スキーマ準拠のモックデータ + フロント用VM生成

// ====== 型（必要に応じて @prisma/client の enum を使って置き換えてOK） ======
export type Weekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";
export type ClassType = "ENGLISH" | "INDIVIDUAL" | "INTERACTIVE" | "JAPANESE";
export type Status = "ACTIVE" | "INACTIVE" | "GRADUATED";
export type EnrollmentStatus = "ACTIVE" | "PAUSED";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "EXCUSED";
export type StaffRole = "TUTOR" | "OPERATION";
export type SessionStatus = "HELD" | "CANCELED" | "MAKEUP";
export type WageUnit = "PER_SESSION" | "PER_HOUR";
export type Subject = "ENGLISH" | "MATH" | "SCIENCE" | "JAPANESE" | "HISTORY";

// ====== IDヘルパ（見やすい固定IDにしてます） ======
const sid = (n: number) => `S${n}`; // Student.id
const tid = (n: number) => `T${n}`; // Tutor.id
const cid = (n: number) => `C${n}`; // Class.id
const sess = (c: number, n: number) => `CS${c}-${n}`; // ClassSession.id

// ====== Students ======
export const students = [
  {
    id: sid(1),
    name: "alice",
    grade: 2,
    generation: 2025,
    report: null,
    status: "ACTIVE" as Status,
  },
  { id: sid(2), name: "bob", grade: 2, generation: 2025, report: null, status: "ACTIVE" as Status },
  {
    id: sid(3),
    name: "chris",
    grade: 3,
    generation: 2024,
    report: null,
    status: "ACTIVE" as Status,
  },
  {
    id: sid(4),
    name: "diana",
    grade: 1,
    generation: 2026,
    report: null,
    status: "ACTIVE" as Status,
  },
  {
    id: sid(5),
    name: "erika",
    grade: 5,
    generation: 2023,
    report: null,
    status: "ACTIVE" as Status,
  },
  {
    id: sid(6),
    name: "fumi",
    grade: 5,
    generation: 2023,
    report: null,
    status: "INACTIVE" as Status,
  },
  { id: sid(7), name: "gen", grade: 5, generation: 2023, report: null, status: "ACTIVE" as Status },
  {
    id: sid(8),
    name: "haru",
    grade: 6,
    generation: 2022,
    report: null,
    status: "ACTIVE" as Status,
  },
];

// ====== Tutors ======
export const tutors = [
  {
    id: tid(1),
    name: "田中",
    needsPickup: false,
    subjects: ["ENGLISH" as Subject],
    email: "tanaka@example.com",
  },
  {
    id: tid(2),
    name: "佐藤",
    needsPickup: false,
    subjects: ["ENGLISH" as Subject],
    email: "sato@example.com",
  },
  {
    id: tid(3),
    name: "山本",
    needsPickup: false,
    subjects: ["MATH" as Subject],
    email: "yamamoto@example.com",
  },
  {
    id: tid(4),
    name: "小林",
    needsPickup: true,
    subjects: ["JAPANESE" as Subject],
    email: "kobayashi@example.com",
  },
];

// ====== Classes ======
export const classes = [
  {
    id: cid(1),
    name: "英検対策",
    classType: "ENGLISH" as ClassType,
    weekday: "MONDAY" as Weekday,
    classRoom: "A-101",
    studentUnitFee: 2500,
    startsAt: "18:00",
    endsAt: "19:30",
    capacity: 12,
    status: "ACTIVE" as Status,
  },
  {
    id: cid(2),
    name: "TOEIC対策",
    classType: "ENGLISH" as ClassType,
    weekday: "MONDAY" as Weekday,
    classRoom: "B-203",
    studentUnitFee: 3000,
    startsAt: "19:00",
    endsAt: "20:30",
    capacity: 10,
    status: "ACTIVE" as Status,
  },
  {
    id: cid(3),
    name: "個別指導",
    classType: "INDIVIDUAL" as ClassType,
    weekday: "TUESDAY" as Weekday,
    classRoom: "C-110",
    studentUnitFee: 4000,
    startsAt: "17:00",
    endsAt: "18:00",
    capacity: 4,
    status: "ACTIVE" as Status,
  },
];

// ====== Teaching（講師アサイン：クラス×講師、単価・単位付き） ======
export const teachings = [
  {
    tutorId: tid(1),
    classId: cid(1),
    assignedAt: new Date(),
    wageUnit: "PER_SESSION" as WageUnit,
    wageAmount: 3000,
  },
  {
    tutorId: tid(2),
    classId: cid(1),
    assignedAt: new Date(),
    wageUnit: "PER_SESSION" as WageUnit,
    wageAmount: 1500,
  },
  {
    tutorId: tid(3),
    classId: cid(2),
    assignedAt: new Date(),
    wageUnit: "PER_SESSION" as WageUnit,
    wageAmount: 3500,
  },
  {
    tutorId: tid(4),
    classId: cid(3),
    assignedAt: new Date(),
    wageUnit: "PER_HOUR" as WageUnit,
    wageAmount: 2500,
  }, // 個別は時給例
];

// ====== Enrollment（在籍：クラス×生徒、個別単価の上書きも可） ======
export const enrollments = [
  {
    studentId: sid(1),
    classId: cid(1),
    joinedAt: new Date("2025-04-01"),
    status: "ACTIVE" as EnrollmentStatus,
    note: null,
  },
  {
    studentId: sid(2),
    classId: cid(1),
    joinedAt: new Date("2025-04-01"),
    status: "ACTIVE" as EnrollmentStatus,
    note: "兄弟割",
  },
  {
    studentId: sid(3),
    classId: cid(1),
    joinedAt: new Date("2025-05-01"),
    status: "ACTIVE" as EnrollmentStatus,
    note: null,
  },
  {
    studentId: sid(4),
    classId: cid(1),
    joinedAt: new Date("2025-06-01"),
    status: "PAUSED" as EnrollmentStatus,
    note: "夏のみ休会",
  },

  {
    studentId: sid(5),
    classId: cid(2),
    joinedAt: new Date("2025-04-01"),
    status: "ACTIVE" as EnrollmentStatus,
    note: null,
  },
  {
    studentId: sid(6),
    classId: cid(2),
    joinedAt: new Date("2025-04-01"),
    status: "PAUSED" as EnrollmentStatus,
    note: null,
  },
  {
    studentId: sid(7),
    classId: cid(2),
    joinedAt: new Date("2025-05-01"),
    status: "ACTIVE" as EnrollmentStatus,
    note: null,
  },

  {
    studentId: sid(8),
    classId: cid(3),
    joinedAt: new Date("2025-04-01"),
    status: "ACTIVE" as EnrollmentStatus,
    note: null,
  },
];

// ====== ClassSession（授業回） ======
export const classSessions = [
  // C1: 2回
  {
    id: sess(1, 1),
    classId: cid(1),
    date: new Date("2025-10-07"),
    status: "HELD" as SessionStatus,
    startAt: null,
    endAt: null,
    note: null,
  },
  {
    id: sess(1, 2),
    classId: cid(1),
    date: new Date("2025-10-14"),
    status: "HELD" as SessionStatus,
    startAt: null,
    endAt: null,
    note: null,
  },
  // C2: 2回（1回は振替）
  {
    id: sess(2, 1),
    classId: cid(2),
    date: new Date("2025-10-07"),
    status: "HELD" as SessionStatus,
    startAt: null,
    endAt: null,
    note: null,
  },
  {
    id: sess(2, 2),
    classId: cid(2),
    date: new Date("2025-10-21"),
    status: "MAKEUP" as SessionStatus,
    startAt: null,
    endAt: null,
    note: "台風振替",
  },
  // C3: 1回
  {
    id: sess(3, 1),
    classId: cid(3),
    date: new Date("2025-10-08"),
    status: "HELD" as SessionStatus,
    startAt: null,
    endAt: null,
    note: null,
  },
];

// ====== Attendance（出席：Enrollment × Session） ======
export const attendance = [
  // C1-#1
  {
    studentId: sid(1),
    classId: cid(1),
    sessionId: sess(1, 1),
    status: "PRESENT" as AttendanceStatus,
    note: null,
  },
  {
    studentId: sid(2),
    classId: cid(1),
    sessionId: sess(1, 1),
    status: "PRESENT" as AttendanceStatus,
    note: null,
  },
  {
    studentId: sid(3),
    classId: cid(1),
    sessionId: sess(1, 1),
    status: "ABSENT" as AttendanceStatus,
    note: "体調不良",
  },
  // C1-#2
  {
    studentId: sid(1),
    classId: cid(1),
    sessionId: sess(1, 2),
    status: "PRESENT" as AttendanceStatus,
    note: null,
  },
  {
    studentId: sid(2),
    classId: cid(1),
    sessionId: sess(1, 2),
    status: "EXCUSED" as AttendanceStatus,
    note: "公欠（検定）",
  },
  {
    studentId: sid(3),
    classId: cid(1),
    sessionId: sess(1, 2),
    status: "PRESENT" as AttendanceStatus,
    note: null,
  },

  // C2-#1
  {
    studentId: sid(5),
    classId: cid(2),
    sessionId: sess(2, 1),
    status: "PRESENT" as AttendanceStatus,
    note: null,
  },
  {
    studentId: sid(7),
    classId: cid(2),
    sessionId: sess(2, 1),
    status: "PRESENT" as AttendanceStatus,
    note: null,
  },
  // C2-#2 (MAKEUP) → 課金に含める/除外はルール次第
  {
    studentId: sid(5),
    classId: cid(2),
    sessionId: sess(2, 2),
    status: "PRESENT" as AttendanceStatus,
    note: null,
  },
  {
    studentId: sid(7),
    classId: cid(2),
    sessionId: sess(2, 2),
    status: "ABSENT" as AttendanceStatus,
    note: null,
  },

  // C3-#1
  {
    studentId: sid(8),
    classId: cid(3),
    sessionId: sess(3, 1),
    status: "PRESENT" as AttendanceStatus,
    note: null,
  },
];

// ====== WorkLog（出勤：Tutor × (Session)） ======
export const workLogs = [
  // C1-#1/#2 田中(LEAD) 佐藤(ASSISTANT)
  {
    id: "W1",
    tutorId: tid(1),
    date: new Date("2025-10-07"),
    minutes: 90,
    role: "TUTOR" as StaffRole,
    classId: cid(1),
    sessionId: sess(1, 1),
    startAt: null,
    endAt: null,
  },
  {
    id: "W2",
    tutorId: tid(2),
    date: new Date("2025-10-07"),
    minutes: 90,
    role: "TUTOR" as StaffRole,
    classId: cid(1),
    sessionId: sess(1, 1),
    startAt: null,
    endAt: null,
  },
  {
    id: "W3",
    tutorId: tid(1),
    date: new Date("2025-10-14"),
    minutes: 90,
    role: "TUTOR" as StaffRole,
    classId: cid(1),
    sessionId: sess(1, 2),
    startAt: null,
    endAt: null,
  },
  {
    id: "W4",
    tutorId: tid(2),
    date: new Date("2025-10-14"),
    minutes: 90,
    role: "TUTOR" as StaffRole,
    classId: cid(1),
    sessionId: sess(1, 2),
    startAt: null,
    endAt: null,
  },

  // C2-#1/#2 山本(LEAD)
  {
    id: "W5",
    tutorId: tid(3),
    date: new Date("2025-10-07"),
    minutes: 90,
    role: "TUTOR" as StaffRole,
    classId: cid(2),
    sessionId: sess(2, 1),
    startAt: null,
    endAt: null,
  },
  {
    id: "W6",
    tutorId: tid(3),
    date: new Date("2025-10-21"),
    minutes: 90,
    role: "TUTOR" as StaffRole,
    classId: cid(2),
    sessionId: sess(2, 2),
    startAt: null,
    endAt: null,
  },

  // C3-#1 小林(時給)
  {
    id: "W7",
    tutorId: tid(4),
    date: new Date("2025-10-08"),
    minutes: 60,
    role: "TUTOR" as StaffRole,
    classId: cid(3),
    sessionId: sess(3, 1),
    startAt: null,
    endAt: null,
  },

  // 運営（クラス無し）
  {
    id: "W8",
    tutorId: tid(2),
    date: new Date("2025-10-10"),
    minutes: 240,
    role: "OPERATION" as StaffRole,
    classId: null,
    sessionId: null,
    startAt: null,
    endAt: null,
  },
];

// ====== フロント用 ViewModel（ClassesTable でそのまま使える形） ======
export type TutorRef = { id: string; name: string };
export type StudentRef = { id: string; name: string; grade: number };
export type ClassVM = {
  id: string;
  name: string;
  classType: ClassType;
  weekday: Weekday;
  classRoom: string;
  studentUnitFee: number;
  capacity: number | null;
  status: Status;
  startsAt: string | null;
  endsAt: string | null;
  tutors: TutorRef[];
  students: StudentRef[];
};

export function buildClassVMs(): ClassVM[] {
  // teaching → tutors map
  const tutorMap = new Map(tutors.map((t) => [t.id, t]));
  const classToTutors = new Map<string, TutorRef[]>();
  teachings.forEach((t) => {
    const arr = classToTutors.get(t.classId) ?? [];
    const tu = tutorMap.get(t.tutorId)!;
    arr.push({ id: tu.id, name: tu.name });
    classToTutors.set(t.classId, arr);
  });

  // enrollment → students map
  const studentMap = new Map(students.map((s) => [s.id, s]));
  const classToStudents = new Map<string, StudentRef[]>();
  enrollments
    .filter((e) => e.status === "ACTIVE")
    .forEach((e) => {
      const arr = classToStudents.get(e.classId) ?? [];
      const st = studentMap.get(e.studentId)!;
      arr.push({ id: st.id, name: st.name, grade: st.grade });
      classToStudents.set(e.classId, arr);
    });

  return classes.map((c) => ({
    id: c.id,
    name: c.name,
    classType: c.classType,
    weekday: c.weekday,
    classRoom: c.classRoom,
    studentUnitFee: c.studentUnitFee,
    capacity: c.capacity ?? null,
    status: c.status,
    startsAt: c.startsAt ?? null,
    endsAt: c.endsAt ?? null,
    tutors: classToTutors.get(c.id) ?? [],
    students: classToStudents.get(c.id) ?? [],
  }));
}

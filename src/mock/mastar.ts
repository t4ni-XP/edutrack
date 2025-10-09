// mock/buildPeopleVMs.ts
// 「newSchemaMocks.ts（= あなたの mock）」から Students/Tutors 一覧用の配列を作る

import {
  students,
  tutors,
  enrollments,
  teachings,
  classSessions,
  attendance,
  workLogs,
} from "@/mock/mock";

// ==== 型（UI向けの軽量行データ） ====
export type StudentRow = {
  id: string;
  name: string;
  grade: number;
  status: "ACTIVE" | "INACTIVE" | "GRADUATED";
  classCount: number;           // 在籍クラス数（ACTIVEのみ）
  billableCount: number;        // 請求対象回数（期間内）
  presentCount: number;         // 出席回数（期間内）
  absentCount: number;          // 欠席回数（期間内）
};

export type TutorRow = {
  id: string;
  name: string;
  email: string;
  needsPickup: boolean;
  subjects: string[];
  classCount: number;           // 担当クラス数
  sessionsWorked: number;       // 担当した授業回数（期間内）
  minutesWorked: number;        // 授業での勤務分（期間内）
  opMinutes: number;            // 運営のみの勤務分（期間内）
};

// ==== 期間ユーティリティ ====
function monthRange(d = new Date()) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return { start, end };
}

function inRange(dt: Date, start: Date, end: Date) {
  return dt >= start && dt < end;
}

// ==== 生徒一覧を作る ====
// by: "session" = 開催回課金（開催された回数を学生の所属クラスで数える）
//     "attendance" = 出席課金（PRESENTのみ数える）
export function buildStudentsRows(opts?: {
  by?: "session" | "attendance";
  start?: Date;
  end?: Date;
}): StudentRow[] {
  const by = opts?.by ?? "session";
  const { start, end } = opts?.start && opts?.end ? { start: opts.start, end: opts.end } : monthRange();

  // 今月の HELD セッション
  const sessionsInRange = classSessions.filter(
    (cs) => cs.status === "HELD" && inRange(cs.date, start, end)
  );
  const sessionsByClass = new Map<string, string[]>();
  const sessionsInRangeSet = new Set<string>();
  sessionsInRange.forEach((cs) => {
    const arr = sessionsByClass.get(cs.classId) ?? [];
    arr.push(cs.id);
    sessionsByClass.set(cs.classId, arr);
    sessionsInRangeSet.add(cs.id);
  });

  // 出席（期間内）
  const attendanceInRange = attendance.filter((a) =>
    sessionsInRangeSet.has(a.sessionId)
  );

  // 学生ごとに集計
  return students.map((st) => {
    // ACTIVE 在籍のみ集計対象にする（必要に応じて変えてOK）
    const myEnrolls = enrollments.filter(
      (e) => e.studentId === st.id && e.status === "ACTIVE"
    );
    const classIds = myEnrolls.map((e) => e.classId);
    const classIdSet = new Set(classIds);
    const classCount = classIds.length;

    // 出席カウント
    const myAttendance = attendanceInRange.filter(
      (a) => a.studentId === st.id && classIdSet.has(a.classId)
    );

    const presentCount = myAttendance.filter((a) => a.status === "PRESENT").length;
    const absentCount  = myAttendance.filter((a) => a.status === "ABSENT").length;

    // 請求回数
    let billableCount = 0;
    if (by === "attendance") {
      billableCount = presentCount;
    } else {
      // session課金：所属クラスの HELD 回数合計
      billableCount = classIds.reduce((sum, cid) => sum + (sessionsByClass.get(cid)?.length ?? 0), 0);
    }

    return {
      id: st.id,
      name: st.name,
      grade: st.grade,
      status: st.status as StudentRow["status"],
      classCount,
      billableCount,
      presentCount,
      absentCount,
    };
  });
}

// ==== 講師一覧を作る ====
export function buildTutorsRows(opts?: { start?: Date; end?: Date }): TutorRow[] {
  const { start, end } = opts?.start && opts?.end ? { start: opts.start, end: opts.end } : monthRange();

  // 担当クラス
  const classesByTutor = new Map<string, Set<string>>();
  teachings.forEach((t) => {
    const s = classesByTutor.get(t.tutorId) ?? new Set<string>();
    s.add(t.classId);
    classesByTutor.set(t.tutorId, s);
  });

  // 期間内の WorkLog
  const logsInRange = workLogs.filter((w) => inRange(w.date, start, end));

  return tutors.map((tu) => {
    const classCount = classesByTutor.get(tu.id)?.size ?? 0;

    // 授業担当のログ（sessionId がある・role=TUTOR）
    const teachLogs = logsInRange.filter((w) => w.tutorId === tu.id && w.sessionId && w.role === "TUTOR");
    const sessionsWorked = teachLogs.length;
    const minutesWorked = teachLogs.reduce((sum, w) => sum + (w.minutes ?? 0), 0);

    // 運営業務
    const opsLogs = logsInRange.filter((w) => w.tutorId === tu.id && w.role === "OPERATION");
    const opMinutes = opsLogs.reduce((sum, w) => sum + (w.minutes ?? 0), 0);

    return {
      id: tu.id,
      name: tu.name,
      needsPickup: tu.needsPickup,
      email: tu.email,
      subjects: tu.subjects,
      classCount,
      sessionsWorked,
      minutesWorked,
      opMinutes,
    };
  });
}

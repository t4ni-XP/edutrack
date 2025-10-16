"use client";
import { useMemo, useState, type ChangeEvent } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  Typography,
} from "@mui/material";
import type {
  AttendanceClassData,
  AttendanceStaffTutor,
  AttendanceStudentStatus,
} from "./types";
import type { AttendanceStatus } from "@/generated/prisma";

const statusOptions: Array<{ value: AttendanceStatus; label: string }> = [
  { value: "PRESENT", label: "出席" },
  { value: "ABSENT", label: "欠席" },
  { value: "EXCUSED", label: "公欠" },
];

type Props = {
  dateIso: string;
  classes: AttendanceClassData[];
  staffTutors: AttendanceStaffTutor[];
};

type ClassState = AttendanceClassData;

type PendingMap = Record<string, boolean>;

export default function AttendancePageClient({ dateIso, classes, staffTutors }: Props) {
  const [classState, setClassState] = useState<ClassState[]>(classes);
  const [pending, setPending] = useState<PendingMap>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  const handleStatusChange = async (
    classId: string,
    studentId: string,
    targetStatus: AttendanceStudentStatus,
  ) => {
    const key = `${classId}:${studentId}`;
    setPending((prev) => ({ ...prev, [key]: true }));
    setMessage(null);

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, studentId, status: targetStatus, date: dateIso }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const text = payload?.message ?? "出席情報の更新に失敗しました。";
        throw new Error(text);
      }

      const payload = await res.json();
      const nextStatus: AttendanceStudentStatus = payload.status ?? "NONE";
      const sessionId: string | null = payload.sessionId ?? null;

      setClassState((prev) =>
        prev.map((cls) => {
          if (cls.id !== classId) return cls;
          return {
            ...cls,
            sessionId: sessionId ?? cls.sessionId,
            students: cls.students.map((student) =>
              student.id === studentId ? { ...student, status: nextStatus } : student,
            ),
          };
        }),
      );
      setMessage({ type: "success", text: "出席情報を更新しました。" });
    } catch (error) {
      const text = error instanceof Error ? error.message : "処理に失敗しました。";
      setMessage({ type: "error", text });
    } finally {
      setPending((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const isPending = (classId: string, studentId: string) => !!pending[`${classId}:${studentId}`];

  const staffTutorList = useMemo(() => staffTutors, [staffTutors]);

  return (
    <Stack spacing={3}>
      {message && (
        <Alert severity={message.type} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {classState.length === 0 ? (
        <Typography variant="body1">本日のクラスはありません。</Typography>
      ) : (
        classState.map((cls) => {
          const tutorsForClass = [...cls.tutors];
          staffTutorList.forEach((staff) => {
            if (!tutorsForClass.some((t) => t.id === staff.id)) {
              tutorsForClass.push(staff);
            }
          });

          return (
            <Card key={cls.id} variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {cls.name}
                  {cls.startsAt && (
                    <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                      ({cls.startsAt}
                      {cls.endsAt ? ` - ${cls.endsAt}` : ""})
                    </Typography>
                  )}
                </Typography>

                <Stack spacing={2}>
                  {tutorsForClass.map((tutor) => (
                    <Box key={`${cls.id}-${tutor.id}`}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        {tutor.name} ({tutor.role})
                      </Typography>
                      <Stack spacing={1}>
                        {cls.students.map((student) => (
                          <AttendanceRow
                            key={student.id}
                            classId={cls.id}
                            studentId={student.id}
                            name={student.name}
                            grade={student.grade}
                            status={student.status}
                            pending={isPending(cls.id, student.id)}
                            onChange={handleStatusChange}
                          />
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          );
        })
      )}
    </Stack>
  );
}

type AttendanceRowProps = {
  classId: string;
  studentId: string;
  name: string;
  grade: number;
  status: AttendanceStudentStatus;
  pending: boolean;
  onChange: (classId: string, studentId: string, status: AttendanceStudentStatus) => void;
};

function AttendanceRow({ classId, studentId, name, grade, status, pending, onChange }: AttendanceRowProps) {
  const handleCheckboxChange = (value: AttendanceStatus) =>
    (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
      const nextStatus: AttendanceStudentStatus = checked
        ? value
        : status === value
        ? "NONE"
        : status;
      if (nextStatus !== status) {
        onChange(classId, studentId, nextStatus);
      }
    };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Typography sx={{ minWidth: 160 }}>{`${name}（${grade}年）`}</Typography>
      {statusOptions.map((option) => (
        <FormControlLabel
          key={option.value}
          control={
            <Checkbox
              checked={status === option.value}
              onChange={handleCheckboxChange(option.value)}
              disabled={pending}
            />
          }
          label={option.label}
        />
      ))}
      {pending && <CircularProgress size={20} />}
    </Stack>
  );
}

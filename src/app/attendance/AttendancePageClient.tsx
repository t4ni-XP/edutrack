"use client";
import { useState, type ChangeEvent } from "react";
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
import type { AttendanceStudentRow, AttendanceStudentStatus, AttendanceTutorRow } from "./types";
import type { AttendanceStatus } from "@/generated/prisma";

const studentStatusOptions: Array<{ value: AttendanceStatus; label: string }> = [
  { value: "PRESENT", label: "出席" },
  { value: "ABSENT", label: "欠席" },
  { value: "EXCUSED", label: "公欠" },
];

const tutorStatusOptions: Array<{ value: AttendanceStatus; label: string }> = [
  { value: "PRESENT", label: "出席" },
  { value: "ABSENT", label: "欠席" },
];

type Props = {
  dateIso: string;
  students: AttendanceStudentRow[];
  tutors: AttendanceTutorRow[];
};

export default function AttendancePageClient({ dateIso, students, tutors }: Props) {
  const [studentRows, setStudentRows] = useState(students);
  const [tutorRows, setTutorRows] = useState(tutors);
  const [pendingMap, setPendingMap] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const setPending = (key: string, value: boolean) => {
    setPendingMap((prev) => ({ ...prev, [key]: value }));
  };

  const handleStudentChange = async (
    row: AttendanceStudentRow,
    status: AttendanceStudentStatus,
  ) => {
    const key = `student:${row.classId}:${row.studentId}`;
    const previous = row.status;
    setPending(key, true);
    setMessage(null);
    setStudentRows((prev) =>
      prev.map((item) =>
        item.classId === row.classId && item.studentId === row.studentId
          ? { ...item, status }
          : item,
      ),
    );

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "student",
          classId: row.classId,
          studentId: row.studentId,
          status,
          date: dateIso,
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const text = payload?.message ?? "出席情報の更新に失敗しました。";
        throw new Error(text);
      }
      const payload = await res.json();
      const nextStatus: AttendanceStudentStatus = payload.status ?? "NONE";
      setStudentRows((prev) =>
        prev.map((item) =>
          item.classId === row.classId && item.studentId === row.studentId
            ? { ...item, status: nextStatus, sessionId: payload.sessionId ?? item.sessionId }
            : item,
        ),
      );
      setMessage({ type: "success", text: "出席情報を更新しました。" });
    } catch (error) {
      const text = error instanceof Error ? error.message : "処理に失敗しました。";
      setStudentRows((prev) =>
        prev.map((item) =>
          item.classId === row.classId && item.studentId === row.studentId
            ? { ...item, status: previous }
            : item,
        ),
      );
      setMessage({ type: "error", text });
    } finally {
      setPending(key, false);
    }
  };

  const handleTutorChange = async (row: AttendanceTutorRow, status: "PRESENT" | "ABSENT") => {
    const key = `tutor:${row.tutorId}:${row.classId ?? "staff"}`;
    const previous = row.status;
    setPending(key, true);
    setMessage(null);
    setTutorRows((prev) =>
      prev.map((item) =>
        item.tutorId === row.tutorId && item.classId === row.classId ? { ...item, status } : item,
      ),
    );

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "tutor",
          tutorId: row.tutorId,
          classId: row.classId,
          status,
          date: dateIso,
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const text = payload?.message ?? "出席情報の更新に失敗しました。";
        throw new Error(text);
      }
      const payload = await res.json();
      const nextStatus: "PRESENT" | "ABSENT" = payload.status === "PRESENT" ? "PRESENT" : "ABSENT";
      setTutorRows((prev) =>
        prev.map((item) =>
          item.tutorId === row.tutorId && item.classId === row.classId
            ? { ...item, status: nextStatus, sessionId: payload.sessionId ?? item.sessionId }
            : item,
        ),
      );
      setMessage({ type: "success", text: "出席情報を更新しました。" });
    } catch (error) {
      const text = error instanceof Error ? error.message : "処理に失敗しました。";
      setTutorRows((prev) =>
        prev.map((item) =>
          item.tutorId === row.tutorId && item.classId === row.classId
            ? { ...item, status: previous }
            : item,
        ),
      );
      setMessage({ type: "error", text });
    } finally {
      setPending(key, false);
    }
  };

  const isPending = (key: string) => !!pendingMap[key];

  return (
    <Stack spacing={3}>
      {message && (
        <Alert severity={message.type} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            講師
          </Typography>
          <Stack spacing={2}>
            {tutorRows.map((row) => {
              const key = `tutor:${row.tutorId}:${row.classId ?? "staff"}`;
              return (
                <Box key={key}>
                  <Typography variant="subtitle1">
                    {row.tutorName}
                    {row.className ? `／${row.className}` : "／スタッフ"}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {tutorStatusOptions.map((option) => (
                      <FormControlLabel
                        key={`${key}-${option.value}`}
                        control={
                          <Checkbox
                            checked={row.status === option.value}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                              const next = event.target.checked
                                ? option.value
                                : option.value === "PRESENT"
                                  ? "ABSENT"
                                  : "PRESENT";
                              if (next !== row.status) {
                                handleTutorChange(row, next as "PRESENT" | "ABSENT");
                              }
                            }}
                            disabled={isPending(key)}
                          />
                        }
                        label={option.label}
                      />
                    ))}
                    {isPending(key) && <CircularProgress size={18} />}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            生徒
          </Typography>
          <Stack spacing={2}>
            {studentRows.map((row) => {
              const key = `student:${row.classId}:${row.studentId}`;
              return (
                <Box key={key}>
                  <Typography variant="subtitle1">
                    {row.studentName}（{row.grade}年）／{row.className}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {studentStatusOptions.map((option) => (
                      <FormControlLabel
                        key={`${key}-${option.value}`}
                        control={
                          <Checkbox
                            checked={row.status === option.value}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                              const nextStatus: AttendanceStudentStatus = event.target.checked
                                ? option.value
                                : row.status === option.value
                                  ? "NONE"
                                  : row.status;
                              if (nextStatus !== row.status) {
                                handleStudentChange(row, nextStatus);
                              }
                            }}
                            disabled={isPending(key)}
                          />
                        }
                        label={option.label}
                      />
                    ))}
                    {isPending(key) && <CircularProgress size={18} />}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

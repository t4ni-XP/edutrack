"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Stack } from "@mui/material";
import StudentsTable from "@/app/_components/tables/StudentsTable";
import PrimaryButton from "@/app/_components/ui/PrimaryButton";
import StudentModal, { type StudentPayload } from "./StudentModal";
import type { StudentListRow } from "./types";

interface StudentsPageClientProps {
  initialRows: StudentListRow[];
}

type ModalState = { type: "create" } | { type: "detail"; student: StudentListRow };

export default function StudentsPageClient({ initialRows }: StudentsPageClientProps) {
  const [rows, setRows] = useState<StudentListRow[]>(initialRows);
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [globalMessage, setGlobalMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const refreshRows = useCallback(async () => {
    try {
      const res = await fetch("/api/students", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to fetch students: ${res.status}`);
      const data = (await res.json()) as StudentListRow[];
      setRows(data);
      return data;
    } catch (error) {
      console.error(error);
      setGlobalMessage({ type: "error", text: "生徒情報の再取得に失敗しました。" });
      return null;
    }
  }, []);

  const handleRowClick = (row: StudentListRow) => {
    setModalState({ type: "detail", student: row });
  };

  const handleCreateStudent = useCallback(
    async (payload: StudentPayload) => {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => null);
        const message =
          result?.message ?? "登録に失敗しました。時間をおいてから再度お試しください。";
        throw new Error(message);
      }
      await refreshRows();
      setGlobalMessage({ type: "success", text: "生徒を登録しました。" });
    },
    [refreshRows],
  );

  const handleUpdateStudent = useCallback(
    async (id: string, payload: StudentPayload) => {
      const res = await fetch(`/api/students/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => null);
        const message =
          result?.message ?? "更新に失敗しました。時間をおいてから再度お試しください。";
        throw new Error(message);
      }
      const updated = (await res.json()) as StudentListRow;
      const latest = await refreshRows();
      const next = latest?.find((row) => row.id === id) ?? updated;
      setModalState((prev) => {
        if (!prev || prev.type !== "detail" || prev.student.id !== id) return prev;
        return { type: "detail", student: next };
      });
      setGlobalMessage({ type: "success", text: "生徒情報を更新しました。" });
      return next;
    },
    [refreshRows],
  );

  const modalProps = useMemo(() => {
    if (!modalState) return null;
    if (modalState.type === "create") {
      return {
        mode: "create" as const,
        student: undefined,
        onCreate: handleCreateStudent,
      };
    }
    return {
      mode: "detail" as const,
      student: modalState.student,
      onUpdate: handleUpdateStudent,
    };
  }, [modalState, handleCreateStudent, handleUpdateStudent]);

  return (
    <Box p={4}>
      <Stack spacing={2}>
        {globalMessage && (
          <Alert severity={globalMessage.type} onClose={() => setGlobalMessage(null)}>
            {globalMessage.text}
          </Alert>
        )}
        <StudentsTable rows={rows} onRowClick={handleRowClick} />

        <Box display="flex" justifyContent="flex-end">
          <PrimaryButton label="生徒を追加" onClick={() => setModalState({ type: "create" })} />
        </Box>
        {modalState && modalProps && (
          <StudentModal
            open
            mode={modalProps.mode}
            student={modalProps.student}
            onClose={() => setModalState(null)}
            onCreate={modalProps.mode === "create" ? modalProps.onCreate : undefined}
            onUpdate={modalProps.mode === "detail" ? modalProps.onUpdate : undefined}
          />
        )}
      </Stack>
    </Box>
  );
}

"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Stack } from "@mui/material";
import TutorsTable from "@/app/_components/tables/TutorsTable";
import PrimaryButton from "@/app/_components/ui/PrimaryButton";
import TutorModal, { type TutorPayload } from "./TutorModal";
import type { TutorListRow } from "./types";

interface TutorsPageClientProps {
  initialRows: TutorListRow[];
}

type ModalState = { type: "create" } | { type: "detail"; tutor: TutorListRow };

export default function TutorsPageClient({ initialRows }: TutorsPageClientProps) {
  const [rows, setRows] = useState<TutorListRow[]>(initialRows);
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
      const res = await fetch("/api/tutors", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to fetch tutors: ${res.status}`);
      const data = (await res.json()) as TutorListRow[];
      setRows(data);
      return data;
    } catch (error) {
      console.error(error);
      setGlobalMessage({ type: "error", text: "講師情報の再取得に失敗しました。" });
      return null;
    }
  }, []);

  const handleCreateTutor = useCallback(
    async (payload: TutorPayload) => {
      const res = await fetch("/api/tutors", {
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
      setGlobalMessage({ type: "success", text: "講師を登録しました。" });
    },
    [refreshRows],
  );

  const handleUpdateTutor = useCallback(
    async (id: string, payload: TutorPayload) => {
      const res = await fetch(`/api/tutors/${id}`, {
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
      const updated = (await res.json()) as TutorListRow;
      const latest = await refreshRows();
      const next = latest?.find((row) => row.id === id) ?? updated;
      setModalState((prev) => {
        if (!prev || prev.type !== "detail" || prev.tutor.id !== id) return prev;
        return { type: "detail", tutor: next };
      });
      setGlobalMessage({ type: "success", text: "講師情報を更新しました。" });
      return next;
    },
    [refreshRows],
  );

  const handleRowClick = (row: TutorListRow) => {
    setModalState({ type: "detail", tutor: row });
  };

  const modalProps = useMemo(() => {
    if (!modalState) return null;
    if (modalState.type === "create") {
      return {
        mode: "create" as const,
        tutor: undefined,
        onCreate: handleCreateTutor,
      };
    }
    return {
      mode: "detail" as const,
      tutor: modalState.tutor,
      onUpdate: handleUpdateTutor,
    };
  }, [modalState, handleCreateTutor, handleUpdateTutor]);

  return (
    <Box p={4}>
      <Stack spacing={2}>
        {globalMessage && (
          <Alert severity={globalMessage.type} onClose={() => setGlobalMessage(null)}>
            {globalMessage.text}
          </Alert>
        )}
        <TutorsTable rows={rows} onRowClick={handleRowClick} />

        <Box display="flex" justifyContent="flex-end">
          <PrimaryButton label="講師を追加" onClick={() => setModalState({ type: "create" })} />
        </Box>
        {modalState && modalProps && (
          <TutorModal
            open
            mode={modalProps.mode}
            tutor={modalProps.tutor}
            onClose={() => setModalState(null)}
            onCreate={modalProps.mode === "create" ? modalProps.onCreate : undefined}
            onUpdate={modalProps.mode === "detail" ? modalProps.onUpdate : undefined}
          />
        )}
      </Stack>
    </Box>
  );
}

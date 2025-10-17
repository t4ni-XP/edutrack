"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Stack } from "@mui/material";
import ClassTable, { type ClassTableRow } from "@/app/_components/ClassTable";
import PrimaryButton from "@/app/_components/ui/PrimaryButton";
import ClassModal, {
  type ClassPayload,
  type ClassStudentOption,
  type ClassTutorOption,
} from "./ClassModal";
import type { ClassDetail } from "./types";

interface ClassesPageClientProps {
  initialClasses: ClassDetail[];
  students: ClassStudentOption[];
  tutors: ClassTutorOption[];
  classTypes: string[];
  weekdays: string[];
}

type ModalState = { type: "create" } | { type: "detail"; classData: ClassDetail };

const weekdayLabels: Record<string, string> = {
  MONDAY: "月",
  TUESDAY: "火",
  WEDNESDAY: "水",
  THURSDAY: "木",
  FRIDAY: "金",
  SATURDAY: "土",
  SUNDAY: "日",
};

export default function ClassesPageClient({
  initialClasses,
  students,
  tutors,
  classTypes,
  weekdays,
}: ClassesPageClientProps) {
  const [classes, setClasses] = useState<ClassDetail[]>(initialClasses);
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [globalMessage, setGlobalMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    setClasses(initialClasses);
  }, [initialClasses]);

  const refreshClasses = useCallback(async () => {
    try {
      const res = await fetch("/api/classes", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to fetch classes: ${res.status}`);
      const data = (await res.json()) as ClassDetail[];
      setClasses(data);
      return data;
    } catch (error) {
      console.error(error);
      setGlobalMessage({ type: "error", text: "クラス情報の再取得に失敗しました。" });
      return null;
    }
  }, []);

  const handleCreateClass = useCallback(
    async (payload: ClassPayload) => {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => null);
        const message =
          result?.message ?? "クラスの作成に失敗しました。時間をおいて再度お試しください。";
        throw new Error(message);
      }
      await refreshClasses();
      setGlobalMessage({ type: "success", text: "クラスを作成しました。" });
    },
    [refreshClasses],
  );

  const handleUpdateClass = useCallback(
    async (id: string, payload: ClassPayload) => {
      const res = await fetch(`/api/classes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => null);
        const message = result?.message ?? "クラス情報の更新に失敗しました。";
        throw new Error(message);
      }
      const updated = (await res.json()) as ClassDetail;
      const latest = await refreshClasses();
      const next = latest?.find((cls) => cls.id === id) ?? updated;
      setModalState((prev) => {
        if (!prev || prev.type !== "detail" || prev.classData.id !== id) return prev;
        return { type: "detail", classData: next };
      });
      setGlobalMessage({ type: "success", text: "クラス情報を更新しました。" });
      return next;
    },
    [refreshClasses],
  );

  const handleRowClick = (row: ClassTableRow) => {
    const cls = classes.find((item) => item.id === row.id);
    if (!cls) return;
    setModalState({ type: "detail", classData: cls });
  };

  const tableRows = useMemo<ClassTableRow[]>(() => {
    return classes.map((cls) => ({
      id: cls.id,
      weekday: weekdayLabels[cls.weekday] ?? cls.weekday,
      className: cls.name,
      classroom: cls.classRoom,
      tutor: cls.tutors.map((tutor) => tutor.name),
      students: cls.students.map((student) => ({ name: student.name, grade: student.grade })),
    }));
  }, [classes]);

  const modalProps = useMemo(() => {
    if (!modalState) return null;
    if (modalState.type === "create") {
      return {
        mode: "create" as const,
        classData: undefined,
        onCreate: handleCreateClass,
      };
    }
    return {
      mode: "detail" as const,
      classData: modalState.classData,
      onUpdate: handleUpdateClass,
    };
  }, [modalState, handleCreateClass, handleUpdateClass]);

  return (
    <Stack spacing={3}>
      {globalMessage && (
        <Alert severity={globalMessage.type} onClose={() => setGlobalMessage(null)}>
          {globalMessage.text}
        </Alert>
      )}
      <ClassTable
        rows={tableRows}
        weekday
        className
        classroom
        tutor
        students
        studentsMode="detailed"
        onRowClick={handleRowClick}
      />

      <Box display="flex" justifyContent="flex-end">
        <PrimaryButton label="追加" onClick={() => setModalState({ type: "create" })} />
      </Box>

      {modalState && modalProps && (
        <ClassModal
          open
          mode={modalProps.mode}
          classData={modalProps.classData}
          classTypes={classTypes}
          weekdays={weekdays}
          students={students}
          tutors={tutors}
          onClose={() => setModalState(null)}
          onCreate={modalProps.mode === "create" ? modalProps.onCreate : undefined}
          onUpdate={modalProps.mode === "detail" ? modalProps.onUpdate : undefined}
        />
      )}
    </Stack>
  );
}

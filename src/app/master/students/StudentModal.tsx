"use client";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import type { Status } from "@/generated/prisma";
import type { StudentListRow } from "./types";

export type StudentPayload = {
  name: string;
  grade: number;
  generation: number;
  status: Status;
  report: string | null;
};

type StudentFormState = {
  name: string;
  grade: string;
  generation: string;
  status: Status;
  report: string;
};

const statusOptions: Array<{ value: Status; label: string }> = [
  { value: "ACTIVE", label: "在籍中" },
  { value: "INACTIVE", label: "休会" },
  { value: "GRADUATED", label: "卒業" },
];

function createFormState(student?: StudentListRow | null): StudentFormState {
  if (!student) {
    return {
      name: "",
      grade: "",
      generation: "",
      status: "ACTIVE",
      report: "",
    };
  }
  return {
    name: student.name,
    grade: String(student.grade),
    generation: String(student.generation),
    status: student.status,
    report: student.report ?? "",
  };
}

function validate(form: StudentFormState) {
  const name = form.name.trim();
  const grade = Number(form.grade);
  const generation = Number(form.generation);

  if (!name) return "氏名を入力してください。";
  if (!Number.isInteger(grade) || grade <= 0) return "学年は 1 以上の整数で入力してください。";
  if (!Number.isInteger(generation) || generation <= 0)
    return "期（世代）は 1 以上の整数で入力してください。";
  return null;
}

function toPayload(form: StudentFormState): StudentPayload {
  return {
    name: form.name.trim(),
    grade: Number(form.grade),
    generation: Number(form.generation),
    status: form.status,
    report: form.report.trim() === "" ? null : form.report.trim(),
  };
}

export type StudentModalMode = "create" | "detail";

interface StudentModalProps {
  open: boolean;
  mode: StudentModalMode;
  student?: StudentListRow | null;
  onClose: () => void;
  onCreate?: (payload: StudentPayload) => Promise<void>;
  onUpdate?: (id: string, payload: StudentPayload) => Promise<StudentListRow | void>;
}

export default function StudentModal({
  open,
  mode,
  student,
  onClose,
  onCreate,
  onUpdate,
}: StudentModalProps) {
  const isCreate = mode === "create";

  const [form, setForm] = useState<StudentFormState>(() => createFormState(student));
  const [editing, setEditing] = useState(isCreate);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(createFormState(student));
      setEditing(isCreate);
      setSubmitting(false);
      setError(null);
      setInfo(null);
    }
  }, [open, student, isCreate]);

  useEffect(() => {
    if (!isCreate && student) {
      setForm(createFormState(student));
    }
  }, [student, isCreate]);

  const handleChange =
    (field: keyof StudentFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setForm((prev) => ({
        ...prev,
        [field]: field === "status" ? (value as Status) : value,
      }));
    };

  const readOnly = !editing;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    const validationError = validate(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = toPayload(form);
    setSubmitting(true);

    try {
      if (isCreate) {
        if (!onCreate) throw new Error("onCreate handler is not provided.");
        await onCreate(payload);
        onClose();
        return;
      }

      if (!student || !onUpdate) throw new Error("onUpdate handler is not provided.");
      const updated = await onUpdate(student.id, payload);
      if (updated && mode === "detail") {
        setForm(createFormState(updated as StudentListRow));
      }
      setEditing(false);
      setInfo("生徒情報を更新しました。");
    } catch (err) {
      const message = err instanceof Error ? err.message : "処理に失敗しました。";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setError(null);
    setInfo(null);
  };

  const handleCancelEdit = () => {
    if (!student) return;
    setForm(createFormState(student));
    setEditing(false);
    setError(null);
    setInfo(null);
  };

  const dialogTitle = isCreate ? "生徒の登録" : "生徒情報";

  const metadata = useMemo(() => {
    if (!student) return null;
    const createdAt = new Date(student.createdAt);
    const updatedAt = new Date(student.updatedAt);
    return {
      createdAt: Number.isNaN(createdAt.getTime())
        ? student.createdAt
        : createdAt.toLocaleString("ja-JP"),
      updatedAt: Number.isNaN(updatedAt.getTime())
        ? student.updatedAt
        : updatedAt.toLocaleString("ja-JP"),
    };
  }, [student]);

  const formId = isCreate ? "student-create-form" : "student-detail-form";

  const formBody = (
    <Stack spacing={2} mt={1} component="form" id={formId} onSubmit={handleSubmit}>
      {error && <Alert severity="error">{error}</Alert>}
      {info && <Alert severity="success">{info}</Alert>}
      <TextField
        label="氏名"
        value={form.name}
        onChange={handleChange("name")}
        required
        InputProps={{ readOnly }}
      />
      <TextField
        label="学年"
        type="number"
        inputProps={{ min: 1 }}
        value={form.grade}
        onChange={handleChange("grade")}
        required
        InputProps={{ readOnly }}
      />
      <TextField
        label="期（世代）"
        type="number"
        inputProps={{ min: 1 }}
        value={form.generation}
        onChange={handleChange("generation")}
        required
        InputProps={{ readOnly }}
      />
      <TextField
        select
        label="ステータス"
        value={form.status}
        onChange={handleChange("status")}
        disabled={readOnly}
      >
        {statusOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="備考"
        value={form.report}
        onChange={handleChange("report")}
        multiline
        minRows={2}
        InputProps={{ readOnly }}
      />
      {!isCreate && student && (
        <>
          <Divider />
          <Typography variant="subtitle2">在籍クラス数</Typography>
          <Typography variant="body2">{student.classCount}</Typography>
          <Typography variant="subtitle2">請求対象回数</Typography>
          <Typography variant="body2">{student.billableCount}</Typography>
          <Typography variant="subtitle2">出席</Typography>
          <Typography variant="body2">{student.presentCount}</Typography>
          <Typography variant="subtitle2">欠席</Typography>
          <Typography variant="body2">{student.absentCount}</Typography>
          {metadata && (
            <>
              <Divider />
              <Typography variant="subtitle2">作成日時</Typography>
              <Typography variant="body2">{metadata.createdAt}</Typography>
              <Typography variant="subtitle2">更新日時</Typography>
              <Typography variant="body2">{metadata.updatedAt}</Typography>
            </>
          )}
        </>
      )}
    </Stack>
  );

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => (submitting && reason === "backdropClick" ? null : onClose())}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>{formBody}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          閉じる
        </Button>
        {isCreate ? (
          <Button type="submit" form={formId} variant="contained" disabled={submitting}>
            {submitting ? "登録中..." : "登録"}
          </Button>
        ) : editing ? (
          <>
            <Button onClick={handleCancelEdit} disabled={submitting}>
              キャンセル
            </Button>
            <Button type="submit" form={formId} variant="contained" disabled={submitting}>
              {submitting ? "保存中..." : "保存"}
            </Button>
          </>
        ) : (
          <Button onClick={handleEdit} variant="contained">
            編集
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

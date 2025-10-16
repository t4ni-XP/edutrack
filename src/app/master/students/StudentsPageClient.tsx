"use client";
import { useState, useEffect, useCallback, type ChangeEvent, type FormEvent } from "react";
import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Button,
  Typography,
  Divider,
} from "@mui/material";
import StudentsTable from "@/app/_components/tables/StudentsTable";
import PrimaryButton from "@/app/_components/ui/PrimaryButton";
import type { StudentListRow } from "./types";
import type { Status } from "@/generated/prisma";

const statusOptions: Array<{ value: Status; label: string }> = [
  { value: "ACTIVE", label: "在籍中" },
  { value: "INACTIVE", label: "休会" },
  { value: "GRADUATED", label: "卒業" },
];

type StudentFormState = {
  name: string;
  grade: string;
  generation: string;
  status: Status;
  report: string;
};

const emptyCreateForm: StudentFormState = {
  name: "",
  grade: "",
  generation: "",
  status: "ACTIVE",
  report: "",
};

type NormalizedForm = {
  data: {
    name: string;
    grade: number;
    generation: number;
    status: Status;
    report: string | null;
  };
};

function normalizeForm(form: StudentFormState): NormalizedForm | { error: string } {
  const name = form.name.trim();
  const grade = Number(form.grade);
  const generation = Number(form.generation);
  const report = form.report.trim();

  if (!name) {
    return { error: "氏名を入力してください。" };
  }
  if (!Number.isInteger(grade) || grade <= 0 || grade >= 6) {
    return { error: "学年は 1 以上の整数で入力してください。" };
  }
  if (!Number.isInteger(generation) || generation <= 0) {
    return { error: "期は 1 以上の整数で入力してください。" };
  }

  return {
    data: {
      name,
      grade,
      generation,
      status: form.status,
      report: report === "" ? null : report,
    },
  };
}

function createFormFromRow(row: StudentListRow): StudentFormState {
  return {
    name: row.name,
    grade: String(row.grade),
    generation: String(row.generation),
    status: row.status,
    report: row.report ?? "",
  };
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ja-JP");
}

interface StudentsPageClientProps {
  initialRows: StudentListRow[];
}

export default function StudentsPageClient({ initialRows }: StudentsPageClientProps) {
  const [rows, setRows] = useState<StudentListRow[]>(initialRows);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<StudentFormState>(emptyCreateForm);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [selected, setSelected] = useState<StudentListRow | null>(null);
  const [editForm, setEditForm] = useState<StudentFormState | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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
      if (!res.ok) {
        throw new Error(`Failed to fetch students: ${res.status}`);
      }
      const data = (await res.json()) as StudentListRow[];
      setRows(data);
      return data;
    } catch (error) {
      console.error(error);
      setGlobalMessage({ type: "error", text: "生徒情報の再取得に失敗しました。" });
      return null;
    }
  }, []);

  const handleCreateChange =
    (field: keyof StudentFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      setCreateForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleEditChange =
    (field: keyof StudentFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      if (!editForm) return;
      setEditForm({ ...editForm, [field]: event.target.value });
    };

  const handleCreateOpen = () => {
    setCreateForm(emptyCreateForm);
    setCreateError(null);
    setCreateOpen(true);
  };

  const handleCreateClose = () => {
    if (createSubmitting) return;
    setCreateOpen(false);
  };

  const handleDetailClose = () => {
    if (editSubmitting) return;
    setSelected(null);
    setEditForm(null);
    setEditError(null);
  };

  const handleRowClick = (row: StudentListRow) => {
    setSelected(row);
    setEditForm(createFormFromRow(row));
    setEditError(null);
  };

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError(null);
    setGlobalMessage(null);

    const normalized = normalizeForm(createForm);
    if ("error" in normalized) {
      setCreateError(normalized.error);
      return;
    }

    setCreateSubmitting(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalized.data),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const message =
          payload?.message ?? "登録に失敗しました。時間をおいてから再度お試しください。";
        setCreateError(message);
        return;
      }

      await refreshRows();
      setCreateOpen(false);
      setCreateForm(emptyCreateForm);
      setGlobalMessage({ type: "success", text: "生徒を登録しました。" });
    } catch (error) {
      console.error(error);
      setCreateError("予期しないエラーが発生しました。");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || !editForm) return;

    setEditError(null);
    setGlobalMessage(null);

    const normalized = normalizeForm(editForm);
    if ("error" in normalized) {
      setEditError(normalized.error);
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/students/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalized.data),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const message =
          payload?.message ?? "更新に失敗しました。時間をおいてから再度お試しください。";
        setEditError(message);
        return;
      }

      const latest = await refreshRows();
      if (latest) {
        const updated = latest.find((row) => row.id === selected.id);
        if (updated) {
          setSelected(updated);
          setEditForm(createFormFromRow(updated));
        } else {
          setSelected(null);
          setEditForm(null);
        }
      } else {
        setSelected(null);
        setEditForm(null);
      }

      setGlobalMessage({ type: "success", text: "生徒情報を更新しました。" });
    } catch (error) {
      console.error(error);
      setEditError("予期しないエラーが発生しました。");
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <Stack spacing={2}>
      {globalMessage && (
        <Alert severity={globalMessage.type} onClose={() => setGlobalMessage(null)}>
          {globalMessage.text}
        </Alert>
      )}
      <Box p={4}>
        <StudentsTable rows={rows} onRowClick={handleRowClick} />
      </Box>
      <Box display="flex" justifyContent="flex-front" px={4}>
        <PrimaryButton label="生徒を追加" onClick={handleCreateOpen} />
      </Box>

      <Dialog
        open={createOpen}
        onClose={(_, reason) => {
          if (createSubmitting && reason === "backdropClick") return;
          handleCreateClose();
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          component: "form",
          onSubmit: handleCreateSubmit,
        }}
      >
        <DialogTitle>生徒の登録</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} mt={1}>
            {createError && <Alert severity="error">{createError}</Alert>}
            <TextField
              label="氏名"
              value={createForm.name}
              onChange={handleCreateChange("name")}
              required
            />
            <TextField
              label="学年"
              type="number"
              inputProps={{ min: 1 }}
              value={createForm.grade}
              onChange={handleCreateChange("grade")}
              required
            />
            <TextField
              label="期（世代）"
              type="number"
              inputProps={{ min: 1 }}
              value={createForm.generation}
              onChange={handleCreateChange("generation")}
              required
            />
            <TextField
              select
              label="ステータス"
              value={createForm.status}
              onChange={handleCreateChange("status")}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="備考"
              value={createForm.report}
              onChange={handleCreateChange("report")}
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCreateClose} disabled={createSubmitting}>
            キャンセル
          </Button>
          <Button type="submit" variant="contained" disabled={createSubmitting}>
            {createSubmitting ? "登録中..." : "登録"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(selected && editForm)}
        onClose={(_, reason) => {
          if (editSubmitting && reason === "backdropClick") return;
          handleDetailClose();
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          component: "form",
          onSubmit: handleEditSubmit,
        }}
      >
        <DialogTitle>生徒情報</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {selected && editForm && (
            <Stack spacing={2} mt={1}>
              {editError && <Alert severity="error">{editError}</Alert>}
              <TextField
                label="氏名"
                value={editForm.name}
                onChange={handleEditChange("name")}
                required
              />
              <TextField
                label="学年"
                type="number"
                inputProps={{ min: 1 }}
                value={editForm.grade}
                onChange={handleEditChange("grade")}
                required
              />
              <TextField
                label="期（世代）"
                type="number"
                inputProps={{ min: 1 }}
                value={editForm.generation}
                onChange={handleEditChange("generation")}
                required
              />
              <TextField
                select
                label="ステータス"
                value={editForm.status}
                onChange={handleEditChange("status")}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="報告書URL"
                value={editForm.report}
                onChange={handleEditChange("report")}
                multiline
                minRows={2}
              />

              <Divider />

              <Typography variant="subtitle2">ID</Typography>
              <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                {selected.id}
              </Typography>

              <TextField
                label="在籍クラス数"
                value={selected.classCount}
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="請求対象回数"
                value={selected.billableCount}
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="出席"
                value={selected.presentCount}
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="欠席"
                value={selected.absentCount}
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="作成日時"
                value={formatDate(selected.createdAt)}
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="更新日時"
                value={formatDate(selected.updatedAt)}
                InputProps={{ readOnly: true }}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleDetailClose} disabled={editSubmitting}>
            閉じる
          </Button>
          <Button type="submit" variant="contained" disabled={editSubmitting || !selected}>
            {editSubmitting ? "更新中..." : "保存"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

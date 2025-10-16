"use client";
import {
  useState,
  useEffect,
  useCallback,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  Alert,
  Box,
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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import TutorsTable from "@/app/_components/tables/TutorsTable";
import PrimaryButton from "@/app/_components/ui/PrimaryButton";
import type { TutorListRow } from "./types";
import { Subject, type Subject as SubjectType } from "@/generated/prisma";

type TutorFormState = {
  name: string;
  email: string;
  needsPickup: boolean;
  subjects: SubjectType[];
};

const emptyForm: TutorFormState = {
  name: "",
  email: "",
  needsPickup: false,
  subjects: [],
};

const subjectOptions = Object.values(Subject) as SubjectType[];

function createFormFromRow(row: TutorListRow): TutorFormState {
  return {
    name: row.name,
    email: row.email,
    needsPickup: row.needsPickup,
    subjects: row.subjects,
  };
}

function normalizeForm(form: TutorFormState) {
  const name = form.name.trim();
  const email = form.email.trim();
  const subjects = Array.from(new Set(form.subjects));

  if (!name) {
    return { error: "氏名を入力してください。" } as const;
  }
  if (!email) {
    return { error: "メールアドレスを入力してください。" } as const;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "メールアドレスの形式が正しくありません。" } as const;
  }
  if (subjects.some((s) => !subjectOptions.includes(s))) {
    return { error: "担当科目の値が不正です。" } as const;
  }

  return {
    data: {
      name,
      email,
      needsPickup: form.needsPickup,
      subjects,
    },
  } as const;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ja-JP");
}

interface TutorsPageClientProps {
  initialRows: TutorListRow[];
}

export default function TutorsPageClient({ initialRows }: TutorsPageClientProps) {
  const [rows, setRows] = useState<TutorListRow[]>(initialRows);
  const [globalMessage, setGlobalMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<TutorFormState>(emptyForm);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [selected, setSelected] = useState<TutorListRow | null>(null);
  const [editForm, setEditForm] = useState<TutorFormState | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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

  const handleCreateFieldChange = (field: "name" | "email") => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateNeedsPickupChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCreateForm((prev) => ({ ...prev, needsPickup: event.target.checked }));
  };

  const handleCreateSubjectsChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    const parsed = typeof value === "string" ? value.split(",") : value;
    const list = parsed.filter((v): v is SubjectType => subjectOptions.includes(v as SubjectType));
    setCreateForm((prev) => ({ ...prev, subjects: list }));
  };

  const handleEditFieldChange = (field: "name" | "email") => (event: ChangeEvent<HTMLInputElement>) => {
    if (!editForm) return;
    const { value } = event.target;
    setEditForm({ ...editForm, [field]: value });
  };

  const handleEditNeedsPickupChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!editForm) return;
    setEditForm({ ...editForm, needsPickup: event.target.checked });
  };

  const handleEditSubjectsChange = (event: SelectChangeEvent) => {
    if (!editForm) return;
    const value = event.target.value;
    const parsed = typeof value === "string" ? value.split(",") : value;
    const list = parsed.filter((v): v is SubjectType => subjectOptions.includes(v as SubjectType));
    setEditForm({ ...editForm, subjects: list });
  };

  const handleCreateOpen = () => {
    setCreateForm(emptyForm);
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

  const handleRowClick = (row: TutorListRow) => {
    setSelected(row);
    setEditForm(createFormFromRow(row));
    setEditError(null);
  };

  const submitCreate = async (event: FormEvent<HTMLFormElement>) => {
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
      const res = await fetch("/api/tutors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalized.data),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const message = payload?.message ?? "登録に失敗しました。時間をおいてから再度お試しください。";
        setCreateError(message);
        return;
      }
      await refreshRows();
      setCreateOpen(false);
      setCreateForm(emptyForm);
      setGlobalMessage({ type: "success", text: "講師を登録しました。" });
    } catch (error) {
      console.error(error);
      setCreateError("予期しないエラーが発生しました。");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const submitEdit = async (event: FormEvent<HTMLFormElement>) => {
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
      const res = await fetch(`/api/tutors/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalized.data),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const message = payload?.message ?? "更新に失敗しました。時間をおいてから再度お試しください。";
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
      setGlobalMessage({ type: "success", text: "講師情報を更新しました。" });
    } catch (error) {
      console.error(error);
      setEditError("予期しないエラーが発生しました。");
    } finally {
      setEditSubmitting(false);
    }
  };

  const renderSubjectsSelect = (
    value: SubjectType[],
    onChange: (event: SelectChangeEvent) => void,
    helperText?: string,
  ) => (
    <TextField
      select
      label="担当科目"
      value={value}
      onChange={onChange}
      SelectProps={{
        multiple: true,
        renderValue: (selected) => (Array.isArray(selected) ? (selected as SubjectType[]).join(", ") : ""),
      }}
      helperText={helperText ?? "複数選択可"}
    >
      {subjectOptions.map((subject) => (
        <MenuItem key={subject} value={subject}>
          {subject}
        </MenuItem>
      ))}
    </TextField>
  );

  return (
    <Stack spacing={2}>
      {globalMessage && (
        <Alert severity={globalMessage.type} onClose={() => setGlobalMessage(null)}>
          {globalMessage.text}
        </Alert>
      )}
      <Box display="flex" justifyContent="flex-end">
        <PrimaryButton label="講師を追加" onClick={handleCreateOpen} />
      </Box>
      <TutorsTable rows={rows} onRowClick={handleRowClick} />

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
          onSubmit: submitCreate,
        }}
      >
        <DialogTitle>講師の登録</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} mt={1}>
            {createError && <Alert severity="error">{createError}</Alert>}
            <TextField label="氏名" value={createForm.name} onChange={handleCreateFieldChange("name")} required />
            <TextField
              label="メールアドレス"
              value={createForm.email}
              onChange={handleCreateFieldChange("email")}
              required
            />
            {renderSubjectsSelect(createForm.subjects, handleCreateSubjectsChange, undefined)}
            <FormControlLabel
              control={<Checkbox checked={createForm.needsPickup} onChange={handleCreateNeedsPickupChange} />}
              label="送迎が必要"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCreateClose} disabled={createSubmitting}>キャンセル</Button>
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
          onSubmit: submitEdit,
        }}
      >
        <DialogTitle>講師情報</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {selected && editForm && (
            <Stack spacing={2} mt={1}>
              {editError && <Alert severity="error">{editError}</Alert>}
              <TextField label="氏名" value={editForm.name} onChange={handleEditFieldChange("name")} required />
              <TextField
                label="メールアドレス"
                value={editForm.email}
                onChange={handleEditFieldChange("email")}
                required
              />
              {renderSubjectsSelect(editForm.subjects, handleEditSubjectsChange, undefined)}
              <FormControlLabel
                control={<Checkbox checked={editForm.needsPickup} onChange={handleEditNeedsPickupChange} />}
                label="送迎が必要"
              />

              <Divider />

              <Typography variant="subtitle2">ID</Typography>
              <Typography variant="body2" sx={{ wordBreak: "break-all" }}>{selected.id}</Typography>

              <TextField
                label="担当クラス数"
                value={selected.classCount}
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="授業担当回数"
                value={selected.sessionsWorked}
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="授業分数"
                value={selected.minutesWorked}
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="運営分数"
                value={selected.opMinutes}
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
          <Button onClick={handleDetailClose} disabled={editSubmitting}>閉じる</Button>
          <Button type="submit" variant="contained" disabled={editSubmitting || !selected}>
            {editSubmitting ? "更新中..." : "保存"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

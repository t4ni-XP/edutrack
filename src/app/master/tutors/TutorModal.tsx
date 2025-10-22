"use client";
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { StaffRole, Subject, type Subject as SubjectType } from "@/generated/prisma";
import type { TutorListRow } from "./types";

export type TutorPayload = {
  name: string;
  email: string;
  needsPickup: boolean;
  subjects: SubjectType[];
  role: StaffRole;
};

type TutorFormState = {
  name: string;
  email: string;
  needsPickup: boolean;
  subjects: SubjectType[];
  role: StaffRole;
};

const subjectOptions = Object.values(Subject) as SubjectType[];
const staffRoleOptions = Object.values(StaffRole) as StaffRole[];

function createFormState(tutor?: TutorListRow | null): TutorFormState {
  if (!tutor) {
    return {
      name: "",
      email: "",
      needsPickup: false,
      subjects: [],
      role: StaffRole.TUTOR,
    };
  }
  return {
    name: tutor.name,
    email: tutor.email,
    needsPickup: tutor.needsPickup,
    subjects: tutor.subjects,
    role: tutor.role,
  };
}

function validate(form: TutorFormState) {
  if (!form.name.trim()) return "氏名を入力してください。";
  const email = form.email.trim();
  if (!email) return "メールアドレスを入力してください。";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "メールアドレスの形式が正しくありません。";
  const invalidSubject = form.subjects.find((subject) => !subjectOptions.includes(subject));
  if (invalidSubject) return "担当科目の値が不正です。";
  if (!staffRoleOptions.includes(form.role)) return "役割の値が不正です。";
  return null;
}

function toPayload(form: TutorFormState): TutorPayload {
  return {
    name: form.name.trim(),
    email: form.email.trim(),
    needsPickup: form.needsPickup,
    subjects: Array.from(new Set(form.subjects)),
    role: form.role,
  };
}

export type TutorModalMode = "create" | "detail";

interface TutorModalProps {
  open: boolean;
  mode: TutorModalMode;
  tutor?: TutorListRow | null;
  onClose: () => void;
  onCreate?: (payload: TutorPayload) => Promise<void>;
  onUpdate?: (id: string, payload: TutorPayload) => Promise<TutorListRow | void>;
}

export default function TutorModal({
  open,
  mode,
  tutor,
  onClose,
  onCreate,
  onUpdate,
}: TutorModalProps) {
  const isCreate = mode === "create";
  const [form, setForm] = useState<TutorFormState>(() => createFormState(tutor));
  const [editing, setEditing] = useState(isCreate);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(createFormState(tutor));
      setEditing(isCreate);
      setSubmitting(false);
      setError(null);
      setInfo(null);
    }
  }, [open, tutor, isCreate]);

  useEffect(() => {
    if (!isCreate && tutor) {
      setForm(createFormState(tutor));
    }
  }, [tutor, isCreate]);

  const readOnly = !editing;

  const handleFieldChange =
    (field: "name" | "email") => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleNeedsPickupChange = (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setForm((prev) => ({ ...prev, needsPickup: checked }));
  };

  const handleSubjectsChange = (event: SelectChangeEvent<SubjectType[]>) => {
    const value = event.target.value;
    const parsed = typeof value === "string" ? value.split(",") : value;
    const list = parsed.filter((item): item is SubjectType =>
      subjectOptions.includes(item as SubjectType),
    );
    setForm((prev) => ({ ...prev, subjects: Array.from(new Set(list)) }));
  };

  const handleRoleChange = (event: SelectChangeEvent<StaffRole>) => {
    setForm((prev) => ({ ...prev, role: event.target.value as StaffRole }));
  };

  const metadata = useMemo(() => {
    if (!tutor) return null;
    const createdAt = new Date(tutor.createdAt);
    const updatedAt = new Date(tutor.updatedAt);
    return {
      createdAt: Number.isNaN(createdAt.getTime())
        ? tutor.createdAt
        : createdAt.toLocaleString("ja-JP"),
      updatedAt: Number.isNaN(updatedAt.getTime())
        ? tutor.updatedAt
        : updatedAt.toLocaleString("ja-JP"),
    };
  }, [tutor]);

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
      if (!tutor || !onUpdate) throw new Error("onUpdate handler is not provided.");
      const updated = await onUpdate(tutor.id, payload);
      if (updated && mode === "detail") {
        setForm(createFormState(updated as TutorListRow));
      }
      setEditing(false);
      setInfo("講師情報を更新しました。");
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
    if (!tutor) return;
    setForm(createFormState(tutor));
    setEditing(false);
    setError(null);
    setInfo(null);
  };

  const formId = isCreate ? "tutor-create-form" : "tutor-detail-form";

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (submitting && reason === "backdropClick") return;
        onClose();
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{isCreate ? "講師の登録" : "講師情報"}</DialogTitle>
      <DialogContent>
        <Stack component="form" id={formId} onSubmit={handleSubmit} spacing={2} mt={1}>
          {error && <Alert severity="error">{error}</Alert>}
          {info && <Alert severity="success">{info}</Alert>}
          <TextField
            label="氏名"
            value={form.name}
            onChange={handleFieldChange("name")}
            required
            InputProps={{ readOnly }}
          />
          <TextField
            label="メールアドレス"
            value={form.email}
            onChange={handleFieldChange("email")}
            required
            InputProps={{ readOnly }}
          />
          <FormControl fullWidth>
            <InputLabel id="tutor-role-label">役割</InputLabel>
            <Select
              labelId="tutor-role-label"
              label="役割"
              value={form.role}
              onChange={handleRoleChange}
              disabled={readOnly}
            >
              {staffRoleOptions.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="tutor-subjects-label">担当科目</InputLabel>
            <Select
              labelId="tutor-subjects-label"
              label="担当科目"
              multiple
              value={form.subjects}
              onChange={handleSubjectsChange}
              renderValue={(selected) =>
                Array.isArray(selected) ? (selected as SubjectType[]).join(", ") : ""
              }
              disabled={readOnly}
            >
              {subjectOptions.map((subject) => (
                <MenuItem key={subject} value={subject}>
                  <Checkbox checked={form.subjects.includes(subject)} />
                  <ListItemText primary={subject} />
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>複数選択可</FormHelperText>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={form.needsPickup}
                onChange={handleNeedsPickupChange}
                disabled={readOnly}
              />
            }
            label="送迎が必要"
          />

          {!isCreate && tutor && (
            <>
              <Divider />
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="subtitle2">担当クラス数</Typography>
                  <Typography variant="body2">{tutor.classCount}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="subtitle2">授業担当回数</Typography>
                  <Typography variant="body2">{tutor.sessionsWorked}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="subtitle2">授業分数</Typography>
                  <Typography variant="body2">{tutor.minutesWorked}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="subtitle2">運営分数</Typography>
                  <Typography variant="body2">{tutor.opCount}</Typography>
                </Grid>
              </Grid>
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
      </DialogContent>
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

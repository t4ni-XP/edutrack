"use client";
import { useState, type ChangeEvent, type FormEvent } from "react";
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
} from "@mui/material";
import StudentsTable from "@/app/_components/tables/StudentsTable";
import PrimaryButton from "@/app/_components/ui/PrimaryButton";
import type { StudentRow } from "@/mock/mastar";

type StatusOption = {
  value: StudentRow["status"];
  label: string;
};

const statusOptions: StatusOption[] = [
  { value: "ACTIVE", label: "在籍中" },
  { value: "INACTIVE", label: "休会" },
  { value: "GRADUATED", label: "卒業" },
];

const initialForm = {
  name: "",
  grade: "",
  generation: "",
  status: statusOptions[0].value,
  report: "",
};

interface StudentsPageClientProps {
  rows: StudentRow[];
}

export default function StudentsPageClient({ rows }: StudentsPageClientProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [globalMessage, setGlobalMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleOpen = () => {
    setForm(initialForm);
    setFormError(null);
    setOpen(true);
  };

  const handleClose = () => {
    if (submitting) return;
    setOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setGlobalMessage(null);

    const name = form.name.trim();
    const grade = Number(form.grade);
    const generation = Number(form.generation);
    const report = form.report.trim();

    if (!name) {
      setFormError("氏名を入力してください。");
      return;
    }
    if (!Number.isInteger(grade) || grade <= 0) {
      setFormError("学年は 1 以上の整数で入力してください。");
      return;
    }
    if (!Number.isInteger(generation) || generation <= 0) {
      setFormError("期（世代）は 1 以上の整数で入力してください。");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          grade,
          generation,
          status: form.status,
          report: report || null,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const message = payload?.message ?? "登録に失敗しました。時間をおいてから再度お試しください。";
        setFormError(message);
        return;
      }

      setOpen(false);
      setForm(initialForm);
      setGlobalMessage({ type: "success", text: "生徒を登録しました。" });
    } catch (error) {
      console.error(error);
      setFormError("予期しないエラーが発生しました。");
    } finally {
      setSubmitting(false);
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
      <StudentsTable rows={rows} />
      </Box>
      <Box display="flex" justifyContent="flex-start" px={4}>
        <PrimaryButton label="生徒を追加" onClick={handleOpen} />
      </Box>
      <Dialog
        open={open}
        onClose={(_, reason) => {
          if (submitting && reason === "backdropClick") return;
          handleClose();
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          component: "form",
          onSubmit: handleSubmit,
        }}
      >
        <DialogTitle>生徒の登録</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} mt={1}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField label="氏名" value={form.name} onChange={handleChange("name")} required />
            <TextField
              label="学年"
              type="number"
              inputProps={{ min: 1 }}
              value={form.grade}
              onChange={handleChange("grade")}
              required
            />
            <TextField
              label="期（世代）"
              type="number"
              inputProps={{ min: 1 }}
              value={form.generation}
              onChange={handleChange("generation")}
              required
            />
            <TextField
              select
              label="ステータス"
              value={form.status}
              onChange={handleChange("status")}
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
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={submitting}>キャンセル</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "登録中..." : "登録"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

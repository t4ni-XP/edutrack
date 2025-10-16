"use client";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  ListItemText,
} from "@mui/material";
import Grid from '@mui/material/Grid';
import type { SelectChangeEvent } from "@mui/material/Select";
import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";
import type { Subject } from "@/generated/prisma";

type ClassTypeValue = string;
type WeekdayValue = string;

type StudentOption = {
  id: string;
  name: string;
  grade: number;
};

type TutorOption = {
  id: string;
  name: string;
  subjects: Subject[];
};

interface ClassCreateClientProps {
  students: StudentOption[];
  tutors: TutorOption[];
  classTypes: ClassTypeValue[];
  weekdays: WeekdayValue[];
}

const initialForm = {
  name: "",
  classType: "",
  weekday: "",
  classRoom: "",
  startsAt: "",
  endsAt: "",
  capacity: "",
  studentUnitFee: "",
};

export default function ClassCreateClient({
  students,
  tutors,
  classTypes,
  weekdays,
}: ClassCreateClientProps) {
  const [form, setForm] = useState(initialForm);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedTutorIds, setSelectedTutorIds] = useState<string[]>([]);
  const [tutorWages, setTutorWages] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetForm = () => {
    setForm(initialForm);
    setSelectedStudents([]);
    setSelectedTutorIds([]);
    setTutorWages({});
  };

  const handleFieldChange = (field: keyof typeof form) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: "classType" | "weekday") => (event: SelectChangeEvent<string>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleStudentSelect = (event: SelectChangeEvent<unknown>) => {
    const value = event.target.value;
    const parsed = typeof value === "string" ? value.split(",") : (value as string[]);
    const unique = Array.from(new Set(parsed));
    setSelectedStudents(unique);
  };

  const handleTutorSelect = (event: SelectChangeEvent<unknown>) => {
    const value = event.target.value;
    const parsed = typeof value === "string" ? value.split(",") : (value as string[]);
    const unique = Array.from(new Set(parsed));
    setSelectedTutorIds(unique);
    setTutorWages((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (!unique.includes(key)) {
          delete next[key];
        }
      });
      return next;
    });
  };

  const handleTutorWageChange = (tutorId: string) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setTutorWages((prev) => ({ ...prev, [tutorId]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "クラス名を入力してください。";
    if (!form.classType) return "クラス種別を選択してください。";
    if (!form.weekday) return "曜日を選択してください。";
    if (!form.classRoom.trim()) return "教室を入力してください。";
    const studentFee = Number(form.studentUnitFee);
    if (!Number.isFinite(studentFee) || studentFee <= 0) return "生徒の単価は 1 以上の数値で入力してください。";

    if (selectedTutorIds.length === 0) {
      return "担当講師を少なくとも1名選択してください。";
    }
    for (const tutorId of selectedTutorIds) {
      const wage = Number(tutorWages[tutorId]);
      if (!Number.isFinite(wage) || wage <= 0) {
        const tutor = tutors.find((t) => t.id === tutorId);
        return `${tutor?.name ?? "講師"}の賃金を 1 以上の数値で入力してください。`;
      }
    }
    if (selectedStudents.length === 0) {
      return "生徒を少なくとも1名選択してください。";
    }
    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const message = validate();
    if (message) {
      setFormError(message);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        classType: form.classType,
        weekday: form.weekday,
        classRoom: form.classRoom.trim(),
        startsAt: form.startsAt.trim() || null,
        endsAt: form.endsAt.trim() || null,
        capacity: form.capacity.trim() ? Number(form.capacity) : null,
        studentUnitFee: Number(form.studentUnitFee),
        studentIds: selectedStudents,
        tutorAssignments: selectedTutorIds.map((tutorId) => ({
          tutorId,
          wageAmount: Number(tutorWages[tutorId]),
        })),
      };

      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        setFormError(result?.message ?? "クラスの作成に失敗しました。時間をおいて再度お試しください。");
        return;
      }

      resetForm();
      setSuccessMessage("クラスを作成しました。");
    } catch (error) {
      console.error(error);
      setFormError("予期しないエラーが発生しました。");
    } finally {
      setSubmitting(false);
    }
  };

  const studentsOptions = useMemo(
    () =>
      students.map((student) => ({
        value: student.id,
        label: `${student.name}（${student.grade}年）`,
      })),
    [students],
  );

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 960, mx: "auto", my: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          クラスの作成
        </Typography>

        {formError && <Alert severity="error">{formError}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        <Card>
          <CardHeader title="基本情報" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid xs={12} md={6}>
                <TextField label="クラス名" value={form.name} onChange={handleFieldChange("name")} fullWidth required />
              </Grid>
              <Grid xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="class-type-label">クラス種別</InputLabel>
                  <Select
                    labelId="class-type-label"
                    label="クラス種別"
                    value={form.classType}
                    onChange={handleSelectChange("classType")}
                  >
                    {classTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="weekday-label">曜日</InputLabel>
                  <Select
                    labelId="weekday-label"
                    label="曜日"
                    value={form.weekday}
                    onChange={handleSelectChange("weekday")}
                  >
                    {weekdays.map((weekday) => (
                      <MenuItem key={weekday} value={weekday}>
                        {weekday}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  label="教室"
                  value={form.classRoom}
                  onChange={handleFieldChange("classRoom")}
                  fullWidth
                  required
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  label="開始時間 (HH:mm)"
                  value={form.startsAt}
                  onChange={handleFieldChange("startsAt")}
                  fullWidth
                  placeholder="18:00"
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  label="終了時間 (HH:mm)"
                  value={form.endsAt}
                  onChange={handleFieldChange("endsAt")}
                  fullWidth
                  placeholder="19:30"
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  label="定員"
                  type="number"
                  value={form.capacity}
                  onChange={handleFieldChange("capacity")}
                  fullWidth
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  label="生徒単価（1回あたり）"
                  type="number"
                  required
                  value={form.studentUnitFee}
                  onChange={handleFieldChange("studentUnitFee")}
                  fullWidth
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="生徒のアサイン" />
          <CardContent>
            <FormControl fullWidth>
              <InputLabel id="students-label">生徒</InputLabel>
              <Select
                multiple
                labelId="students-label"
                label="生徒"
                value={selectedStudents}
                onChange={handleStudentSelect}
                renderValue={(selected) =>
                  studentsOptions
                    .filter((option) => selected.includes(option.value))
                    .map((option) => option.label)
                    .join(", ")
                }
              >
                {studentsOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Checkbox checked={selectedStudents.includes(option.value)} />
                    <ListItemText primary={option.label} />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>割り当てる生徒を選択してください。</FormHelperText>
            </FormControl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="講師のアサイン" />
          <CardContent>
            <Stack spacing={3}>
              <FormControl fullWidth required>
                <InputLabel id="tutors-label">講師</InputLabel>
                <Select
                  multiple
                  labelId="tutors-label"
                  label="講師"
                  value={selectedTutorIds}
                  onChange={handleTutorSelect}
                  renderValue={(selected) => {
                    const ids = Array.isArray(selected)
                      ? (selected as string[])
                      : typeof selected === "string"
                        ? selected.split(",")
                        : [];
                    return tutors
                      .filter((tutor) => ids.includes(tutor.id))
                      .map((tutor) => tutor.name)
                      .join(", ");
                  }}
                >
                  {tutors.map((tutor) => (
                    <MenuItem key={tutor.id} value={tutor.id}>
                      <Checkbox checked={selectedTutorIds.includes(tutor.id)} />
                      <ListItemText primary={tutor.name} secondary={tutor.subjects.join(", ")} />
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>担当する講師を選択し、賃金を入力してください。</FormHelperText>
              </FormControl>

              {selectedTutorIds.length > 0 && (
                <Stack spacing={2}>
                  <Typography variant="subtitle2">講師ごとの賃金（1回あたり）</Typography>
                  {selectedTutorIds.map((tutorId) => {
                    const tutor = tutors.find((item) => item.id === tutorId);
                    return (
                      <TextField
                        key={tutorId}
                        label={`${tutor?.name ?? "講師"}`}
                        type="number"
                        value={tutorWages[tutorId] ?? ""}
                        onChange={handleTutorWageChange(tutorId)}
                        inputProps={{ min: 1 }}
                      />
                    );
                  })}
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Divider />

        <Box display="flex" justifyContent="flex-end">
          <Button type="submit" variant="contained" size="large" disabled={submitting}>
            {submitting ? "作成中..." : "クラスを作成"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

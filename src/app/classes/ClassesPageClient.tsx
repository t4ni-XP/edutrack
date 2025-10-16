"use client";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Checkbox,
  ListItemText,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import type { SelectChangeEvent } from "@mui/material/Select";
import {
  useCallback,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import ClassTable, { type ClassTableRow } from "@/app/_components/ClassTable";
import PrimaryButton from "@/app/_components/ui/PrimaryButton";
import type { ClassDetail } from "./types";

type StudentOption = {
  id: string;
  name: string;
  grade: number;
};

type TutorOption = {
  id: string;
  name: string;
  subjects: string[];
};

type ClassFormState = {
  name: string;
  classType: string;
  weekday: string;
  classRoom: string;
  startsAt: string;
  endsAt: string;
  capacity: string;
  studentUnitFee: string;
};

const weekdayLabels: Record<string, string> = {
  MONDAY: "月",
  TUESDAY: "火",
  WEDNESDAY: "水",
  THURSDAY: "木",
  FRIDAY: "金",
  SATURDAY: "土",
  SUNDAY: "日",
};

const formatLabel = (value: string) => weekdayLabels[value] ?? value;

function createFormFromClass(cls: ClassDetail): ClassFormState {
  return {
    name: cls.name,
    classType: cls.classType,
    weekday: cls.weekday,
    classRoom: cls.classRoom,
    startsAt: cls.startsAt ?? "",
    endsAt: cls.endsAt ?? "",
    capacity: cls.capacity != null ? String(cls.capacity) : "",
    studentUnitFee: String(cls.studentUnitFee),
  };
}

interface ClassesPageClientProps {
  initialClasses: ClassDetail[];
  students: StudentOption[];
  tutors: TutorOption[];
  classTypes: string[];
  weekdays: string[];
}

export default function ClassesPageClient({
  initialClasses,
  students,
  tutors,
  classTypes,
  weekdays,
}: ClassesPageClientProps) {
  const [classes, setClasses] = useState<ClassDetail[]>(initialClasses);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [detailSubmitting, setDetailSubmitting] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailMessage, setDetailMessage] = useState<string | null>(null);

  const [form, setForm] = useState<ClassFormState | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedTutorIds, setSelectedTutorIds] = useState<string[]>([]);
  const [tutorWages, setTutorWages] = useState<Record<string, string>>({});

  const selectedClass = useMemo(
    () => classes.find((cls) => cls.id === selectedClassId) ?? null,
    [classes, selectedClassId],
  );

  const applySelection = useCallback((cls: ClassDetail) => {
    setSelectedClassId(cls.id);
    setForm(createFormFromClass(cls));
    setSelectedStudents(cls.students.map((student) => student.id));
    setSelectedTutorIds(cls.tutors.map((tutor) => tutor.id));
    setTutorWages(
      cls.tutors.reduce<Record<string, string>>((acc, tutor) => {
        acc[tutor.id] = String(tutor.wageAmount);
        return acc;
      }, {}),
    );
  }, []);

  const handleRowClick = (row: ClassTableRow) => {
    const cls = classes.find((item) => item.id === row.id);
    if (!cls) return;
    applySelection(cls);
    setIsEditing(false);
    setDetailError(null);
    setDetailMessage(null);
    setDetailOpen(true);
  };

  const handleDetailClose = () => {
    if (detailSubmitting) return;
    setDetailOpen(false);
    setIsEditing(false);
    setDetailError(null);
    setDetailMessage(null);
  };

  const handleEdit = () => {
    if (!selectedClass) return;
    setIsEditing(true);
    setDetailError(null);
    setDetailMessage(null);
  };

  const handleEditCancel = () => {
    if (!selectedClass) return;
    applySelection(selectedClass);
    setIsEditing(false);
    setDetailError(null);
    setDetailMessage(null);
  };

  const handleFieldChange =
    (field: keyof ClassFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

  const handleSelectChange =
    (field: "classType" | "weekday") => (event: SelectChangeEvent<string>) => {
      const value = event.target.value;
      setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

  const handleStudentsChange = (event: SelectChangeEvent<unknown>) => {
    const value = event.target.value;
    const parsed = typeof value === "string" ? value.split(",") : (value as string[]);
    setSelectedStudents(Array.from(new Set(parsed)));
  };

  const handleTutorsChange = (event: SelectChangeEvent<unknown>) => {
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

  const validateForm = () => {
    if (!form) return "フォームが読み込まれていません。";
    if (!form.name.trim()) return "クラス名を入力してください。";
    if (!form.classType) return "クラス種別を選択してください。";
    if (!form.weekday) return "曜日を選択してください。";
    if (!form.classRoom.trim()) return "教室を入力してください。";
    const studentFee = Number(form.studentUnitFee);
    if (!Number.isFinite(studentFee) || studentFee <= 0)
      return "生徒の単価は 1 以上の数値で入力してください。";
    if (selectedStudents.length === 0) return "生徒を1名以上選択してください。";
    if (selectedTutorIds.length === 0) return "講師を1名以上選択してください。";
    for (const tutorId of selectedTutorIds) {
      const wage = Number(tutorWages[tutorId]);
      if (!Number.isFinite(wage) || wage <= 0) {
        const tutor = tutors.find((item) => item.id === tutorId);
        return `${tutor?.name ?? "講師"}の賃金を 1 以上の数値で入力してください。`;
      }
    }
    if (form.capacity.trim()) {
      const capacity = Number(form.capacity);
      if (!Number.isInteger(capacity) || capacity < 0) {
        return "定員は 0 以上の整数で入力してください。";
      }
    }
    return null;
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedClass || !form) return;

    setDetailError(null);
    setDetailMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setDetailError(validationError);
      return;
    }

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

    setDetailSubmitting(true);
    try {
      const res = await fetch(`/api/classes/${selectedClass.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => null);
        setDetailError(result?.message ?? "クラス情報の更新に失敗しました。");
        return;
      }

      const updated = (await res.json()) as ClassDetail;
      setClasses((prev) => prev.map((cls) => (cls.id === updated.id ? updated : cls)));
      applySelection(updated);
      setIsEditing(false);
      setDetailMessage("クラス情報を更新しました。");
    } catch (error) {
      console.error(error);
      setDetailError("予期しないエラーが発生しました。");
    } finally {
      setDetailSubmitting(false);
    }
  };

  const tableRows = useMemo<ClassTableRow[]>(() => {
    return classes.map((cls) => ({
      id: cls.id,
      weekday: formatLabel(cls.weekday),
      className: cls.name,
      classroom: cls.classRoom,
      tutor: cls.tutors.map((tutor) => tutor.name),
      students: cls.students.map((student) => ({ name: student.name, grade: student.grade })),
    }));
  }, [classes]);

  const studentsOptions = useMemo(
    () =>
      students.map((student) => ({
        value: student.id,
        label: `${student.name}（${student.grade}年）`,
      })),
    [students],
  );

  return (
    <Stack spacing={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" component="h1">
          クラス一覧
        </Typography>
        <PrimaryButton href="/classes/add" label="クラスを追加" />
      </Box>

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

      <Dialog open={detailOpen} onClose={handleDetailClose} fullWidth maxWidth="md">
        <DialogTitle>クラス詳細</DialogTitle>
        <DialogContent>
          <Stack component="form" spacing={3} onSubmit={handleSave} sx={{ mt: 1 }}>
            {detailError && <Alert severity="error">{detailError}</Alert>}
            {detailMessage && <Alert severity="success">{detailMessage}</Alert>}

            {selectedClass && form && (
              <>
                <CardSection title="基本情報">
                  <Grid container spacing={2}>
                    <Grid xs={12} md={6}>
                      <TextField
                        label="クラス名"
                        value={form.name}
                        onChange={handleFieldChange("name")}
                        fullWidth
                        required
                        InputProps={{ readOnly: !isEditing }}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <FormControl fullWidth required>
                        <InputLabel id="detail-class-type-label">クラス種別</InputLabel>
                        <Select
                          labelId="detail-class-type-label"
                          label="クラス種別"
                          value={form.classType}
                          onChange={handleSelectChange("classType")}
                          disabled={!isEditing}
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
                        <InputLabel id="detail-weekday-label">曜日</InputLabel>
                        <Select
                          labelId="detail-weekday-label"
                          label="曜日"
                          value={form.weekday}
                          onChange={handleSelectChange("weekday")}
                          disabled={!isEditing}
                        >
                          {weekdays.map((weekday) => (
                            <MenuItem key={weekday} value={weekday}>
                              {formatLabel(weekday)}
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
                        InputProps={{ readOnly: !isEditing }}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <TextField
                        label="開始時間 (HH:mm)"
                        value={form.startsAt}
                        onChange={handleFieldChange("startsAt")}
                        fullWidth
                        placeholder="18:00"
                        InputProps={{ readOnly: !isEditing }}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <TextField
                        label="終了時間 (HH:mm)"
                        value={form.endsAt}
                        onChange={handleFieldChange("endsAt")}
                        fullWidth
                        placeholder="19:30"
                        InputProps={{ readOnly: !isEditing }}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <TextField
                        label="定員"
                        type="number"
                        value={form.capacity}
                        onChange={handleFieldChange("capacity")}
                        fullWidth
                        inputProps={{ min: 0 }}
                        InputProps={{ readOnly: !isEditing }}
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
                        InputProps={{ readOnly: !isEditing }}
                      />
                    </Grid>
                  </Grid>
                </CardSection>

                <CardSection title="生徒">
                  <FormControl fullWidth>
                    <InputLabel id="detail-students-label">生徒</InputLabel>
                    <Select
                      labelId="detail-students-label"
                      label="生徒"
                      value={selectedStudents}
                      onChange={handleStudentsChange}
                      renderValue={(selected) => {
                        const ids = Array.isArray(selected)
                          ? (selected as string[])
                          : typeof selected === "string"
                            ? selected.split(",")
                            : [];
                        return studentsOptions
                          .filter((option) => ids.includes(option.value))
                          .map((option) => option.label)
                          .join(", ");
                      }}
                      multiple
                      disabled={!isEditing}
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
                </CardSection>

                <CardSection title="講師">
                  <Stack spacing={2}>
                    <FormControl fullWidth required>
                      <InputLabel id="detail-tutors-label">講師</InputLabel>
                      <Select
                        labelId="detail-tutors-label"
                        label="講師"
                        value={selectedTutorIds}
                        onChange={handleTutorsChange}
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
                        multiple
                        disabled={!isEditing}
                      >
                        {tutors.map((tutor) => (
                          <MenuItem key={tutor.id} value={tutor.id}>
                            <Checkbox checked={selectedTutorIds.includes(tutor.id)} />
                            <ListItemText
                              primary={tutor.name}
                              secondary={tutor.subjects.join(", ")}
                            />
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        担当する講師を選択し、賃金を入力してください。
                      </FormHelperText>
                    </FormControl>

                    <Stack spacing={1}>
                      <Typography variant="subtitle2">講師ごとの賃金（1回あたり）</Typography>
                      {selectedTutorIds.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                          講師を選択してください。
                        </Typography>
                      )}
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
                            InputProps={{ readOnly: !isEditing }}
                          />
                        );
                      })}
                    </Stack>
                  </Stack>
                </CardSection>

                <Divider />

                <Stack spacing={1}>
                  <Typography variant="subtitle2">作成日時</Typography>
                  <Typography variant="body2">
                    {new Date(selectedClass.createdAt).toLocaleString("ja-JP")}
                  </Typography>
                  <Typography variant="subtitle2">更新日時</Typography>
                  <Typography variant="body2">
                    {new Date(selectedClass.updatedAt).toLocaleString("ja-JP")}
                  </Typography>
                </Stack>
              </>
            )}

            <Box />
            <DialogActions sx={{ px: 0 }}>
              <Button onClick={handleDetailClose} disabled={detailSubmitting}>
                閉じる
              </Button>
              {isEditing ? (
                <>
                  <Button onClick={handleEditCancel} disabled={detailSubmitting}>
                    キャンセル
                  </Button>
                  <Button type="submit" variant="contained" disabled={detailSubmitting}>
                    {detailSubmitting ? "保存中..." : "保存"}
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit} variant="contained">
                  編集
                </Button>
              )}
            </DialogActions>
          </Stack>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

function CardSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack spacing={2}>
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
      {children}
    </Stack>
  );
}

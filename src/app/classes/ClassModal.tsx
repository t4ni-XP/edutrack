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
import type { ClassDetail } from "./types";

export type ClassStudentOption = {
  id: string;
  name: string;
  grade: number;
};

export type ClassTutorOption = {
  id: string;
  name: string;
  subjects: string[];
};

export type ClassPayload = {
  name: string;
  classType: string;
  weekday: string;
  classRoom: string;
  startsAt: string | null;
  endsAt: string | null;
  capacity: number | null;
  studentUnitFee: number;
  studentIds: string[];
  tutorAssignments: { tutorId: string; wageAmount: number }[];
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

const initialForm: ClassFormState = {
  name: "",
  classType: "",
  weekday: "",
  classRoom: "",
  startsAt: "",
  endsAt: "",
  capacity: "",
  studentUnitFee: "",
};

function createFormState(cls?: ClassDetail | null): ClassFormState {
  if (!cls) return initialForm;
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

function validate(
  form: ClassFormState,
  students: string[],
  tutors: string[],
  tutorWages: Record<string, string>,
) {
  if (!form.name.trim()) return "クラス名を入力してください。";
  if (!form.classType) return "クラス種別を選択してください。";
  if (!form.weekday) return "曜日を選択してください。";
  if (!form.classRoom.trim()) return "教室を入力してください。";
  const fee = Number(form.studentUnitFee);
  if (!Number.isFinite(fee) || fee <= 0) return "生徒単価は 1 以上の数値で入力してください。";
  if (form.capacity.trim()) {
    const capacity = Number(form.capacity);
    if (!Number.isInteger(capacity) || capacity < 0)
      return "定員は 0 以上の整数で入力してください。";
  }
  if (students.length === 0) return "生徒を1名以上選択してください。";
  if (tutors.length === 0) return "講師を1名以上選択してください。";
  for (const tutorId of tutors) {
    const wage = Number(tutorWages[tutorId]);
    if (!Number.isFinite(wage) || wage <= 0) return "講師の賃金は 1 以上の数値で入力してください。";
  }
  return null;
}

function toPayload(
  form: ClassFormState,
  students: string[],
  tutors: string[],
  tutorWages: Record<string, string>,
): ClassPayload {
  return {
    name: form.name.trim(),
    classType: form.classType,
    weekday: form.weekday,
    classRoom: form.classRoom.trim(),
    startsAt: form.startsAt.trim() ? form.startsAt.trim() : null,
    endsAt: form.endsAt.trim() ? form.endsAt.trim() : null,
    capacity: form.capacity.trim() ? Number(form.capacity) : null,
    studentUnitFee: Number(form.studentUnitFee),
    studentIds: students,
    tutorAssignments: tutors.map((tutorId) => ({
      tutorId,
      wageAmount: Number(tutorWages[tutorId]),
    })),
  };
}

export type ClassModalMode = "create" | "detail";

interface ClassModalProps {
  open: boolean;
  mode: ClassModalMode;
  classTypes: string[];
  weekdays: string[];
  students: ClassStudentOption[];
  tutors: ClassTutorOption[];
  classData?: ClassDetail | null;
  onClose: () => void;
  onCreate?: (payload: ClassPayload) => Promise<void>;
  onUpdate?: (id: string, payload: ClassPayload) => Promise<ClassDetail | void>;
}

export default function ClassModal({
  open,
  mode,
  classTypes,
  weekdays,
  students,
  tutors,
  classData,
  onClose,
  onCreate,
  onUpdate,
}: ClassModalProps) {
  const isCreate = mode === "create";
  const [form, setForm] = useState<ClassFormState>(() => createFormState(classData));
  const [selectedStudents, setSelectedStudents] = useState<string[]>(() =>
    classData ? classData.students.map((student) => student.id) : [],
  );
  const [selectedTutors, setSelectedTutors] = useState<string[]>(() =>
    classData ? classData.tutors.map((tutor) => tutor.id) : [],
  );
  const [tutorWages, setTutorWages] = useState<Record<string, string>>(() => {
    if (!classData) return {};
    return classData.tutors.reduce<Record<string, string>>((acc, tutor) => {
      acc[tutor.id] = String(tutor.wageAmount);
      return acc;
    }, {});
  });
  const [editing, setEditing] = useState(isCreate);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(createFormState(classData));
      const studentIds = classData ? classData.students.map((student) => student.id) : [];
      const tutorIds = classData ? classData.tutors.map((tutor) => tutor.id) : [];
      setSelectedStudents(studentIds);
      setSelectedTutors(tutorIds);
      setTutorWages(
        classData
          ? classData.tutors.reduce<Record<string, string>>((acc, tutor) => {
              acc[tutor.id] = String(tutor.wageAmount);
              return acc;
            }, {})
          : {},
      );
      setEditing(isCreate);
      setSubmitting(false);
      setError(null);
      setInfo(null);
    }
  }, [open, classData, isCreate]);

  useEffect(() => {
    if (!isCreate && classData) {
      setForm(createFormState(classData));
      setSelectedStudents(classData.students.map((student) => student.id));
      setSelectedTutors(classData.tutors.map((tutor) => tutor.id));
      setTutorWages(
        classData.tutors.reduce<Record<string, string>>((acc, tutor) => {
          acc[tutor.id] = String(tutor.wageAmount);
          return acc;
        }, {}),
      );
    }
  }, [classData, isCreate]);

  const readOnly = !editing;

  const handleFieldChange =
    (field: keyof ClassFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleSelectFieldChange =
    (field: "classType" | "weekday") => (event: SelectChangeEvent<string>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleStudentsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const parsed = typeof value === "string" ? value.split(",") : value;
    setSelectedStudents(Array.from(new Set(parsed)));
  };

  const handleTutorsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const parsed = typeof value === "string" ? value.split(",") : value;
    const unique = Array.from(new Set(parsed));
    setSelectedTutors(unique);
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

  const metadata = useMemo(() => {
    if (!classData) return null;
    const createdAt = new Date(classData.createdAt);
    const updatedAt = new Date(classData.updatedAt);
    return {
      createdAt: Number.isNaN(createdAt.getTime())
        ? classData.createdAt
        : createdAt.toLocaleString("ja-JP"),
      updatedAt: Number.isNaN(updatedAt.getTime())
        ? classData.updatedAt
        : updatedAt.toLocaleString("ja-JP"),
      status: classData.status,
    };
  }, [classData]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    const validationError = validate(form, selectedStudents, selectedTutors, tutorWages);
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = toPayload(form, selectedStudents, selectedTutors, tutorWages);
    setSubmitting(true);
    try {
      if (isCreate) {
        if (!onCreate) throw new Error("onCreate handler is not provided.");
        await onCreate(payload);
        onClose();
        return;
      }
      if (!classData || !onUpdate) throw new Error("onUpdate handler is not provided.");
      const updated = await onUpdate(classData.id, payload);
      if (updated && mode === "detail") {
        setForm(createFormState(updated as ClassDetail));
        setSelectedStudents(updated.students.map((student) => student.id));
        setSelectedTutors(updated.tutors.map((tutor) => tutor.id));
        setTutorWages(
          updated.tutors.reduce<Record<string, string>>((acc, tutor) => {
            acc[tutor.id] = String(tutor.wageAmount);
            return acc;
          }, {}),
        );
      }
      setEditing(false);
      setInfo("クラス情報を更新しました。");
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
    if (!classData) return;
    setForm(createFormState(classData));
    setSelectedStudents(classData.students.map((student) => student.id));
    setSelectedTutors(classData.tutors.map((tutor) => tutor.id));
    setTutorWages(
      classData.tutors.reduce<Record<string, string>>((acc, tutor) => {
        acc[tutor.id] = String(tutor.wageAmount);
        return acc;
      }, {}),
    );
    setEditing(false);
    setError(null);
    setInfo(null);
  };

  const formId = isCreate ? "class-create-form" : "class-detail-form";

  const renderStudentLabel = (id: string) => {
    const student = students.find((item) => item.id === id);
    if (!student) return id;
    return `${student.name}（${student.grade}年）`;
  };

  const renderTutorLabel = (id: string) => {
    const tutor = tutors.find((item) => item.id === id);
    if (!tutor) return id;
    return tutor.name;
  };

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (submitting && reason === "backdropClick") return;
        onClose();
      }}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>{isCreate ? "クラスの作成" : "クラス詳細"}</DialogTitle>
      <DialogContent>
        <Stack component="form" id={formId} onSubmit={handleSubmit} spacing={3} mt={1}>
          {error && <Alert severity="error">{error}</Alert>}
          {info && <Alert severity="success">{info}</Alert>}

          <Stack spacing={2}>
            <Typography variant="h6">基本情報</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="クラス名"
                  value={form.name}
                  onChange={handleFieldChange("name")}
                  required
                  InputProps={{ readOnly }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel id="class-type-select-label">クラス種別</InputLabel>
                  <Select
                    labelId="class-type-select-label"
                    label="クラス種別"
                    value={form.classType}
                    onChange={handleSelectFieldChange("classType")}
                    disabled={readOnly}
                  >
                    {classTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel id="weekday-select-label">曜日</InputLabel>
                  <Select
                    labelId="weekday-select-label"
                    label="曜日"
                    value={form.weekday}
                    onChange={handleSelectFieldChange("weekday")}
                    disabled={readOnly}
                  >
                    {weekdays.map((weekday) => (
                      <MenuItem key={weekday} value={weekday}>
                        {weekday}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="教室"
                  value={form.classRoom}
                  onChange={handleFieldChange("classRoom")}
                  required
                  InputProps={{ readOnly }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="開始時間 (HH:mm)"
                  value={form.startsAt}
                  onChange={handleFieldChange("startsAt")}
                  placeholder="18:00"
                  InputProps={{ readOnly }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="終了時間 (HH:mm)"
                  value={form.endsAt}
                  onChange={handleFieldChange("endsAt")}
                  placeholder="19:30"
                  InputProps={{ readOnly }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="定員"
                  type="number"
                  value={form.capacity}
                  onChange={handleFieldChange("capacity")}
                  inputProps={{ min: 0 }}
                  InputProps={{ readOnly }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="生徒単価（1回あたり）"
                  type="number"
                  value={form.studentUnitFee}
                  onChange={handleFieldChange("studentUnitFee")}
                  required
                  inputProps={{ min: 1 }}
                  InputProps={{ readOnly }}
                />
              </Grid>
            </Grid>
          </Stack>

          <Stack spacing={2}>
            <Typography variant="h6">生徒</Typography>
            <FormControl fullWidth>
              <InputLabel id="class-students-select">生徒</InputLabel>
              <Select
                labelId="class-students-select"
                label="生徒"
                multiple
                value={selectedStudents}
                onChange={handleStudentsChange}
                renderValue={(selected) =>
                  (Array.isArray(selected) ? selected : [])
                    .map((id) => renderStudentLabel(String(id)))
                    .join(", ")
                }
                disabled={readOnly}
              >
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    <Checkbox checked={selectedStudents.includes(student.id)} />
                    <ListItemText primary={renderStudentLabel(student.id)} />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>割り当てる生徒を選択してください。</FormHelperText>
            </FormControl>
          </Stack>

          <Stack spacing={2}>
            <Typography variant="h6">講師</Typography>
            <FormControl fullWidth>
              <InputLabel id="class-tutors-select">講師</InputLabel>
              <Select
                labelId="class-tutors-select"
                label="講師"
                multiple
                value={selectedTutors}
                onChange={handleTutorsChange}
                renderValue={(selected) =>
                  (Array.isArray(selected) ? selected : [])
                    .map((id) => renderTutorLabel(String(id)))
                    .join(", ")
                }
                disabled={readOnly}
              >
                {tutors.map((tutor) => (
                  <MenuItem key={tutor.id} value={tutor.id}>
                    <Checkbox checked={selectedTutors.includes(tutor.id)} />
                    <ListItemText primary={tutor.name} secondary={tutor.subjects.join(", ")} />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>担当する講師を選択し、賃金を入力してください。</FormHelperText>
            </FormControl>
            <Stack spacing={1}>
              {selectedTutors.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  講師を選択してください。
                </Typography>
              )}
              {selectedTutors.map((tutorId) => (
                <TextField
                  key={tutorId}
                  label={renderTutorLabel(tutorId)}
                  type="number"
                  value={tutorWages[tutorId] ?? ""}
                  onChange={handleTutorWageChange(tutorId)}
                  inputProps={{ min: 1 }}
                  InputProps={{ readOnly }}
                />
              ))}
            </Stack>
          </Stack>

          {!isCreate && metadata && (
            <>
              <Divider />
              <Typography variant="h6">メタ情報</Typography>
              <Typography variant="subtitle2">ステータス</Typography>
              <Typography variant="body2">{metadata.status}</Typography>
              <Typography variant="subtitle2">作成日時</Typography>
              <Typography variant="body2">{metadata.createdAt}</Typography>
              <Typography variant="subtitle2">更新日時</Typography>
              <Typography variant="body2">{metadata.updatedAt}</Typography>
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
            {submitting ? "作成中..." : "作成"}
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

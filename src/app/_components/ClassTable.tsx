import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Chip,
  Box,
  Typography,
} from "@mui/material";

type Student = { name: string; grade: number };

export interface ClassTableRow {
  id: string | number;
  weekday?: string;
  className?: string;
  classroom?: string;
  tutor?: string | string[];
  students?: Student[];
}

type StudentsMode = "count" | "names" | "detailed" | "chips";

interface ClassTableProps {
  rows: ClassTableRow[];

  // 列表示フラグ（未指定はfalse）
  weekday?: boolean;
  className?: boolean;
  classroom?: boolean;
  tutor?: boolean;
  students?: boolean;

  // 学年表示のモード設定
  studentsMode?: StudentsMode; // デフォ: "detailed"
}

export default function ClassTable({
  rows,
  weekday = false,
  className = false,
  classroom = false,
  tutor = false,
  students = false,
  studentsMode = "detailed",
}: ClassTableProps) {
  const columns = [
    { key: "weekday", label: "曜日", enabled: weekday },
    { key: "className", label: "クラス名", enabled: className },
    { key: "classroom", label: "教室", enabled: classroom },
    { key: "tutor", label: "講師", enabled: tutor },
    { key: "students", label: "生徒", enabled: students },
  ].filter((c) => c.enabled);

  if (columns.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          表示する列が選ばれていません
        </Typography>
      </Paper>
    );
  }

  const renderStudents = (list?: Student[]) => {
    if (!list || list.length === 0) return "-";

    const toLabel = (s: Student) => `${s.grade ? ` ${s.grade}年` : ""} ${s.name}`;

    switch (studentsMode) {
      case "count":
        return `${list.length}名`;
      case "names":
        return list.map((s) => s.name).join(", ");
      case "detailed":
        return list.map(toLabel).join(", ");
      case "chips":
        return (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {list.map((s, i) => (
              <Chip key={`${s.name}-${i}`} size="small" label={toLabel(s)} />
            ))}
          </Box>
        );
      default:
        return list.map(toLabel).join(", ");
    }
  };

  const renderCell = (row: ClassTableRow, key: string) => {
    switch (key) {
      case "weekday":
        return row.weekday ?? "-";
      case "className":
        return row.className ?? "-";
      case "classroom":
        return row.classroom ?? "-";
      case "tutor": {
        const t = row.tutor;
        if (Array.isArray(t)) return t.join(", ");
        return t ?? "-";
      }
      case "students":
        return renderStudents(row.students);
      default:
        return "-";
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table size={"medium"} stickyHeader={true}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.key}>{col.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                No DATA
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} hover>
                {columns.map((col) => (
                  <TableCell key={col.key}>{renderCell(row, col.key)}</TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

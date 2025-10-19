import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

export interface ClassesTableRow {
  id: string | number;
  name: string;
  classType: string;
  weekday: string;
  classRoom: string;
  startsAt: string | null;
  endsAt: string | null;
  tutors: string[];
  students: string[];
}

interface ClassesTableProps {
  rows: ClassesTableRow[];
}

export default function ClassesTable({ rows }: ClassesTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table size="medium" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>クラス名</TableCell>
            <TableCell>種別</TableCell>
            <TableCell>曜日</TableCell>
            <TableCell>教室</TableCell>
            <TableCell>開始</TableCell>
            <TableCell>終了</TableCell>
            <TableCell>講師</TableCell>
            <TableCell>生徒</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                No DATA
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.classType}</TableCell>
                <TableCell>{row.weekday}</TableCell>
                <TableCell>{row.classRoom}</TableCell>
                <TableCell>{row.startsAt ?? "-"}</TableCell>
                <TableCell>{row.endsAt ?? "-"}</TableCell>
                <TableCell>{row.tutors.join(", ") || "-"}</TableCell>
                <TableCell>{row.students.join(", ") || "-"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

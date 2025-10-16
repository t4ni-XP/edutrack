// StudentsTable.tsx
"use client";
import { Chip, TextField } from "@mui/material";
import DataTable, { Column } from "./DataTable";
import type { StudentListRow } from "@/app/master/students/types";

const statusLabel: Record<StudentListRow["status"], string> = {
  ACTIVE: "在籍中",
  INACTIVE: "休会",
  GRADUATED: "卒業",
};

const columns: Column<StudentListRow>[] = [
  { key: "name", header: "氏名", accessor: (r) => r.name, sortAccessor: (r) => r.name },
  {
    key: "grade",
    header: "学年",
    accessor: (r) => `${r.grade}年`,
    sortAccessor: (r) => r.grade,
    width: 100,
    align: "right",
  },
  {
    key: "status",
    header: "ステータス",
    accessor: (r) => <Chip size="small" label={statusLabel[r.status]} />,
  },
  {
    key: "classCount",
    header: "在籍クラス",
    accessor: (r) => r.classCount,
    sortAccessor: (r) => r.classCount,
    align: "right",
    width: 120,
  },
  {
    key: "billableCount",
    header: "請求対象",
    accessor: (r) => r.billableCount,
    sortAccessor: (r) => r.billableCount,
    align: "right",
    width: 120,
  },
  {
    key: "presentCount",
    header: "出席",
    accessor: (r) => r.presentCount,
    sortAccessor: (r) => r.presentCount,
    align: "right",
    width: 100,
  },
  {
    key: "absentCount",
    header: "欠席",
    accessor: (r) => r.absentCount,
    sortAccessor: (r) => r.absentCount,
    align: "right",
    width: 100,
  },
];

export default function StudentsTable({
  rows,
  editable = false,
  onRowsChange,
  onRowClick,
}: {
  rows: StudentListRow[];
  editable?: boolean;
  onRowsChange?: (_next: StudentListRow[]) => void;
  onRowClick?: (_row: StudentListRow) => void;
}) {
  // 名前のみ編集可能とする例
  const cols = columns.map((c) =>
    c.key !== "name"
      ? c
      : {
          ...c,
          renderEditCell: (row, commit) => (
            <TextField
              size="small"
              defaultValue={row.name}
              onChange={(e) => commit({ name: e.target.value })}
            />
          ),
        },
  );
  return (
    <DataTable
      rows={rows}
      columns={cols}
      stickyHeader
      dense
      editable={editable}
      onRowsChange={onRowsChange}
      onRowClick={onRowClick}
    />
  );
}

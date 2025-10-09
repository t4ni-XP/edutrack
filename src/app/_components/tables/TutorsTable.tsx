// TutorsTable.tsx
"use client";
import { Chip } from "@mui/material";
import DataTable, { Column } from "./DataTable";
import type { TutorRow } from "@/mock/mastar";

const columns: Column<TutorRow>[] = [
  { key: "name", header: "氏名", accessor: (r) => r.name, sortAccessor: (r) => r.name },
  { key: "email", header: "Email", accessor: (r) => r.email, sortAccessor: (r) => r.email },
  { key: "subjects", header: "担当科目", accessor: (r) => r.subjects.join(", ") },
  {
    key: "needsPickup",
    header: "送迎",
    accessor: (r) => (
      <Chip
        size="small"
        label={r.needsPickup ? "要" : "不要"}
        color={r.needsPickup ? "warning" : "default"}
      />
    ),
  },
  {
    key: "classCount",
    header: "担当クラス",
    accessor: (r) => r.classCount,
    sortAccessor: (r) => r.classCount,
    align: "right",
    width: 120,
  },
  {
    key: "sessionsWorked",
    header: "担当回数",
    accessor: (r) => r.sessionsWorked,
    sortAccessor: (r) => r.sessionsWorked,
    align: "right",
    width: 120,
  },
  {
    key: "minutesWorked",
    header: "授業分数",
    accessor: (r) => r.minutesWorked,
    sortAccessor: (r) => r.minutesWorked,
    align: "right",
    width: 120,
  },
  {
    key: "opMinutes",
    header: "運営分数",
    accessor: (r) => r.opMinutes,
    sortAccessor: (r) => r.opMinutes,
    align: "right",
    width: 120,
  },
];

export default function TutorsTable({ rows }: { rows: TutorRow[] }) {
  return <DataTable rows={rows} columns={columns} stickyHeader />;
}

// ClassesTable.tsx（ClassTable の統合版）
"use client";
import { Chip, Box } from "@mui/material";
import DataTable, { Column } from "./DataTable";
import type { ClassVM, Status, Weekday, ClassType } from "@/mock/mock";

const weekdayLabel: Record<Weekday, string> = {
  MONDAY: "月",
  TUESDAY: "火",
  WEDNESDAY: "水",
  THURSDAY: "木",
  FRIDAY: "金",
  SATURDAY: "土",
  SUNDAY: "日",
};

const classTypeLabel: Record<ClassType, string> = {
  ENGLISH: "英語",
  INDIVIDUAL: "個別",
  INTERACTIVE: "双方向",
  JAPANESE: "国語",
};

const statusLabel: Record<Status, { text: string; color: "default" | "success" | "warning" }> = {
  ACTIVE: { text: "稼働", color: "success" },
  INACTIVE: { text: "休止", color: "warning" },
  GRADUATED: { text: "終了", color: "default" },
};

const columns: Column<ClassVM>[] = [
  {
    key: "weekday",
    header: "曜日",
    accessor: (r) => weekdayLabel[r.weekday],
    sortAccessor: (r) => r.weekday,
    width: 80,
  },
  { key: "name", header: "クラス名", accessor: (r) => r.name, sortAccessor: (r) => r.name },
  {
    key: "classType",
    header: "種別",
    accessor: (r) => classTypeLabel[r.classType],
    width: 110,
  },
  { key: "classRoom", header: "教室", accessor: (r) => r.classRoom, width: 110 },
  {
    key: "status",
    header: "ステータス",
    accessor: (r) => {
      const { text, color } = statusLabel[r.status];
      return <Chip size="small" label={text} color={color} />;
    },
    width: 110,
  },
  {
    key: "time",
    header: "時間",
    accessor: (r) => (r.startsAt && r.endsAt ? `${r.startsAt} - ${r.endsAt}` : (r.startsAt ?? "-")),
    width: 140,
  },
  {
    key: "capacity",
    header: "定員",
    accessor: (r) => r.capacity ?? "未設定",
    align: "right",
    width: 100,
  },
  {
    key: "tutors",
    header: "講師",
    accessor: (r) => r.tutors.map((t) => t.name).join(", "),
  },
  {
    key: "students",
    header: "生徒",
    accessor: (r) => (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {r.students.map((s) => (
          <Chip key={s.id} size="small" label={`${s.grade}年 ${s.name}`} />
        ))}
      </Box>
    ),
  },
  {
    key: "fee",
    header: "単価",
    accessor: (r) => `¥${r.studentUnitFee.toLocaleString()}`,
    align: "right",
    width: 120,
  },
];

export default function ClassesTable({
  rows,
  onRowClick,
}: {
  rows: ClassVM[];
  onRowClick?: (_row: ClassVM) => void;
}) {
  return <DataTable rows={rows} columns={columns} onRowClick={onRowClick} stickyHeader />;
}

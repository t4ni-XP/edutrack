export interface StudentFeeRow {
  id: string;
  name: string;
  grade: number;
  openedCount: number;
  presentCount: number;
  absentCount: number;
  excusedCount: number;
  totalFee: number;
}

export function toStudentFeeCsv(rows: StudentFeeRow[]): string {
  const headers = [
    "生徒名",
    "学年",
    "開講回数",
    "出席回数",
    "欠席回数",
    "公欠回数",
    "料金",
  ];
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        escapeCsv(row.name),
        row.grade,
        row.openedCount,
        row.presentCount,
        row.absentCount,
        row.excusedCount,
        row.totalFee,
      ].join(","),
    ),
  ];
  return lines.join("\n");
}

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

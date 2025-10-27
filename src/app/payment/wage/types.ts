export interface TutorWageRow {
  id: string;
  name: string;
  openedCount: number;
  mondayCount: number;
  tuesdayCount: number;
  wednesdayCount: number;
  thursdayCount: number;
  fridayCount: number;
  saturdayCount: number;
  sundayCount: number;
  totalWage: number;
}

export function toTutorWageCsv(rows: TutorWageRow[]): string {
  const headers = [
    "チューター名",
    "開講回数",
    "月曜",
    "火曜",
    "水曜",
    "木曜",
    "金曜",
    "土曜",
    "日曜",
    "合計料金",
  ];
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        escapeCsv(row.name),
        row.openedCount,
        row.mondayCount,
        row.tuesdayCount,
        row.wednesdayCount,
        row.thursdayCount,
        row.fridayCount,
        row.saturdayCount,
        row.sundayCount,
        row.totalWage,
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

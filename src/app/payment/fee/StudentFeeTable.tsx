"use client";
import { useMemo } from "react";
import { Box, Button, Stack, Tooltip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import DataTable, { type Column } from "@/app/_components/tables/DataTable";
import type { StudentFeeRow } from "./types";
import { toStudentFeeCsv } from "./types";

const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
});

const columns: Column<StudentFeeRow>[] = [
  {
    key: "name",
    header: "生徒名",
    accessor: (row) => row.name,
    sortAccessor: (row) => row.name,
  },
  {
    key: "grade",
    header: "学年",
    accessor: (row) => `${row.grade}年`,
    sortAccessor: (row) => row.grade,
    align: "right",
    width: 120,
  },
  {
    key: "openedCount",
    header: "開講回数",
    accessor: (row) => row.openedCount,
    sortAccessor: (row) => row.openedCount,
    align: "right",
    width: 120,
  },
  {
    key: "presentCount",
    header: "出席",
    accessor: (row) => row.presentCount,
    sortAccessor: (row) => row.presentCount,
    align: "right",
    width: 100,
  },
  {
    key: "absentCount",
    header: "欠席",
    accessor: (row) => row.absentCount,
    sortAccessor: (row) => row.absentCount,
    align: "right",
    width: 100,
  },
  {
    key: "excusedCount",
    header: "公欠",
    accessor: (row) => row.excusedCount,
    sortAccessor: (row) => row.excusedCount,
    align: "right",
    width: 100,
  },
  {
    key: "totalFee",
    header: "料金",
    accessor: (row) => currencyFormatter.format(row.totalFee),
    sortAccessor: (row) => row.totalFee,
    align: "right",
    width: 160,
  },
];

interface StudentFeeTableProps {
  rows: StudentFeeRow[];
  monthValue: string;
}

export default function StudentFeeTable({ rows, monthValue }: StudentFeeTableProps) {
  const csvDataUrl = useMemo(() => {
    if (!rows.length) return null;
    const csvWithBom = `\uFEFF${toStudentFeeCsv(rows)}`;
    return `data:text/csv;charset=utf-8,${encodeURIComponent(csvWithBom)}`;
  }, [rows]);

  const downloadFilename = useMemo(() => {
    const normalized = monthValue?.replace("-", "_") || "latest";
    return `student-fees_${normalized}.csv`;
  }, [monthValue]);

  return (
    <Stack spacing={2}>
      <DataTable rows={rows} columns={columns} stickyHeader dense />
      <Box display="flex" justifyContent="flex-end">
        <Tooltip title="表示中のデータをCSVでダウンロード">
          <span>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              disabled={!csvDataUrl}
              component="a"
              href={csvDataUrl ?? undefined}
              download={downloadFilename}
            >
              CSV出力
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Stack>
  );
}

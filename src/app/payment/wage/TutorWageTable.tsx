"use client";
import { useMemo } from "react";
import { Box, Button, Stack, Tooltip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import DataTable, { type Column } from "@/app/_components/tables/DataTable";
import type { TutorWageRow } from "./types";
import { toTutorWageCsv } from "./types";

const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
});

const columns: Column<TutorWageRow>[] = [
  {
    key: "name",
    header: "チューター名",
    accessor: (row) => row.name,
    sortAccessor: (row) => row.name,
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
    key: "monday",
    header: "月",
    accessor: (row) => row.mondayCount,
    sortAccessor: (row) => row.mondayCount,
    align: "right",
    width: 70,
  },
  {
    key: "tuesday",
    header: "火",
    accessor: (row) => row.tuesdayCount,
    sortAccessor: (row) => row.tuesdayCount,
    align: "right",
    width: 70,
  },
  {
    key: "wednesday",
    header: "水",
    accessor: (row) => row.wednesdayCount,
    sortAccessor: (row) => row.wednesdayCount,
    align: "right",
    width: 70,
  },
  {
    key: "thursday",
    header: "木",
    accessor: (row) => row.thursdayCount,
    sortAccessor: (row) => row.thursdayCount,
    align: "right",
    width: 70,
  },
  {
    key: "friday",
    header: "金",
    accessor: (row) => row.fridayCount,
    sortAccessor: (row) => row.fridayCount,
    align: "right",
    width: 70,
  },
  {
    key: "saturday",
    header: "土",
    accessor: (row) => row.saturdayCount,
    sortAccessor: (row) => row.saturdayCount,
    align: "right",
    width: 70,
  },
  {
    key: "sunday",
    header: "日",
    accessor: (row) => row.sundayCount,
    sortAccessor: (row) => row.sundayCount,
    align: "right",
    width: 70,
  },
  {
    key: "totalWage",
    header: "合計料金",
    accessor: (row) => currencyFormatter.format(row.totalWage),
    sortAccessor: (row) => row.totalWage,
    align: "right",
    width: 160,
  },
];

interface TutorWageTableProps {
  rows: TutorWageRow[];
  monthValue: string;
}

export default function TutorWageTable({ rows, monthValue }: TutorWageTableProps) {
  const csvDataUrl = useMemo(() => {
    if (!rows.length) return null;
    const csvWithBom = `\uFEFF${toTutorWageCsv(rows)}`;
    return `data:text/csv;charset=utf-8,${encodeURIComponent(csvWithBom)}`;
  }, [rows]);

  const downloadFilename = useMemo(() => {
    const normalized = monthValue?.replace("-", "_") || "latest";
    return `tutor-wages_${normalized}.csv`;
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

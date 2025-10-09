// app/_components/ui/DataTable.tsx
"use client";
import * as React from "react";
import {
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper,
  TableSortLabel, TablePagination
} from "@mui/material";

export type Accessor<T> = (row: T) => React.ReactNode;
export type SortAccessor<T> = (row: T) => string | number | Date | null;

export interface Column<T> {
  key: string;
  header: string;
  width?: number | string;
  align?: "left" | "right" | "center";
  accessor: Accessor<T>;            // 表示
  sortAccessor?: SortAccessor<T>;   // ソート用（未指定ならソート不可）
  renderEditCell?: (row: T, onChange: (next: Partial<T>) => void) => React.ReactNode; // 任意: 編集
}

export interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  dense?: boolean;
  stickyHeader?: boolean;
  initialSort?: { key: string; direction: "asc" | "desc" };
  pageSizeOptions?: number[];
  onRowClick?: (row: T) => void;
  // 編集系（任意）
  editable?: boolean;
  onRowsChange?: (next: T[]) => void;
  getRowId?: (row: T) => string | number;
}

export default function DataTable<T>({
  rows,
  columns,
  dense,
  stickyHeader,
  initialSort,
  pageSizeOptions = [10, 25, 50],
  onRowClick,
  editable = false,
  onRowsChange,
  getRowId = (r: any) => r.id ?? JSON.stringify(r),
}: DataTableProps<T>) {
  const [orderBy, setOrderBy] = React.useState<string | undefined>(initialSort?.key);
  const [order, setOrder] = React.useState<"asc" | "desc">(initialSort?.direction ?? "asc");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(pageSizeOptions[0]);
  const [data, setData] = React.useState(rows);
  React.useEffect(() => setData(rows), [rows]);

  const colMap = React.useMemo(() => {
    const m = new Map(columns.map(c => [c.key, c]));
    return m;
  }, [columns]);

  const sorted = React.useMemo(() => {
    if (!orderBy) return data;
    const col = colMap.get(orderBy);
    if (!col?.sortAccessor) return data;
    const arr = [...data].sort((a, b) => {
      const va = col.sortAccessor!(a);
      const vb = col.sortAccessor!(b);
      const na = va instanceof Date ? va.getTime() : (va ?? 0 as any);
      const nb = vb instanceof Date ? vb.getTime() : (vb ?? 0 as any);
      return (na < nb ? -1 : na > nb ? 1 : 0) * (order === "asc" ? 1 : -1);
    });
    return arr;
  }, [data, orderBy, order, colMap]);

  const paged = React.useMemo(() => {
    const start = page * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, page, rowsPerPage]);

  const handleSort = (key: string) => {
    if (orderBy !== key) { setOrderBy(key); setOrder("asc"); }
    else setOrder(order === "asc" ? "desc" : "asc");
  };

  const commitRow = (idx: number, patch: Partial<T>) => {
    const next = [...data];
    next[idx] = { ...next[idx], ...patch };
    setData(next);
    onRowsChange?.(next);
  };

  return (
    <Paper>
      <TableContainer sx={{ maxHeight: stickyHeader ? 560 : undefined }}>
        <Table size={dense ? "small" : "medium"} stickyHeader={stickyHeader}>
          <TableHead>
            <TableRow>
              {columns.map(c => {
                const sortable = !!c.sortAccessor;
                return (
                  <TableCell key={c.key} align={c.align} sx={{ width: c.width, backgroundColor: "background.paper" }}>
                    {sortable ? (
                      <TableSortLabel
                        active={orderBy === c.key}
                        direction={orderBy === c.key ? order : "asc"}
                        onClick={() => handleSort(c.key)}
                      >
                        {c.header}
                      </TableSortLabel>
                    ) : c.header}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((row, i) => {
              const globalIdx = page * rowsPerPage + i;
              return (
                <TableRow
                  key={getRowId(row)}
                  hover
                  onClick={() => onRowClick?.(row)}
                  sx={{ cursor: onRowClick ? "pointer" : "default" }}
                >
                  {columns.map(col => (
                    <TableCell key={col.key} align={col.align}>
                      {editable && col.renderEditCell
                        ? col.renderEditCell(row, (patch) => commitRow(globalIdx, patch))
                        : col.accessor(row)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            {paged.length === 0 && (
              <TableRow><TableCell colSpan={columns.length} align="center">No data</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={sorted.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={pageSizeOptions}
      />
    </Paper>
  );
}
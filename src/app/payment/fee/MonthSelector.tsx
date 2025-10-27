"use client";
import { IconButton, Stack, TextField, Tooltip } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function MonthSelector({ value }: { value: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateMonth = (nextValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextValue) params.set("month", nextValue);
    else params.delete("month");
    const query = params.toString();
    startTransition(() => {
      router.replace(`/payment/fee${query ? `?${query}` : ""}`, { scroll: false });
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateMonth(event.target.value);
  };

  const shiftMonth = (delta: number) => {
    const { year, month } = parseYearMonth(value) ?? getTodayYearMonth();
    const date = new Date(Date.UTC(year, month - 1 + delta, 1));
    const nextYear = date.getUTCFullYear();
    const nextMonth = date.getUTCMonth() + 1;
    updateMonth(`${nextYear}-${String(nextMonth).padStart(2, "0")}`);
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Tooltip title="前月">
        <span>
          <IconButton size="small" onClick={() => shiftMonth(-1)} disabled={isPending}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <TextField
        label="対象月"
        type="month"
        size="small"
        value={value}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        disabled={isPending}
      />
      <Tooltip title="翌月">
        <span>
          <IconButton size="small" onClick={() => shiftMonth(1)} disabled={isPending}>
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}

function parseYearMonth(input: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(input);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null;
  return { year, month };
}

function getTodayYearMonth() {
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

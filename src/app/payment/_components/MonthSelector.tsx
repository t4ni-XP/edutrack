"use client";
import { IconButton, Stack, TextField, Tooltip } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { shiftYearMonth } from "../utils/month";

interface MonthSelectorProps {
  value: string;
  basePath: string;
  queryKey?: string;
}

export default function MonthSelector({
  value,
  basePath,
  queryKey = "month",
}: MonthSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateMonth = (nextValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextValue) params.set(queryKey, nextValue);
    else params.delete(queryKey);
    const query = params.toString();
    startTransition(() => {
      router.replace(`${basePath}${query ? `?${query}` : ""}`, { scroll: false });
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateMonth(event.target.value);
  };

  const handleShift = (delta: number) => {
    updateMonth(shiftYearMonth(value, delta));
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Tooltip title="前月">
        <span>
          <IconButton size="small" onClick={() => handleShift(-1)} disabled={isPending}>
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
          <IconButton size="small" onClick={() => handleShift(1)} disabled={isPending}>
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}

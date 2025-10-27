export interface MonthRange {
  startDate: Date;
  endDate: Date;
  label: string;
  value: string;
}

export function getMonthRange(monthParam?: string): MonthRange {
  const parsed = parseYearMonth(monthParam);
  const now = new Date();
  const year = parsed?.year ?? now.getFullYear();
  const month = parsed?.month ?? now.getMonth() + 1;
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));
  const label = `${year}年${month}月`;
  const value = `${year}-${String(month).padStart(2, "0")}`;
  return { startDate, endDate, label, value };
}

export function parseYearMonth(value?: string) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null;
  if (month < 1 || month > 12) return null;
  return { year, month };
}

export function shiftYearMonth(value: string, delta: number) {
  const base = parseYearMonth(value) ?? getTodayYearMonth();
  const date = new Date(Date.UTC(base.year, base.month - 1 + delta, 1));
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
}

function getTodayYearMonth() {
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

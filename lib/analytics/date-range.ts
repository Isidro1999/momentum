import {
  eachDayOfInterval,
  format,
  parseISO,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { getTodayDateString } from "@/lib/dates";

export type ProgressPeriod =
  | "7d"
  | "30d"
  | "month"
  | "3m"
  | "all";

export const PROGRESS_PERIOD_LABELS: Record<ProgressPeriod, string> = {
  "7d": "Últimos 7 días",
  "30d": "Últimos 30 días",
  month: "Este mes",
  "3m": "Últimos 3 meses",
  all: "Todos",
};

export interface DateRange {
  start: string;
  end: string;
  days: string[];
}

function toDateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function buildDateRange(
  period: ProgressPeriod,
  today: string = getTodayDateString(),
  earliestDate?: string,
): DateRange {
  const endDate = parseISO(today);
  let startDate: Date;

  switch (period) {
    case "7d":
      startDate = subDays(endDate, 6);
      break;
    case "30d":
      startDate = subDays(endDate, 29);
      break;
    case "month":
      startDate = startOfMonth(endDate);
      break;
    case "3m":
      startDate = subMonths(endDate, 3);
      break;
    case "all":
      startDate = earliestDate
        ? parseISO(earliestDate)
        : subDays(endDate, 29);
      break;
  }

  if (startDate > endDate) {
    startDate = endDate;
  }

  const days = eachDayOfInterval({ start: startDate, end: endDate }).map(
    (day) => toDateString(day),
  );

  return {
    start: toDateString(startDate),
    end: today,
    days,
  };
}

export function isDateInRange(
  date: string,
  range: DateRange,
): boolean {
  return date >= range.start && date <= range.end;
}

export function findEarliestDate(dates: string[]): string | undefined {
  if (dates.length === 0) {
    return undefined;
  }

  return [...dates].sort((a, b) => a.localeCompare(b))[0];
}

export function average(values: number[]): number | null {
  const finite = values.filter((value) => Number.isFinite(value));
  if (finite.length === 0) {
    return null;
  }

  const sum = finite.reduce((total, value) => total + value, 0);
  return Math.round((sum / finite.length) * 10) / 10;
}

export function percent(part: number, total: number): number | null {
  if (!Number.isFinite(part) || !Number.isFinite(total) || total === 0) {
    return null;
  }

  return Math.round((part / total) * 100);
}

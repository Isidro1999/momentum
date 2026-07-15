import { format } from "date-fns";

export function getTodayDateString(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

export function isSameDate(dateA: string, dateB: string): boolean {
  return dateA === dateB;
}

export function isFutureDate(
  date: string,
  today: string = getTodayDateString(),
): boolean {
  return date > today;
}

export function isPastDate(
  date: string,
  today: string = getTodayDateString(),
): boolean {
  return date < today;
}

/** Convierte un ISO timestamp a fecha local YYYY-MM-DD. */
export function isoToLocalDateString(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso.slice(0, 10);
  }

  return format(date, "yyyy-MM-dd");
}

export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export type DayGreeting = "Buenos días" | "Buenas tardes" | "Buenas noches";

export function getDayGreeting(date: Date = new Date()): DayGreeting {
  const hour = date.getHours();
  if (hour < 12) {
    return "Buenos días";
  }
  if (hour < 19) {
    return "Buenas tardes";
  }
  return "Buenas noches";
}

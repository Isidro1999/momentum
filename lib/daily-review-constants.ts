export const SCALE_MIN = 1;
export const SCALE_MAX = 10;
export const SLEEP_MIN = 0;
export const SLEEP_MAX = 24;

export const SCALE_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export type BitacoraPeriodFilter =
  | "7d"
  | "30d"
  | "month"
  | "all";

export const BITACORA_PERIOD_LABELS: Record<BitacoraPeriodFilter, string> = {
  "7d": "Últimos 7 días",
  "30d": "Últimos 30 días",
  month: "Este mes",
  all: "Todos",
};

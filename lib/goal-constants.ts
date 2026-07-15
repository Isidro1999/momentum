import type { GoalStatus, ProgressMode } from "@/types";

export const GOAL_STATUSES: GoalStatus[] = [
  "activo",
  "pausado",
  "completado",
  "cancelado",
];

export const PROGRESS_MODES: ProgressMode[] = ["hitos", "tareas", "manual"];

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  activo: "Activo",
  pausado: "Pausado",
  completado: "Completado",
  cancelado: "Cancelado",
};

export const PROGRESS_MODE_LABELS: Record<ProgressMode, string> = {
  hitos: "Automático por hitos",
  tareas: "Automático por tareas",
  manual: "Manual",
};

export const GOAL_STATUS_BADGE_CLASS: Record<GoalStatus, string> = {
  activo: "bg-teal-50 text-teal-800",
  pausado: "bg-amber-50 text-amber-700",
  completado: "bg-emerald-50 text-emerald-700",
  cancelado: "bg-rose-50 text-rose-700",
};

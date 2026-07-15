import type { TaskCategory, TaskPriority, TaskStatus } from "@/types";

export const TASK_CATEGORIES: TaskCategory[] = [
  "Feater",
  "Búsqueda laboral",
  "IFEDEL",
  "Facultad",
  "Entrenamiento",
  "Personal",
];

export const TASK_PRIORITIES: TaskPriority[] = ["baja", "media", "alta"];

export const TASK_STATUSES: TaskStatus[] = [
  "pendiente",
  "en_progreso",
  "completada",
  "postergada",
  "cancelada",
];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completada: "Completada",
  postergada: "Postergada",
  cancelada: "Cancelada",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
};

export const STATUS_BADGE_CLASS: Record<TaskStatus, string> = {
  pendiente: "bg-slate-100 text-slate-600",
  en_progreso: "bg-sky-50 text-sky-700",
  completada: "bg-emerald-50 text-emerald-700",
  postergada: "bg-amber-50 text-amber-700",
  cancelada: "bg-rose-50 text-rose-700",
};

export const PRIORITY_BADGE_CLASS: Record<TaskPriority, string> = {
  baja: "bg-slate-100 text-slate-600",
  media: "bg-sky-50 text-sky-700",
  alta: "bg-rose-50 text-rose-700",
};

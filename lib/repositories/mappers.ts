import type {
  DbGoalStatus,
  DbProgressMode,
  DbTaskPriority,
  DbTaskStatus,
} from "@/types/database";
import type {
  GoalStatus,
  ProgressMode,
  TaskPriority,
  TaskStatus,
} from "@/types";

const TASK_STATUS_TO_DB: Record<TaskStatus, DbTaskStatus> = {
  pendiente: "pending",
  en_progreso: "in_progress",
  completada: "completed",
  postergada: "postponed",
  cancelada: "cancelled",
};

const TASK_STATUS_FROM_DB: Record<DbTaskStatus, TaskStatus> = {
  pending: "pendiente",
  in_progress: "en_progreso",
  completed: "completada",
  postponed: "postergada",
  cancelled: "cancelada",
};

const TASK_PRIORITY_TO_DB: Record<TaskPriority, DbTaskPriority> = {
  baja: "low",
  media: "medium",
  alta: "high",
};

const TASK_PRIORITY_FROM_DB: Record<DbTaskPriority, TaskPriority> = {
  low: "baja",
  medium: "media",
  high: "alta",
};

const GOAL_STATUS_TO_DB: Record<GoalStatus, DbGoalStatus> = {
  activo: "active",
  pausado: "paused",
  completado: "completed",
  cancelado: "cancelled",
};

const GOAL_STATUS_FROM_DB: Record<DbGoalStatus, GoalStatus> = {
  active: "activo",
  paused: "pausado",
  completed: "completado",
  cancelled: "cancelado",
};

const PROGRESS_MODE_TO_DB: Record<ProgressMode, DbProgressMode> = {
  hitos: "milestones",
  tareas: "tasks",
  manual: "manual",
};

const PROGRESS_MODE_FROM_DB: Record<DbProgressMode, ProgressMode> = {
  milestones: "hitos",
  tasks: "tareas",
  manual: "manual",
};

export function taskStatusToDb(status: TaskStatus): DbTaskStatus {
  return TASK_STATUS_TO_DB[status];
}

export function taskStatusFromDb(status: string): TaskStatus {
  return TASK_STATUS_FROM_DB[status as DbTaskStatus] ?? "pendiente";
}

export function taskPriorityToDb(priority: TaskPriority): DbTaskPriority {
  return TASK_PRIORITY_TO_DB[priority];
}

export function taskPriorityFromDb(priority: string): TaskPriority {
  return TASK_PRIORITY_FROM_DB[priority as DbTaskPriority] ?? "media";
}

export function goalStatusToDb(status: GoalStatus): DbGoalStatus {
  return GOAL_STATUS_TO_DB[status];
}

export function goalStatusFromDb(status: string): GoalStatus {
  return GOAL_STATUS_FROM_DB[status as DbGoalStatus] ?? "activo";
}

export function progressModeToDb(mode: ProgressMode): DbProgressMode {
  return PROGRESS_MODE_TO_DB[mode];
}

export function progressModeFromDb(mode: string): ProgressMode {
  return PROGRESS_MODE_FROM_DB[mode as DbProgressMode] ?? "manual";
}

/** Normaliza `time` de Postgres a HH:MM */
export function timeFromDb(value: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  return value.slice(0, 5);
}

export function optionalText(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

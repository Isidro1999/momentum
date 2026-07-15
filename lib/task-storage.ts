import type { StorageLoadResult } from "@/lib/storage";
import { safeJsonParse, safeLocalStorageSet } from "@/lib/storage";
import type { Task, TaskCategory, TaskPriority, TaskStatus } from "@/types";

export const TASKS_STORAGE_KEY = "momentum.tasks.v1";

const TASK_STATUSES: TaskStatus[] = [
  "pendiente",
  "en_progreso",
  "completada",
  "postergada",
  "cancelada",
];

const TASK_PRIORITIES: TaskPriority[] = ["baja", "media", "alta"];

function isTaskCategory(value: unknown): value is TaskCategory {
  return typeof value === "string" && value.length > 0;
}

function isTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    isTaskCategory(item.category) &&
    typeof item.date === "string" &&
    typeof item.priority === "string" &&
    TASK_PRIORITIES.includes(item.priority as TaskPriority) &&
    typeof item.status === "string" &&
    TASK_STATUSES.includes(item.status as TaskStatus) &&
    typeof item.createdAt === "string"
  );
}

export function loadTasksFromStorage(): StorageLoadResult<Task[]> {
  if (typeof window === "undefined") {
    return { status: "missing" };
  }

  try {
    const raw = window.localStorage.getItem(TASKS_STORAGE_KEY);
    if (raw === null) {
      return { status: "missing" };
    }

    const parsed = safeJsonParse(raw);
    if (parsed === undefined || !Array.isArray(parsed)) {
      return { status: "corrupt" };
    }

    const tasks = parsed.filter(isTask);
    if (parsed.length > 0 && tasks.length === 0) {
      return { status: "corrupt" };
    }

    return { status: "ok", data: tasks };
  } catch {
    return { status: "corrupt" };
  }
}

export function saveTasksToStorage(tasks: Task[]): boolean {
  return safeLocalStorageSet(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

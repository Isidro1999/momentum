import type { Task, TaskCategory } from "@/types";
import {
  type DateRange,
  isDateInRange,
  percent,
} from "@/lib/analytics/date-range";

export interface DailyTaskCompletionPoint {
  date: string;
  label: string;
  completed: number;
  incomplete: number;
}

export interface CategoryCompletionPoint {
  category: TaskCategory;
  completed: number;
}

export interface TaskAnalytics {
  planned: number;
  completed: number;
  completionRate: number | null;
  postponed: number;
  cancelled: number;
  highPriorityTotal: number;
  highPriorityCompleted: number;
  highPriorityCompletionRate: number | null;
  topCategory: TaskCategory | null;
  daysWithCompletedTask: Set<string>;
  dailyCompletion: DailyTaskCompletionPoint[];
  byCategory: CategoryCompletionPoint[];
}

function shortLabel(date: string): string {
  const [, month, day] = date.split("-");
  return `${day}/${month}`;
}

export function buildTaskAnalytics(
  tasks: Task[],
  range: DateRange,
): TaskAnalytics {
  const inRange = tasks.filter((task) => isDateInRange(task.date, range));
  const plannedTasks = inRange.filter((task) => task.status !== "cancelada");
  const completedTasks = plannedTasks.filter(
    (task) => task.status === "completada",
  );
  const postponed = inRange.filter((task) => task.status === "postergada").length;
  const cancelled = inRange.filter((task) => task.status === "cancelada").length;

  const highPriorityTasks = plannedTasks.filter(
    (task) => task.priority === "alta",
  );
  const highPriorityCompleted = highPriorityTasks.filter(
    (task) => task.status === "completada",
  ).length;

  const categoryCounts = new Map<TaskCategory, number>();
  for (const task of completedTasks) {
    categoryCounts.set(
      task.category,
      (categoryCounts.get(task.category) ?? 0) + 1,
    );
  }

  const byCategory = [...categoryCounts.entries()]
    .map(([category, completed]) => ({ category, completed }))
    .sort((a, b) => b.completed - a.completed);

  const topCategory = byCategory[0]?.category ?? null;

  const daysWithCompletedTask = new Set(
    completedTasks.map((task) => task.date),
  );

  const dailyCompletion = range.days.map((date) => {
    const dayTasks = plannedTasks.filter((task) => task.date === date);
    const completed = dayTasks.filter(
      (task) => task.status === "completada",
    ).length;

    return {
      date,
      label: shortLabel(date),
      completed,
      incomplete: dayTasks.length - completed,
    };
  });

  return {
    planned: plannedTasks.length,
    completed: completedTasks.length,
    completionRate: percent(completedTasks.length, plannedTasks.length),
    postponed,
    cancelled,
    highPriorityTotal: highPriorityTasks.length,
    highPriorityCompleted,
    highPriorityCompletionRate: percent(
      highPriorityCompleted,
      highPriorityTasks.length,
    ),
    topCategory,
    daysWithCompletedTask,
    dailyCompletion,
    byCategory,
  };
}

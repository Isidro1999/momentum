import { calculateGoalProgress } from "@/lib/goal-progress";
import {
  average,
  type DateRange,
  isDateInRange,
} from "@/lib/analytics/date-range";
import { isoToLocalDateString } from "@/lib/dates";
import type { Goal, Milestone, Task } from "@/types";

export interface GoalListItem {
  id: string;
  title: string;
  category: string;
  progress: number;
  targetDate?: string;
}

export interface GoalAnalytics {
  activeCount: number;
  averageActiveProgress: number | null;
  completedInPeriod: number;
  topActive: GoalListItem | null;
  nearestDeadline: GoalListItem | null;
  activeGoals: GoalListItem[];
}

export function buildGoalAnalytics(
  goals: Goal[],
  milestones: Milestone[],
  tasks: Task[],
  range: DateRange,
): GoalAnalytics {
  const activeGoalsRaw = goals.filter((goal) => goal.status === "activo");

  const activeGoals = activeGoalsRaw
    .map((goal) => ({
      id: goal.id,
      title: goal.title,
      category: goal.category,
      progress: calculateGoalProgress(goal, milestones, tasks),
      targetDate: goal.targetDate,
    }))
    .sort((a, b) => b.progress - a.progress);

  const completedInPeriod = goals.filter(
    (goal) =>
      goal.status === "completado" &&
      goal.completedAt !== undefined &&
      isDateInRange(isoToLocalDateString(goal.completedAt), range),
  ).length;

  const topActive = activeGoals[0] ?? null;

  const withDeadline = activeGoals
    .filter((goal) => goal.targetDate)
    .sort((a, b) =>
      (a.targetDate ?? "").localeCompare(b.targetDate ?? ""),
    );

  return {
    activeCount: activeGoals.length,
    averageActiveProgress: average(activeGoals.map((goal) => goal.progress)),
    completedInPeriod,
    topActive,
    nearestDeadline: withDeadline[0] ?? null,
    activeGoals,
  };
}

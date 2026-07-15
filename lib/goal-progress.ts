import type { Goal, Milestone, Task } from "@/types";

function clampPercent(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

export function calculateGoalProgress(
  goal: Goal,
  milestones: Milestone[],
  tasks: Task[],
): number {
  if (goal.status === "completado") {
    return 100;
  }

  if (goal.progressMode === "manual") {
    return clampPercent(goal.manualProgress ?? 0);
  }

  if (goal.progressMode === "hitos") {
    const relatedMilestones = milestones.filter(
      (milestone) => milestone.goalId === goal.id,
    );

    if (relatedMilestones.length === 0) {
      return 0;
    }

    const completedCount = relatedMilestones.filter(
      (milestone) => milestone.completed,
    ).length;

    return clampPercent((completedCount / relatedMilestones.length) * 100);
  }

  const relatedTasks = tasks.filter(
    (task) => task.goalId === goal.id && task.status !== "cancelada",
  );

  if (relatedTasks.length === 0) {
    return 0;
  }

  const completedTasks = relatedTasks.filter(
    (task) => task.status === "completada",
  ).length;

  return clampPercent((completedTasks / relatedTasks.length) * 100);
}

export function countCompletedMilestones(
  goalId: string,
  milestones: Milestone[],
): { completed: number; total: number } {
  const related = milestones.filter((milestone) => milestone.goalId === goalId);

  return {
    completed: related.filter((milestone) => milestone.completed).length,
    total: related.length,
  };
}

export function countRelatedTasks(
  goalId: string,
  tasks: Task[],
): { completed: number; total: number } {
  const related = tasks.filter(
    (task) => task.goalId === goalId && task.status !== "cancelada",
  );

  return {
    completed: related.filter((task) => task.status === "completada").length,
    total: related.length,
  };
}

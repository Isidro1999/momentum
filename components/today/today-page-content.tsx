"use client";

import { useMemo } from "react";
import { DailyProgress } from "@/components/today/daily-progress";
import { DayCloseButton } from "@/components/today/day-close-button";
import { DayOverview } from "@/components/today/day-overview";
import { GoalProgress } from "@/components/today/goal-progress";
import { NextEvent } from "@/components/today/next-event";
import { TaskList } from "@/components/today/task-list";
import { WellbeingCard } from "@/components/today/wellbeing-card";
import { useDailyReviews } from "@/hooks/use-daily-reviews";
import { useGoals } from "@/hooks/use-goals";
import { useTasks } from "@/hooks/use-tasks";
import { getTodayDateString } from "@/lib/dates";
import { calculateGoalProgress } from "@/lib/goal-progress";
import type { GoalProgressItem } from "@/types";

const PRIORITY_ORDER = { alta: 0, media: 1, baja: 2 } as const;

interface TodayPageContentProps {
  userName: string;
}

export function TodayPageContent({ userName }: TodayPageContentProps) {
  const { tasks, isReady: tasksReady, openCreateForm } = useTasks();
  const { goals, milestones, isReady: goalsReady } = useGoals();
  const {
    getByDate,
    isReady: reviewsReady,
    openCloseForm,
  } = useDailyReviews();
  const today = getTodayDateString();
  const todayReview = getByDate(today) ?? null;

  const todayTasks = useMemo(() => {
    return tasks
      .filter((task) => task.date === today && task.status !== "cancelada")
      .sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
  }, [tasks, today]);

  const metrics = useMemo(() => {
    const completedTasks = todayTasks.filter(
      (task) => task.status === "completada",
    ).length;
    const pendingTasks = todayTasks.filter(
      (task) =>
        task.status === "pendiente" ||
        task.status === "en_progreso" ||
        task.status === "postergada",
    ).length;
    const total = completedTasks + pendingTasks;
    const progressPercent =
      total === 0 ? 0 : Math.round((completedTasks / total) * 100);

    return { completedTasks, pendingTasks, progressPercent };
  }, [todayTasks]);

  const mainPriority = useMemo(() => {
    const incomplete = todayTasks
      .filter(
        (task) =>
          task.status === "pendiente" ||
          task.status === "en_progreso" ||
          task.status === "postergada",
      )
      .sort(
        (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
      );

    if (incomplete[0]) {
      return incomplete[0].title;
    }

    if (todayReview?.tomorrowPriority?.trim()) {
      return todayReview.tomorrowPriority.trim();
    }

    return "organizar tu día con calma";
  }, [todayTasks, todayReview]);

  const highlightedGoals = useMemo((): GoalProgressItem[] => {
    return goals
      .filter((goal) => goal.status === "activo")
      .map((goal) => ({
        id: goal.id,
        title: goal.title,
        progress: calculateGoalProgress(goal, milestones, tasks),
        targetDate: goal.targetDate,
        createdAt: goal.createdAt,
      }))
      .sort((a, b) => {
        const aDate = a.targetDate ?? "9999-12-31";
        const bDate = b.targetDate ?? "9999-12-31";
        if (aDate !== bDate) {
          return aDate.localeCompare(bDate);
        }

        if (a.progress !== b.progress) {
          return b.progress - a.progress;
        }

        return b.createdAt.localeCompare(a.createdAt);
      })
      .slice(0, 3)
      .map(({ id, title, progress }) => ({ id, title, progress }));
  }, [goals, milestones, tasks]);

  const isReady = tasksReady && goalsReady && reviewsReady;

  function openTodayClose() {
    openCloseForm({ date: today, lockDate: true });
  }

  return (
    <div className="space-y-6">
      <DayOverview
        userName={userName}
        mainPriority={mainPriority}
        onNewTask={openCreateForm}
      />

      <DailyProgress
        progressPercent={isReady ? metrics.progressPercent : 0}
        completedTasks={isReady ? metrics.completedTasks : 0}
        pendingTasks={isReady ? metrics.pendingTasks : 0}
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <TaskList tasks={todayTasks} isLoading={!isReady} />
          <DayCloseButton
            review={isReady ? todayReview : null}
            onOpen={openTodayClose}
          />
        </div>

        <div className="space-y-4 lg:col-span-2">
          <NextEvent />
          <GoalProgress goals={highlightedGoals} isLoading={!isReady} />
          <WellbeingCard
            hasReview={Boolean(isReady && todayReview)}
            mood={todayReview?.mood}
            energy={todayReview?.energy}
            onUpdate={openTodayClose}
          />
        </div>
      </div>
    </div>
  );
}

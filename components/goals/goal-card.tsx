"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { useGoals } from "@/hooks/use-goals";
import { useTasks } from "@/hooks/use-tasks";
import {
  GOAL_STATUS_BADGE_CLASS,
  GOAL_STATUS_LABELS,
} from "@/lib/goal-constants";
import {
  calculateGoalProgress,
  countCompletedMilestones,
  countRelatedTasks,
} from "@/lib/goal-progress";
import type { Goal } from "@/types";

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const {
    milestones,
    openEditForm,
    setGoalStatus,
    deleteGoal,
  } = useGoals();
  const { tasks, unlinkGoalFromTasks } = useTasks();

  const progress = calculateGoalProgress(goal, milestones, tasks);
  const milestoneStats = countCompletedMilestones(goal.id, milestones);
  const taskStats = countRelatedTasks(goal.id, tasks);

  function handleDelete() {
    const confirmed = window.confirm(
      `¿Eliminar el objetivo “${goal.title}”? También se borrarán sus hitos.`,
    );

    if (!confirmed) {
      return;
    }

    void deleteGoal(goal.id);
    unlinkGoalFromTasks(goal.id);
  }

  function handleComplete() {
    const confirmed = window.confirm(
      `¿Marcar “${goal.title}” como completado?`,
    );
    if (confirmed) {
      void setGoalStatus(goal.id, "completado");
    }
  }

  function handleCancel() {
    const confirmed = window.confirm(
      `¿Cancelar el objetivo “${goal.title}”? Podés dejarlo como referencia.`,
    );
    if (confirmed) {
      void setGoalStatus(goal.id, "cancelado");
    }
  }

  return (
    <li className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/objetivos/${goal.id}`}
            className="text-base font-semibold text-slate-900 hover:text-teal-800"
          >
            {goal.title}
          </Link>
          {goal.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">
              {goal.description}
            </p>
          ) : null}
        </div>
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-medium ${GOAL_STATUS_BADGE_CLASS[goal.status]}`}
        >
          {GOAL_STATUS_LABELS[goal.status]}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
          {goal.category}
        </span>
        {goal.targetDate ? <span>Meta: {goal.targetDate}</span> : null}
        <span>
          Hitos {milestoneStats.completed}/{milestoneStats.total}
        </span>
        <span>
          Tareas {taskStats.completed}/{taskStats.total}
        </span>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Progreso
          </p>
          <span className="text-sm font-semibold text-teal-700">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-teal-600"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progreso de ${goal.title}`}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/objetivos/${goal.id}`}
          className="rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-100"
        >
          Ver detalle
        </Link>

        {goal.status === "activo" ? (
          <button
            type="button"
            onClick={() => void setGoalStatus(goal.id, "pausado")}
            className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
          >
            Pausar
          </button>
        ) : null}

        {goal.status === "pausado" ? (
          <button
            type="button"
            onClick={() => void setGoalStatus(goal.id, "activo")}
            className="rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-100"
          >
            Reactivar
          </button>
        ) : null}

        {goal.status !== "completado" ? (
          <button
            type="button"
            onClick={handleComplete}
            className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
          >
            Completar
          </button>
        ) : null}

        {goal.status !== "cancelado" && goal.status !== "completado" ? (
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
          >
            Cancelar
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => openEditForm(goal)}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          <Pencil className="size-3.5" aria-hidden />
          Editar
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
        >
          <Trash2 className="size-3.5" aria-hidden />
          Eliminar
        </button>
      </div>
    </li>
  );
}

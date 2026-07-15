"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { GoalCard } from "@/components/goals/goal-card";
import { useGoals } from "@/hooks/use-goals";
import { useTasks } from "@/hooks/use-tasks";
import {
  GOAL_STATUSES,
  GOAL_STATUS_LABELS,
} from "@/lib/goal-constants";
import { calculateGoalProgress } from "@/lib/goal-progress";
import { TASK_CATEGORIES } from "@/lib/task-constants";
import type { GoalStatus, TaskCategory } from "@/types";

export function GoalsPageContent() {
  const { goals, milestones, isReady, openCreateForm } = useGoals();
  const { tasks } = useTasks();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<GoalStatus | "todos">("todos");
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | "todas">(
    "todas",
  );

  const summary = useMemo(() => {
    const activeGoals = goals.filter((goal) => goal.status === "activo");
    const completedGoals = goals.filter((goal) => goal.status === "completado");
    const progressValues = activeGoals.map((goal) =>
      calculateGoalProgress(goal, milestones, tasks),
    );
    const averageProgress =
      progressValues.length === 0
        ? null
        : Math.round(
            progressValues.reduce((sum, value) => sum + value, 0) /
              progressValues.length,
          );

    return {
      activeCount: activeGoals.length,
      completedCount: completedGoals.length,
      averageProgress,
    };
  }, [goals, milestones, tasks]);

  const filteredGoals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return goals.filter((goal) => {
      if (statusFilter !== "todos" && goal.status !== statusFilter) {
        return false;
      }

      if (categoryFilter !== "todas" && goal.category !== categoryFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack =
        `${goal.title} ${goal.description ?? ""} ${goal.category}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [goals, query, statusFilter, categoryFilter]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Objetivos
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Dividí tus focos en hitos y seguí el progreso con claridad.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 sm:w-auto"
        >
          <Plus className="size-4" aria-hidden />
          Nuevo objetivo
        </button>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Activos
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {isReady ? summary.activeCount : 0}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Completados
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {isReady ? summary.completedCount : 0}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Progreso promedio
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {isReady && summary.averageProgress !== null
              ? `${summary.averageProgress}%`
              : "—"}
          </p>
        </article>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar objetivos"
            aria-label="Buscar objetivos"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium text-slate-500">
            Estado
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as GoalStatus | "todos")
              }
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30"
            >
              <option value="todos">Todos</option>
              {GOAL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {GOAL_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-medium text-slate-500">
            Categoría
            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value as TaskCategory | "todas")
              }
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30"
            >
              <option value="todas">Todas</option>
              {TASK_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {!isReady ? (
        <p className="text-sm text-slate-500">Cargando objetivos…</p>
      ) : filteredGoals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-base font-medium text-slate-900">
            {goals.length === 0
              ? "Todavía no hay objetivos"
              : "No hay resultados con estos filtros"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {goals.length === 0
              ? "Creá un objetivo para seguir tus focos principales."
              : "Probá cambiando la búsqueda o los filtros."}
          </p>
          {goals.length === 0 ? (
            <button
              type="button"
              onClick={openCreateForm}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              <Plus className="size-4" aria-hidden />
              Nuevo objetivo
            </button>
          ) : null}
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </ul>
      )}
    </div>
  );
}

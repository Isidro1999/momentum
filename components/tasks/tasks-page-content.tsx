"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useGoals } from "@/hooks/use-goals";
import { useTasks } from "@/hooks/use-tasks";
import { getTodayDateString, isFutureDate } from "@/lib/dates";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "@/lib/task-constants";
import { TaskCard } from "@/components/tasks/task-card";
import type { TaskCategory, TaskPriority, TaskStatus } from "@/types";

type ScopeFilter = "todas" | "hoy" | "proximas" | "completadas";

export function TasksPageContent() {
  const { tasks, isReady, openCreateForm } = useTasks();
  const { goals } = useGoals();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<ScopeFilter>("todas");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "todas">("todas");
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | "todas">(
    "todas",
  );
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "todas">(
    "todas",
  );
  const [goalFilter, setGoalFilter] = useState<string>("todas");

  const today = getTodayDateString();

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tasks
      .filter((task) => {
        if (scope === "hoy" && task.date !== today) {
          return false;
        }

        if (scope === "proximas" && !isFutureDate(task.date, today)) {
          return false;
        }

        if (scope === "completadas" && task.status !== "completada") {
          return false;
        }

        if (statusFilter !== "todas" && task.status !== statusFilter) {
          return false;
        }

        if (categoryFilter !== "todas" && task.category !== categoryFilter) {
          return false;
        }

        if (priorityFilter !== "todas" && task.priority !== priorityFilter) {
          return false;
        }

        if (goalFilter !== "todas" && task.goalId !== goalFilter) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        const haystack = `${task.title} ${task.description ?? ""} ${task.category}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (a.date === b.date) {
          return (a.startTime ?? "").localeCompare(b.startTime ?? "");
        }

        return a.date.localeCompare(b.date);
      });
  }, [
    tasks,
    query,
    scope,
    statusFilter,
    categoryFilter,
    priorityFilter,
    goalFilter,
    today,
  ]);

  const scopes: { id: ScopeFilter; label: string }[] = [
    { id: "todas", label: "Todas" },
    { id: "hoy", label: "Hoy" },
    { id: "proximas", label: "Próximas" },
    { id: "completadas", label: "Completadas" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Tareas
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Organizá, editá y seguí el avance de tu trabajo diario.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 sm:w-auto"
        >
          <Plus className="size-4" aria-hidden />
          Nueva tarea
        </button>
      </header>

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
            placeholder="Buscar por título, descripción o categoría"
            aria-label="Buscar tareas"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none ring-teal-600/30 placeholder:text-slate-400 focus:border-teal-600 focus:ring-2"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {scopes.map((item) => {
            const isActive = scope === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setScope(item.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-teal-50 text-teal-800"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-xs font-medium text-slate-500">
            Estado
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as TaskStatus | "todas")
              }
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30"
            >
              <option value="todas">Todos</option>
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
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
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30"
            >
              <option value="todas">Todas</option>
              {TASK_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-medium text-slate-500">
            Prioridad
            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value as TaskPriority | "todas")
              }
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30"
            >
              <option value="todas">Todas</option>
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-medium text-slate-500">
            Objetivo
            <select
              value={goalFilter}
              onChange={(event) => setGoalFilter(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30"
            >
              <option value="todas">Todos</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {!isReady ? (
        <p className="text-sm text-slate-500">Cargando tareas…</p>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-base font-medium text-slate-900">
            {tasks.length === 0
              ? "Todavía no hay tareas"
              : "No hay resultados con estos filtros"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {tasks.length === 0
              ? "Creá tu primera tarea para organizar el día."
              : "Probá cambiando la búsqueda o los filtros."}
          </p>
          {tasks.length === 0 ? (
            <button
              type="button"
              onClick={openCreateForm}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              <Plus className="size-4" aria-hidden />
              Nueva tarea
            </button>
          ) : null}
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </ul>
      )}
    </div>
  );
}

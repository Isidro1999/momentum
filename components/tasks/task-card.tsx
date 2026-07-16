"use client";

import {
  Check,
  Circle,
  LoaderCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useGoals } from "@/hooks/use-goals";
import { useTasks } from "@/hooks/use-tasks";
import {
  PRIORITY_BADGE_CLASS,
  PRIORITY_LABELS,
  STATUS_BADGE_CLASS,
  STATUS_LABELS,
} from "@/lib/task-constants";
import type { Task, TaskStatus } from "@/types";

interface TaskCardProps {
  task: Task;
}

const statusIcon: Record<TaskStatus, "check" | "loader" | "circle"> = {
  completada: "check",
  en_progreso: "loader",
  pendiente: "circle",
  postergada: "circle",
  cancelada: "circle",
};

function StatusIcon({ type }: { type: "check" | "loader" | "circle" }) {
  if (type === "check") {
    return <Check className="size-3.5" aria-hidden />;
  }

  if (type === "loader") {
    return <LoaderCircle className="size-3.5" aria-hidden />;
  }

  return <Circle className="size-3.5" aria-hidden />;
}

export function TaskCard({ task }: TaskCardProps) {
  const { setTaskStatus, openEditForm, deleteTask } = useTasks();
  const { getGoalById } = useGoals();
  const isCompleted = task.status === "completada";
  const relatedGoal = task.goalId ? getGoalById(task.goalId) : undefined;

  function handleDelete() {
    const confirmed = window.confirm(
      `¿Eliminar la tarea “${task.title}”? Esta acción no se puede deshacer.`,
    );

    if (confirmed) {
      void deleteTask(task.id);
    }
  }

  return (
    <li className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${STATUS_BADGE_CLASS[task.status]}`}
        >
          <StatusIcon type={statusIcon[task.status]} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p
                className={`text-sm font-semibold leading-snug ${
                  isCompleted ? "text-slate-600 line-through" : "text-slate-900"
                }`}
              >
                {task.title}
              </p>
              {task.description ? (
                <p className="mt-1 text-sm text-slate-500">{task.description}</p>
              ) : null}
            </div>
            <span
              className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${PRIORITY_BADGE_CLASS[task.priority]}`}
            >
              {PRIORITY_LABELS[task.priority]}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
              {task.category}
            </span>
            <span>{task.date}</span>
            {task.startTime ? <span>{task.startTime}</span> : null}
            {task.estimatedMinutes ? (
              <span>{task.estimatedMinutes} min</span>
            ) : null}
            <span
              className={`rounded-md px-2 py-0.5 font-medium ${STATUS_BADGE_CLASS[task.status]}`}
            >
              {STATUS_LABELS[task.status]}
            </span>
            {relatedGoal ? (
              <Link
                href={`/objetivos/${relatedGoal.id}`}
                className="rounded-md bg-teal-50 px-2 py-0.5 font-medium text-teal-800 hover:bg-teal-100"
              >
                {relatedGoal.title}
              </Link>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {task.status !== "completada" && task.status !== "cancelada" ? (
              <button
                type="button"
                onClick={() => void setTaskStatus(task.id, "completada")}
                className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
              >
                Completar
              </button>
            ) : task.status === "completada" ? (
              <button
                type="button"
                onClick={() => void setTaskStatus(task.id, "pendiente")}
                className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Volver a pendiente
              </button>
            ) : null}

            {task.status !== "en_progreso" &&
            task.status !== "completada" &&
            task.status !== "cancelada" ? (
              <button
                type="button"
                onClick={() => void setTaskStatus(task.id, "en_progreso")}
                className="rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100"
              >
                En progreso
              </button>
            ) : null}

            {task.status !== "postergada" &&
            task.status !== "completada" &&
            task.status !== "cancelada" ? (
              <button
                type="button"
                onClick={() => void setTaskStatus(task.id, "postergada")}
                className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
              >
                Postergar
              </button>
            ) : null}

            {task.status !== "cancelada" && task.status !== "completada" ? (
              <button
                type="button"
                onClick={() => {
                  const confirmed = window.confirm(
                    `¿Cancelar la tarea “${task.title}”?`,
                  );
                  if (confirmed) {
                    void setTaskStatus(task.id, "cancelada");
                  }
                }}
                className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
              >
                Cancelar
              </button>
            ) : null}

            {task.status === "cancelada" ? (
              <button
                type="button"
                onClick={() => void setTaskStatus(task.id, "pendiente")}
                className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Reactivar
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => openEditForm(task)}
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
        </div>
      </div>
    </li>
  );
}

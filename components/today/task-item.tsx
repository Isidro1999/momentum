"use client";

import { Check, Circle, LoaderCircle } from "lucide-react";
import {
  STATUS_BADGE_CLASS,
  STATUS_LABELS,
} from "@/lib/task-constants";
import { useTasks } from "@/hooks/use-tasks";
import type { Task, TaskStatus } from "@/types";

interface TaskItemProps {
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

export function TaskItem({ task }: TaskItemProps) {
  const { setTaskStatus, openEditForm } = useTasks();
  const isCompleted = task.status === "completada";

  function toggleComplete() {
    void setTaskStatus(task.id, isCompleted ? "pendiente" : "completada");
  }

  return (
    <li className="flex items-start gap-3 rounded-xl px-2 py-3 sm:px-3">
      <button
        type="button"
        onClick={toggleComplete}
        className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${STATUS_BADGE_CLASS[task.status]}`}
        aria-label={
          isCompleted
            ? `Marcar “${task.title}” como pendiente`
            : `Completar “${task.title}”`
        }
      >
        <StatusIcon type={statusIcon[task.status]} />
      </button>

      <button
        type="button"
        onClick={() => openEditForm(task)}
        className="min-w-0 flex-1 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      >
        <p
          className={`text-sm font-medium leading-snug ${
            isCompleted ? "text-slate-600 line-through" : "text-slate-900"
          }`}
        >
          {task.title}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
            {task.category}
          </span>
          {task.startTime ? <span>{task.startTime}</span> : null}
          <span
            className={`rounded-md px-2 py-0.5 font-medium ${STATUS_BADGE_CLASS[task.status]}`}
          >
            {STATUS_LABELS[task.status]}
          </span>
        </div>
      </button>
    </li>
  );
}

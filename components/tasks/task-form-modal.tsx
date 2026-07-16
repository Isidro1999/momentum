"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { useEscapeKey } from "@/hooks/use-escape-key";
import { useGoals } from "@/hooks/use-goals";
import { useTasks } from "@/hooks/use-tasks";
import { getTodayDateString, isValidDateString } from "@/lib/dates";
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  PRIORITY_LABELS,
} from "@/lib/task-constants";
import type { Task, TaskCategory, TaskInput, TaskPriority } from "@/types";

interface FormState {
  title: string;
  description: string;
  category: TaskCategory;
  date: string;
  startTime: string;
  estimatedMinutes: string;
  priority: TaskPriority;
  goalId: string;
}

interface FormErrors {
  title?: string;
  date?: string;
}

function toFormState(editing: Task | null): FormState {
  if (!editing) {
    return {
      title: "",
      description: "",
      category: "Personal",
      date: getTodayDateString(),
      startTime: "",
      estimatedMinutes: "",
      priority: "media",
      goalId: "",
    };
  }

  return {
    title: editing.title,
    description: editing.description ?? "",
    category: editing.category,
    date: editing.date,
    startTime: editing.startTime ?? "",
    estimatedMinutes:
      editing.estimatedMinutes !== undefined
        ? String(editing.estimatedMinutes)
        : "",
    priority: editing.priority,
    goalId: editing.goalId ?? "",
  };
}

export function TaskFormModal() {
  const {
    isFormOpen,
    editingTask,
    closeForm,
    createTask,
    updateTask,
  } = useTasks();
  const { goals } = useGoals();
  const titleId = useId();
  const [form, setForm] = useState<FormState>(() => toFormState(null));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeGoals = goals.filter((goal) => goal.status === "activo");

  useEscapeKey(isFormOpen, closeForm);

  useEffect(() => {
    if (!isFormOpen) {
      return;
    }

    setForm(toFormState(editingTask));
    setErrors({});
    setIsSubmitting(false);
  }, [isFormOpen, editingTask]);

  if (!isFormOpen) {
    return null;
  }

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === "title" || key === "date") {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  }

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "El título es obligatorio.";
    }

    if (!form.date) {
      nextErrors.date = "La fecha es obligatoria.";
    } else if (!isValidDateString(form.date)) {
      nextErrors.date = "Ingresá una fecha válida.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    const estimated =
      form.estimatedMinutes.trim() === ""
        ? undefined
        : Number(form.estimatedMinutes);

    const input: TaskInput = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      category: form.category,
      date: form.date,
      startTime: form.startTime || undefined,
      estimatedMinutes:
        estimated !== undefined && !Number.isNaN(estimated) && estimated > 0
          ? estimated
          : undefined,
      priority: form.priority,
      goalId: form.goalId || undefined,
    };

    try {
      if (editingTask) {
        await updateTask(editingTask.id, input);
      } else {
        await createTask(input);
      }
      closeForm();
    } catch {
      // El provider mantiene el estado; el usuario puede reintentar.
    } finally {
      setIsSubmitting(false);
    }
  }

  const isEditing = Boolean(editingTask);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-slate-900/40"
        onClick={closeForm}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-slate-200/80 bg-white shadow-lg sm:rounded-2xl"
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-slate-900">
            {isEditing ? "Editar tarea" : "Nueva tarea"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Completá los datos para organizar tu día.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
          noValidate
        >
          <div className="space-y-4 overflow-y-auto px-5 py-4">
            <div>
              <label
                htmlFor="task-title"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Título
              </label>
              <input
                id="task-title"
                type="text"
                value={form.title}
                onChange={(event) => handleChange("title", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-teal-600/30 placeholder:text-slate-400 focus:border-teal-600 focus:ring-2"
                placeholder="Ej. Avanzar con la propuesta"
              />
              {errors.title ? (
                <p className="mt-1.5 text-xs text-rose-600">{errors.title}</p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="task-description"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Descripción
              </label>
              <textarea
                id="task-description"
                value={form.description}
                onChange={(event) =>
                  handleChange("description", event.target.value)
                }
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-teal-600/30 placeholder:text-slate-400 focus:border-teal-600 focus:ring-2"
                placeholder="Detalle opcional"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="task-category"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Categoría
                </label>
                <select
                  id="task-category"
                  value={form.category}
                  onChange={(event) =>
                    handleChange("category", event.target.value as TaskCategory)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-teal-600/30 focus:border-teal-600 focus:ring-2"
                >
                  {TASK_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="task-priority"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Prioridad
                </label>
                <select
                  id="task-priority"
                  value={form.priority}
                  onChange={(event) =>
                    handleChange("priority", event.target.value as TaskPriority)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-teal-600/30 focus:border-teal-600 focus:ring-2"
                >
                  {TASK_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {PRIORITY_LABELS[priority]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="task-date"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Fecha
                </label>
                <input
                  id="task-date"
                  type="date"
                  value={form.date}
                  onChange={(event) => handleChange("date", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-teal-600/30 focus:border-teal-600 focus:ring-2"
                />
                {errors.date ? (
                  <p className="mt-1.5 text-xs text-rose-600">{errors.date}</p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="task-time"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Hora
                </label>
                <input
                  id="task-time"
                  type="time"
                  value={form.startTime}
                  onChange={(event) =>
                    handleChange("startTime", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-teal-600/30 focus:border-teal-600 focus:ring-2"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="task-duration"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Duración estimada (minutos)
              </label>
              <input
                id="task-duration"
                type="number"
                min={1}
                value={form.estimatedMinutes}
                onChange={(event) =>
                  handleChange("estimatedMinutes", event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-teal-600/30 placeholder:text-slate-400 focus:border-teal-600 focus:ring-2"
                placeholder="Ej. 45"
              />
            </div>

            <div>
              <label
                htmlFor="task-goal"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Objetivo relacionado
              </label>
              <select
                id="task-goal"
                value={form.goalId}
                onChange={(event) => handleChange("goalId", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-teal-600/30 focus:border-teal-600 focus:ring-2"
              >
                <option value="">Sin objetivo</option>
                {activeGoals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 disabled:opacity-60"
            >
              {isEditing ? "Guardar cambios" : "Crear tarea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

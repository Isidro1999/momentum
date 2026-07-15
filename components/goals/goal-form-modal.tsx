"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { useEscapeKey } from "@/hooks/use-escape-key";
import { useGoals } from "@/hooks/use-goals";
import { getTodayDateString, isValidDateString } from "@/lib/dates";
import {
  PROGRESS_MODES,
  PROGRESS_MODE_LABELS,
} from "@/lib/goal-constants";
import { TASK_CATEGORIES } from "@/lib/task-constants";
import type { Goal, GoalInput, ProgressMode, TaskCategory } from "@/types";

interface FormState {
  title: string;
  description: string;
  category: TaskCategory;
  startDate: string;
  targetDate: string;
  progressMode: ProgressMode;
  manualProgress: string;
}

interface FormErrors {
  title?: string;
  startDate?: string;
  targetDate?: string;
  manualProgress?: string;
}

function toFormState(editing: Goal | null): FormState {
  if (!editing) {
    return {
      title: "",
      description: "",
      category: "Personal",
      startDate: getTodayDateString(),
      targetDate: "",
      progressMode: "hitos",
      manualProgress: "0",
    };
  }

  return {
    title: editing.title,
    description: editing.description ?? "",
    category: editing.category,
    startDate: editing.startDate,
    targetDate: editing.targetDate ?? "",
    progressMode: editing.progressMode,
    manualProgress: String(editing.manualProgress ?? 0),
  };
}

export function GoalFormModal() {
  const {
    isFormOpen,
    editingGoal,
    closeForm,
    createGoal,
    updateGoal,
  } = useGoals();
  const titleId = useId();
  const [form, setForm] = useState<FormState>(() => toFormState(null));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEscapeKey(isFormOpen, closeForm);

  useEffect(() => {
    if (!isFormOpen) {
      return;
    }

    setForm(toFormState(editingGoal));
    setErrors({});
    setIsSubmitting(false);
  }, [isFormOpen, editingGoal]);

  if (!isFormOpen) {
    return null;
  }

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "El título es obligatorio.";
    }

    if (!form.startDate) {
      nextErrors.startDate = "La fecha de inicio es obligatoria.";
    } else if (!isValidDateString(form.startDate)) {
      nextErrors.startDate = "Ingresá una fecha de inicio válida.";
    }

    if (form.targetDate) {
      if (!isValidDateString(form.targetDate)) {
        nextErrors.targetDate = "Ingresá una fecha objetivo válida.";
      } else if (
        form.startDate &&
        isValidDateString(form.startDate) &&
        form.targetDate < form.startDate
      ) {
        nextErrors.targetDate =
          "La fecha objetivo no puede ser anterior al inicio.";
      }
    }

    if (form.progressMode === "manual") {
      const value = Number(form.manualProgress);
      if (
        form.manualProgress.trim() === "" ||
        Number.isNaN(value) ||
        value < 0 ||
        value > 100
      ) {
        nextErrors.manualProgress = "El progreso debe estar entre 0 y 100.";
      }
    }

    return nextErrors;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    const input: GoalInput = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      category: form.category,
      startDate: form.startDate,
      targetDate: form.targetDate || undefined,
      progressMode: form.progressMode,
      manualProgress:
        form.progressMode === "manual"
          ? Number(form.manualProgress)
          : undefined,
    };

    if (editingGoal) {
      updateGoal(editingGoal.id, input);
    } else {
      createGoal(input);
    }

    closeForm();
  }

  const isEditing = Boolean(editingGoal);

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
            {isEditing ? "Editar objetivo" : "Nuevo objetivo"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Definí un foco claro y cómo vas a medir el avance.
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
                htmlFor="goal-title"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Título
              </label>
              <input
                id="goal-title"
                type="text"
                value={form.title}
                onChange={(event) => handleChange("title", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-teal-600/30 focus:border-teal-600 focus:ring-2"
                placeholder="Ej. Lanzar primera versión"
              />
              {errors.title ? (
                <p className="mt-1.5 text-xs text-rose-600">{errors.title}</p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="goal-description"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Descripción
              </label>
              <textarea
                id="goal-description"
                value={form.description}
                onChange={(event) =>
                  handleChange("description", event.target.value)
                }
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-teal-600/30 focus:border-teal-600 focus:ring-2"
                placeholder="Detalle opcional"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="goal-category"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Categoría
                </label>
                <select
                  id="goal-category"
                  value={form.category}
                  onChange={(event) =>
                    handleChange("category", event.target.value as TaskCategory)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30"
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
                  htmlFor="goal-mode"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Modo de progreso
                </label>
                <select
                  id="goal-mode"
                  value={form.progressMode}
                  onChange={(event) =>
                    handleChange(
                      "progressMode",
                      event.target.value as ProgressMode,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30"
                >
                  {PROGRESS_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {PROGRESS_MODE_LABELS[mode]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="goal-start"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Fecha de inicio
                </label>
                <input
                  id="goal-start"
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    handleChange("startDate", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30"
                />
                {errors.startDate ? (
                  <p className="mt-1.5 text-xs text-rose-600">{errors.startDate}</p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="goal-target"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Fecha objetivo
                </label>
                <input
                  id="goal-target"
                  type="date"
                  value={form.targetDate}
                  onChange={(event) =>
                    handleChange("targetDate", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30"
                />
                {errors.targetDate ? (
                  <p className="mt-1.5 text-xs text-rose-600">{errors.targetDate}</p>
                ) : null}
              </div>
            </div>

            {form.progressMode === "manual" ? (
              <div>
                <label
                  htmlFor="goal-manual"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Progreso manual (%)
                </label>
                <input
                  id="goal-manual"
                  type="number"
                  min={0}
                  max={100}
                  value={form.manualProgress}
                  onChange={(event) =>
                    handleChange("manualProgress", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30"
                />
                {errors.manualProgress ? (
                  <p className="mt-1.5 text-xs text-rose-600">
                    {errors.manualProgress}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {isEditing ? "Guardar cambios" : "Crear objetivo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

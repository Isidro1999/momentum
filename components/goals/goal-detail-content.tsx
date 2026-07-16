"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useId, useMemo, useState, type FormEvent } from "react";
import { useEscapeKey } from "@/hooks/use-escape-key";
import { useGoals } from "@/hooks/use-goals";
import { useTasks } from "@/hooks/use-tasks";
import { isValidDateString } from "@/lib/dates";
import {
  GOAL_STATUS_BADGE_CLASS,
  GOAL_STATUS_LABELS,
  PROGRESS_MODE_LABELS,
} from "@/lib/goal-constants";
import {
  calculateGoalProgress,
  countCompletedMilestones,
  countRelatedTasks,
} from "@/lib/goal-progress";
import {
  STATUS_BADGE_CLASS,
  STATUS_LABELS,
} from "@/lib/task-constants";
import type { Milestone, MilestoneInput } from "@/types";

interface MilestoneFormState {
  title: string;
  description: string;
  targetDate: string;
}

const emptyMilestoneForm: MilestoneFormState = {
  title: "",
  description: "",
  targetDate: "",
};

export function GoalDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const goalId = params.id;

  const {
    isReady,
    getGoalById,
    getMilestonesByGoalId,
    openEditForm,
    setGoalStatus,
    deleteGoal,
    createMilestone,
    updateMilestone,
    toggleMilestone,
    deleteMilestone,
    moveMilestone,
  } = useGoals();
  const { tasks, unlinkGoalFromTasks, openCreateForm } = useTasks();

  const goal = getGoalById(goalId);
  const milestones = getMilestonesByGoalId(goalId);
  const milestoneTitleId = useId();

  const [milestoneFormOpen, setMilestoneFormOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(
    null,
  );
  const [milestoneForm, setMilestoneForm] =
    useState<MilestoneFormState>(emptyMilestoneForm);
  const [milestoneError, setMilestoneError] = useState<string | undefined>();

  useEscapeKey(milestoneFormOpen, () => {
    setMilestoneFormOpen(false);
    setEditingMilestone(null);
    setMilestoneError(undefined);
  });

  useEffect(() => {
    if (!milestoneFormOpen) {
      return;
    }

    if (editingMilestone) {
      setMilestoneForm({
        title: editingMilestone.title,
        description: editingMilestone.description ?? "",
        targetDate: editingMilestone.targetDate ?? "",
      });
    } else {
      setMilestoneForm(emptyMilestoneForm);
    }

    setMilestoneError(undefined);
  }, [milestoneFormOpen, editingMilestone]);

  const relatedTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task.goalId === goalId && task.status !== "cancelada",
      ),
    [tasks, goalId],
  );

  if (!isReady) {
    return <p className="text-sm text-slate-500">Cargando objetivo…</p>;
  }

  if (!goal) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
        <p className="text-base font-medium text-slate-900">
          Objetivo no encontrado
        </p>
        <Link
          href="/objetivos"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-800"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver a objetivos
        </Link>
      </div>
    );
  }

  const currentGoal = goal;

  const progress = calculateGoalProgress(
    currentGoal,
    getMilestonesByGoalId(currentGoal.id),
    tasks,
  );
  const milestoneStats = countCompletedMilestones(currentGoal.id, milestones);
  const taskStats = countRelatedTasks(currentGoal.id, tasks);

  function openCreateMilestone() {
    setEditingMilestone(null);
    setMilestoneFormOpen(true);
  }

  function openEditMilestone(milestone: Milestone) {
    setEditingMilestone(milestone);
    setMilestoneFormOpen(true);
  }

  function closeMilestoneForm() {
    setMilestoneFormOpen(false);
    setEditingMilestone(null);
    setMilestoneError(undefined);
  }

  function handleMilestoneSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!milestoneForm.title.trim()) {
      setMilestoneError("El título del hito es obligatorio.");
      return;
    }

    if (
      milestoneForm.targetDate &&
      !isValidDateString(milestoneForm.targetDate)
    ) {
      setMilestoneError("Ingresá una fecha objetivo válida.");
      return;
    }

    const input: MilestoneInput = {
      title: milestoneForm.title.trim(),
      description: milestoneForm.description.trim() || undefined,
      targetDate: milestoneForm.targetDate || undefined,
    };

    if (editingMilestone) {
      void updateMilestone(editingMilestone.id, input);
    } else {
      void createMilestone(currentGoal.id, input);
    }

    closeMilestoneForm();
  }

  function handleDeleteGoal() {
    const confirmed = window.confirm(
      `¿Eliminar el objetivo “${currentGoal.title}”? También se borrarán sus hitos.`,
    );

    if (!confirmed) {
      return;
    }

    void deleteGoal(currentGoal.id).then(() => {
      unlinkGoalFromTasks(currentGoal.id);
      router.push("/objetivos");
    });
  }

  function handleDeleteMilestone(milestone: Milestone) {
    const confirmed = window.confirm(
      `¿Eliminar el hito “${milestone.title}”?`,
    );

    if (confirmed) {
      void deleteMilestone(milestone.id);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/objetivos"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Objetivos
        </Link>
      </div>

      <header className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {currentGoal.title}
            </h2>
            {currentGoal.description ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                {currentGoal.description}
              </p>
            ) : null}
          </div>
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-medium ${GOAL_STATUS_BADGE_CLASS[currentGoal.status]}`}
          >
            {GOAL_STATUS_LABELS[currentGoal.status]}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
            {currentGoal.category}
          </span>
          <span>Inicio: {currentGoal.startDate}</span>
          {currentGoal.targetDate ? (
            <span>Meta: {currentGoal.targetDate}</span>
          ) : null}
          <span>{PROGRESS_MODE_LABELS[currentGoal.progressMode]}</span>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Progreso
            </p>
            <span className="text-sm font-semibold text-teal-700">
              {progress}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-teal-600"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progreso de ${currentGoal.title}`}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Hitos {milestoneStats.completed}/{milestoneStats.total} · Tareas{" "}
            {taskStats.completed}/{taskStats.total}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openEditForm(currentGoal)}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            <Pencil className="size-3.5" aria-hidden />
            Editar
          </button>
          {currentGoal.status === "activo" ? (
            <button
              type="button"
              onClick={() => void setGoalStatus(currentGoal.id, "pausado")}
              className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
            >
              Pausar
            </button>
          ) : null}
          {currentGoal.status === "pausado" ? (
            <button
              type="button"
              onClick={() => void setGoalStatus(currentGoal.id, "activo")}
              className="rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-100"
            >
              Reactivar
            </button>
          ) : null}
          {currentGoal.status !== "completado" ? (
            <button
              type="button"
              onClick={() => {
                const confirmed = window.confirm(
                  `¿Marcar “${currentGoal.title}” como completado?`,
                );
                if (confirmed) {
                  void setGoalStatus(currentGoal.id, "completado");
                }
              }}
              className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
            >
              Completar
            </button>
          ) : null}
          {currentGoal.status !== "cancelado" &&
          currentGoal.status !== "completado" ? (
            <button
              type="button"
              onClick={() => {
                const confirmed = window.confirm(
                  `¿Cancelar el objetivo “${currentGoal.title}”?`,
                );
                if (confirmed) {
                  void setGoalStatus(currentGoal.id, "cancelado");
                }
              }}
              className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
            >
              Cancelar
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleDeleteGoal}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="size-3.5" aria-hidden />
            Eliminar
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Hitos</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Dividí el objetivo en pasos concretos
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateMilestone}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800"
          >
            <Plus className="size-4" aria-hidden />
            Nuevo hito
          </button>
        </div>

        {milestones.length === 0 ? (
          <p className="py-6 text-sm text-slate-500">
            Todavía no hay hitos. Creá el primero para empezar a medir avance.
          </p>
        ) : (
          <ul className="space-y-3">
            {milestones.map((milestone, index) => (
              <li
                key={milestone.id}
                className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => void toggleMilestone(milestone.id)}
                    className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${
                      milestone.completed
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-white text-slate-400"
                    }`}
                    aria-label={
                      milestone.completed
                        ? "Marcar hito como pendiente"
                        : "Completar hito"
                    }
                  >
                    <Check className="size-3.5" aria-hidden />
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        milestone.completed
                          ? "text-slate-600 line-through"
                          : "text-slate-900"
                      }`}
                    >
                      {milestone.title}
                    </p>
                    {milestone.description ? (
                      <p className="mt-1 text-sm text-slate-500">
                        {milestone.description}
                      </p>
                    ) : null}
                    {milestone.targetDate ? (
                      <p className="mt-1 text-xs text-slate-500">
                        Meta: {milestone.targetDate}
                      </p>
                    ) : null}

                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditMilestone(milestone)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => void moveMilestone(milestone.id, "up")}
                        disabled={index === 0}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white disabled:opacity-40"
                      >
                        <ArrowUp className="size-3.5" aria-hidden />
                        Subir
                      </button>
                      <button
                        type="button"
                        onClick={() => void moveMilestone(milestone.id, "down")}
                        disabled={index === milestones.length - 1}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white disabled:opacity-40"
                      >
                        <ArrowDown className="size-3.5" aria-hidden />
                        Bajar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMilestone(milestone)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Tareas relacionadas
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Tareas vinculadas a este objetivo
            </p>
          </div>
          <Link
            href="/tareas"
            className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-50"
          >
            Ver tareas
          </Link>
        </div>

        {relatedTasks.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-slate-500">
              No hay tareas relacionadas. Creá una y asignala a este objetivo.
            </p>
            <button
              type="button"
              onClick={openCreateForm}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            >
              <Plus className="size-4" aria-hidden />
              Nueva tarea
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {relatedTasks.map((task) => (
              <li key={task.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {task.title}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>{task.date}</span>
                    {task.startTime ? <span>{task.startTime}</span> : null}
                    <span
                      className={`rounded-md px-2 py-0.5 font-medium ${STATUS_BADGE_CLASS[task.status]}`}
                    >
                      {STATUS_LABELS[task.status]}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {milestoneFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-slate-900/40"
            onClick={closeMilestoneForm}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={milestoneTitleId}
            className="relative z-10 w-full max-w-md rounded-t-2xl border border-slate-200/80 bg-white shadow-lg sm:rounded-2xl"
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <h3
                id={milestoneTitleId}
                className="text-lg font-semibold text-slate-900"
              >
                {editingMilestone ? "Editar hito" : "Nuevo hito"}
              </h3>
            </div>
            <form onSubmit={handleMilestoneSubmit} className="space-y-4 px-5 py-4" noValidate>
              <div>
                <label
                  htmlFor="milestone-title"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Título
                </label>
                <input
                  id="milestone-title"
                  type="text"
                  value={milestoneForm.title}
                  onChange={(event) =>
                    setMilestoneForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30"
                />
                {milestoneError ? (
                  <p className="mt-1.5 text-xs text-rose-600">{milestoneError}</p>
                ) : null}
              </div>
              <div>
                <label
                  htmlFor="milestone-description"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Descripción
                </label>
                <textarea
                  id="milestone-description"
                  rows={3}
                  value={milestoneForm.description}
                  onChange={(event) =>
                    setMilestoneForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30"
                />
              </div>
              <div>
                <label
                  htmlFor="milestone-date"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Fecha objetivo
                </label>
                <input
                  id="milestone-date"
                  type="date"
                  value={milestoneForm.targetDate}
                  onChange={(event) =>
                    setMilestoneForm((current) => ({
                      ...current,
                      targetDate: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30"
                />
              </div>
              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeMilestoneForm}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  {editingMilestone ? "Guardar" : "Crear hito"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

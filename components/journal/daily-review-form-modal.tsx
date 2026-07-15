"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { useEscapeKey } from "@/hooks/use-escape-key";
import { useDailyReviews } from "@/hooks/use-daily-reviews";
import {
  SCALE_MAX,
  SCALE_MIN,
  SCALE_VALUES,
  SLEEP_MAX,
  SLEEP_MIN,
} from "@/lib/daily-review-constants";
import { getTodayDateString, isValidDateString } from "@/lib/dates";
import type { DailyReview, DailyReviewInput } from "@/types";

interface FormState {
  date: string;
  mood: number;
  energy: number;
  stress: number;
  productivity: number;
  sleepHours: string;
  trained: boolean;
  studied: boolean;
  jobSearchProgress: boolean;
  ifedelProgress: boolean;
  wentWell: string;
  difficulties: string;
  dailyWin: string;
  learning: string;
  tomorrowPriority: string;
  notes: string;
}

interface FormErrors {
  date?: string;
  mood?: string;
  energy?: string;
  stress?: string;
  productivity?: string;
  sleepHours?: string;
  wentWell?: string;
  difficulties?: string;
  dailyWin?: string;
  learning?: string;
  tomorrowPriority?: string;
}

function toFormState(
  date: string,
  editing: DailyReview | null,
): FormState {
  if (!editing) {
    return {
      date,
      mood: 5,
      energy: 5,
      stress: 5,
      productivity: 5,
      sleepHours: "",
      trained: false,
      studied: false,
      jobSearchProgress: false,
      ifedelProgress: false,
      wentWell: "",
      difficulties: "",
      dailyWin: "",
      learning: "",
      tomorrowPriority: "",
      notes: "",
    };
  }

  return {
    date: editing.date,
    mood: editing.mood,
    energy: editing.energy,
    stress: editing.stress,
    productivity: editing.productivity,
    sleepHours:
      editing.sleepHours !== undefined ? String(editing.sleepHours) : "",
    trained: editing.trained,
    studied: editing.studied,
    jobSearchProgress: editing.jobSearchProgress,
    ifedelProgress: editing.ifedelProgress,
    wentWell: editing.wentWell,
    difficulties: editing.difficulties,
    dailyWin: editing.dailyWin,
    learning: editing.learning,
    tomorrowPriority: editing.tomorrowPriority,
    notes: editing.notes ?? "",
  };
}

function ScaleSelector({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
}) {
  const legendId = `${id}-legend`;

  return (
    <fieldset>
      <legend id={legendId} className="mb-2 text-sm font-medium text-slate-700">
        {label}
        <span className="ml-2 font-semibold text-teal-700">{value}/10</span>
      </legend>
      <div
        className="flex flex-wrap gap-1.5"
        role="radiogroup"
        aria-labelledby={legendId}
      >        {SCALE_VALUES.map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${label} ${n} de 10`}
              onClick={() => onChange(n)}
              className={`flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                selected
                  ? "bg-teal-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-1.5 text-xs text-rose-600">{error}</p> : null}
    </fieldset>
  );
}

function ToggleField({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-3 text-sm transition-colors ${
        checked
          ? "border-teal-200 bg-teal-50 text-teal-900"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      <span className="font-medium">{label}</span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
      />
    </label>
  );
}

export function DailyReviewFormModal() {
  const {
    isFormOpen,
    formDate,
    formDateLocked,
    editingReview,
    closeForm,
    upsertReview,
    getByDate,
  } = useDailyReviews();
  const titleId = useId();
  const [form, setForm] = useState<FormState>(() =>
    toFormState(getTodayDateString(), null),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEscapeKey(isFormOpen, closeForm);

  useEffect(() => {
    if (!isFormOpen) {
      return;
    }

    const existing = editingReview ?? getByDate(formDate) ?? null;
    setForm(toFormState(formDate, existing));
    setErrors({});
    setIsSubmitting(false);
  }, [isFormOpen, formDate, editingReview, getByDate]);

  if (!isFormOpen) {
    return null;
  }

  const isEditing = Boolean(editingReview ?? getByDate(form.date));
  const today = getTodayDateString();

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validate(): FormErrors {
    const next: FormErrors = {};

    if (!form.date) {
      next.date = "La fecha es obligatoria.";
    } else if (!isValidDateString(form.date)) {
      next.date = "Ingresá una fecha válida.";
    } else if (form.date > today) {
      next.date = "No podés registrar un día futuro.";
    }

    for (const key of ["mood", "energy", "stress", "productivity"] as const) {
      const value = form[key];
      if (value < SCALE_MIN || value > SCALE_MAX) {
        next[key] = `Debe estar entre ${SCALE_MIN} y ${SCALE_MAX}.`;
      }
    }

    if (form.sleepHours.trim() !== "") {
      const sleep = Number(form.sleepHours);
      if (
        Number.isNaN(sleep) ||
        sleep < SLEEP_MIN ||
        sleep > SLEEP_MAX
      ) {
        next.sleepHours = `Las horas de sueño deben estar entre ${SLEEP_MIN} y ${SLEEP_MAX}.`;
      }
    }

    if (!form.wentWell.trim()) {
      next.wentWell = "Contanos qué salió bien.";
    }
    if (!form.difficulties.trim()) {
      next.difficulties = "Contanos qué te costó.";
    }
    if (!form.dailyWin.trim()) {
      next.dailyWin = "Registrá el principal logro del día.";
    }
    if (!form.learning.trim()) {
      next.learning = "Registrá un aprendizaje.";
    }
    if (!form.tomorrowPriority.trim()) {
      next.tomorrowPriority = "Definí la prioridad de mañana.";
    }

    return next;
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

    const sleep =
      form.sleepHours.trim() === ""
        ? undefined
        : Number(form.sleepHours);

    const input: DailyReviewInput = {
      date: form.date,
      mood: form.mood,
      energy: form.energy,
      stress: form.stress,
      productivity: form.productivity,
      sleepHours: sleep,
      trained: form.trained,
      studied: form.studied,
      jobSearchProgress: form.jobSearchProgress,
      ifedelProgress: form.ifedelProgress,
      wentWell: form.wentWell,
      difficulties: form.difficulties,
      dailyWin: form.dailyWin,
      learning: form.learning,
      tomorrowPriority: form.tomorrowPriority,
      notes: form.notes.trim() || undefined,
    };

    upsertReview(input);
    closeForm();
  }

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
        className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-slate-200/80 bg-white shadow-lg sm:rounded-2xl"
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-slate-900">
            {isEditing ? "Editar cierre del día" : "Completar cierre del día"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Un momento para mirar el día con calma, sin juzgarte.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
          noValidate
        >
          <div className="space-y-8 overflow-y-auto px-5 py-5">
            <div>
              <label
                htmlFor="review-date"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Fecha
              </label>
              <input
                id="review-date"
                type="date"
                value={form.date}
                max={today}
                disabled={formDateLocked}
                onChange={(event) => {
                  const nextDate = event.target.value;
                  const existing = getByDate(nextDate) ?? null;
                  setForm(toFormState(nextDate, existing));
                  setErrors({});
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30 disabled:bg-slate-50 disabled:text-slate-500"
              />
              {errors.date ? (
                <p className="mt-1.5 text-xs text-rose-600">{errors.date}</p>
              ) : null}
            </div>

            <section className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Cómo estuvo el día
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Elegí un número que represente cómo te sentiste.
                </p>
              </div>

              <ScaleSelector
                id="mood"
                label="Ánimo"
                value={form.mood}
                onChange={(value) => handleChange("mood", value)}
                error={errors.mood}
              />
              <ScaleSelector
                id="energy"
                label="Energía"
                value={form.energy}
                onChange={(value) => handleChange("energy", value)}
                error={errors.energy}
              />
              <ScaleSelector
                id="stress"
                label="Estrés"
                value={form.stress}
                onChange={(value) => handleChange("stress", value)}
                error={errors.stress}
              />
              <ScaleSelector
                id="productivity"
                label="Productividad percibida"
                value={form.productivity}
                onChange={(value) => handleChange("productivity", value)}
                error={errors.productivity}
              />

              <div>
                <label
                  htmlFor="sleep-hours"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Horas de sueño
                </label>
                <input
                  id="sleep-hours"
                  type="number"
                  min={SLEEP_MIN}
                  max={SLEEP_MAX}
                  step="0.5"
                  value={form.sleepHours}
                  onChange={(event) =>
                    handleChange("sleepHours", event.target.value)
                  }
                  placeholder="Ej. 7.5"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30"
                />
                {errors.sleepHours ? (
                  <p className="mt-1.5 text-xs text-rose-600">
                    {errors.sleepHours}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="space-y-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Acciones del día
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Marcá lo que hiciste. Está bien si no llegó todo.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <ToggleField
                  id="trained"
                  label="¿Entrenaste?"
                  checked={form.trained}
                  onChange={(value) => handleChange("trained", value)}
                />
                <ToggleField
                  id="studied"
                  label="¿Estudiaste?"
                  checked={form.studied}
                  onChange={(value) => handleChange("studied", value)}
                />
                <ToggleField
                  id="job-search"
                  label="¿Avanzaste con la búsqueda laboral?"
                  checked={form.jobSearchProgress}
                  onChange={(value) => handleChange("jobSearchProgress", value)}
                />
                <ToggleField
                  id="ifedel"
                  label="¿Avanzaste con IFEDEL?"
                  checked={form.ifedelProgress}
                  onChange={(value) => handleChange("ifedelProgress", value)}
                />
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Reflexión
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Escribí con honestidad. No tiene que ser perfecto.
                </p>
              </div>

              {(
                [
                  ["wentWell", "¿Qué salió bien hoy?", errors.wentWell],
                  ["difficulties", "¿Qué te costó?", errors.difficulties],
                  ["dailyWin", "¿Cuál fue tu principal logro?", errors.dailyWin],
                  ["learning", "¿Qué aprendiste?", errors.learning],
                  [
                    "tomorrowPriority",
                    "¿Qué querés priorizar mañana?",
                    errors.tomorrowPriority,
                  ],
                ] as const
              ).map(([key, label, error]) => (
                <div key={key}>
                  <label
                    htmlFor={key}
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    {label}
                  </label>
                  <textarea
                    id={key}
                    rows={3}
                    value={form[key]}
                    onChange={(event) => handleChange(key, event.target.value)}
                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30"
                  />
                  {error ? (
                    <p className="mt-1.5 text-xs text-rose-600">{error}</p>
                  ) : null}
                </div>
              ))}

              <div>
                <label
                  htmlFor="notes"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Notas adicionales
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={form.notes}
                  onChange={(event) => handleChange("notes", event.target.value)}
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30"
                  placeholder="Opcional"
                />
              </div>
            </section>
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
              {isEditing ? "Guardar cambios" : "Guardar cierre"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

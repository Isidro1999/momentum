"use client";

import { format, parseISO, subDays, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useDailyReviews } from "@/hooks/use-daily-reviews";
import {
  BITACORA_PERIOD_LABELS,
  type BitacoraPeriodFilter,
} from "@/lib/daily-review-constants";
import { getTodayDateString } from "@/lib/dates";
import type { DailyReview } from "@/types";

function formatReviewDate(date: string): string {
  const formatted = format(parseISO(date), "EEEE d 'de' MMMM yyyy", {
    locale: es,
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return Math.round(
    (values.reduce((sum, value) => sum + value, 0) / values.length) * 10,
  ) / 10;
}

function ActionChip({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-xs font-medium ${
        active
          ? "bg-teal-50 text-teal-800"
          : "bg-slate-100 text-slate-400"
      }`}
    >
      {label}
    </span>
  );
}

export function BitacoraPageContent() {
  const {
    reviews,
    isReady,
    openCloseForm,
    openEditForm,
    deleteReview,
  } = useDailyReviews();
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<BitacoraPeriodFilter>("30d");
  const today = getTodayDateString();

  const filteredReviews = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const last7 = format(subDays(new Date(), 6), "yyyy-MM-dd");
    const last30 = format(subDays(new Date(), 29), "yyyy-MM-dd");

    return [...reviews]
      .filter((review) => {
        if (period === "7d" && review.date < last7) {
          return false;
        }
        if (period === "30d" && review.date < last30) {
          return false;
        }
        if (period === "month" && review.date < monthStart) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        const haystack = [
          review.wentWell,
          review.difficulties,
          review.dailyWin,
          review.learning,
          review.tomorrowPriority,
          review.notes ?? "",
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [reviews, query, period]);

  const summary = useMemo(() => {
    const moods = reviews.map((review) => review.mood);
    const energies = reviews.map((review) => review.energy);
    const productivities = reviews.map((review) => review.productivity);

    return {
      count: reviews.length,
      mood: average(moods),
      energy: average(energies),
      productivity: average(productivities),
    };
  }, [reviews]);

  function handleDelete(review: DailyReview) {
    const confirmed = window.confirm(
      `¿Eliminar el registro del ${review.date}? Esta acción no se puede deshacer.`,
    );

    if (confirmed) {
      deleteReview(review.id);
    }
  }

  const periods = Object.entries(BITACORA_PERIOD_LABELS) as [
    BitacoraPeriodFilter,
    string,
  ][];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Bitácora
          </h2>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Un lugar tranquilo para mirar cómo fueron tus días y qué te están enseñando.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openCloseForm({ date: today, lockDate: false })}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 sm:w-auto"
        >
          <Plus className="size-4" aria-hidden />
          Registrar día
        </button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Días registrados
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {isReady ? summary.count : 0}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Ánimo promedio
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {isReady && summary.mood !== null ? summary.mood : "—"}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Energía promedio
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {isReady && summary.energy !== null ? summary.energy : "—"}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Productividad promedio
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {isReady && summary.productivity !== null
              ? summary.productivity
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
            placeholder="Buscar en logros, aprendizajes o notas"
            aria-label="Buscar en bitácora"
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {periods.map(([id, label]) => {
            const isActive = period === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setPeriod(id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-teal-50 text-teal-800"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {!isReady ? (
        <p className="text-sm text-slate-500">Cargando bitácora…</p>
      ) : filteredReviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-base font-medium text-slate-900">
            {reviews.length === 0
              ? "Todavía no hay registros"
              : "No hay resultados con estos filtros"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {reviews.length === 0
              ? "Completá el cierre de un día para empezar a ver patrones."
              : "Probá cambiando el período o la búsqueda."}
          </p>
          {reviews.length === 0 ? (
            <button
              type="button"
              onClick={() => openCloseForm({ date: today, lockDate: false })}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              <Plus className="size-4" aria-hidden />
              Registrar día
            </button>
          ) : null}
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredReviews.map((review) => (
            <li
              key={review.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {formatReviewDate(review.date)}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">{review.date}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                    Ánimo {review.mood}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                    Energía {review.energy}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                    Estrés {review.stress}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                    Productividad {review.productivity}
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                <p>
                  <span className="font-medium text-slate-800">Logro: </span>
                  {review.dailyWin}
                </p>
                <p>
                  <span className="font-medium text-slate-800">
                    Mañana:{" "}
                  </span>
                  {review.tomorrowPriority}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <ActionChip active={review.trained} label="Entrenamiento" />
                <ActionChip active={review.studied} label="Estudio" />
                <ActionChip
                  active={review.jobSearchProgress}
                  label="Búsqueda laboral"
                />
                <ActionChip active={review.ifedelProgress} label="IFEDEL" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/bitacora/${review.date}`}
                  className="rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-100"
                >
                  Ver detalle
                </Link>
                <button
                  type="button"
                  onClick={() => openEditForm(review)}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Pencil className="size-3.5" aria-hidden />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(review)}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

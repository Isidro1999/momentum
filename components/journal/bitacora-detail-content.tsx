"use client";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { useDailyReviews } from "@/hooks/use-daily-reviews";
import { isValidDateString } from "@/lib/dates";

function formatReviewDate(date: string): string {
  const formatted = format(parseISO(date), "EEEE d 'de' MMMM yyyy", {
    locale: es,
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function ReflectionBlock({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
        {content}
      </p>
    </div>
  );
}

export function BitacoraDetailContent() {
  const params = useParams<{ date: string }>();
  const date = params.date;
  const { isReady, getByDate, openEditForm } = useDailyReviews();
  const review = isValidDateString(date) ? getByDate(date) : undefined;

  if (!isReady) {
    return <p className="text-sm text-slate-500">Cargando registro…</p>;
  }

  if (!isValidDateString(date)) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
        <p className="text-base font-medium text-slate-900">
          Fecha inválida
        </p>
        <p className="mt-1 text-sm text-slate-500">
          La URL no corresponde a una fecha válida (AAAA-MM-DD).
        </p>
        <Link
          href="/bitacora"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-800"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver a Bitácora
        </Link>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
        <p className="text-base font-medium text-slate-900">
          No hay registro para esta fecha
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Todavía no se guardó un cierre para el {date}.
        </p>
        <Link
          href="/bitacora"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-800"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver a Bitácora
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/bitacora"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Bitácora
        </Link>
      </div>

      <header className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {formatReviewDate(review.date)}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{review.date}</p>
          </div>
          <button
            type="button"
            onClick={() => openEditForm(review)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800"
          >
            <Pencil className="size-4" aria-hidden />
            Editar
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Ánimo" value={`${review.mood}/10`} />
          <Metric label="Energía" value={`${review.energy}/10`} />
          <Metric label="Estrés" value={`${review.stress}/10`} />
          <Metric label="Productividad" value={`${review.productivity}/10`} />
          <Metric
            label="Sueño"
            value={
              review.sleepHours !== undefined
                ? `${review.sleepHours} h`
                : "Sin dato"
            }
          />
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="text-base font-semibold text-slate-900">
          Acciones del día
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {(
            [
              ["Entrenaste", review.trained],
              ["Estudiaste", review.studied],
              ["Avanzaste con búsqueda laboral", review.jobSearchProgress],
              ["Avanzaste con IFEDEL", review.ifedelProgress],
            ] as const
          ).map(([label, value]) => (
            <li
              key={label}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium ${
                value
                  ? "bg-teal-50 text-teal-800"
                  : "bg-slate-50 text-slate-500"
              }`}
            >
              {value ? "Sí" : "No"} · {label}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <ReflectionBlock title="Qué salió bien" content={review.wentWell} />
        <ReflectionBlock title="Qué te costó" content={review.difficulties} />
        <ReflectionBlock title="Principal logro" content={review.dailyWin} />
        <ReflectionBlock title="Aprendizaje" content={review.learning} />
        <ReflectionBlock
          title="Prioridad para mañana"
          content={review.tomorrowPriority}
        />
        {review.notes ? (
          <ReflectionBlock title="Notas" content={review.notes} />
        ) : null}
      </section>
    </div>
  );
}

"use client";

import { CheckCircle2, MoonStar, Pencil } from "lucide-react";
import type { DailyReview } from "@/types";

interface DayCloseButtonProps {
  review: DailyReview | null;
  onOpen: () => void;
}

export function DayCloseButton({ review, onOpen }: DayCloseButtonProps) {
  if (review) {
    return (
      <section className="rounded-2xl border border-emerald-200/70 bg-emerald-50/50 p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-700" aria-hidden />
              <h3 className="text-base font-semibold text-emerald-950">
                Cierre del día completado
              </h3>
            </div>
            <p className="mt-2 text-sm text-emerald-900/80">
              Ánimo {review.mood}/10 · Energía {review.energy}/10 ·
              Productividad {review.productivity}/10
            </p>
          </div>
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm transition-colors hover:bg-emerald-50 sm:w-auto"
          >
            <Pencil className="size-4" aria-hidden />
            Editar cierre
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-teal-200/70 bg-teal-50/60 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-teal-950">
            Cierre del día
          </h3>
          <p className="mt-1 max-w-md text-sm leading-relaxed text-teal-800/80">
            Todavía está pendiente. Reservá unos minutos para registrar cómo te
            fue y definir la prioridad de mañana.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:w-auto"
        >
          <MoonStar className="size-4" aria-hidden />
          Completar cierre del día
        </button>
      </div>
    </section>
  );
}

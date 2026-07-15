"use client";

import { BatteryMedium, Smile } from "lucide-react";

interface WellbeingCardProps {
  mood?: number;
  energy?: number;
  hasReview: boolean;
  onUpdate: () => void;
}

function ScoreBar({
  label,
  value,
  max,
  icon,
}: {
  label: string;
  value: number;
  max: number;
  icon: "mood" | "energy";
}) {
  const percent = Math.round((value / max) * 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          {icon === "mood" ? (
            <Smile className="size-4 text-slate-400" aria-hidden />
          ) : (
            <BatteryMedium className="size-4 text-slate-400" aria-hidden />
          )}
          <span>{label}</span>
        </div>
        <span className="text-sm font-semibold text-slate-900">
          {value} de {max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-500"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        />
      </div>
    </div>
  );
}

export function WellbeingCard({
  mood,
  energy,
  hasReview,
  onUpdate,
}: WellbeingCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900">
            Estado personal
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {hasReview
              ? "Valores del cierre que registraste hoy"
              : "Todavía no registraste cómo te sentís hoy"}
          </p>
        </div>
        <button
          type="button"
          onClick={onUpdate}
          className="shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          {hasReview ? "Editar" : "Registrar"}
        </button>
      </div>

      {hasReview && mood !== undefined && energy !== undefined ? (
        <div className="mt-5 space-y-5">
          <ScoreBar label="Ánimo" value={mood} max={10} icon="mood" />
          <ScoreBar label="Energía" value={energy} max={10} icon="energy" />
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
          Completá el cierre del día para ver aquí tu ánimo y energía.
        </div>
      )}
    </section>
  );
}

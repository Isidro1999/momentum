"use client";

import Link from "next/link";
import type { GoalProgressItem } from "@/types";

interface GoalProgressProps {
  goals: GoalProgressItem[];
  isLoading?: boolean;
}

export function GoalProgress({
  goals,
  isLoading = false,
}: GoalProgressProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Avance de objetivos
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Progreso de tus focos principales
          </p>
        </div>
        <Link
          href="/objetivos"
          className="shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-50"
        >
          Ver todos
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-5 text-sm text-slate-500">Cargando objetivos…</p>
      ) : goals.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">
          No hay objetivos activos. Creá uno para seguir tu avance.
        </p>
      ) : (
        <ul className="mt-5 space-y-4">
          {goals.map((goal) => (
            <li key={goal.id}>
              <Link href={`/objetivos/${goal.id}`} className="block">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-800 hover:text-teal-800">
                    {goal.title}
                  </p>
                  <span className="shrink-0 text-sm font-semibold text-teal-700">
                    {goal.progress}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-teal-600"
                    style={{ width: `${goal.progress}%` }}
                    role="progressbar"
                    aria-valuenow={goal.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progreso de ${goal.title}`}
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

import { CheckCircle2, CircleDashed, Gauge } from "lucide-react";

interface DailyProgressProps {
  progressPercent: number;
  completedTasks: number;
  pendingTasks: number;
}

export function DailyProgress({
  progressPercent,
  completedTasks,
  pendingTasks,
}: DailyProgressProps) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <article className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <Gauge className="size-3.5 shrink-0" aria-hidden />
          <p className="text-xs font-medium uppercase tracking-wide">
            Progreso del día
          </p>
        </div>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          {progressPercent}%
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-teal-600 transition-all"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso general del día"
          />
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
          <p className="text-xs font-medium uppercase tracking-wide">
            Completadas
          </p>
        </div>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          {completedTasks}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">tareas finalizadas</p>
      </article>

      <article className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <CircleDashed className="size-3.5 shrink-0" aria-hidden />
          <p className="text-xs font-medium uppercase tracking-wide">
            Pendientes
          </p>
        </div>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          {pendingTasks}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">por atender hoy</p>
      </article>
    </section>
  );
}

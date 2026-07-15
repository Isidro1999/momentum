"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDailyReviews } from "@/hooks/use-daily-reviews";
import { useGoals } from "@/hooks/use-goals";
import { useTasks } from "@/hooks/use-tasks";
import {
  buildDateRange,
  findEarliestDate,
  type ProgressPeriod,
  PROGRESS_PERIOD_LABELS,
} from "@/lib/analytics/date-range";
import { buildGoalAnalytics } from "@/lib/analytics/goal-analytics";
import { buildInsights } from "@/lib/analytics/insights";
import { buildTaskAnalytics } from "@/lib/analytics/task-analytics";
import { buildWellbeingAnalytics } from "@/lib/analytics/wellbeing-analytics";
import { getTodayDateString } from "@/lib/dates";

const CHART_COLORS = {
  completed: "#0f766e",
  incomplete: "#cbd5e1",
  mood: "#0f766e",
  energy: "#0284c7",
  stress: "#d97706",
  productivity: "#6366f1",
  sleep: "#64748b",
  category: "#0d9488",
};

type WellbeingSeriesKey = "mood" | "energy" | "stress" | "productivity";

const SERIES_META: {
  key: WellbeingSeriesKey;
  label: string;
  color: string;
}[] = [
  { key: "mood", label: "Ánimo", color: CHART_COLORS.mood },
  { key: "energy", label: "Energía", color: CHART_COLORS.energy },
  { key: "stress", label: "Estrés", color: CHART_COLORS.stress },
  {
    key: "productivity",
    label: "Productividad",
    color: CHART_COLORS.productivity,
  },
];

function MetricCard({
  title,
  primary,
  secondary,
  empty,
}: {
  title: string;
  primary: string;
  secondary?: string;
  empty?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {title}
      </p>
      {empty ? (
        <p className="mt-2 text-sm text-slate-500">Sin datos suficientes</p>
      ) : (
        <>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{primary}</p>
          {secondary ? (
            <p className="mt-1 text-xs text-slate-500">{secondary}</p>
          ) : null}
        </>
      )}
    </article>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

function HabitStat({
  label,
  count,
  total,
  rate,
}: {
  label: string;
  count: number;
  total: number;
  rate: number | null;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3">
      <p className="text-sm font-medium text-slate-800">{label}</p>
      <p className="mt-1 text-xl font-semibold text-teal-700">
        {rate !== null ? `${rate}%` : "—"}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {count} de {total} días registrados
      </p>
    </div>
  );
}

export function ProgressPageContent() {
  const { tasks, isReady: tasksReady } = useTasks();
  const { goals, milestones, isReady: goalsReady } = useGoals();
  const { reviews, isReady: reviewsReady } = useDailyReviews();
  const [period, setPeriod] = useState<ProgressPeriod>("30d");
  const [visibleSeries, setVisibleSeries] = useState<
    Record<WellbeingSeriesKey, boolean>
  >({
    mood: true,
    energy: true,
    stress: true,
    productivity: true,
  });

  const today = getTodayDateString();
  const isReady = tasksReady && goalsReady && reviewsReady;

  const analytics = useMemo(() => {
    const earliest = findEarliestDate([
      ...tasks.map((task) => task.date),
      ...reviews.map((review) => review.date),
      ...goals.map((goal) => goal.startDate),
    ]);

    const range = buildDateRange(period, today, earliest);
    const taskAnalytics = buildTaskAnalytics(tasks, range);
    const wellbeing = buildWellbeingAnalytics(reviews, range, today);
    const goalAnalytics = buildGoalAnalytics(goals, milestones, tasks, range);

    const consistencyDays = new Set([
      ...taskAnalytics.daysWithCompletedTask,
      ...wellbeing.daysWithReview,
    ]);

    const insights = buildInsights({
      tasks,
      taskAnalytics,
      wellbeing,
      today,
    });

    return {
      range,
      taskAnalytics,
      wellbeing,
      goalAnalytics,
      consistencyDays: consistencyDays.size,
      totalDays: range.days.length,
      insights,
    };
  }, [tasks, reviews, goals, milestones, period, today]);

  function toggleSeries(key: WellbeingSeriesKey) {
    setVisibleSeries((current) => {
      const next = { ...current, [key]: !current[key] };
      const anyVisible = Object.values(next).some(Boolean);
      return anyVisible ? next : current;
    });
  }

  const periods = Object.entries(PROGRESS_PERIOD_LABELS) as [
    ProgressPeriod,
    string,
  ][];

  const hasDailyTaskChart = analytics.taskAnalytics.dailyCompletion.some(
    (point) => point.completed > 0 || point.incomplete > 0,
  );
  const hasWellbeingSeries = analytics.wellbeing.reviewsInPeriod.length > 0;

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Progreso
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Una mirada a cómo venís avanzando en tus distintas áreas.
          </p>
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
      </header>

      {!isReady ? (
        <p className="text-sm text-slate-500">Cargando progreso…</p>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Cumplimiento de tareas"
              empty={analytics.taskAnalytics.planned === 0}
              primary={`${analytics.taskAnalytics.completionRate ?? 0}%`}
              secondary={`${analytics.taskAnalytics.completed} de ${analytics.taskAnalytics.planned} planificadas`}
            />
            <MetricCard
              title="Constancia"
              empty={analytics.consistencyDays === 0}
              primary={`${analytics.consistencyDays}`}
              secondary={`de ${analytics.totalDays} días del período`}
            />
            <MetricCard
              title="Estado de ánimo promedio"
              empty={analytics.wellbeing.averageMood === null}
              primary={
                analytics.wellbeing.averageMood !== null
                  ? `${analytics.wellbeing.averageMood}`
                  : "—"
              }
              secondary="Sobre cierres diarios del período"
            />
            <MetricCard
              title="Objetivos activos"
              empty={analytics.goalAnalytics.activeCount === 0}
              primary={`${analytics.goalAnalytics.activeCount}`}
              secondary={
                analytics.goalAnalytics.averageActiveProgress !== null
                  ? `Progreso promedio ${analytics.goalAnalytics.averageActiveProgress}%`
                  : undefined
              }
            />
          </section>

          <div className="grid gap-4 xl:grid-cols-2">
            <SectionCard
              title="Cumplimiento diario"
              description="Tareas completadas frente a pendientes o en curso."
            >
              {!hasDailyTaskChart ? (
                <EmptyState message="Todavía no hay tareas en este período." />
              ) : (
                <div className="h-64 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.taskAnalytics.dailyCompletion}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "#64748b", fontSize: 11 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: "#64748b", fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          borderColor: "#e2e8f0",
                        }}
                        formatter={(value, name) => [
                          value,
                          name === "completed"
                            ? "Completadas"
                            : "No completadas",
                        ]}
                        labelFormatter={(_, payload) => {
                          const point = payload?.[0]?.payload as
                            | { date?: string }
                            | undefined;
                          return point?.date ?? "";
                        }}
                      />
                      <Legend
                        formatter={(value) =>
                          value === "completed"
                            ? "Completadas"
                            : "No completadas"
                        }
                      />
                      <Bar
                        dataKey="completed"
                        stackId="tasks"
                        fill={CHART_COLORS.completed}
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="incomplete"
                        stackId="tasks"
                        fill={CHART_COLORS.incomplete}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Tareas completadas por categoría"
              description="Distribución de tu avance cerrado."
            >
              {analytics.taskAnalytics.byCategory.length === 0 ? (
                <EmptyState message="Todavía no hay tareas completadas en este período." />
              ) : (
                <div className="h-64 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={analytics.taskAnalytics.byCategory}
                      margin={{ left: 16, right: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        type="number"
                        allowDecimals={false}
                        tick={{ fill: "#64748b", fontSize: 11 }}
                      />
                      <YAxis
                        type="category"
                        dataKey="category"
                        width={110}
                        tick={{ fill: "#64748b", fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          borderColor: "#e2e8f0",
                        }}
                        formatter={(value) => [value, "Completadas"]}
                      />
                      <Bar
                        dataKey="completed"
                        fill={CHART_COLORS.category}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </SectionCard>
          </div>

          <SectionCard title="Métricas de tareas">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-slate-50 px-3 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Postergadas
                </p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {analytics.taskAnalytics.postponed}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Canceladas
                </p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {analytics.taskAnalytics.cancelled}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Mayor avance
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {analytics.taskAnalytics.topCategory ?? "Sin datos"}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Alta prioridad
                </p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {analytics.taskAnalytics.highPriorityCompletionRate !== null
                    ? `${analytics.taskAnalytics.highPriorityCompletionRate}%`
                    : "—"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {analytics.taskAnalytics.highPriorityCompleted} de{" "}
                  {analytics.taskAnalytics.highPriorityTotal}
                </p>
              </div>
            </div>
          </SectionCard>

          <div className="grid gap-4 xl:grid-cols-2">
            <SectionCard
              title="Evolución personal"
              description="Ánimo, energía, estrés y productividad."
            >
              {!hasWellbeingSeries ? (
                <EmptyState message="Completá algunos cierres diarios para ver tu evolución." />
              ) : (
                <>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {SERIES_META.map((series) => (
                      <button
                        key={series.key}
                        type="button"
                        aria-pressed={visibleSeries[series.key]}
                        onClick={() => toggleSeries(series.key)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                          visibleSeries[series.key]
                            ? "text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                        style={
                          visibleSeries[series.key]
                            ? { backgroundColor: series.color }
                            : undefined
                        }
                      >
                        {series.label}
                      </button>
                    ))}
                  </div>
                  <div className="h-64 w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.wellbeing.series}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="label"
                          tick={{ fill: "#64748b", fontSize: 11 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          domain={[1, 10]}
                          tick={{ fill: "#64748b", fontSize: 11 }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            borderColor: "#e2e8f0",
                          }}
                          labelFormatter={(_, payload) => {
                            const point = payload?.[0]?.payload as
                              | { date?: string }
                              | undefined;
                            return point?.date ?? "";
                          }}
                        />
                        {SERIES_META.map((series) =>
                          visibleSeries[series.key] ? (
                            <Line
                              key={series.key}
                              type="monotone"
                              dataKey={series.key}
                              name={series.label}
                              stroke={series.color}
                              strokeWidth={2}
                              dot={false}
                              connectNulls={false}
                            />
                          ) : null,
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </SectionCard>

            <SectionCard
              title="Horas de sueño"
              description={
                analytics.wellbeing.averageSleep !== null
                  ? `Promedio del período: ${analytics.wellbeing.averageSleep} h`
                  : "Promedio del período cuando haya registros."
              }
            >
              {analytics.wellbeing.sleepSeries.length === 0 ? (
                <EmptyState message="Todavía no registraste horas de sueño en este período." />
              ) : (
                <div className="h-64 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.wellbeing.sleepSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "#64748b", fontSize: 11 }}
                      />
                      <YAxis
                        domain={[0, 24]}
                        tick={{ fill: "#64748b", fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          borderColor: "#e2e8f0",
                        }}
                        formatter={(value) => [`${value} h`, "Sueño"]}
                        labelFormatter={(_, payload) => {
                          const point = payload?.[0]?.payload as
                            | { date?: string }
                            | undefined;
                          return point?.date ?? "";
                        }}
                      />
                      <Bar
                        dataKey="sleepHours"
                        fill={CHART_COLORS.sleep}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </SectionCard>
          </div>

          <SectionCard
            title="Hábitos y acciones"
            description="Porcentajes sobre los cierres diarios del período."
          >
            {analytics.wellbeing.habits.recordedDays === 0 ? (
              <EmptyState message="Completá algunos cierres diarios para ver tus hábitos." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <HabitStat
                  label="Entrenamiento"
                  count={analytics.wellbeing.habits.trained.count}
                  total={analytics.wellbeing.habits.recordedDays}
                  rate={analytics.wellbeing.habits.trained.percent}
                />
                <HabitStat
                  label="Estudio"
                  count={analytics.wellbeing.habits.studied.count}
                  total={analytics.wellbeing.habits.recordedDays}
                  rate={analytics.wellbeing.habits.studied.percent}
                />
                <HabitStat
                  label="Búsqueda laboral"
                  count={analytics.wellbeing.habits.jobSearch.count}
                  total={analytics.wellbeing.habits.recordedDays}
                  rate={analytics.wellbeing.habits.jobSearch.percent}
                />
                <HabitStat
                  label="IFEDEL"
                  count={analytics.wellbeing.habits.ifedel.count}
                  total={analytics.wellbeing.habits.recordedDays}
                  rate={analytics.wellbeing.habits.ifedel.percent}
                />
              </div>
            )}
          </SectionCard>

          <SectionCard title="Objetivos">
            {analytics.goalAnalytics.activeCount === 0 &&
            analytics.goalAnalytics.completedInPeriod === 0 ? (
              <EmptyState message="Creá objetivos para empezar a medir su progreso." />
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 px-3 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Activos
                    </p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">
                      {analytics.goalAnalytics.activeCount}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Progreso promedio
                    </p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">
                      {analytics.goalAnalytics.averageActiveProgress !== null
                        ? `${analytics.goalAnalytics.averageActiveProgress}%`
                        : "—"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Completados en el período
                    </p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">
                      {analytics.goalAnalytics.completedInPeriod}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Mayor progreso
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {analytics.goalAnalytics.topActive?.title ?? "Sin datos"}
                    </p>
                  </div>
                </div>

                {analytics.goalAnalytics.nearestDeadline ? (
                  <p className="text-sm text-slate-600">
                    Fecha más cercana:{" "}
                    <span className="font-medium text-slate-900">
                      {analytics.goalAnalytics.nearestDeadline.title}
                    </span>
                    {analytics.goalAnalytics.nearestDeadline.targetDate
                      ? ` · ${analytics.goalAnalytics.nearestDeadline.targetDate}`
                      : null}
                  </p>
                ) : null}

                {analytics.goalAnalytics.activeGoals.length > 0 ? (
                  <ul className="space-y-3">
                    {analytics.goalAnalytics.activeGoals.map((goal) => (
                      <li
                        key={goal.id}
                        className="rounded-xl border border-slate-100 px-3 py-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <Link
                              href={`/objetivos/${goal.id}`}
                              className="text-sm font-semibold text-slate-900 hover:text-teal-800"
                            >
                              {goal.title}
                            </Link>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {goal.category}
                              {goal.targetDate
                                ? ` · Meta ${goal.targetDate}`
                                : ""}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-teal-700">
                            {goal.progress}%
                          </span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-teal-600"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Lo que muestran tus datos"
            description="Observaciones simples basadas en tu registro local."
          >
            <ul className="space-y-2">
              {analytics.insights.map((insight) => (
                <li
                  key={insight.id}
                  className="rounded-xl bg-slate-50 px-3 py-3 text-sm leading-relaxed text-slate-700"
                >
                  {insight.text}
                </li>
              ))}
            </ul>
          </SectionCard>
        </>
      )}
    </div>
  );
}

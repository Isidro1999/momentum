"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus } from "lucide-react";
import { getDayGreeting } from "@/lib/dates";

interface DayOverviewProps {
  userName: string;
  mainPriority: string;
  onNewTask: () => void;
}

export function DayOverview({
  userName,
  mainPriority,
  onNewTask,
}: DayOverviewProps) {
  const today = new Date();
  const formattedDate = format(today, "EEEE d 'de' MMMM yyyy", { locale: es });
  const capitalizedDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  const greeting = getDayGreeting(today);
  const focusText = `Hoy tu foco principal es ${mainPriority.charAt(0).toLowerCase()}${mainPriority.slice(1)}`;

  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div className="min-w-0 space-y-2">
        <p className="text-sm font-medium text-slate-500">{capitalizedDate}</p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {greeting}, {userName}
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-600">
          {focusText}
        </p>
      </div>

      <button
        type="button"
        onClick={onNewTask}
        className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:w-auto"
      >
        <Plus className="size-4" aria-hidden />
        Nueva tarea
      </button>
    </header>
  );
}

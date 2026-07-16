"use client";

import { useCategories } from "@/providers/category-provider";
import { useDailyReviews } from "@/hooks/use-daily-reviews";
import { useGoals } from "@/hooks/use-goals";
import { useTasks } from "@/hooks/use-tasks";

export function DataErrorBanner() {
  const {
    error: categoriesError,
    retry: retryCategories,
  } = useCategories();
  const { error: tasksError, retry: retryTasks } = useTasks();
  const { error: goalsError, retry: retryGoals } = useGoals();
  const { error: reviewsError, retry: retryReviews } = useDailyReviews();

  const error =
    categoriesError || tasksError || goalsError || reviewsError;

  if (!error) {
    return null;
  }

  function handleRetry() {
    if (categoriesError) {
      retryCategories();
    }
    if (tasksError) {
      retryTasks();
    }
    if (goalsError) {
      retryGoals();
    }
    if (reviewsError) {
      retryReviews();
    }
  }

  return (
    <div
      role="alert"
      className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-950"
    >
      <p className="font-medium">No se pudieron cargar tus datos.</p>
      <p className="mt-1 text-rose-900/80">{error}</p>
      <button
        type="button"
        onClick={handleRetry}
        className="mt-3 rounded-xl bg-rose-800 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-900"
      >
        Reintentar
      </button>
    </div>
  );
}

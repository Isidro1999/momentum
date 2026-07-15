"use client";

import { useDailyReviews } from "@/hooks/use-daily-reviews";
import { useGoals } from "@/hooks/use-goals";
import { useTasks } from "@/hooks/use-tasks";

export function StorageRecoveryBanner() {
  const {
    storageCorrupt: tasksCorrupt,
    recoverStorage: recoverTasks,
  } = useTasks();
  const {
    storageCorrupt: goalsCorrupt,
    recoverStorage: recoverGoals,
  } = useGoals();
  const {
    storageCorrupt: reviewsCorrupt,
    recoverStorage: recoverReviews,
  } = useDailyReviews();

  const corrupt =
    tasksCorrupt || goalsCorrupt || reviewsCorrupt;

  if (!corrupt) {
    return null;
  }

  function handleRecover() {
    if (tasksCorrupt) {
      recoverTasks();
    }
    if (goalsCorrupt) {
      recoverGoals();
    }
    if (reviewsCorrupt) {
      recoverReviews();
    }
  }

  return (
    <div
      role="alert"
      className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <p className="font-medium">
        Hay datos locales dañados y no se pudieron cargar.
      </p>
      <p className="mt-1 text-amber-900/80">
        Podés restaurar con los datos de ejemplo (se perderán los datos
        corruptos). Tus datos válidos en otras claves no se tocan.
      </p>
      <button
        type="button"
        onClick={handleRecover}
        className="mt-3 rounded-xl bg-amber-800 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-900"
      >
        Restaurar datos locales
      </button>
    </div>
  );
}

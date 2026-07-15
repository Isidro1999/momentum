import type { StorageLoadResult } from "@/lib/storage";
import { safeJsonParse, safeLocalStorageSet } from "@/lib/storage";
import type { DailyReview } from "@/types";

export const DAILY_REVIEWS_STORAGE_KEY = "momentum.dailyReviews.v1";

function isDailyReview(value: unknown): value is DailyReview {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.date === "string" &&
    typeof item.mood === "number" &&
    typeof item.energy === "number" &&
    typeof item.stress === "number" &&
    typeof item.productivity === "number" &&
    typeof item.trained === "boolean" &&
    typeof item.studied === "boolean" &&
    typeof item.jobSearchProgress === "boolean" &&
    typeof item.ifedelProgress === "boolean" &&
    typeof item.wentWell === "string" &&
    typeof item.difficulties === "string" &&
    typeof item.dailyWin === "string" &&
    typeof item.learning === "string" &&
    typeof item.tomorrowPriority === "string" &&
    typeof item.createdAt === "string" &&
    typeof item.updatedAt === "string"
  );
}

export function loadDailyReviewsFromStorage(): StorageLoadResult<DailyReview[]> {
  if (typeof window === "undefined") {
    return { status: "missing" };
  }

  try {
    const raw = window.localStorage.getItem(DAILY_REVIEWS_STORAGE_KEY);
    if (raw === null) {
      return { status: "missing" };
    }

    const parsed = safeJsonParse(raw);
    if (parsed === undefined || !Array.isArray(parsed)) {
      return { status: "corrupt" };
    }

    const reviews = parsed.filter(isDailyReview);
    if (parsed.length > 0 && reviews.length === 0) {
      return { status: "corrupt" };
    }

    return { status: "ok", data: reviews };
  } catch {
    return { status: "corrupt" };
  }
}

export function saveDailyReviewsToStorage(reviews: DailyReview[]): boolean {
  return safeLocalStorageSet(DAILY_REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
}

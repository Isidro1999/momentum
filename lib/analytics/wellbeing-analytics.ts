import type { DailyReview } from "@/types";
import {
  average,
  type DateRange,
  isDateInRange,
  percent,
} from "@/lib/analytics/date-range";

export interface WellbeingSeriesPoint {
  date: string;
  label: string;
  mood: number | null;
  energy: number | null;
  stress: number | null;
  productivity: number | null;
}

export interface SleepPoint {
  date: string;
  label: string;
  sleepHours: number;
}

export interface HabitStats {
  trained: { count: number; percent: number | null };
  studied: { count: number; percent: number | null };
  jobSearch: { count: number; percent: number | null };
  ifedel: { count: number; percent: number | null };
  recordedDays: number;
}

export interface WellbeingAnalytics {
  reviewsInPeriod: DailyReview[];
  averageMood: number | null;
  averageEnergy: number | null;
  averageStress: number | null;
  averageProductivity: number | null;
  averageSleep: number | null;
  series: WellbeingSeriesPoint[];
  sleepSeries: SleepPoint[];
  habits: HabitStats;
  daysWithReview: Set<string>;
  consecutiveStreak: number;
}

function shortLabel(date: string): string {
  const [, month, day] = date.split("-");
  return `${day}/${month}`;
}

export function countConsecutiveReviewStreak(
  reviews: DailyReview[],
  today: string,
): number {
  const dates = new Set(reviews.map((review) => review.date));
  let streak = 0;
  let cursor = today;

  while (dates.has(cursor)) {
    streak += 1;
    const [year, month, day] = cursor.split("-").map(Number);
    const previous = new Date(year, month - 1, day - 1);
    cursor = `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, "0")}-${String(previous.getDate()).padStart(2, "0")}`;
  }

  return streak;
}

export function buildWellbeingAnalytics(
  reviews: DailyReview[],
  range: DateRange,
  today: string,
): WellbeingAnalytics {
  const reviewsInPeriod = reviews
    .filter((review) => isDateInRange(review.date, range))
    .sort((a, b) => a.date.localeCompare(b.date));

  const byDate = new Map(
    reviewsInPeriod.map((review) => [review.date, review]),
  );

  const series = range.days.map((date) => {
    const review = byDate.get(date);
    return {
      date,
      label: shortLabel(date),
      mood: review?.mood ?? null,
      energy: review?.energy ?? null,
      stress: review?.stress ?? null,
      productivity: review?.productivity ?? null,
    };
  });

  const sleepSeries = reviewsInPeriod
    .filter((review) => review.sleepHours !== undefined)
    .map((review) => ({
      date: review.date,
      label: shortLabel(review.date),
      sleepHours: review.sleepHours as number,
    }));

  const recordedDays = reviewsInPeriod.length;
  const habitCount = (
    predicate: (review: DailyReview) => boolean,
  ): { count: number; percent: number | null } => {
    const count = reviewsInPeriod.filter(predicate).length;
    return { count, percent: percent(count, recordedDays) };
  };

  return {
    reviewsInPeriod,
    averageMood: average(reviewsInPeriod.map((review) => review.mood)),
    averageEnergy: average(reviewsInPeriod.map((review) => review.energy)),
    averageStress: average(reviewsInPeriod.map((review) => review.stress)),
    averageProductivity: average(
      reviewsInPeriod.map((review) => review.productivity),
    ),
    averageSleep: average(sleepSeries.map((point) => point.sleepHours)),
    series,
    sleepSeries,
    habits: {
      trained: habitCount((review) => review.trained),
      studied: habitCount((review) => review.studied),
      jobSearch: habitCount((review) => review.jobSearchProgress),
      ifedel: habitCount((review) => review.ifedelProgress),
      recordedDays,
    },
    daysWithReview: new Set(reviewsInPeriod.map((review) => review.date)),
    consecutiveStreak: countConsecutiveReviewStreak(reviews, today),
  };
}

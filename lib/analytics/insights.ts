import type { TaskAnalytics } from "@/lib/analytics/task-analytics";
import type { WellbeingAnalytics } from "@/lib/analytics/wellbeing-analytics";
import type { Task } from "@/types";
import { average } from "@/lib/analytics/date-range";

export interface Insight {
  id: string;
  text: string;
}

export function buildInsights(params: {
  tasks: Task[];
  taskAnalytics: TaskAnalytics;
  wellbeing: WellbeingAnalytics;
  today: string;
}): Insight[] {
  const { tasks, taskAnalytics, wellbeing, today } = params;
  const insights: Insight[] = [];

  const hasAnyData =
    taskAnalytics.planned > 0 ||
    wellbeing.reviewsInPeriod.length > 0;

  if (!hasAnyData) {
    return [
      {
        id: "insufficient",
        text: "Todavía no hay suficientes datos para detectar patrones. Seguí registrando tus días.",
      },
    ];
  }

  const trainedMood = average(
    wellbeing.reviewsInPeriod
      .filter((review) => review.trained)
      .map((review) => review.mood),
  );
  const untrainedMood = average(
    wellbeing.reviewsInPeriod
      .filter((review) => !review.trained)
      .map((review) => review.mood),
  );

  if (
    trainedMood !== null &&
    untrainedMood !== null &&
    trainedMood > untrainedMood
  ) {
    insights.push({
      id: "training-mood",
      text: "Tu ánimo fue más alto los días que entrenaste.",
    });
  }

  if (
    taskAnalytics.planned > 0 &&
    taskAnalytics.postponed / taskAnalytics.planned > 0.3
  ) {
    insights.push({
      id: "postponed",
      text: "Estás postergando una parte importante de tus tareas. Quizás convenga planificar menos por día.",
    });
  }

  if (
    taskAnalytics.completed > 0 &&
    taskAnalytics.topCategory &&
    taskAnalytics.byCategory[0] &&
    taskAnalytics.byCategory[0].completed / taskAnalytics.completed > 0.5
  ) {
    insights.push({
      id: "category-focus",
      text: `La mayor parte de tu avance estuvo concentrada en ${taskAnalytics.topCategory}.`,
    });
  }

  const sevenDaysAgo = (() => {
    const [year, month, day] = today.split("-").map(Number);
    const date = new Date(year, month - 1, day - 6);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  })();

  const jobSearchCompletedRecently = tasks.some(
    (task) =>
      task.category === "Búsqueda laboral" &&
      task.status === "completada" &&
      task.date >= sevenDaysAgo &&
      task.date <= today,
  );

  const hasJobSearchWindow =
    tasks.some(
      (task) =>
        task.category === "Búsqueda laboral" &&
        task.date <= today,
    ) ||
    wellbeing.reviewsInPeriod.some((review) => review.jobSearchProgress);

  if (hasJobSearchWindow && !jobSearchCompletedRecently) {
    const noRecentJobSearchProgress = !wellbeing.reviewsInPeriod.some(
      (review) =>
        review.date >= sevenDaysAgo && review.jobSearchProgress,
    );

    if (noRecentJobSearchProgress) {
      insights.push({
        id: "job-search-gap",
        text: "Hace varios días que no registrás avances en tu búsqueda laboral.",
      });
    }
  }

  if (wellbeing.consecutiveStreak >= 3) {
    insights.push({
      id: "streak",
      text: `Llevás una racha de ${wellbeing.consecutiveStreak} días completando tu bitácora.`,
    });
  }

  return insights.slice(0, 4);
}

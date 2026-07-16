import { loadDailyReviewsFromStorage } from "@/lib/daily-review-storage";
import { loadGoalsFromStorage } from "@/lib/goal-storage";
import { loadTasksFromStorage } from "@/lib/task-storage";
import type { Category } from "@/lib/repositories/category-repository";
import {
  createDailyReviewWithLocalSource,
  findDailyReviewIdsByLocalSourceIds,
} from "@/lib/repositories/daily-review-repository";
import { RepositoryError, toUserFacingError } from "@/lib/repositories/errors";
import {
  createGoal,
  findGoalIdsByLocalSourceIds,
} from "@/lib/repositories/goal-repository";
import {
  createMilestone,
  findMilestoneIdsByLocalSourceIds,
} from "@/lib/repositories/milestone-repository";
import {
  getBrowserSupabase,
  requireUserId,
} from "@/lib/repositories/session";
import {
  createTask,
  findTaskIdsByLocalSourceIds,
} from "@/lib/repositories/task-repository";
import type { DailyReview, Goal, Milestone, Task } from "@/types";
import type { ProfileRow } from "@/types/database";

export type LocalMigrationSummary = {
  tasksImported: number;
  goalsImported: number;
  milestonesImported: number;
  reviewsImported: number;
  tasksSkipped: number;
  goalsSkipped: number;
  milestonesSkipped: number;
  reviewsSkipped: number;
  errors: string[];
};

export type LocalDataSnapshot = {
  hasData: boolean;
  taskCount: number;
  goalCount: number;
  milestoneCount: number;
  reviewCount: number;
  tasks: Task[];
  goals: Goal[];
  milestones: Milestone[];
  reviews: DailyReview[];
};

export function readLocalDataSnapshot(): LocalDataSnapshot {
  const tasksResult = loadTasksFromStorage();
  const goalsResult = loadGoalsFromStorage();
  const reviewsResult = loadDailyReviewsFromStorage();

  const tasks = tasksResult.status === "ok" ? tasksResult.data : [];
  const goals =
    goalsResult.status === "ok" ? goalsResult.data.goals : [];
  const milestones =
    goalsResult.status === "ok" ? goalsResult.data.milestones : [];
  const reviews =
    reviewsResult.status === "ok" ? reviewsResult.data : [];

  return {
    hasData:
      tasks.length > 0 ||
      goals.length > 0 ||
      milestones.length > 0 ||
      reviews.length > 0,
    taskCount: tasks.length,
    goalCount: goals.length,
    milestoneCount: milestones.length,
    reviewCount: reviews.length,
    tasks,
    goals,
    milestones,
    reviews,
  };
}

export async function getLocalStorageMigratedAt(): Promise<string | null> {
  const userId = await requireUserId();
  const supabase = getBrowserSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("local_storage_migrated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new RepositoryError(toUserFacingError(error));
  }

  return (data as ProfileRow | null)?.local_storage_migrated_at ?? null;
}

export async function markLocalStorageMigrated(): Promise<void> {
  const userId = await requireUserId();
  const supabase = getBrowserSupabase();
  const { error } = await supabase
    .from("profiles")
    .update({ local_storage_migrated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    throw new RepositoryError(toUserFacingError(error));
  }
}

export function clearLocalMomentumStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem("momentum.tasks.v1");
  window.localStorage.removeItem("momentum.goals.v1");
  window.localStorage.removeItem("momentum.dailyReviews.v1");
}

export async function importLocalDataToSupabase(
  categories: Category[],
): Promise<LocalMigrationSummary> {
  const summary: LocalMigrationSummary = {
    tasksImported: 0,
    goalsImported: 0,
    milestonesImported: 0,
    reviewsImported: 0,
    tasksSkipped: 0,
    goalsSkipped: 0,
    milestonesSkipped: 0,
    reviewsSkipped: 0,
    errors: [],
  };

  const snapshot = readLocalDataSnapshot();
  const goalIdMap = new Map<string, string>();

  const existingGoalIds = await findGoalIdsByLocalSourceIds(
    snapshot.goals.map((goal) => goal.id),
  );

  for (const goal of snapshot.goals) {
    const existingId = existingGoalIds.get(goal.id);
    if (existingId) {
      goalIdMap.set(goal.id, existingId);
      summary.goalsSkipped += 1;
      continue;
    }

    try {
      const created = await createGoal(
        {
          title: goal.title,
          description: goal.description,
          category: goal.category,
          startDate: goal.startDate,
          targetDate: goal.targetDate,
          progressMode: goal.progressMode,
          manualProgress: goal.manualProgress,
        },
        categories,
        {
          status: goal.status,
          completedAt: goal.completedAt,
          localSourceId: goal.id,
        },
      );
      goalIdMap.set(goal.id, created.id);
      summary.goalsImported += 1;
    } catch {
      summary.errors.push(`No se pudo importar el objetivo “${goal.title}”.`);
    }
  }

  const existingMilestoneIds = await findMilestoneIdsByLocalSourceIds(
    snapshot.milestones.map((milestone) => milestone.id),
  );

  for (const milestone of snapshot.milestones) {
    if (existingMilestoneIds.has(milestone.id)) {
      summary.milestonesSkipped += 1;
      continue;
    }

    const remoteGoalId = goalIdMap.get(milestone.goalId);
    if (!remoteGoalId) {
      summary.errors.push(
        `Se omitió el hito “${milestone.title}” porque faltaba su objetivo.`,
      );
      continue;
    }

    try {
      await createMilestone(
        remoteGoalId,
        {
          title: milestone.title,
          description: milestone.description,
          targetDate: milestone.targetDate,
        },
        milestone.position,
        {
          completed: milestone.completed,
          completedAt: milestone.completedAt,
          localSourceId: milestone.id,
        },
      );
      summary.milestonesImported += 1;
    } catch {
      summary.errors.push(`No se pudo importar el hito “${milestone.title}”.`);
    }
  }

  const existingTaskIds = await findTaskIdsByLocalSourceIds(
    snapshot.tasks.map((task) => task.id),
  );

  for (const task of snapshot.tasks) {
    if (existingTaskIds.has(task.id)) {
      summary.tasksSkipped += 1;
      continue;
    }

    try {
      const remoteGoalId = task.goalId
        ? goalIdMap.get(task.goalId)
        : undefined;

      await createTask(
        {
          title: task.title,
          description: task.description,
          category: task.category,
          date: task.date,
          startTime: task.startTime,
          estimatedMinutes: task.estimatedMinutes,
          priority: task.priority,
          goalId: remoteGoalId,
        },
        categories,
        {
          status: task.status,
          completedAt: task.completedAt,
          localSourceId: task.id,
        },
      );
      summary.tasksImported += 1;
    } catch {
      summary.errors.push(`No se pudo importar la tarea “${task.title}”.`);
    }
  }

  const existingReviewIds = await findDailyReviewIdsByLocalSourceIds(
    snapshot.reviews.map((review) => review.id),
  );

  for (const review of snapshot.reviews) {
    if (existingReviewIds.has(review.id)) {
      summary.reviewsSkipped += 1;
      continue;
    }

    try {
      await createDailyReviewWithLocalSource(
        {
          date: review.date,
          mood: review.mood,
          energy: review.energy,
          stress: review.stress,
          productivity: review.productivity,
          sleepHours: review.sleepHours,
          trained: review.trained,
          studied: review.studied,
          jobSearchProgress: review.jobSearchProgress,
          ifedelProgress: review.ifedelProgress,
          wentWell: review.wentWell,
          difficulties: review.difficulties,
          dailyWin: review.dailyWin,
          learning: review.learning,
          tomorrowPriority: review.tomorrowPriority,
          notes: review.notes,
        },
        review.id,
        {
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        },
      );
      summary.reviewsImported += 1;
    } catch {
      // Unique (user_id, review_date) may collide with an already-synced day.
      summary.reviewsSkipped += 1;
      summary.errors.push(
        `Se omitió el registro del ${review.date} (posible duplicado por fecha).`,
      );
    }
  }

  if (summary.errors.length === 0) {
    await markLocalStorageMigrated();
  }

  return summary;
}

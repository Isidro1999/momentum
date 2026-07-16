import { resolveCategoryName } from "@/lib/repositories/category-repository";
import type { Category } from "@/lib/repositories/category-repository";
import { RepositoryError, toUserFacingError } from "@/lib/repositories/errors";
import {
  goalStatusFromDb,
  goalStatusToDb,
  optionalText,
  progressModeFromDb,
  progressModeToDb,
} from "@/lib/repositories/mappers";
import {
  getBrowserSupabase,
  requireUserId,
} from "@/lib/repositories/session";
import type { GoalRow } from "@/types/database";
import type { Goal, GoalInput, GoalStatus } from "@/types";

function mapGoal(row: GoalRow, categories: Category[]): Goal {
  return {
    id: row.id,
    title: row.title,
    description: optionalText(row.description),
    category: resolveCategoryName(categories, row.category_id),
    startDate: row.start_date,
    targetDate: row.target_date ?? undefined,
    status: goalStatusFromDb(row.status),
    progressMode: progressModeFromDb(row.progress_mode),
    manualProgress:
      row.manual_progress === null ? undefined : row.manual_progress,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
  };
}

export async function listGoals(categories: Category[]): Promise<Goal[]> {
  try {
    const userId = await requireUserId();
    const supabase = getBrowserSupabase();
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new RepositoryError(toUserFacingError(error));
    }

    return ((data as GoalRow[]) ?? []).map((row) => mapGoal(row, categories));
  } catch (error) {
    throw new RepositoryError(toUserFacingError(error));
  }
}

export async function createGoal(
  input: GoalInput,
  categories: Category[],
  options?: {
    status?: GoalStatus;
    completedAt?: string;
    localSourceId?: string;
  },
): Promise<Goal> {
  try {
    const userId = await requireUserId();
    const supabase = getBrowserSupabase();
    const category = categories.find((item) => item.name === input.category);
    const status = options?.status ?? "activo";
    const progressMode = input.progressMode;

    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: userId,
        category_id: category?.id ?? null,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        start_date: input.startDate,
        target_date: input.targetDate || null,
        status: goalStatusToDb(status),
        progress_mode: progressModeToDb(progressMode),
        manual_progress:
          progressMode === "manual" ? (input.manualProgress ?? 0) : null,
        completed_at: options?.completedAt ?? null,
        local_source_id: options?.localSourceId ?? null,
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new RepositoryError(toUserFacingError(error));
    }

    return mapGoal(data as GoalRow, categories);
  } catch (error) {
    throw new RepositoryError(toUserFacingError(error));
  }
}

export async function updateGoal(
  id: string,
  input: GoalInput,
  categories: Category[],
): Promise<Goal> {
  try {
    await requireUserId();
    const supabase = getBrowserSupabase();
    const category = categories.find((item) => item.name === input.category);

    const { data, error } = await supabase
      .from("goals")
      .update({
        category_id: category?.id ?? null,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        start_date: input.startDate,
        target_date: input.targetDate || null,
        progress_mode: progressModeToDb(input.progressMode),
        manual_progress:
          input.progressMode === "manual"
            ? (input.manualProgress ?? 0)
            : null,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      throw new RepositoryError(toUserFacingError(error));
    }

    return mapGoal(data as GoalRow, categories);
  } catch (error) {
    throw new RepositoryError(toUserFacingError(error));
  }
}

export async function setGoalStatus(
  id: string,
  status: GoalStatus,
  categories: Category[],
): Promise<Goal> {
  try {
    await requireUserId();
    const supabase = getBrowserSupabase();
    const completedAt =
      status === "completado" ? new Date().toISOString() : null;

    const { data, error } = await supabase
      .from("goals")
      .update({
        status: goalStatusToDb(status),
        completed_at: completedAt,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      throw new RepositoryError(toUserFacingError(error));
    }

    return mapGoal(data as GoalRow, categories);
  } catch (error) {
    throw new RepositoryError(toUserFacingError(error));
  }
}

export async function deleteGoal(id: string): Promise<void> {
  try {
    await requireUserId();
    const supabase = getBrowserSupabase();
    const { error } = await supabase.from("goals").delete().eq("id", id);

    if (error) {
      throw new RepositoryError(toUserFacingError(error));
    }
  } catch (error) {
    throw new RepositoryError(toUserFacingError(error));
  }
}

export async function findGoalIdsByLocalSourceIds(
  localSourceIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (localSourceIds.length === 0) {
    return map;
  }

  const userId = await requireUserId();
  const supabase = getBrowserSupabase();
  const { data, error } = await supabase
    .from("goals")
    .select("id, local_source_id")
    .eq("user_id", userId)
    .in("local_source_id", localSourceIds);

  if (error) {
    throw new RepositoryError(toUserFacingError(error));
  }

  for (const row of data ?? []) {
    if (row.local_source_id) {
      map.set(row.local_source_id, row.id);
    }
  }

  return map;
}

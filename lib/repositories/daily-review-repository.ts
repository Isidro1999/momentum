import { RepositoryError, toUserFacingError } from "@/lib/repositories/errors";
import { optionalText } from "@/lib/repositories/mappers";
import {
  getBrowserSupabase,
  requireUserId,
} from "@/lib/repositories/session";
import type { DailyReviewRow } from "@/types/database";
import type { DailyReview, DailyReviewInput } from "@/types";

function mapReview(row: DailyReviewRow): DailyReview {
  return {
    id: row.id,
    date: row.review_date,
    mood: row.mood,
    energy: row.energy,
    stress: row.stress,
    productivity: row.productivity,
    sleepHours:
      row.sleep_hours === null || row.sleep_hours === undefined
        ? undefined
        : Number(row.sleep_hours),
    trained: row.trained,
    studied: row.studied,
    jobSearchProgress: row.job_search_progress,
    ifedelProgress: row.ifedel_progress,
    wentWell: row.went_well,
    difficulties: row.difficulties,
    dailyWin: row.daily_win,
    learning: row.learning,
    tomorrowPriority: row.tomorrow_priority,
    notes: optionalText(row.notes),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toPayload(input: DailyReviewInput) {
  return {
    review_date: input.date,
    mood: input.mood,
    energy: input.energy,
    stress: input.stress,
    productivity: input.productivity,
    sleep_hours: input.sleepHours ?? null,
    trained: input.trained,
    studied: input.studied,
    job_search_progress: input.jobSearchProgress,
    ifedel_progress: input.ifedelProgress,
    went_well: input.wentWell.trim(),
    difficulties: input.difficulties.trim(),
    daily_win: input.dailyWin.trim(),
    learning: input.learning.trim(),
    tomorrow_priority: input.tomorrowPriority.trim(),
    notes: input.notes?.trim() || null,
  };
}

export async function listDailyReviews(): Promise<DailyReview[]> {
  try {
    const userId = await requireUserId();
    const supabase = getBrowserSupabase();
    const { data, error } = await supabase
      .from("daily_reviews")
      .select("*")
      .eq("user_id", userId)
      .order("review_date", { ascending: false });

    if (error) {
      throw new RepositoryError(toUserFacingError(error));
    }

    return ((data as DailyReviewRow[]) ?? []).map(mapReview);
  } catch (error) {
    throw new RepositoryError(toUserFacingError(error));
  }
}

export async function upsertDailyReview(
  input: DailyReviewInput,
  options?: { localSourceId?: string },
): Promise<DailyReview> {
  try {
    const userId = await requireUserId();
    const supabase = getBrowserSupabase();
    const payload = toPayload(input);

    const { data: existing, error: existingError } = await supabase
      .from("daily_reviews")
      .select("*")
      .eq("user_id", userId)
      .eq("review_date", input.date)
      .maybeSingle();

    if (existingError) {
      throw new RepositoryError(toUserFacingError(existingError));
    }

    if (existing) {
      const { data, error } = await supabase
        .from("daily_reviews")
        .update(payload)
        .eq("id", (existing as DailyReviewRow).id)
        .select("*")
        .single();

      if (error || !data) {
        throw new RepositoryError(toUserFacingError(error));
      }

      return mapReview(data as DailyReviewRow);
    }

    const { data, error } = await supabase
      .from("daily_reviews")
      .insert({
        user_id: userId,
        ...payload,
        local_source_id: options?.localSourceId ?? null,
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new RepositoryError(toUserFacingError(error));
    }

    return mapReview(data as DailyReviewRow);
  } catch (error) {
    throw new RepositoryError(toUserFacingError(error));
  }
}

export async function deleteDailyReview(id: string): Promise<void> {
  try {
    await requireUserId();
    const supabase = getBrowserSupabase();
    const { error } = await supabase
      .from("daily_reviews")
      .delete()
      .eq("id", id);

    if (error) {
      throw new RepositoryError(toUserFacingError(error));
    }
  } catch (error) {
    throw new RepositoryError(toUserFacingError(error));
  }
}

export async function findDailyReviewIdsByLocalSourceIds(
  localSourceIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (localSourceIds.length === 0) {
    return map;
  }

  const userId = await requireUserId();
  const supabase = getBrowserSupabase();
  const { data, error } = await supabase
    .from("daily_reviews")
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

export async function createDailyReviewWithLocalSource(
  input: DailyReviewInput,
  localSourceId: string,
  timestamps?: { createdAt?: string; updatedAt?: string },
): Promise<DailyReview> {
  try {
    const userId = await requireUserId();
    const supabase = getBrowserSupabase();
    const payload = toPayload(input);

    const { data, error } = await supabase
      .from("daily_reviews")
      .insert({
        user_id: userId,
        ...payload,
        local_source_id: localSourceId,
        ...(timestamps?.createdAt ? { created_at: timestamps.createdAt } : {}),
        ...(timestamps?.updatedAt ? { updated_at: timestamps.updatedAt } : {}),
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new RepositoryError(toUserFacingError(error));
    }

    return mapReview(data as DailyReviewRow);
  } catch (error) {
    throw new RepositoryError(toUserFacingError(error));
  }
}

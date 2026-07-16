import { RepositoryError, toUserFacingError } from "@/lib/repositories/errors";
import { optionalText } from "@/lib/repositories/mappers";
import {
  getBrowserSupabase,
  requireUserId,
} from "@/lib/repositories/session";
import type { MilestoneRow } from "@/types/database";
import type { Milestone, MilestoneInput } from "@/types";

function mapMilestone(row: MilestoneRow): Milestone {
  return {
    id: row.id,
    goalId: row.goal_id,
    title: row.title,
    description: optionalText(row.description),
    completed: row.completed,
    targetDate: row.target_date ?? undefined,
    completedAt: row.completed_at ?? undefined,
    position: row.position,
  };
}

export async function listMilestones(): Promise<Milestone[]> {
  try {
    const userId = await requireUserId();
    const supabase = getBrowserSupabase();
    const { data, error } = await supabase
      .from("milestones")
      .select("*")
      .eq("user_id", userId)
      .order("position", { ascending: true });

    if (error) {
      throw new RepositoryError(toUserFacingError(error));
    }

    return ((data as MilestoneRow[]) ?? []).map(mapMilestone);
  } catch (error) {
    throw new RepositoryError(toUserFacingError(error));
  }
}

export async function createMilestone(
  goalId: string,
  input: MilestoneInput,
  position: number,
  options?: {
    completed?: boolean;
    completedAt?: string;
    localSourceId?: string;
  },
): Promise<Milestone> {
  try {
    const userId = await requireUserId();
    const supabase = getBrowserSupabase();
    const completed = options?.completed ?? false;

    const { data, error } = await supabase
      .from("milestones")
      .insert({
        user_id: userId,
        goal_id: goalId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        completed,
        target_date: input.targetDate || null,
        position,
        completed_at: completed ? (options?.completedAt ?? null) : null,
        local_source_id: options?.localSourceId ?? null,
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new RepositoryError(toUserFacingError(error));
    }

    return mapMilestone(data as MilestoneRow);
  } catch (error) {
    throw new RepositoryError(toUserFacingError(error));
  }
}

export async function updateMilestone(
  id: string,
  input: MilestoneInput & { completed?: boolean },
): Promise<Milestone> {
  try {
    await requireUserId();
    const supabase = getBrowserSupabase();

    const { data: existing, error: existingError } = await supabase
      .from("milestones")
      .select("*")
      .eq("id", id)
      .single();

    if (existingError || !existing) {
      throw new RepositoryError(toUserFacingError(existingError));
    }

    const current = existing as MilestoneRow;
    const completed = input.completed ?? current.completed;
    const completedAt = completed
      ? current.completed_at ?? new Date().toISOString()
      : null;

    const { data, error } = await supabase
      .from("milestones")
      .update({
        title: input.title.trim(),
        description: input.description?.trim() || null,
        target_date: input.targetDate || null,
        completed,
        completed_at: completedAt,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      throw new RepositoryError(toUserFacingError(error));
    }

    return mapMilestone(data as MilestoneRow);
  } catch (error) {
    throw new RepositoryError(toUserFacingError(error));
  }
}

export async function toggleMilestone(id: string): Promise<Milestone> {
  try {
    await requireUserId();
    const supabase = getBrowserSupabase();

    const { data: existing, error: existingError } = await supabase
      .from("milestones")
      .select("*")
      .eq("id", id)
      .single();

    if (existingError || !existing) {
      throw new RepositoryError(toUserFacingError(existingError));
    }

    const current = existing as MilestoneRow;
    const completed = !current.completed;

    const { data, error } = await supabase
      .from("milestones")
      .update({
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      throw new RepositoryError(toUserFacingError(error));
    }

    return mapMilestone(data as MilestoneRow);
  } catch (error) {
    throw new RepositoryError(toUserFacingError(error));
  }
}

export async function deleteMilestone(id: string): Promise<void> {
  try {
    await requireUserId();
    const supabase = getBrowserSupabase();
    const { error } = await supabase.from("milestones").delete().eq("id", id);

    if (error) {
      throw new RepositoryError(toUserFacingError(error));
    }
  } catch (error) {
    throw new RepositoryError(toUserFacingError(error));
  }
}

export async function swapMilestonePositions(
  firstId: string,
  firstPosition: number,
  secondId: string,
  secondPosition: number,
): Promise<void> {
  try {
    await requireUserId();
    const supabase = getBrowserSupabase();

    const [firstResult, secondResult] = await Promise.all([
      supabase
        .from("milestones")
        .update({ position: secondPosition })
        .eq("id", firstId),
      supabase
        .from("milestones")
        .update({ position: firstPosition })
        .eq("id", secondId),
    ]);

    if (firstResult.error || secondResult.error) {
      throw new RepositoryError(
        toUserFacingError(firstResult.error ?? secondResult.error),
      );
    }
  } catch (error) {
    throw new RepositoryError(toUserFacingError(error));
  }
}

export async function findMilestoneIdsByLocalSourceIds(
  localSourceIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (localSourceIds.length === 0) {
    return map;
  }

  const userId = await requireUserId();
  const supabase = getBrowserSupabase();
  const { data, error } = await supabase
    .from("milestones")
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

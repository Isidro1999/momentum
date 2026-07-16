import { resolveCategoryName } from "@/lib/repositories/category-repository";
import type { Category } from "@/lib/repositories/category-repository";
import { RepositoryError, toUserFacingError } from "@/lib/repositories/errors";
import {
  optionalText,
  taskPriorityFromDb,
  taskPriorityToDb,
  taskStatusFromDb,
  taskStatusToDb,
  timeFromDb,
} from "@/lib/repositories/mappers";
import {
  getBrowserSupabase,
  requireUserId,
} from "@/lib/repositories/session";
import type { TaskRow } from "@/types/database";
import type { Task, TaskInput, TaskStatus } from "@/types";

function mapTask(row: TaskRow, categories: Category[]): Task {
  return {
    id: row.id,
    title: row.title,
    description: optionalText(row.description),
    category: resolveCategoryName(categories, row.category_id),
    date: row.task_date,
    startTime: timeFromDb(row.start_time),
    estimatedMinutes: row.estimated_minutes ?? undefined,
    priority: taskPriorityFromDb(row.priority),
    status: taskStatusFromDb(row.status),
    goalId: row.goal_id ?? undefined,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
  };
}

type TaskInsertPayload = {
  user_id: string;
  category_id: string | null;
  goal_id: string | null;
  title: string;
  description: string | null;
  task_date: string;
  start_time: string | null;
  estimated_minutes: number | null;
  priority: ReturnType<typeof taskPriorityToDb>;
  status: ReturnType<typeof taskStatusToDb>;
  completed_at: string | null;
  local_source_id?: string | null;
};

function toInsertPayload(
  userId: string,
  input: TaskInput,
  categoryId: string | null,
  status: TaskStatus = "pendiente",
  completedAt: string | null = null,
  localSourceId?: string,
): TaskInsertPayload {
  return {
    user_id: userId,
    category_id: categoryId,
    goal_id: input.goalId || null,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    task_date: input.date,
    start_time: input.startTime || null,
    estimated_minutes: input.estimatedMinutes ?? null,
    priority: taskPriorityToDb(input.priority),
    status: taskStatusToDb(status),
    completed_at: completedAt,
    ...(localSourceId !== undefined
      ? { local_source_id: localSourceId }
      : {}),
  };
}

export async function listTasks(categories: Category[]): Promise<Task[]> {
  try {
    const userId = await requireUserId();
    const supabase = getBrowserSupabase();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new RepositoryError(toUserFacingError(error));
    }

    return ((data as TaskRow[]) ?? []).map((row) => mapTask(row, categories));
  } catch (error) {
    throw new RepositoryError(toUserFacingError(error));
  }
}

export async function createTask(
  input: TaskInput,
  categories: Category[],
  options?: {
    status?: TaskStatus;
    completedAt?: string;
    localSourceId?: string;
  },
): Promise<Task> {
  try {
    const userId = await requireUserId();
    const supabase = getBrowserSupabase();
    const category = categories.find((item) => item.name === input.category);
    const payload = toInsertPayload(
      userId,
      input,
      category?.id ?? null,
      options?.status ?? "pendiente",
      options?.completedAt ?? null,
      options?.localSourceId,
    );

    const { data, error } = await supabase
      .from("tasks")
      .insert(payload)
      .select("*")
      .single();

    if (error || !data) {
      throw new RepositoryError(toUserFacingError(error));
    }

    return mapTask(data as TaskRow, categories);
  } catch (error) {
    throw new RepositoryError(toUserFacingError(error));
  }
}

export async function updateTask(
  id: string,
  input: TaskInput,
  categories: Category[],
): Promise<Task> {
  try {
    await requireUserId();
    const supabase = getBrowserSupabase();
    const category = categories.find((item) => item.name === input.category);
    const { data, error } = await supabase
      .from("tasks")
      .update({
        category_id: category?.id ?? null,
        goal_id: input.goalId || null,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        task_date: input.date,
        start_time: input.startTime || null,
        estimated_minutes: input.estimatedMinutes ?? null,
        priority: taskPriorityToDb(input.priority),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      throw new RepositoryError(toUserFacingError(error));
    }

    return mapTask(data as TaskRow, categories);
  } catch (error) {
    throw new RepositoryError(toUserFacingError(error));
  }
}

export async function setTaskStatus(
  id: string,
  status: TaskStatus,
  categories: Category[],
): Promise<Task> {
  try {
    await requireUserId();
    const supabase = getBrowserSupabase();
    const completedAt =
      status === "completada" ? new Date().toISOString() : null;
    const { data, error } = await supabase
      .from("tasks")
      .update({
        status: taskStatusToDb(status),
        completed_at: completedAt,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      throw new RepositoryError(toUserFacingError(error));
    }

    return mapTask(data as TaskRow, categories);
  } catch (error) {
    throw new RepositoryError(toUserFacingError(error));
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    await requireUserId();
    const supabase = getBrowserSupabase();
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      throw new RepositoryError(toUserFacingError(error));
    }
  } catch (error) {
    throw new RepositoryError(toUserFacingError(error));
  }
}

export async function findTaskIdsByLocalSourceIds(
  localSourceIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (localSourceIds.length === 0) {
    return map;
  }

  const userId = await requireUserId();
  const supabase = getBrowserSupabase();
  const { data, error } = await supabase
    .from("tasks")
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

import type { StorageLoadResult } from "@/lib/storage";
import { safeJsonParse, safeLocalStorageSet } from "@/lib/storage";
import type { Goal, Milestone } from "@/types";

export const GOALS_STORAGE_KEY = "momentum.goals.v1";

export interface GoalsStoragePayload {
  goals: Goal[];
  milestones: Milestone[];
}

function isGoal(value: unknown): value is Goal {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.category === "string" &&
    typeof item.startDate === "string" &&
    typeof item.status === "string" &&
    typeof item.progressMode === "string" &&
    typeof item.createdAt === "string"
  );
}

function isMilestone(value: unknown): value is Milestone {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.goalId === "string" &&
    typeof item.title === "string" &&
    typeof item.completed === "boolean" &&
    typeof item.position === "number"
  );
}

export function loadGoalsFromStorage(): StorageLoadResult<GoalsStoragePayload> {
  if (typeof window === "undefined") {
    return { status: "missing" };
  }

  try {
    const raw = window.localStorage.getItem(GOALS_STORAGE_KEY);
    if (raw === null) {
      return { status: "missing" };
    }

    const parsed = safeJsonParse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("goals" in parsed) ||
      !("milestones" in parsed)
    ) {
      return { status: "corrupt" };
    }

    const payload = parsed as { goals: unknown; milestones: unknown };
    if (!Array.isArray(payload.goals) || !Array.isArray(payload.milestones)) {
      return { status: "corrupt" };
    }

    const goals = payload.goals.filter(isGoal);
    const milestones = payload.milestones.filter(isMilestone);

    if (
      (payload.goals.length > 0 && goals.length === 0) ||
      (payload.milestones.length > 0 && milestones.length === 0)
    ) {
      return { status: "corrupt" };
    }

    return {
      status: "ok",
      data: { goals, milestones },
    };
  } catch {
    return { status: "corrupt" };
  }
}

export function saveGoalsToStorage(payload: GoalsStoragePayload): boolean {
  return safeLocalStorageSet(GOALS_STORAGE_KEY, JSON.stringify(payload));
}

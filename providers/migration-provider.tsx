"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearLocalMomentumStorage,
  getLocalStorageMigratedAt,
  importLocalDataToSupabase,
  readLocalDataSnapshot,
  type LocalMigrationSummary,
} from "@/lib/migration/local-storage-import";
import { toUserFacingError } from "@/lib/repositories/errors";
import { useCategories } from "@/providers/category-provider";
import { useDailyReviews } from "@/providers/daily-review-provider";
import { useGoals } from "@/providers/goal-provider";
import { useTasks } from "@/providers/task-provider";

type MigrationPhase =
  | "checking"
  | "idle"
  | "prompt"
  | "importing"
  | "summary"
  | "done";

interface MigrationContextValue {
  phase: MigrationPhase;
  summary: LocalMigrationSummary | null;
  error: string | null;
  localCounts: {
    tasks: number;
    goals: number;
    milestones: number;
    reviews: number;
  } | null;
  canClearLocal: boolean;
  importNow: () => Promise<void>;
  skipForNow: () => void;
  dismissSummary: () => void;
  clearLocalData: () => void;
}

const MigrationContext = createContext<MigrationContextValue | null>(null);

const SKIP_KEY_PREFIX = "momentum.migration.skip.";

function getSkipKey(userHint: string): string {
  return `${SKIP_KEY_PREFIX}${userHint}`;
}

export function MigrationProvider({ children }: { children: ReactNode }) {
  const { categories, isReady: categoriesReady } = useCategories();
  const { refresh: refreshTasks } = useTasks();
  const { refresh: refreshGoals } = useGoals();
  const { refresh: refreshReviews } = useDailyReviews();

  const [phase, setPhase] = useState<MigrationPhase>("checking");
  const [summary, setSummary] = useState<LocalMigrationSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localCounts, setLocalCounts] = useState<{
    tasks: number;
    goals: number;
    milestones: number;
    reviews: number;
  } | null>(null);
  const [canClearLocal, setCanClearLocal] = useState(false);
  const [userHint, setUserHint] = useState("default");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (!categoriesReady) {
        return;
      }

      setPhase("checking");
      setError(null);

      try {
        const migratedAt = await getLocalStorageMigratedAt();
        const snapshot = readLocalDataSnapshot();
        const hint =
          categories[0]?.id?.slice(0, 8) ??
          String(snapshot.taskCount + snapshot.goalCount);

        if (cancelled) {
          return;
        }

        setUserHint(hint);
        setLocalCounts({
          tasks: snapshot.taskCount,
          goals: snapshot.goalCount,
          milestones: snapshot.milestoneCount,
          reviews: snapshot.reviewCount,
        });

        if (migratedAt) {
          setCanClearLocal(snapshot.hasData);
          setPhase(snapshot.hasData ? "done" : "idle");
          return;
        }

        const skipped =
          typeof window !== "undefined" &&
          window.sessionStorage.getItem(getSkipKey(hint)) === "1";

        if (snapshot.hasData && !skipped) {
          setPhase("prompt");
          return;
        }

        setPhase("idle");
      } catch (checkError) {
        if (!cancelled) {
          setError(toUserFacingError(checkError));
          setPhase("idle");
        }
      }
    }

    void check();

    return () => {
      cancelled = true;
    };
  }, [categoriesReady, categories]);

  const importNow = useCallback(async () => {
    setPhase("importing");
    setError(null);

    try {
      const result = await importLocalDataToSupabase(categories);
      setSummary(result);

      await Promise.all([refreshTasks(), refreshGoals(), refreshReviews()]);

      if (result.errors.length === 0) {
        setCanClearLocal(true);
      }

      setPhase("summary");
    } catch (importError) {
      setError(toUserFacingError(importError));
      setPhase("prompt");
    }
  }, [categories, refreshTasks, refreshGoals, refreshReviews]);

  const skipForNow = useCallback(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(getSkipKey(userHint), "1");
    }
    setPhase("idle");
  }, [userHint]);

  const dismissSummary = useCallback(() => {
    setPhase(canClearLocal ? "done" : "idle");
  }, [canClearLocal]);

  const clearLocalData = useCallback(() => {
    clearLocalMomentumStorage();
    setLocalCounts({
      tasks: 0,
      goals: 0,
      milestones: 0,
      reviews: 0,
    });
    setCanClearLocal(false);
    setPhase("idle");
  }, []);

  const value = useMemo(
    () => ({
      phase,
      summary,
      error,
      localCounts,
      canClearLocal,
      importNow,
      skipForNow,
      dismissSummary,
      clearLocalData,
    }),
    [
      phase,
      summary,
      error,
      localCounts,
      canClearLocal,
      importNow,
      skipForNow,
      dismissSummary,
      clearLocalData,
    ],
  );

  return (
    <MigrationContext.Provider value={value}>
      {children}
    </MigrationContext.Provider>
  );
}

export function useMigration(): MigrationContextValue {
  const context = useContext(MigrationContext);
  if (!context) {
    throw new Error("useMigration debe usarse dentro de MigrationProvider");
  }
  return context;
}

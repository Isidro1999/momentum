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
import { getSeedGoals } from "@/data/mock-data";
import { loadGoalsFromStorage, saveGoalsToStorage } from "@/lib/goal-storage";
import type {
  Goal,
  GoalInput,
  GoalStatus,
  Milestone,
  MilestoneInput,
} from "@/types";

interface GoalContextValue {
  goals: Goal[];
  milestones: Milestone[];
  isReady: boolean;
  storageCorrupt: boolean;
  recoverStorage: () => void;
  createGoal: (input: GoalInput) => Goal;
  updateGoal: (id: string, input: GoalInput) => void;
  setGoalStatus: (id: string, status: GoalStatus) => void;
  deleteGoal: (id: string) => void;
  createMilestone: (goalId: string, input: MilestoneInput) => Milestone;
  updateMilestone: (
    id: string,
    input: MilestoneInput & { completed?: boolean },
  ) => void;
  toggleMilestone: (id: string) => void;
  deleteMilestone: (id: string) => void;
  moveMilestone: (id: string, direction: "up" | "down") => void;
  getGoalById: (id: string) => Goal | undefined;
  getMilestonesByGoalId: (goalId: string) => Milestone[];
  isFormOpen: boolean;
  editingGoal: Goal | null;
  openCreateForm: () => void;
  openEditForm: (goal: Goal) => void;
  closeForm: () => void;
}

const GoalContext = createContext<GoalContextValue | null>(null);

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface GoalProviderProps {
  children: ReactNode;
}

export function GoalProvider({ children }: GoalProviderProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [canPersist, setCanPersist] = useState(false);
  const [storageCorrupt, setStorageCorrupt] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  useEffect(() => {
    const stored = loadGoalsFromStorage();

    if (stored.status === "missing") {
      const seed = getSeedGoals();
      setGoals(seed.goals);
      setMilestones(seed.milestones);
      saveGoalsToStorage(seed);
      setCanPersist(true);
      setStorageCorrupt(false);
    } else if (stored.status === "corrupt") {
      setGoals([]);
      setMilestones([]);
      setCanPersist(false);
      setStorageCorrupt(true);
    } else {
      setGoals(stored.data.goals);
      setMilestones(stored.data.milestones);
      setCanPersist(true);
      setStorageCorrupt(false);
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || !canPersist) {
      return;
    }

    saveGoalsToStorage({ goals, milestones });
  }, [goals, milestones, isReady, canPersist]);

  const recoverStorage = useCallback(() => {
    const seed = getSeedGoals();
    setGoals(seed.goals);
    setMilestones(seed.milestones);
    saveGoalsToStorage(seed);
    setCanPersist(true);
    setStorageCorrupt(false);
  }, []);

  const createGoal = useCallback((input: GoalInput): Goal => {
    const now = new Date().toISOString();
    const goal: Goal = {
      id: createId("goal"),
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
      category: input.category,
      startDate: input.startDate,
      targetDate: input.targetDate || undefined,
      status: "activo",
      progressMode: input.progressMode,
      manualProgress:
        input.progressMode === "manual" ? (input.manualProgress ?? 0) : undefined,
      createdAt: now,
    };

    setGoals((current) => [goal, ...current]);
    return goal;
  }, []);

  const updateGoal = useCallback((id: string, input: GoalInput) => {
    setGoals((current) =>
      current.map((goal) =>
        goal.id === id
          ? {
              ...goal,
              title: input.title.trim(),
              description: input.description?.trim() || undefined,
              category: input.category,
              startDate: input.startDate,
              targetDate: input.targetDate || undefined,
              progressMode: input.progressMode,
              manualProgress:
                input.progressMode === "manual"
                  ? (input.manualProgress ?? 0)
                  : undefined,
            }
          : goal,
      ),
    );
  }, []);

  const setGoalStatus = useCallback((id: string, status: GoalStatus) => {
    const now = new Date().toISOString();

    setGoals((current) =>
      current.map((goal) => {
        if (goal.id !== id) {
          return goal;
        }

        return {
          ...goal,
          status,
          completedAt: status === "completado" ? now : undefined,
        };
      }),
    );
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals((current) => current.filter((goal) => goal.id !== id));
    setMilestones((current) =>
      current.filter((milestone) => milestone.goalId !== id),
    );
  }, []);

  const createMilestone = useCallback(
    (goalId: string, input: MilestoneInput): Milestone => {
      const siblings = milestones.filter(
        (milestone) => milestone.goalId === goalId,
      );
      const nextPosition =
        siblings.length === 0
          ? 0
          : Math.max(...siblings.map((milestone) => milestone.position)) + 1;

      const created: Milestone = {
        id: createId("ms"),
        goalId,
        title: input.title.trim(),
        description: input.description?.trim() || undefined,
        completed: false,
        targetDate: input.targetDate || undefined,
        position: nextPosition,
      };

      setMilestones((current) => [...current, created]);
      return created;
    },
    [milestones],
  );

  const updateMilestone = useCallback(
    (id: string, input: MilestoneInput & { completed?: boolean }) => {
      const now = new Date().toISOString();

      setMilestones((current) =>
        current.map((milestone) => {
          if (milestone.id !== id) {
            return milestone;
          }

          const completed = input.completed ?? milestone.completed;

          return {
            ...milestone,
            title: input.title.trim(),
            description: input.description?.trim() || undefined,
            targetDate: input.targetDate || undefined,
            completed,
            completedAt: completed
              ? milestone.completedAt ?? now
              : undefined,
          };
        }),
      );
    },
    [],
  );

  const toggleMilestone = useCallback((id: string) => {
    const now = new Date().toISOString();

    setMilestones((current) =>
      current.map((milestone) => {
        if (milestone.id !== id) {
          return milestone;
        }

        const completed = !milestone.completed;

        return {
          ...milestone,
          completed,
          completedAt: completed ? now : undefined,
        };
      }),
    );
  }, []);

  const deleteMilestone = useCallback((id: string) => {
    setMilestones((current) =>
      current.filter((milestone) => milestone.id !== id),
    );
  }, []);

  const moveMilestone = useCallback((id: string, direction: "up" | "down") => {
    setMilestones((current) => {
      const milestone = current.find((item) => item.id === id);
      if (!milestone) {
        return current;
      }

      const siblings = current
        .filter((item) => item.goalId === milestone.goalId)
        .sort((a, b) => a.position - b.position);

      const index = siblings.findIndex((item) => item.id === id);
      const swapWith = direction === "up" ? index - 1 : index + 1;

      if (swapWith < 0 || swapWith >= siblings.length) {
        return current;
      }

      const currentItem = siblings[index];
      const targetItem = siblings[swapWith];

      return current.map((item) => {
        if (item.id === currentItem.id) {
          return { ...item, position: targetItem.position };
        }

        if (item.id === targetItem.id) {
          return { ...item, position: currentItem.position };
        }

        return item;
      });
    });
  }, []);

  const getGoalById = useCallback(
    (id: string) => goals.find((goal) => goal.id === id),
    [goals],
  );

  const getMilestonesByGoalId = useCallback(
    (goalId: string) =>
      milestones
        .filter((milestone) => milestone.goalId === goalId)
        .sort((a, b) => a.position - b.position),
    [milestones],
  );

  const openCreateForm = useCallback(() => {
    setEditingGoal(null);
    setIsFormOpen(true);
  }, []);

  const openEditForm = useCallback((goal: Goal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingGoal(null);
  }, []);

  const value = useMemo(
    () => ({
      goals,
      milestones,
      isReady,
      storageCorrupt,
      recoverStorage,
      createGoal,
      updateGoal,
      setGoalStatus,
      deleteGoal,
      createMilestone,
      updateMilestone,
      toggleMilestone,
      deleteMilestone,
      moveMilestone,
      getGoalById,
      getMilestonesByGoalId,
      isFormOpen,
      editingGoal,
      openCreateForm,
      openEditForm,
      closeForm,
    }),
    [
      goals,
      milestones,
      isReady,
      storageCorrupt,
      recoverStorage,
      createGoal,
      updateGoal,
      setGoalStatus,
      deleteGoal,
      createMilestone,
      updateMilestone,
      toggleMilestone,
      deleteMilestone,
      moveMilestone,
      getGoalById,
      getMilestonesByGoalId,
      isFormOpen,
      editingGoal,
      openCreateForm,
      openEditForm,
      closeForm,
    ],
  );

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
}

export function useGoals(): GoalContextValue {
  const context = useContext(GoalContext);

  if (!context) {
    throw new Error("useGoals debe usarse dentro de GoalProvider");
  }

  return context;
}

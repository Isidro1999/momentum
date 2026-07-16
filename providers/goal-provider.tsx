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
import { toUserFacingError } from "@/lib/repositories/errors";
import * as goalRepository from "@/lib/repositories/goal-repository";
import * as milestoneRepository from "@/lib/repositories/milestone-repository";
import { useCategories } from "@/providers/category-provider";
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
  loading: boolean;
  error: string | null;
  isReady: boolean;
  retry: () => void;
  refresh: () => Promise<void>;
  createGoal: (input: GoalInput) => Promise<Goal>;
  updateGoal: (id: string, input: GoalInput) => Promise<void>;
  setGoalStatus: (id: string, status: GoalStatus) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  createMilestone: (
    goalId: string,
    input: MilestoneInput,
  ) => Promise<Milestone>;
  updateMilestone: (
    id: string,
    input: MilestoneInput & { completed?: boolean },
  ) => Promise<void>;
  toggleMilestone: (id: string) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  moveMilestone: (id: string, direction: "up" | "down") => Promise<void>;
  getGoalById: (id: string) => Goal | undefined;
  getMilestonesByGoalId: (goalId: string) => Milestone[];
  isFormOpen: boolean;
  editingGoal: Goal | null;
  openCreateForm: () => void;
  openEditForm: (goal: Goal) => void;
  closeForm: () => void;
}

const GoalContext = createContext<GoalContextValue | null>(null);

interface GoalProviderProps {
  children: ReactNode;
}

export function GoalProvider({ children }: GoalProviderProps) {
  const {
    categories,
    isReady: categoriesReady,
    error: categoriesError,
  } = useCategories();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const loadGoals = useCallback(async () => {
    if (!categoriesReady) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [goalData, milestoneData] = await Promise.all([
        goalRepository.listGoals(categories),
        milestoneRepository.listMilestones(),
      ]);
      setGoals(goalData);
      setMilestones(milestoneData);
    } catch (loadError) {
      setGoals([]);
      setMilestones([]);
      setError(toUserFacingError(loadError));
    } finally {
      setLoading(false);
    }
  }, [categories, categoriesReady]);

  useEffect(() => {
    if (categoriesError) {
      setGoals([]);
      setMilestones([]);
      setLoading(false);
      setError(categoriesError);
      return;
    }

    if (!categoriesReady) {
      setLoading(true);
      return;
    }

    void loadGoals();
  }, [categoriesReady, categoriesError, loadGoals, reloadKey]);

  const retry = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  const refresh = useCallback(async () => {
    await loadGoals();
  }, [loadGoals]);

  const createGoal = useCallback(
    async (input: GoalInput): Promise<Goal> => {
      const created = await goalRepository.createGoal(input, categories);
      setGoals((current) => [created, ...current]);
      return created;
    },
    [categories],
  );

  const updateGoal = useCallback(
    async (id: string, input: GoalInput) => {
      const updated = await goalRepository.updateGoal(id, input, categories);
      setGoals((current) =>
        current.map((goal) => (goal.id === id ? updated : goal)),
      );
    },
    [categories],
  );

  const setGoalStatus = useCallback(
    async (id: string, status: GoalStatus) => {
      const updated = await goalRepository.setGoalStatus(
        id,
        status,
        categories,
      );
      setGoals((current) =>
        current.map((goal) => (goal.id === id ? updated : goal)),
      );
    },
    [categories],
  );

  const deleteGoal = useCallback(async (id: string) => {
    await goalRepository.deleteGoal(id);
    setGoals((current) => current.filter((goal) => goal.id !== id));
    setMilestones((current) =>
      current.filter((milestone) => milestone.goalId !== id),
    );
  }, []);

  const createMilestone = useCallback(
    async (goalId: string, input: MilestoneInput): Promise<Milestone> => {
      const siblings = milestones.filter(
        (milestone) => milestone.goalId === goalId,
      );
      const nextPosition =
        siblings.length === 0
          ? 0
          : Math.max(...siblings.map((milestone) => milestone.position)) + 1;

      const created = await milestoneRepository.createMilestone(
        goalId,
        input,
        nextPosition,
      );
      setMilestones((current) => [...current, created]);
      return created;
    },
    [milestones],
  );

  const updateMilestone = useCallback(
    async (id: string, input: MilestoneInput & { completed?: boolean }) => {
      const updated = await milestoneRepository.updateMilestone(id, input);
      setMilestones((current) =>
        current.map((milestone) =>
          milestone.id === id ? updated : milestone,
        ),
      );
    },
    [],
  );

  const toggleMilestone = useCallback(async (id: string) => {
    const updated = await milestoneRepository.toggleMilestone(id);
    setMilestones((current) =>
      current.map((milestone) => (milestone.id === id ? updated : milestone)),
    );
  }, []);

  const deleteMilestone = useCallback(async (id: string) => {
    await milestoneRepository.deleteMilestone(id);
    setMilestones((current) =>
      current.filter((milestone) => milestone.id !== id),
    );
  }, []);

  const moveMilestone = useCallback(
    async (id: string, direction: "up" | "down") => {
      const milestone = milestones.find((item) => item.id === id);
      if (!milestone) {
        return;
      }

      const siblings = milestones
        .filter((item) => item.goalId === milestone.goalId)
        .sort((a, b) => a.position - b.position);

      const index = siblings.findIndex((item) => item.id === id);
      const swapWith = direction === "up" ? index - 1 : index + 1;

      if (swapWith < 0 || swapWith >= siblings.length) {
        return;
      }

      const currentItem = siblings[index];
      const targetItem = siblings[swapWith];

      await milestoneRepository.swapMilestonePositions(
        currentItem.id,
        currentItem.position,
        targetItem.id,
        targetItem.position,
      );

      setMilestones((current) =>
        current.map((item) => {
          if (item.id === currentItem.id) {
            return { ...item, position: targetItem.position };
          }

          if (item.id === targetItem.id) {
            return { ...item, position: currentItem.position };
          }

          return item;
        }),
      );
    },
    [milestones],
  );

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
      loading,
      error,
      isReady: !loading && error === null,
      retry,
      refresh,
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
      loading,
      error,
      retry,
      refresh,
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

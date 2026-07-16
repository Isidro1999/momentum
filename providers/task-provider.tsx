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
import * as taskRepository from "@/lib/repositories/task-repository";
import { useCategories } from "@/providers/category-provider";
import type { Task, TaskInput, TaskStatus } from "@/types";

interface TaskContextValue {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  isReady: boolean;
  retry: () => void;
  refresh: () => Promise<void>;
  createTask: (input: TaskInput) => Promise<Task>;
  updateTask: (id: string, input: TaskInput) => Promise<void>;
  setTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  unlinkGoalFromTasks: (goalId: string) => void;
  isFormOpen: boolean;
  editingTask: Task | null;
  openCreateForm: () => void;
  openEditForm: (task: Task) => void;
  closeForm: () => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const {
    categories,
    isReady: categoriesReady,
    error: categoriesError,
  } = useCategories();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const loadTasks = useCallback(async () => {
    if (!categoriesReady) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await taskRepository.listTasks(categories);
      setTasks(data);
    } catch (loadError) {
      setTasks([]);
      setError(toUserFacingError(loadError));
    } finally {
      setLoading(false);
    }
  }, [categories, categoriesReady]);

  useEffect(() => {
    if (categoriesError) {
      setTasks([]);
      setLoading(false);
      setError(categoriesError);
      return;
    }

    if (!categoriesReady) {
      setLoading(true);
      return;
    }

    void loadTasks();
  }, [categoriesReady, categoriesError, loadTasks, reloadKey]);

  const retry = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  const refresh = useCallback(async () => {
    await loadTasks();
  }, [loadTasks]);

  const createTask = useCallback(
    async (input: TaskInput): Promise<Task> => {
      const created = await taskRepository.createTask(input, categories);
      setTasks((current) => [created, ...current]);
      return created;
    },
    [categories],
  );

  const updateTask = useCallback(
    async (id: string, input: TaskInput) => {
      const updated = await taskRepository.updateTask(id, input, categories);
      setTasks((current) =>
        current.map((task) => (task.id === id ? updated : task)),
      );
    },
    [categories],
  );

  const setTaskStatus = useCallback(
    async (id: string, status: TaskStatus) => {
      const updated = await taskRepository.setTaskStatus(
        id,
        status,
        categories,
      );
      setTasks((current) =>
        current.map((task) => (task.id === id ? updated : task)),
      );
    },
    [categories],
  );

  const deleteTask = useCallback(async (id: string) => {
    await taskRepository.deleteTask(id);
    setTasks((current) => current.filter((task) => task.id !== id));
  }, []);

  const unlinkGoalFromTasks = useCallback((goalId: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.goalId === goalId ? { ...task, goalId: undefined } : task,
      ),
    );
  }, []);

  const openCreateForm = useCallback(() => {
    setEditingTask(null);
    setIsFormOpen(true);
  }, []);

  const openEditForm = useCallback((task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingTask(null);
  }, []);

  const value = useMemo(
    () => ({
      tasks,
      loading,
      error,
      isReady: !loading && error === null,
      retry,
      refresh,
      createTask,
      updateTask,
      setTaskStatus,
      deleteTask,
      unlinkGoalFromTasks,
      isFormOpen,
      editingTask,
      openCreateForm,
      openEditForm,
      closeForm,
    }),
    [
      tasks,
      loading,
      error,
      retry,
      refresh,
      createTask,
      updateTask,
      setTaskStatus,
      deleteTask,
      unlinkGoalFromTasks,
      isFormOpen,
      editingTask,
      openCreateForm,
      openEditForm,
      closeForm,
    ],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks(): TaskContextValue {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error("useTasks debe usarse dentro de TaskProvider");
  }

  return context;
}

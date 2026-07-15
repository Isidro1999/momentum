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
import { getSeedTasks } from "@/data/mock-data";
import { loadTasksFromStorage, saveTasksToStorage } from "@/lib/task-storage";
import type { Task, TaskInput, TaskStatus } from "@/types";

interface TaskContextValue {
  tasks: Task[];
  isReady: boolean;
  storageCorrupt: boolean;
  recoverStorage: () => void;
  createTask: (input: TaskInput) => Task;
  updateTask: (id: string, input: TaskInput) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  unlinkGoalFromTasks: (goalId: string) => void;
  isFormOpen: boolean;
  editingTask: Task | null;
  openCreateForm: () => void;
  openEditForm: (task: Task) => void;
  closeForm: () => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [canPersist, setCanPersist] = useState(false);
  const [storageCorrupt, setStorageCorrupt] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    const stored = loadTasksFromStorage();

    if (stored.status === "missing") {
      const seed = getSeedTasks();
      setTasks(seed);
      saveTasksToStorage(seed);
      setCanPersist(true);
      setStorageCorrupt(false);
    } else if (stored.status === "corrupt") {
      setTasks([]);
      setCanPersist(false);
      setStorageCorrupt(true);
    } else {
      setTasks(stored.data);
      setCanPersist(true);
      setStorageCorrupt(false);
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || !canPersist) {
      return;
    }

    saveTasksToStorage(tasks);
  }, [tasks, isReady, canPersist]);

  const recoverStorage = useCallback(() => {
    const seed = getSeedTasks();
    setTasks(seed);
    saveTasksToStorage(seed);
    setCanPersist(true);
    setStorageCorrupt(false);
  }, []);

  const createTask = useCallback((input: TaskInput): Task => {
    const now = new Date().toISOString();
    const task: Task = {
      id: createId(),
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
      category: input.category,
      date: input.date,
      startTime: input.startTime || undefined,
      estimatedMinutes: input.estimatedMinutes,
      priority: input.priority,
      status: "pendiente",
      goalId: input.goalId || undefined,
      createdAt: now,
    };

    setTasks((current) => [task, ...current]);
    return task;
  }, []);

  const updateTask = useCallback((id: string, input: TaskInput) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              title: input.title.trim(),
              description: input.description?.trim() || undefined,
              category: input.category,
              date: input.date,
              startTime: input.startTime || undefined,
              estimatedMinutes: input.estimatedMinutes,
              priority: input.priority,
              goalId: input.goalId || undefined,
            }
          : task,
      ),
    );
  }, []);

  const setTaskStatus = useCallback((id: string, status: TaskStatus) => {
    const now = new Date().toISOString();

    setTasks((current) =>
      current.map((task) => {
        if (task.id !== id) {
          return task;
        }

        return {
          ...task,
          status,
          completedAt: status === "completada" ? now : undefined,
        };
      }),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
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
      isReady,
      storageCorrupt,
      recoverStorage,
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
      isReady,
      storageCorrupt,
      recoverStorage,
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

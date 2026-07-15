export type TaskStatus =
  | "pendiente"
  | "en_progreso"
  | "completada"
  | "postergada"
  | "cancelada";

export type TaskCategory =
  | "Feater"
  | "Búsqueda laboral"
  | "IFEDEL"
  | "Facultad"
  | "Entrenamiento"
  | "Personal";

export type TaskPriority = "baja" | "media" | "alta";

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  date: string;
  startTime?: string;
  estimatedMinutes?: number;
  priority: TaskPriority;
  status: TaskStatus;
  goalId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  category: TaskCategory;
  date: string;
  startTime?: string;
  estimatedMinutes?: number;
  priority: TaskPriority;
  goalId?: string;
}

export type GoalStatus = "activo" | "pausado" | "completado" | "cancelado";

export type ProgressMode = "hitos" | "tareas" | "manual";

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  startDate: string;
  targetDate?: string;
  status: GoalStatus;
  progressMode: ProgressMode;
  manualProgress?: number;
  createdAt: string;
  completedAt?: string;
}

export interface GoalInput {
  title: string;
  description?: string;
  category: TaskCategory;
  startDate: string;
  targetDate?: string;
  progressMode: ProgressMode;
  manualProgress?: number;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  completed: boolean;
  targetDate?: string;
  completedAt?: string;
  position: number;
}

export interface MilestoneInput {
  title: string;
  description?: string;
  targetDate?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
}

export interface GoalProgressItem {
  id: string;
  title: string;
  progress: number;
}

export interface Wellbeing {
  mood: number;
  energy: number;
  max: number;
}

export interface DailyReview {
  id: string;
  date: string;
  mood: number;
  energy: number;
  stress: number;
  productivity: number;
  sleepHours?: number;
  trained: boolean;
  studied: boolean;
  jobSearchProgress: boolean;
  ifedelProgress: boolean;
  wentWell: string;
  difficulties: string;
  dailyWin: string;
  learning: string;
  tomorrowPriority: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyReviewInput {
  date: string;
  mood: number;
  energy: number;
  stress: number;
  productivity: number;
  sleepHours?: number;
  trained: boolean;
  studied: boolean;
  jobSearchProgress: boolean;
  ifedelProgress: boolean;
  wentWell: string;
  difficulties: string;
  dailyWin: string;
  learning: string;
  tomorrowPriority: string;
  notes?: string;
}

export interface DaySummary {
  completedTasks: number;
  pendingTasks: number;
  progressPercent: number;
  mainPriority: string;
  introMessage: string;
}

export interface TodayData {
  userName: string;
  summary: DaySummary;
  nextEvent: CalendarEvent;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export type DbTaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "postponed"
  | "cancelled";

export type DbTaskPriority = "low" | "medium" | "high";

export type DbGoalStatus = "active" | "paused" | "completed" | "cancelled";

export type DbProgressMode = "milestones" | "tasks" | "manual";

export type CategoryRow = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type TaskRow = {
  id: string;
  user_id: string;
  category_id: string | null;
  goal_id: string | null;
  title: string;
  description: string | null;
  task_date: string;
  start_time: string | null;
  estimated_minutes: number | null;
  priority: DbTaskPriority;
  status: DbTaskStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  local_source_id: string | null;
};

export type GoalRow = {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  start_date: string;
  target_date: string | null;
  status: DbGoalStatus;
  progress_mode: DbProgressMode;
  manual_progress: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  local_source_id: string | null;
};

export type MilestoneRow = {
  id: string;
  user_id: string;
  goal_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  target_date: string | null;
  position: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  local_source_id: string | null;
};

export type DailyReviewRow = {
  id: string;
  user_id: string;
  review_date: string;
  mood: number;
  energy: number;
  stress: number;
  productivity: number;
  sleep_hours: number | null;
  trained: boolean;
  studied: boolean;
  job_search_progress: boolean;
  ifedel_progress: boolean;
  went_well: string;
  difficulties: string;
  daily_win: string;
  learning: string;
  tomorrow_priority: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  local_source_id: string | null;
};

export type ProfileRow = {
  id: string;
  name: string | null;
  local_storage_migrated_at: string | null;
  created_at: string;
  updated_at: string;
};

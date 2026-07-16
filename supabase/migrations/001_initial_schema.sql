-- Momentum — esquema inicial
-- Ejecutar en Supabase SQL Editor (ver docs/supabase-setup.md).
-- No incluye autenticación de aplicación ni migración desde localStorage.

-- ---------------------------------------------------------------------------
-- Extensiones
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Función reusable: updated_at automático
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  name text,
  local_storage_migrated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  color text,
  icon text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, slug)
);

CREATE INDEX categories_user_id_idx ON public.categories (user_id);

CREATE TRIGGER categories_set_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- goals
-- ---------------------------------------------------------------------------
CREATE TABLE public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories (id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  start_date date NOT NULL,
  target_date date,
  status text NOT NULL,
  progress_mode text NOT NULL,
  manual_progress integer,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT goals_status_check
    CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  CONSTRAINT goals_progress_mode_check
    CHECK (progress_mode IN ('milestones', 'tasks', 'manual')),
  CONSTRAINT goals_manual_progress_check
    CHECK (manual_progress IS NULL OR (manual_progress >= 0 AND manual_progress <= 100)),
  CONSTRAINT goals_target_date_check
    CHECK (target_date IS NULL OR target_date >= start_date)
);

CREATE INDEX goals_user_id_idx ON public.goals (user_id);
CREATE INDEX goals_category_id_idx ON public.goals (category_id);

CREATE TRIGGER goals_set_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- milestones
-- ---------------------------------------------------------------------------
CREATE TABLE public.milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  goal_id uuid NOT NULL REFERENCES public.goals (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  completed boolean NOT NULL DEFAULT false,
  target_date date,
  position integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX milestones_goal_id_idx ON public.milestones (goal_id);

CREATE TRIGGER milestones_set_updated_at
  BEFORE UPDATE ON public.milestones
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories (id) ON DELETE SET NULL,
  goal_id uuid REFERENCES public.goals (id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  task_date date NOT NULL,
  start_time time,
  estimated_minutes integer,
  priority text NOT NULL,
  status text NOT NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tasks_priority_check
    CHECK (priority IN ('low', 'medium', 'high')),
  CONSTRAINT tasks_status_check
    CHECK (status IN ('pending', 'in_progress', 'completed', 'postponed', 'cancelled')),
  CONSTRAINT tasks_estimated_minutes_check
    CHECK (estimated_minutes IS NULL OR estimated_minutes > 0)
);

CREATE INDEX tasks_user_id_idx ON public.tasks (user_id);
CREATE INDEX tasks_task_date_idx ON public.tasks (task_date);
CREATE INDEX tasks_goal_id_idx ON public.tasks (goal_id);
CREATE INDEX tasks_category_id_idx ON public.tasks (category_id);

CREATE TRIGGER tasks_set_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- daily_reviews
-- ---------------------------------------------------------------------------
CREATE TABLE public.daily_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  review_date date NOT NULL,
  mood integer NOT NULL,
  energy integer NOT NULL,
  stress integer NOT NULL,
  productivity integer NOT NULL,
  sleep_hours numeric,
  trained boolean NOT NULL DEFAULT false,
  studied boolean NOT NULL DEFAULT false,
  job_search_progress boolean NOT NULL DEFAULT false,
  ifedel_progress boolean NOT NULL DEFAULT false,
  went_well text NOT NULL,
  difficulties text NOT NULL,
  daily_win text NOT NULL,
  learning text NOT NULL,
  tomorrow_priority text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, review_date),
  CONSTRAINT daily_reviews_mood_check
    CHECK (mood >= 1 AND mood <= 10),
  CONSTRAINT daily_reviews_energy_check
    CHECK (energy >= 1 AND energy <= 10),
  CONSTRAINT daily_reviews_stress_check
    CHECK (stress >= 1 AND stress <= 10),
  CONSTRAINT daily_reviews_productivity_check
    CHECK (productivity >= 1 AND productivity <= 10),
  CONSTRAINT daily_reviews_sleep_hours_check
    CHECK (sleep_hours IS NULL OR (sleep_hours >= 0 AND sleep_hours <= 24))
);

CREATE INDEX daily_reviews_user_id_review_date_idx
  ON public.daily_reviews (user_id, review_date);

CREATE TRIGGER daily_reviews_set_updated_at
  BEFORE UPDATE ON public.daily_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Profile + categorías iniciales al crear usuario
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    NULLIF(NEW.raw_user_meta_data ->> 'name', '')
  );

  INSERT INTO public.categories (user_id, name, slug, position)
  VALUES
    (NEW.id, 'Feater', 'feater', 0),
    (NEW.id, 'Búsqueda laboral', 'busqueda-laboral', 1),
    (NEW.id, 'IFEDEL', 'ifedel', 2),
    (NEW.id, 'Facultad', 'facultad', 3),
    (NEW.id, 'Entrenamiento', 'entrenamiento', 4),
    (NEW.id, 'Personal', 'personal', 5);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reviews ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  USING (id = auth.uid());

-- categories
CREATE POLICY "categories_select_own"
  ON public.categories FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "categories_insert_own"
  ON public.categories FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "categories_update_own"
  ON public.categories FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "categories_delete_own"
  ON public.categories FOR DELETE
  USING (user_id = auth.uid());

-- goals
CREATE POLICY "goals_select_own"
  ON public.goals FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "goals_insert_own"
  ON public.goals FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "goals_update_own"
  ON public.goals FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "goals_delete_own"
  ON public.goals FOR DELETE
  USING (user_id = auth.uid());

-- milestones
CREATE POLICY "milestones_select_own"
  ON public.milestones FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "milestones_insert_own"
  ON public.milestones FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.goals
      WHERE goals.id = goal_id
        AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "milestones_update_own"
  ON public.milestones FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.goals
      WHERE goals.id = goal_id
        AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "milestones_delete_own"
  ON public.milestones FOR DELETE
  USING (user_id = auth.uid());

-- tasks
CREATE POLICY "tasks_select_own"
  ON public.tasks FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "tasks_insert_own"
  ON public.tasks FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "tasks_update_own"
  ON public.tasks FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "tasks_delete_own"
  ON public.tasks FOR DELETE
  USING (user_id = auth.uid());

-- daily_reviews
CREATE POLICY "daily_reviews_select_own"
  ON public.daily_reviews FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "daily_reviews_insert_own"
  ON public.daily_reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "daily_reviews_update_own"
  ON public.daily_reviews FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "daily_reviews_delete_own"
  ON public.daily_reviews FOR DELETE
  USING (user_id = auth.uid());

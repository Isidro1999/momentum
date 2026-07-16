-- Momentum — IDs de origen para importación idempotente desde localStorage
-- Ejecutar en Supabase SQL Editor después de 001_initial_schema.sql
-- Ver docs/supabase-setup.md

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS local_source_id text;

ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS local_source_id text;

ALTER TABLE public.milestones
  ADD COLUMN IF NOT EXISTS local_source_id text;

ALTER TABLE public.daily_reviews
  ADD COLUMN IF NOT EXISTS local_source_id text;

CREATE UNIQUE INDEX IF NOT EXISTS tasks_user_local_source_id_uidx
  ON public.tasks (user_id, local_source_id)
  WHERE local_source_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS goals_user_local_source_id_uidx
  ON public.goals (user_id, local_source_id)
  WHERE local_source_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS milestones_user_local_source_id_uidx
  ON public.milestones (user_id, local_source_id)
  WHERE local_source_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS daily_reviews_user_local_source_id_uidx
  ON public.daily_reviews (user_id, local_source_id)
  WHERE local_source_id IS NOT NULL;

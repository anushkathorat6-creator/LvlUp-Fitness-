-- LevelFit AI Consolidated Schema Migration
-- Optimized for Supabase/PostgreSQL

-- Master Tables
CREATE TABLE IF NOT EXISTS public.levels (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_number    INT UNIQUE NOT NULL,
  tier            VARCHAR(50) NOT NULL,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  duration_days   INT NOT NULL DEFAULT 5,
  point_threshold INT NOT NULL,
  workout_focus   VARCHAR(255),
  diet_focus      VARCHAR(255),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            VARCHAR(100) UNIQUE NOT NULL,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  icon_url        VARCHAR(500),
  trigger_type    VARCHAR(100) NOT NULL,
  trigger_value   INT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Data (Extending auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name         VARCHAR(255),
  email             VARCHAR(255),
  age               INT,
  gender            VARCHAR(20),
  weight_kg         DECIMAL(5,2),
  height_cm         DECIMAL(5,2),
  target_weight_kg  DECIMAL(5,2),
  fitness_goal      VARCHAR(100),
  activity_level    VARCHAR(50),
  diet_preference   VARCHAR(50),
  coach_preference  VARCHAR(50),
  medical_conditions TEXT[],
  onboarding_complete BOOLEAN DEFAULT false,
  role              VARCHAR(20) DEFAULT 'user',
  current_level     INT DEFAULT 1,
  points            INT DEFAULT 0,
  streak_count      INT DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS public.daily_tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_date     DATE NOT NULL,
  task_type     VARCHAR(50) NOT NULL,
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  target_value  DECIMAL(10,2),
  unit          VARCHAR(50),
  is_completed  BOOLEAN NOT NULL DEFAULT false,
  completed_at  TIMESTAMPTZ,
  points_awarded INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workout_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id         UUID REFERENCES public.daily_tasks(id),
  level_id        UUID REFERENCES public.levels(id),
  log_date        DATE NOT NULL,
  workout_name    VARCHAR(255) NOT NULL,
  exercises       JSONB,
  duration_min    INT,
  calories_burned DECIMAL(8,2),
  notes           TEXT,
  points_earned   INT NOT NULL DEFAULT 50,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.diet_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id         UUID REFERENCES public.daily_tasks(id),
  log_date        DATE NOT NULL,
  meal_type       VARCHAR(50) NOT NULL,
  food_name       VARCHAR(255) NOT NULL,
  calories        DECIMAL(8,2) NOT NULL,
  protein_g       DECIMAL(8,2),
  carbs_g         DECIMAL(8,2),
  fats_g          DECIMAL(8,2),
  quantity_g      DECIMAL(8,2),
  recognized_by_ai BOOLEAN NOT NULL DEFAULT false,
  points_earned   INT NOT NULL DEFAULT 20,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Progress & Events
CREATE TABLE IF NOT EXISTS public.streak_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date      DATE NOT NULL,
  status        VARCHAR(20) NOT NULL,
  streak_day    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, log_date)
);

CREATE TABLE IF NOT EXISTS public.score_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type    VARCHAR(100) NOT NULL,
  reference_id  UUID,
  points        INT NOT NULL,
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id  UUID NOT NULL REFERENCES public.achievements(id),
  earned_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS public.wearable_data (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider        VARCHAR(50) NOT NULL,
  sync_date       DATE NOT NULL,
  steps           INT,
  heart_rate_avg  INT,
  sleep_hours     DECIMAL(4,2),
  calories_active DECIMAL(8,2),
  raw_payload     JSONB,
  synced_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON public.daily_tasks(user_id, task_date);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_id ON public.workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_logs_user_date ON public.diet_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_score_events_user_id ON public.score_events(user_id);

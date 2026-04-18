# LevelFit AI — Database Schema

## Overview

The database layer uses **PostgreSQL / Appwrite Database** for persistent storage and efficient data retrieval. All collections are indexed on `userId` and `createdAt` for performance. Timestamps follow ISO 8601 format.

---

## Collections / Tables

---

### 1. `users`

Stores core authentication and identity data.

```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255),                        -- null for OAuth users
  oauth_provider  VARCHAR(50),                         -- 'google' | null
  oauth_id        VARCHAR(255),                        -- provider's user ID
  role            VARCHAR(20) NOT NULL DEFAULT 'user', -- 'user' | 'admin'
  is_onboarded    BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

---

### 2. `user_profiles`

Stores body metrics, fitness goals, and medical info collected during onboarding.

```sql
CREATE TABLE user_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name         VARCHAR(255) NOT NULL,
  age               INT,
  gender            VARCHAR(20),                       -- 'male' | 'female' | 'other'
  weight_kg         DECIMAL(5,2),
  height_cm         DECIMAL(5,2),
  target_weight_kg  DECIMAL(5,2),
  fitness_goal      VARCHAR(100),                      -- 'fat_loss' | 'muscle_gain' | 'endurance' | 'general'
  activity_level    VARCHAR(50),                       -- 'beginner' | 'intermediate' | 'advanced' | 'pro'
  diet_preference   VARCHAR(50),                       -- 'veg' | 'non-veg' | 'vegan'
  coach_preference  VARCHAR(50),                       -- 'strict' | 'moderate' | 'flexible'
  medical_conditions TEXT[],                           -- array of conditions
  onboarding_step   INT NOT NULL DEFAULT 0,            -- 0–6
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

---

### 3. `user_levels`

Tracks the user's current position in the 21-level gamification journey.

```sql
CREATE TABLE user_levels (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_level     INT NOT NULL DEFAULT 1,            -- 1 to 21
  level_start_date  DATE NOT NULL,
  days_completed    INT NOT NULL DEFAULT 0,            -- 0 to 5 per level
  total_points      INT NOT NULL DEFAULT 0,
  streak_count      INT NOT NULL DEFAULT 0,
  missed_days       INT NOT NULL DEFAULT 0,            -- resets on activity; triggers reset at 3
  last_active_date  DATE,
  is_level_complete BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Level Tier Reference:**

| Level Range | Tier | Focus |
|---|---|---|
| L1 – L5 | Beginner | Habit building, walk, basics |
| L6 – L10 | Fat Loss | Cardio + diet, calorie target |
| L11 – L16 | Strength | Gym splits, protein tracking |
| L17 – L21 | Elite | AI coaching, advanced plans |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_user_levels_user_id ON user_levels(user_id);
CREATE INDEX idx_user_levels_current_level ON user_levels(current_level);
```

---

### 4. `levels`

Master table defining the 21 levels and their properties.

```sql
CREATE TABLE levels (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_number    INT UNIQUE NOT NULL,                 -- 1 to 21
  tier            VARCHAR(50) NOT NULL,                -- 'beginner' | 'fat_loss' | 'strength' | 'elite'
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  duration_days   INT NOT NULL DEFAULT 5,
  point_threshold INT NOT NULL,                        -- points needed to unlock next level
  workout_focus   VARCHAR(255),
  diet_focus      VARCHAR(255),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### 5. `daily_tasks`

Stores the daily generated task list per user per day.

```sql
CREATE TABLE daily_tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_date     DATE NOT NULL,
  task_type     VARCHAR(50) NOT NULL,                  -- 'workout' | 'diet' | 'water' | 'steps'
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  target_value  DECIMAL(10,2),                         -- e.g. 2.5 litres, 8000 steps
  unit          VARCHAR(50),                           -- 'litres' | 'steps' | 'calories' | 'minutes'
  is_completed  BOOLEAN NOT NULL DEFAULT false,
  completed_at  TIMESTAMPTZ,
  points_awarded INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
```sql
CREATE INDEX idx_daily_tasks_user_date ON daily_tasks(user_id, task_date);
CREATE INDEX idx_daily_tasks_task_type ON daily_tasks(task_type);
```

---

### 6. `workout_logs`

Records each workout session completed by a user.

```sql
CREATE TABLE workout_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id         UUID REFERENCES daily_tasks(id),
  level_id        UUID REFERENCES levels(id),
  log_date        DATE NOT NULL,
  workout_name    VARCHAR(255) NOT NULL,
  exercises       JSONB,                               -- array of {name, sets, reps, duration_sec}
  duration_min    INT,
  calories_burned DECIMAL(8,2),
  notes           TEXT,
  points_earned   INT NOT NULL DEFAULT 50,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**JSONB `exercises` example:**
```json
[
  { "name": "Push-ups", "sets": 3, "reps": 15, "duration_sec": null },
  { "name": "Plank", "sets": 3, "reps": null, "duration_sec": 60 }
]
```

**Indexes:**
```sql
CREATE INDEX idx_workout_logs_user_id ON workout_logs(user_id);
CREATE INDEX idx_workout_logs_log_date ON workout_logs(user_id, log_date);
```

---

### 7. `diet_logs`

Records nutritional intake per meal per day.

```sql
CREATE TABLE diet_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id         UUID REFERENCES daily_tasks(id),
  log_date        DATE NOT NULL,
  meal_type       VARCHAR(50) NOT NULL,                -- 'breakfast' | 'lunch' | 'dinner' | 'snack'
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
```

**Indexes:**
```sql
CREATE INDEX idx_diet_logs_user_date ON diet_logs(user_id, log_date);
CREATE INDEX idx_diet_logs_meal_type ON diet_logs(meal_type);
```

---

### 8. `streak_logs`

Maintains a per-day record of streak status for calendar visualization and reset logic.

```sql
CREATE TABLE streak_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  log_date      DATE NOT NULL,
  status        VARCHAR(20) NOT NULL,                  -- 'active' | 'missed' | 'warning' | 'reset'
  streak_day    INT NOT NULL DEFAULT 0,                -- streak count at this date
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_streak_logs_user_date ON streak_logs(user_id, log_date);
```

---

### 9. `score_events`

Append-only event log of every scoring action — the source of truth for the scoring engine.

```sql
CREATE TABLE score_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type    VARCHAR(100) NOT NULL,                 -- 'workout_complete' | 'meal_logged' | 'streak_bonus' | 'level_complete' | 'level_reset'
  reference_id  UUID,                                  -- ID of the workout_log / diet_log that triggered this
  points        INT NOT NULL,                          -- positive for gains, negative for resets
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
```sql
CREATE INDEX idx_score_events_user_id ON score_events(user_id);
CREATE INDEX idx_score_events_created_at ON score_events(user_id, created_at DESC);
```

---

### 10. `achievements`

Master definitions for all available badges and milestones.

```sql
CREATE TABLE achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            VARCHAR(100) UNIQUE NOT NULL,        -- e.g. 'streak_5', 'level_complete_10'
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  icon_url        VARCHAR(500),
  trigger_type    VARCHAR(100) NOT NULL,               -- 'streak' | 'level_complete' | 'total_points' | 'first_workout'
  trigger_value   INT,                                 -- e.g. 5 for 5-day streak
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### 11. `user_achievements`

Junction table recording which achievements each user has earned.

```sql
CREATE TABLE user_achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id  UUID NOT NULL REFERENCES achievements(id),
  earned_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);
```

**Indexes:**
```sql
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
```

---

### 12. `wearable_data`

Stores synced data from Google Fit / Fitbit wearables.

```sql
CREATE TABLE wearable_data (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider        VARCHAR(50) NOT NULL,                -- 'google_fit' | 'fitbit'
  sync_date       DATE NOT NULL,
  steps           INT,
  heart_rate_avg  INT,
  sleep_hours     DECIMAL(4,2),
  calories_active DECIMAL(8,2),
  raw_payload     JSONB,                               -- full provider response
  synced_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
```sql
CREATE INDEX idx_wearable_data_user_date ON wearable_data(user_id, sync_date);
```

---

### 13. `sessions`

Tracks active user sessions for JWT / token management.

```sql
CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash      VARCHAR(500) NOT NULL,
  device_info     VARCHAR(255),
  ip_address      INET,
  expires_at      TIMESTAMPTZ NOT NULL,
  revoked         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
```sql
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
```

---

## Entity Relationship Summary

```
users
  ├── user_profiles       (1:1)
  ├── user_levels         (1:1)
  ├── daily_tasks         (1:N)
  ├── workout_logs        (1:N)
  ├── diet_logs           (1:N)
  ├── streak_logs         (1:N)
  ├── score_events        (1:N, append-only)
  ├── user_achievements   (1:N → achievements)
  ├── wearable_data       (1:N)
  └── sessions            (1:N)

levels
  ├── daily_tasks         (referenced by level context)
  └── workout_logs        (referenced for level tracking)

achievements
  └── user_achievements   (N:N with users via junction)
```

---

## Data Integrity Notes

- All foreign keys use `ON DELETE CASCADE` to clean up user data on account deletion.
- `score_events` is append-only — points are never edited, only new events added. The scoring engine computes totals from this log.
- `streak_logs` has a unique constraint on `(user_id, log_date)` to prevent duplicate daily entries.
- `user_achievements` has a unique constraint on `(user_id, achievement_id)` to prevent duplicate badge awards.
- JSONB fields (`exercises`, `raw_payload`) allow schema flexibility for evolving AI/wearable payloads.

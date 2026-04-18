# LevelFit AI — Backend Documentation

## Overview

The backend acts as the **central processing unit** of LevelFit AI, built on **Node.js / Appwrite Functions** with **PostgreSQL / Appwrite Database** for persistence. It follows a layered, event-driven architecture where every user action triggers a sequence of backend operations processed in real-time.

**System Flow:**
```
User Interaction → Frontend → API Request → Backend Logic → Database Update → AI Processing → Response
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js / Appwrite Functions |
| Database | PostgreSQL / Appwrite Database |
| Auth | Appwrite Auth (JWT / Session tokens) |
| AI Integration | Claude API / OpenAI API |
| Wearable Sync | Google Fit / Fitbit API |
| Food Recognition | Camera → AI detection (auto-calorie logging) |

---

## Core Modules

### 1. Authentication Module

Handles secure access to the application.

**Responsibilities:**
- Email/password-based registration and login
- OAuth-based login (Google)
- Session management
- JWT/session token generation and validation
- Password hashing (bcrypt or equivalent)
- Secure API communication enforcement

**Endpoints:**

| Method | Route | Description | Role Required |
|---|---|---|---|
| POST | `/auth/register` | Register a new user | Public |
| POST | `/auth/login` | Login with email/password | Public |
| POST | `/auth/oauth/google` | OAuth login via Google | Public |
| POST | `/auth/logout` | Invalidate session token | User |
| GET | `/auth/me` | Get current user info | User |
| POST | `/auth/refresh` | Refresh access token | User |

---

### 2. Onboarding Module

Collects critical user data in a 6-step flow that drives personalized level assignment.

**Steps:**
1. Sign Up — Name, email
2. Goal — Diet / Coach preference
3. Body Info — Weight, height, target weight
4. Medical — Conditions and restrictions
5. Activity — Beginner → Pro self-assessment
6. AI — Smart level placement

**Responsibilities:**
- Validate and store onboarding data per step
- Trigger AI-based level assignment on completion
- Persist profile to `users` and `user_profiles` collections

**Level Assignment Logic:**
```
Beginner  → Level 1   (L1–5: Habit building, walk, basics)
Intermediate → Level 6  (L6–10: Cardio + diet, calorie target)
Advanced  → Level 11  (L11–16: Gym splits, protein tracking)
Pro       → Level 17  (L17–21: AI coaching, advanced plans)
```

**Endpoints:**

| Method | Route | Description | Role Required |
|---|---|---|---|
| POST | `/onboarding/step/:stepNumber` | Submit data for a given step | User |
| GET | `/onboarding/status` | Get onboarding completion status | User |
| POST | `/onboarding/complete` | Finalize onboarding and assign level | User |

---

### 3. Level Progression Engine

The core of the gamification system — manages the 21-level, 105-day structured journey.

**Structure:**
- 21 levels total, each lasting 5 days (105 days total)
- Each level unlocks after the user meets daily task thresholds for 5 consecutive days
- Level tiers: Beginner (L1–5), Fat Loss (L6–10), Strength (L11–16), Elite (L17–21)

**Level Unlock Logic:**
```
After 5 days of completing required tasks:
  → Level marked complete
  → Bonus points awarded
  → Next level unlocked
```

**Endpoints:**

| Method | Route | Description | Role Required |
|---|---|---|---|
| GET | `/levels/current` | Get user's current level and progress | User |
| GET | `/levels/all` | Get full 21-level map | User |
| POST | `/levels/check-progress` | Evaluate if user is eligible for level-up | User (system trigger) |
| GET | `/levels/:levelId` | Get details of a specific level | User |

---

### 4. Daily Task Lifecycle Module

Generates and manages the daily task set for each user based on their current level.

**Daily Tasks Generated:**
- Workout plan (based on level tier)
- Diet logging requirement (calorie/macro targets)
- Water intake target
- Step count goal

**Endpoints:**

| Method | Route | Description | Role Required |
|---|---|---|---|
| GET | `/tasks/today` | Get today's generated task list | User |
| POST | `/tasks/:taskId/complete` | Mark a task as complete | User |
| GET | `/tasks/history` | Get task completion history | User |

---

### 5. Scoring Engine

Processes all user action events in real-time and calculates points, streaks, and level eligibility.

**Point Allocation:**

| Action | Points |
|---|---|
| Workout completed | +50 pts |
| Meal logged | +20 pts |
| Daily streak maintained | +30 pts |
| Level completion bonus | Variable |

**Streak & Reset Logic:**
```
Miss 1 day  → Push notification / reminder
Miss 2 days → Warning notification
Miss 3 days → Level reset triggered
```

**Responsibilities:**
- Listen for task completion events
- Calculate and persist points atomically
- Maintain streak counter
- Trigger level-up check on threshold breach
- Execute reset logic on 3-day miss

**Endpoints:**

| Method | Route | Description | Role Required |
|---|---|---|---|
| GET | `/score/summary` | Get total points, level, streak | User |
| POST | `/score/event` | Internal — fire scoring event | System |
| GET | `/score/leaderboard` | Get community leaderboard | User |

---

### 6. Workout Tracking Module

Handles logging of physical activity sessions.

**Features:**
- Daily workout list (per level)
- Mark exercises as complete
- Input sets, reps, and duration
- On completion → triggers scoring engine event

**Endpoints:**

| Method | Route | Description | Role Required |
|---|---|---|---|
| GET | `/workouts/today` | Get today's workout plan | User |
| POST | `/workouts/log` | Log a completed workout session | User |
| GET | `/workouts/history` | Get past workout logs | User |
| PUT | `/workouts/log/:logId` | Update a workout log entry | User |

---

### 7. Diet Logging Module

Tracks user nutritional intake with meal categorization and macro breakdown.

**Features:**
- Meal categorization: breakfast, lunch, dinner, snacks
- Calorie calculation per entry
- Macro tracking: protein, carbs, fats
- Camera-based AI food recognition (auto-logs calories)
- Integrates with scoring engine on successful log

**Endpoints:**

| Method | Route | Description | Role Required |
|---|---|---|---|
| POST | `/diet/log` | Log a meal entry | User |
| GET | `/diet/today` | Get today's diet summary | User |
| GET | `/diet/history` | Get historical diet logs | User |
| POST | `/diet/recognize` | Submit image for AI food recognition | User |
| DELETE | `/diet/log/:logId` | Delete a meal log | User |

---

### 8. Progress Dashboard Module

Provides aggregated performance data for the frontend dashboard.

**Data Served:**
- Current level and tier
- Total points accumulated
- Streak count
- Daily task completion progress
- Weekly/monthly trends

**Endpoints:**

| Method | Route | Description | Role Required |
|---|---|---|---|
| GET | `/dashboard` | Get full dashboard summary | User |
| GET | `/dashboard/analytics` | Get detailed progress analytics | User |
| GET | `/dashboard/streak-history` | Get streak calendar data | User |

---

### 9. Achievement System

Awards milestone-based badges and rewards.

**Achievement Types:**
- Streak badges (5-day, 10-day, 30-day streaks)
- Level completion badges
- First workout badge
- Diet consistency badges

**Endpoints:**

| Method | Route | Description | Role Required |
|---|---|---|---|
| GET | `/achievements` | Get all user achievements | User |
| GET | `/achievements/available` | Get all possible achievements | User |

---

### 10. AI Coach Module

Provides intelligent, personalized workout and diet recommendations via Claude / OpenAI API.

**Capabilities:**
- Analyze user data (history, level, goals)
- Suggest personalized workout plans
- Suggest diet adjustments
- Behavioral analysis and motivational coaching

**Endpoints:**

| Method | Route | Description | Role Required |
|---|---|---|---|
| POST | `/ai/recommend` | Get AI workout/diet recommendation | User |
| POST | `/ai/coach` | Chat with AI coach | User |
| GET | `/ai/insights` | Get behavioral insights summary | User |

---

### 11. Wearable Sync Module

Syncs data from external fitness devices.

**Supported Integrations:**
- Google Fit
- Fitbit

**Data Synced:**
- Heart rate
- Sleep data
- Step count

**Endpoints:**

| Method | Route | Description | Role Required |
|---|---|---|---|
| POST | `/wearable/connect` | Authorize wearable integration | User |
| GET | `/wearable/sync` | Trigger manual data sync | User |
| GET | `/wearable/data` | Get latest synced wearable data | User |

---

### 12. Admin Module

Internal management and moderation capabilities.

**Responsibilities:**
- View and manage all users
- Monitor system health and scoring
- Override level resets or achievements
- Manage achievement definitions and level content

**Endpoints:**

| Method | Route | Description | Role Required |
|---|---|---|---|
| GET | `/admin/users` | List all registered users | Admin |
| GET | `/admin/users/:userId` | View a specific user's full profile | Admin |
| PUT | `/admin/users/:userId/level` | Manually override user level | Admin |
| DELETE | `/admin/users/:userId` | Delete a user account | Admin |
| GET | `/admin/stats` | View system-wide usage statistics | Admin |
| POST | `/admin/achievements` | Create new achievement definition | Admin |
| PUT | `/admin/achievements/:id` | Update an achievement | Admin |

---

## Error Handling Strategy

| Issue | Handling |
|---|---|
| Network failure | Retry mechanism with exponential backoff |
| Incomplete data submission | Input validation with descriptive errors |
| Duplicate requests | Idempotent API design (unique request IDs) |
| Unauthorized access | 401/403 responses with token refresh flow |
| Scoring race conditions | Atomic database transactions |

---

## Performance & Optimization

- API response caching for static/level data
- Lazy loading of non-critical modules
- Efficient database queries with indexed fields (userId, date, levelId)
- Asynchronous processing for AI calls and wearable sync
- Event-driven scoring to avoid blocking request threads

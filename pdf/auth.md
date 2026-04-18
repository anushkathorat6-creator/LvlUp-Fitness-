# LevelFit AI — Authentication & Authorization (RBAC)

## Overview

LevelFit AI uses a **JWT-based authentication system** backed by Appwrite Auth. Authorization is enforced through **Role-Based Access Control (RBAC)** with two primary roles. Every API request is validated against the user's role before business logic executes.

---

## Roles

### `user` (Default)
Any registered individual using the LevelFit AI application. Assigned automatically on registration.

**Access:** Own data only — workouts, diet logs, progress, achievements, AI coaching.

---

### `admin`
Internal team members managing platform content and user accounts.

**Access:** All user data, system statistics, level definitions, achievement management, manual overrides.

---

## Authentication Flow

### 1. Email / Password Registration

```
POST /auth/register
Body: { email, password, full_name }

→ Validate email format + password strength
→ Hash password (bcrypt, cost factor 12)
→ Create record in `users` table (role: 'user')
→ Create empty record in `user_profiles`
→ Generate JWT access token (15 min TTL)
→ Generate refresh token (7 days TTL), store hash in `sessions`
→ Return: { accessToken, refreshToken, user }
```

---

### 2. Email / Password Login

```
POST /auth/login
Body: { email, password }

→ Look up user by email
→ Compare password against stored hash
→ If match: generate new JWT + refresh token
→ Store session in `sessions` table
→ Return: { accessToken, refreshToken, user }
```

---

### 3. Google OAuth Login

```
POST /auth/oauth/google
Body: { oauth_token }

→ Validate token with Google API
→ Extract email and google user ID
→ If user exists: update oauth_id, return tokens
→ If new user: create record (role: 'user'), skip password
→ Return: { accessToken, refreshToken, user }
```

---

### 4. Token Refresh

```
POST /auth/refresh
Body: { refreshToken }

→ Hash incoming refresh token
→ Look up in `sessions` — check not revoked + not expired
→ Issue new access token (15 min TTL)
→ Return: { accessToken }
```

---

### 5. Logout

```
POST /auth/logout
Headers: Authorization: Bearer <accessToken>

→ Decode token → get session ID
→ Set `revoked = true` in `sessions`
→ Return: { success: true }
```

---

## Token Specification

| Property | Access Token | Refresh Token |
|---|---|---|
| Format | JWT (HS256) | Opaque (random 64-byte hex) |
| Storage (client) | Memory / secure cookie | HttpOnly cookie |
| TTL | 15 minutes | 7 days |
| Stored server-side | No | Yes (hashed in `sessions`) |

**JWT Payload Structure:**
```json
{
  "sub": "user-uuid",
  "role": "user",
  "email": "user@example.com",
  "iat": 1713500000,
  "exp": 1713500900
}
```

---

## Middleware: `authenticate`

Applied to all protected routes. Validates the JWT on every request.

```js
// middleware/authenticate.js
const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

---

## Middleware: `authorize(...roles)`

Applied after `authenticate`. Enforces role-based access.

```js
// middleware/authorize.js
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }
    next();
  };
};
```

**Usage on routes:**
```js
// User-only route
router.get('/dashboard', authenticate, authorize('user', 'admin'), dashboardController.get);

// Admin-only route
router.get('/admin/users', authenticate, authorize('admin'), adminController.listUsers);

// Public route (no middleware)
router.post('/auth/register', authController.register);
```

---

## Route Access Matrix

### Public Routes (No auth required)

| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Register new account |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/oauth/google` | OAuth login |
| POST | `/auth/refresh` | Refresh access token |

---

### User Routes (`role: user`)

Users can only access and modify **their own data**. All queries are scoped by `req.user.id`.

| Method | Route | Description |
|---|---|---|
| POST | `/auth/logout` | Logout and revoke session |
| GET | `/auth/me` | Get own user info |
| POST | `/onboarding/step/:n` | Submit onboarding step |
| GET | `/onboarding/status` | Get onboarding status |
| POST | `/onboarding/complete` | Finalize onboarding |
| GET | `/levels/current` | Get current level and progress |
| GET | `/levels/all` | View full level map |
| GET | `/levels/:levelId` | View specific level details |
| GET | `/tasks/today` | Get today's task list |
| POST | `/tasks/:taskId/complete` | Mark task as complete |
| GET | `/tasks/history` | View task history |
| GET | `/workouts/today` | Get today's workout plan |
| POST | `/workouts/log` | Log a completed workout |
| GET | `/workouts/history` | View workout history |
| PUT | `/workouts/log/:logId` | Edit own workout log |
| POST | `/diet/log` | Log a meal |
| GET | `/diet/today` | Get today's diet summary |
| GET | `/diet/history` | View diet history |
| POST | `/diet/recognize` | AI food recognition |
| DELETE | `/diet/log/:logId` | Delete own meal log |
| GET | `/score/summary` | Get points, level, streak |
| GET | `/score/leaderboard` | View community leaderboard |
| GET | `/dashboard` | Full dashboard summary |
| GET | `/dashboard/analytics` | Detailed analytics |
| GET | `/dashboard/streak-history` | Streak calendar data |
| GET | `/achievements` | View own achievements |
| GET | `/achievements/available` | View all possible achievements |
| POST | `/ai/recommend` | Get AI recommendations |
| POST | `/ai/coach` | Chat with AI coach |
| GET | `/ai/insights` | Get behavioral insights |
| POST | `/wearable/connect` | Connect a wearable device |
| GET | `/wearable/sync` | Trigger manual sync |
| GET | `/wearable/data` | Get latest wearable data |

---

### Admin Routes (`role: admin`)

Admins can access any user's data and manage platform content. Admin also has access to all user routes above.

| Method | Route | Description |
|---|---|---|
| GET | `/admin/users` | List all users |
| GET | `/admin/users/:userId` | View any user's full profile |
| PUT | `/admin/users/:userId/level` | Manually override a user's level |
| PUT | `/admin/users/:userId/role` | Change a user's role |
| DELETE | `/admin/users/:userId` | Delete a user account |
| GET | `/admin/stats` | System-wide usage statistics |
| POST | `/admin/achievements` | Create new achievement definition |
| PUT | `/admin/achievements/:id` | Update an achievement |
| DELETE | `/admin/achievements/:id` | Delete an achievement |
| GET | `/admin/score-events` | View raw scoring event log |
| POST | `/admin/levels` | Create or update level definitions |

---

## Data Ownership Enforcement

Even within the `user` role, ownership is checked at the controller level to prevent horizontal privilege escalation (e.g., User A accessing User B's diet logs).

```js
// Example: ownership check in diet controller
const deleteDietLog = async (req, res) => {
  const log = await DietLog.findById(req.params.logId);

  if (!log) return res.status(404).json({ error: 'Log not found' });

  if (log.userId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: not your resource' });
  }

  await log.delete();
  return res.status(200).json({ success: true });
};
```

---

## Security Policies

| Policy | Implementation |
|---|---|
| Password hashing | bcrypt, cost factor 12 |
| Token signing | HS256 with environment-stored secret |
| Token storage | Access token in memory; refresh token in HttpOnly cookie |
| Session revocation | `revoked` flag in `sessions` table |
| HTTPS enforcement | All API communication over TLS |
| Rate limiting | Login endpoint: max 10 attempts / 15 min per IP |
| Input validation | All request bodies validated before processing |
| SQL injection | Parameterized queries / ORM only; no raw string interpolation |
| CORS | Restricted to known frontend origins |

---

## Onboarding Gate

After registration, users cannot access protected app routes until onboarding is complete. An additional middleware layer checks `is_onboarded` on the user record.

```js
// middleware/requireOnboarded.js
const requireOnboarded = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user.is_onboarded) {
    return res.status(403).json({
      error: 'Onboarding required',
      redirect: '/onboarding'
    });
  }

  next();
};
```

Applied to all non-onboarding user routes:
```js
router.get('/dashboard', authenticate, authorize('user', 'admin'), requireOnboarded, dashboardController.get);
```

---

## Error Response Reference

| HTTP Status | Meaning | When Used |
|---|---|---|
| 400 | Bad Request | Missing / invalid fields in request body |
| 401 | Unauthorized | Missing, expired, or invalid token |
| 403 | Forbidden | Valid token but insufficient role or ownership |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate registration (email already exists) |
| 429 | Too Many Requests | Rate limit exceeded on auth endpoints |
| 500 | Internal Server Error | Unexpected backend failure |

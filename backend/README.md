# Health + Finance Literacy Backend (Offline-First Sync)

Backend API for a PWA that delivers bite-sized financial/health literacy
lessons and a government scheme eligibility checker to users in
low-connectivity areas.

## Why this project exists

Most people in underserved areas either don't know government welfare
schemes exist, or can't easily check if they qualify. This backend powers
an app that (1) teaches basic financial/health literacy through short
audio/video lessons, and (2) tells users which schemes they're eligible
for based on a simple profile — and it's designed to work well even when
the client has spotty or no internet.

## Architecture highlights

- **Configurable eligibility engine** (`src/utils/rulesEngine.js`) — scheme
  eligibility criteria are stored as JSON in the database, not hardcoded
  in application logic. Adding a new scheme is a database insert, not a
  code change or redeploy.
- **Offline-first sync design** (`src/controllers/syncController.js`) —
  a `POST /api/sync/push` endpoint accepts batched progress events from
  a client that was offline, using client-generated UUIDs
  (`clientEventId`) to guarantee idempotency on retry, and a
  "furthest-progress-wins" strategy to resolve conflicts instead of naive
  last-write-wins.
- **Delta sync** — `GET /api/sync/pull?since=<timestamp>` returns only
  lessons/schemes updated since the client's last sync, minimizing data
  usage on slow connections.
- **Anonymous-first eligibility checks** — `POST /api/eligibility/check`
  works with or without auth, so users can find out if they qualify for a
  scheme before being forced to create an account (reduces drop-off).

## Tech stack

- Node.js + Express
- PostgreSQL + Sequelize ORM
- JWT-based auth (bcrypt password hashing)

## Project structure

```
src/
  config/db.js            # Sequelize + Postgres connection
  models/                 # User, Scheme, Lesson, UserProgress, EligibilityCheck
  middleware/              # auth guard, centralized error handler
  utils/
    rulesEngine.js         # the eligibility rules engine
    generateToken.js
  controllers/             # request handlers, one per resource
  routes/                  # Express routers
  seed/                    # sample schemes + lessons to get started
  server.js                # app entry point
```

## Setup

```bash
git clone <your-repo-url>
cd health-finance-backend
npm install
cp .env.example .env   # fill in your Postgres credentials + JWT secret
```

Create the database (locally or on a free-tier host like Supabase/Neon/Railway):

```sql
CREATE DATABASE health_finance_db;
```

Start the server (auto-creates/syncs tables in dev mode):

```bash
npm run dev
```

Seed sample schemes + lessons:

```bash
npm run seed
```

## API overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Create account |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get own profile |
| PATCH | `/api/auth/me` | ✅ | Update profile (feeds eligibility engine) |
| GET | `/api/schemes` | — | List schemes (`?category=`) |
| GET | `/api/schemes/:slug` | — | Get one scheme |
| GET | `/api/lessons` | — | List lessons (`?category=&language=`) |
| GET | `/api/lessons/progress` | ✅ | Own lesson progress |
| POST | `/api/eligibility/check` | optional | Run profile against all schemes |
| GET | `/api/eligibility/history` | ✅ | Past eligibility checks |
| POST | `/api/sync/push` | ✅ | Batch-upload offline progress events |
| GET | `/api/sync/pull?since=` | — | Delta sync of lessons/schemes |

### Example: checking eligibility

```bash
curl -X POST http://localhost:5000/api/eligibility/check \
  -H "Content-Type: application/json" \
  -d '{
    "age": 25,
    "gender": "female",
    "state": "Karnataka",
    "annualIncome": 180000,
    "occupation": "farmer",
    "isPregnantOrLactating": true
  }'
```

### Example: offline sync push

```bash
curl -X POST http://localhost:5000/api/sync/push \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {
        "clientEventId": "3f29b1e2-...-uuid",
        "lessonId": "<lesson-uuid>",
        "completed": true,
        "progressPercent": 100,
        "occurredAt": "2026-07-01T10:15:00Z"
      }
    ]
  }'
```

## What I'd add next

- Admin dashboard for non-technical staff to manage schemes/lessons
- SMS/IVR fallback (Twilio) for feature-phone users
- Multi-language content variants per lesson
- Redis caching for the schemes list (rarely changes, frequently read)
- Rate limiting on auth endpoints

## License

MIT

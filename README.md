# Saksham — voice-first livelihood mapping and skilling assistant

Built for **SIH26097**: *AI-Driven voice Assistant for livelihood Mapping and
NSQF-Aligned Skilling Recommendations for SC Communities under GIA component
of PM-AJAY* (Ministry of Social Justice and Empowerment).

Saksham replaces the usual sign-up form with a short spoken interview, in
Hindi or English, over whichever channel someone already has — a phone
browser, a WhatsApp chat, or a plain phone call. From that conversation it
builds a 7-field livelihood profile, ranks NSQF-aligned training courses
against it with a stated reason for each, flags the skill gap between what
the person has and what the course needs, and shows local job and
enterprise opportunities. District officers and counsellors get a live
dashboard of demand, gaps, and a queue of sessions that need a human look.

The project began as a different app — an offline-first PWA for financial
and health literacy lessons and a government scheme eligibility checker.
Both still work and share the same backend; see [Legacy
features](#legacy-features-still-in-the-repo) below.

## What's built

| Area | Status |
|---|---|
| Voice interview (7-field profile, one question at a time, read-back and correction) | ✅ Built |
| Ranked NSQF course matches with a stated reason | ✅ Built (sample course catalogue — see note below) |
| Skill-gap view and district opportunity note | ✅ Built (sample demand data — see note below) |
| PM-AJAY / scheme eligibility, reusing the existing rules engine | ✅ Built |
| Web channel — installable PWA, works offline | ✅ Built |
| WhatsApp channel — text or voice note, same interview engine | ✅ Built (Twilio) |
| Phone / IVR channel — same interview engine over a call | ✅ Built (Twilio) |
| Officer / counsellor dashboard — demand, gaps, review queue | ✅ Built (shared access key, not individual officer logins — see note below) |
| Consent-gated save, delete-my-data | ✅ Built |
| Languages | Hindi and English only |
| Automated placement follow-up | ❌ Not built — a counsellor sets follow-up status by hand on the dashboard |
| Kiosk mode (auto-reset per user) | ❌ Not built — guest access works, but the screen doesn't reset itself |

**Sample data, by design, not oversight.** The course catalogue
(`backend/src/livelihood/courses.js`) and the state-by-trade demand table
(`backend/src/livelihood/demand.js`) are hand-built, illustrative datasets —
each file says so at the top, with a note on what real source should
replace it (Skill India Digital Hub / NSDC qualification packs for courses;
District Skill Development Plans, PLFS/NCS postings and state skill-mission
surveys for demand). The recommendation logic doesn't care where the rows
come from, so swapping in real data is a data change, not a code change.

**One backend, three channels.** `channels/voiceController.js` (phone) and
`channels/whatsappController.js` (WhatsApp) both call the exact same
`processTurn` and `recommend` functions in `livelihood/` that the web
assistant uses — there's a single interview engine and a single
recommendation engine behind all three.

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS, installable PWA (offline-capable via service worker)
- **Backend:** Node.js, Express, Sequelize, PostgreSQL
- **Voice (web):** Browser Web Speech API (speech-to-text and text-to-speech)
- **Voice (phone/WhatsApp):** Twilio Voice and WhatsApp APIs; optional OpenAI transcription for WhatsApp voice notes

## Project structure

```
backend/
  src/
    livelihood/     interview engine, extraction, recommendation, course
                     catalogue, demand data, vocab/keyword lists — the core
                     engine shared by every channel
    channels/        the phone (IVR) and WhatsApp bridges on top of that engine
    controllers/     route handlers, including the legacy scheme/lesson app
    models/          Sequelize models (User, LivelihoodSession, ChannelSession,
                     Scheme, Lesson, ...)
    routes/          Express routers
    middleware/      auth, officer-key check, Twilio signature verification
    seed/            sample schemes, lessons, and demo livelihood sessions
frontend/
  src/
    pages/           Assistant (voice interview), LivelihoodResults,
                     OfficerDashboard, plus the legacy Home/Lessons/Schemes pages
    components/      CourseCard, ProfileEditor, SchemeCard, ...
    hooks/           useVoice (Web Speech API wrapper), useSync, useOnlineStatus
    api/             axios client
```

## Setup

### 1. Clone the repository
```bash
git clone https://github.com/vaish1409/government-scheme.git
cd government-scheme
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
```
Edit `.env`:
- Set either `DATABASE_URL` or the `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, and `DB_PORT` PostgreSQL settings, plus a real `JWT_SECRET`.
- Set `OFFICER_KEY` to whatever you want the officer dashboard's access key to be.
- Leave the Twilio and `OPENAI_API_KEY` variables blank unless you're setting up the phone/WhatsApp channels (see below) — the web assistant, PWA, and legacy app all work without them.

```bash
npm run seed   # sample schemes, lessons, and demo livelihood sessions
npm run dev    # or: npm start
```
The API runs at `http://localhost:5000`.

### 3. Frontend
```bash
cd ../frontend
npm install
cp .env.example .env   # set VITE_API_URL if your backend isn't on localhost:5000
npm run dev
```
Open the URL Vite prints (usually `http://localhost:5173`) in a Chromium-based browser — the voice interview uses the Web Speech API, which Safari and Firefox don't fully support.

Key routes: `/assistant` (voice interview), `/results` (recommendations), `/officer` (dashboard, needs the `OFFICER_KEY`).

### 4. Phone (IVR) and WhatsApp channels — optional
These need a Twilio account and a public HTTPS URL (your deployed backend, or `ngrok` while testing locally):
1. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `PUBLIC_BASE_URL` in `backend/.env`.
2. In the Twilio console, point your phone number's "A call comes in" webhook to `{PUBLIC_BASE_URL}/api/channels/voice/incoming`.
3. Point your WhatsApp sender's webhook to `{PUBLIC_BASE_URL}/api/channels/whatsapp/incoming`.
4. Optionally set `OPENAI_API_KEY` so WhatsApp voice notes get transcribed — without it, the bridge asks the sender to type instead. Phone-call speech recognition doesn't need this key; Twilio transcribes call speech itself.

## API overview

**Livelihood assistant** (`/api/livelihood`) — public unless noted:
- `GET /meta` — languages, education levels, trades, etc. for the frontend
- `GET /catalog` — the course catalogue
- `POST /turn` — one step of the interview
- `POST /recommend` — ranked courses, skill gaps, and local opportunities for a completed profile
- `DELETE /sessions/:id` — a saved session deletes its own data
- `GET /dashboard`, `GET /sessions`, `PATCH /sessions/:id` — officer-only, sent with an `x-officer-key` header matching `OFFICER_KEY`

**Channels** (`/api/channels`) — Twilio webhooks only, not for direct use:
- `POST /voice/incoming`, `/voice/language`, `/voice/gather`, `/voice/consent`
- `POST /whatsapp/incoming`

**Health check** — `GET /health` returns the server status.

**Legacy app** — `/api/auth`, `/api/schemes`, `/api/lessons`, `/api/eligibility`, `/api/sync` (see [Legacy features](#legacy-features-still-in-the-repo)). The frontend still includes `/home`, `/lessons`, and `/profile`; there is no standalone `/schemes` page in the current router.

## Legacy features still in the repo

The project's first version was an offline-first PWA that teaches short
financial/health-literacy lessons and checks eligibility for government
welfare schemes (PM Kisan, PMMVY, Ayushman Bharat, and others), with an
offline-first sync design so progress made without a connection still
saves once the device reconnects. That code is untouched and still runs —
`/home`, `/lessons`, and `/profile` in the frontend, and the
`auth`, `scheme`, `lesson`, and `sync` routes in the backend — but it's a
separate feature set from the livelihood assistant described above, kept
in the same repo because they share a database and a rules engine.

## Known limitations

- Officer dashboard access is one shared key (`OFFICER_KEY`), not individual officer accounts.
- No automated placement follow-up: a counsellor sets status by hand.
- No kiosk auto-reset between users on a shared device.
- Course and demand data are illustrative, not sourced from live NSQF/NSDC or labour-market feeds.
- Voice support covers Hindi and English only.

# Saksham — Frontend (Offline-First PWA)

React + Vite PWA for the health/finance literacy + government scheme
eligibility project. Designed specifically for first-time smartphone
users and rural/low-connectivity contexts.

## Design decisions worth mentioning in an interview

- **Icon-led, minimal-text UI** — every primary action has a big icon plus a
  short label, not paragraphs of instructions
- **48px+ touch targets everywhere** — small buttons are the #1 usability
  failure on cheap touchscreens
- **Bilingual from day one** (English/Hindi) — `src/i18n/strings.js` is a
  flat dictionary; adding a third language is one new object, no code changes
- **Offline-first progress tracking** — lesson completion writes to
  IndexedDB instantly (`src/db/offlineStore.js`) using a client-generated
  UUID; the UI never waits on a network call. A background sync
  (`src/hooks/useSync.js`) pushes queued events to the backend the moment
  connectivity returns, and the backend dedupes on that same UUID.
- **Installable PWA** — `vite-plugin-pwa` generates a service worker that
  caches the lesson/scheme catalog and downloaded media so the app keeps
  working with zero connectivity, not just "slow" connectivity.

## Tech stack

React 18 · React Router · Tailwind CSS · Framer Motion (animations) ·
IndexedDB via `idb` · Axios · Vite PWA plugin

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_URL at your deployed backend
npm run dev
```

Visit `http://localhost:5173`.

## Building for production

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

The `dist/` folder is what you deploy (see deployment steps below).

## Deploying (Vercel — recommended, free)

1. Push this folder to GitHub (as its own repo, or a subfolder of a monorepo)
2. Go to vercel.com → **New Project** → import the repo
3. Framework preset: **Vite**
4. Add environment variable: `VITE_API_URL` = your deployed backend URL
5. Deploy — Vercel gives you a live `https://yourapp.vercel.app` URL

### Testing the offline behavior for a demo

1. Open the deployed app, log in, and open a lesson while online
2. Chrome DevTools → **Network tab** → set to **Offline**
3. Mark the lesson complete — notice it works instantly, no error
4. Set Network back to **Online** — watch the sync banner confirm the sync
5. This "online → offline → online" sequence is the best 60 seconds of any
   demo video for this project — lead with it

## Project structure

```
src/
  api/client.js           # axios wrapper for all backend calls
  db/offlineStore.js       # IndexedDB queue for offline progress events
  hooks/useSync.js         # auto-syncs queued events when back online
  hooks/useOnlineStatus.js
  context/AuthContext.jsx
  context/LanguageContext.jsx
  i18n/strings.js           # English + Hindi strings
  components/               # Button, cards, nav, sync banner
  pages/                     # one file per screen
```

## What I'd add next

- Add more languages (Kannada, Tamil, Bengali, Telugu)
- Voice narration for onboarding for fully non-literate users
- Downloadable lesson packs with visible storage-used indicator
- Push notifications (via a service worker) for new eligible schemes

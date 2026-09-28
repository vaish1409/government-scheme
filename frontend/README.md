# Saksham — Voice Livelihood Assistant (SIH26097)

An AI-assisted, voice-first assistant that helps Scheduled Caste beneficiaries under **PM-AJAY (GIA component)** find NSQF-aligned skill training, livelihood pathways and linked support, in Hindi or English, without filling forms.

## What it does
- **Voice interview** in Hindi or English (browser speech-to-text and text-to-speech, with a typed fallback). Covers the seven topics in the brief: education, family occupation, current livelihood, skills and interests, mobility and physical constraints, job vs. self-employment, local economy.
- **Structured profile** extracted from speech, shown back so the person or a counsellor can correct it.
- **Ranked NSQF courses** with a plain-language reason for every recommendation, a skill-gap view (what you have, what you will add, next level), the pathway (job or own work) and local demand.
- **PM-AJAY linkage**: linked schemes (skilling, NSFDC, PM Vishwakarma, PMEGP, MUDRA, Stand-Up India, DAY-NRLM) checked with the existing rules engine.
- **Counsellor confirms**: uncertain or sensitive cases are flagged; nothing is promised by the AI alone.
- **Officer dashboard**: demand by state, wanted vs. locally available trades, common skill gaps, and a post-recommendation funnel (enrolled, completed, placed, dropped).
- **Privacy**: guest mode, no audio stored, data saved only with explicit consent and deletable by the person.
- **Offline PWA** shell, cached catalogue and lessons. Speaking to the assistant needs internet (browser speech service).

## Honest limits of this prototype
- Course catalogue and state demand data are **sample data**. Real sources: Skill India Digital Hub / NSDC qualification packs, District Skill Development Plans, PLFS / NCS job data.
- Understanding is keyword-based (deterministic and explainable) for Hindi and English. Regional languages and dialects are a roadmap item (add keywords in `backend/src/livelihood/vocab.js`, or plug a speech/LLM service into `extract.js`).
- IVR and WhatsApp channels are planned: the `/api/livelihood/turn` endpoint is stateless and channel-agnostic, so a bridge can reuse it.
- Scheme rules are simplified; the counsellor confirms current terms.

## Tech Stack
- Frontend: React, Vite, Tailwind CSS, PWA, Web Speech API
- Backend: Node.js, Express, Sequelize, PostgreSQL

## Prerequisites
- Node.js 18+
- npm
- PostgreSQL database (or Neon/Postgres-compatible URL)

## Project Structure
- backend/ — Express API and database models
- frontend/ — React + Vite client app

## Setup

### 1) Clone the repository
```bash
git clone https://github.com/vaish1409/government-scheme.git
cd government-scheme
```

### 2) Backend setup
```bash
cd backend
npm install
cp .env.example .env
```
Update the backend .env file with your PostgreSQL connection string and JWT secret.

Run the backend:
```bash
npm run dev
```
The API will run at http://localhost:5000.

### 3) Frontend setup
```bash
cd ../frontend
npm install
cp .env.example .env
```
If needed, set the frontend API URL in the .env file:
```bash
VITE_API_URL=http://localhost:5000
```
Run the frontend:
```bash
npm run dev
```
The app will run at http://localhost:5173.

## Build
```bash
cd frontend
npm run build
```

## Notes
- Run `npm run seed` in `backend/` to load sample lessons and 150 demo interviews for the officer dashboard (flagged `isDemo`).
- Set `OFFICER_KEY` in `backend/.env`; open `/officer` in the app and enter it.
- The frontend is configured for local development with the backend running on port 5000.

# Saksham — Learn & Discover Schemes

Saksham is an offline-first mobile-friendly web app that helps users learn basic financial and health concepts, discover government schemes, and check scheme eligibility.

## Features
- User signup and login
- Scheme discovery and detail views
- Eligibility checker based on user profile
- Educational lessons with audio/video content
- Offline-friendly PWA experience

## Tech Stack
- Frontend: React, Vite, Tailwind CSS, PWA
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
- The backend seeds sample lessons and schemes on startup through the database sync and seed flow.
- The frontend is configured for local development with the backend running on port 5000.

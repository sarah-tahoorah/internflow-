# InternFlow

This repo contains a full-stack application with a Node.js/Express backend and a React frontend.

## Setup

### Root workspace install
1. Open a terminal in the repo root (`Internflow-main`).
2. Install dependencies for both apps:
   ```bash
   npm install
   ```
   This works because the repo now includes root-level `package.json` with npm workspaces for `backend` and `frontend`.

### Backend
1. Copy the example env file:
   ```bash
   copy backend\.env.example backend\.env
   ```
2. Edit `backend/.env` and set your values.
   - `MONGO_URI` should point to your MongoDB instance.
   - `JWT_SECRET` should be a secure random string.
   - `PORT` can remain `5000`.
   - `FRONTEND_URL` should be `http://localhost:3000` for local development.
3. Install backend dependencies if needed:
   ```bash
   npm --prefix backend install
   ```

### Frontend
1. Copy the example env file (optional):
   ```bash
   copy frontend\.env.example frontend\.env
   ```
2. Install frontend dependencies if needed:
   ```bash
   npm --prefix frontend install
   ```

## Running the app
From the repo root, start both backend and frontend together with one command:
```bash
npm run dev
```

If you only want the frontend or backend separately:
- Backend only: `npm run dev:backend`
- Frontend only: `npm run dev:frontend`

### Local URLs
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## Notes
- The frontend uses `http://localhost:5000/api` by default.
- If you deploy the backend elsewhere, update `frontend/.env` with `REACT_APP_API_URL`.
- Make sure MongoDB is running and accessible before starting the backend.

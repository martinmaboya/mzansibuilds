# Frontend (React)

This folder now contains the standalone React frontend for MzansiBuilds.

## Why this clears the confusion

- The frontend lives here: `frontend/`
- The backend lives here: `backend/`
- The older root Next.js files are separate and not required for running this React frontend.

## Run the full stack

1. Start backend:

```bash
cd backend
mvn spring-boot:run
```

2. Start frontend:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api/*` requests to `http://localhost:8085`.

The app also sends requests using an explicit backend base URL in code:

- Default: `http://localhost:8085`
- Override using `VITE_API_BASE_URL` in a `.env` file (see `.env.example`)

## Backend contract used by this React frontend

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me`
- `PATCH /api/me/profile`
- `GET /api/feed`
- `GET /api/celebration`
- `POST /api/projects`
- `GET /api/projects/{id}/updates`
- `GET /api/projects/{id}/comments`
- `GET /api/projects/{id}/collaboration-requests`
- `PATCH /api/projects/{id}/complete`
- `POST /api/projects/{id}/updates`
- `POST /api/projects/{id}/comments`
- `POST /api/projects/{id}/raise-hand`

Protected routes use JWT in `Authorization: Bearer <token>`.

## Environment option

If needed, you can override the API base with:

```bash
VITE_API_BASE_URL=http://localhost:8085
```

In normal local development this is not needed because Vite proxy is already configured.

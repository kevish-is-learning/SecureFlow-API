# SecureFlow API

A production-ready REST API and companion React client demonstrating:

- **JWT authentication** (`jsonwebtoken`) with bcrypt password hashing
- **Role-based access control** (`USER` / `ADMIN`)
- **Task CRUD** with per-role scoping
- **Zod** input validation and a centralized error handler
- **Swagger UI** at `/api/docs`
- **Winston** structured logging + Morgan request logging
- **Optional Redis** caching for list queries
- **Rate limiting**, **Helmet**, **CORS**, and **compression** out of the box
- **Prisma** + **PostgreSQL**
- **Docker Compose** for one-command bring-up
- A minimal **React (Vite)** frontend with Register / Login / Dashboard

```
SecureFlow-API/
├── backend/           # Node.js + Express + Prisma API
├── frontend/          # React (Vite) client
├── postman/           # Postman collection
├── docker-compose.yml # Postgres + Redis + API
└── README.md
```

---

## 1. Prerequisites

- Node.js **20+**
- npm **10+**
- Either: Docker Desktop (recommended) **or** a local PostgreSQL 14+

---

## 2. Quickstart (Docker — recommended)

```bash
# From the repo root
docker compose up -d --build
```

This starts:

- `postgres` on `:5432`
- `redis` on `:6379`
- `api` on `:4000` (migrations run automatically on boot)

Then seed demo accounts:

```bash
docker compose exec api node prisma/seed.js
```

- Swagger UI → http://localhost:4000/api/docs
- Health    → http://localhost:4000/api/v1/health

### Run the frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

---

## 3. Quickstart (local, no Docker)

### Backend

```bash
cd backend
cp .env.example .env         # edit DATABASE_URL if needed
npm install
npx prisma migrate dev       # creates tables
npm run db:seed              # optional demo data
npm run dev                  # http://localhost:4000
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                  # http://localhost:5173
```

---

## 4. Sample credentials (from seed)

| Role  | Email                    | Password     |
| ----- | ------------------------ | ------------ |
| ADMIN | `admin@secureflow.dev`   | `Admin@12345`|
| USER  | `user@secureflow.dev`    | `User@12345` |

> A `USER` sees and modifies **only** their own tasks. An `ADMIN` can see and modify **any** task and the list includes the task owner.

---

## 5. Environment variables (backend)

| Variable                 | Description                                  | Default                         |
| ------------------------ | -------------------------------------------- | ------------------------------- |
| `NODE_ENV`               | `development` \| `production` \| `test`      | `development`                   |
| `PORT`                   | HTTP port                                    | `4000`                          |
| `API_PREFIX`             | API route prefix                             | `/api/v1`                       |
| `DATABASE_URL`           | Postgres connection string                   | —                               |
| `JWT_SECRET`             | 16+ char secret for signing tokens           | —                               |
| `JWT_EXPIRES_IN`         | Token lifetime                               | `1d`                            |
| `BCRYPT_SALT_ROUNDS`     | bcrypt cost                                  | `10`                            |
| `CORS_ORIGIN`            | Allowed origin(s), comma separated, or `*`   | `*`                             |
| `REDIS_ENABLED`          | Enable Redis caching                         | `false`                         |
| `REDIS_URL`              | Redis connection string                      | `redis://localhost:6379`        |
| `CACHE_TTL_SECONDS`      | Cache TTL for list queries                   | `60`                            |
| `RATE_LIMIT_WINDOW_MS`   | Global rate limit window                     | `900000` (15 min)               |
| `RATE_LIMIT_MAX`         | Max requests per window                      | `200`                           |
| `LOG_LEVEL`              | Winston log level                            | `info`                          |

---

## 6. API endpoints

Base path: `/api/v1`

### Auth

| Method | Path             | Access  | Description                      |
| ------ | ---------------- | ------- | -------------------------------- |
| POST   | `/auth/register` | public  | Register a new user              |
| POST   | `/auth/login`    | public  | Exchange credentials for a JWT   |
| GET    | `/auth/me`       | JWT     | Return the authenticated user    |

### Tasks

| Method | Path          | Access      | Scope                                                 |
| ------ | ------------- | ----------- | ----------------------------------------------------- |
| GET    | `/tasks`      | JWT         | USER: own tasks · ADMIN: all tasks                    |
| GET    | `/tasks/:id`  | JWT         | Owner or ADMIN                                        |
| POST   | `/tasks`      | JWT         | Creates a task owned by the caller                    |
| PUT    | `/tasks/:id`  | JWT         | Owner or ADMIN                                        |
| DELETE | `/tasks/:id`  | JWT         | Owner or ADMIN                                        |

### Response envelope

All endpoints return:

```json
{
  "success": true,
  "data": { /* payload */ },
  "message": "Human readable message"
}
```

Errors use the same shape with `success: false` and a `details` field when validation fails.

---

## 7. Swagger / Postman

- **Swagger UI**: http://localhost:4000/api/docs (click "Authorize" and paste `Bearer <token>`).
- **OpenAPI JSON**: http://localhost:4000/api/docs.json
- **Postman**: import `postman/SecureFlow.postman_collection.json`. The **Register** and **Login** requests automatically populate the `token` collection variable via a test script — all other requests inherit the bearer auth.

---

## 8. Security highlights

- Passwords hashed with bcrypt (configurable rounds).
- JWTs signed with a required 16+ char `JWT_SECRET`; payload kept minimal (`{ id, role }`).
- Helmet sets secure HTTP headers.
- CORS locked down to `CORS_ORIGIN`.
- Body size capped at 1 MB.
- Zod validators reject unknown keys (`.strict()`) and sanitize whitespace / case.
- Stricter rate limit on `/auth/login` + `/auth/register` to deter brute force.
- Prisma parameterized queries — no raw SQL.
- Password field is stripped from every user payload returned by the API.
- Self-service `ADMIN` role registration is disabled; admins must be seeded or created by another admin.

---

## 9. Project structure

```
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
└── src/
    ├── config/        # env, prisma, logger, redis
    ├── controllers/   # thin HTTP layer
    ├── docs/          # Swagger spec
    ├── middleware/    # auth, validate, errorHandler, rateLimit
    ├── routes/        # /auth, /tasks, index
    ├── services/      # business logic
    ├── utils/         # ApiError, apiResponse, jwt, sanitize, asyncHandler
    ├── validators/    # Zod schemas
    ├── app.js         # express app composition
    └── server.js      # process entrypoint

frontend/
└── src/
    ├── components/    # Nav, TaskForm, TaskList, Toast, ProtectedRoute
    ├── context/       # AuthContext (JWT + localStorage)
    ├── lib/           # axios instance with interceptors
    ├── pages/         # Login, Register, Dashboard
    ├── App.jsx
    └── main.jsx
```

---

## 10. Scripts

### Backend (`backend/`)

```bash
npm run dev              # start with nodemon
npm start                # start without nodemon
npm run prisma:generate  # regenerate Prisma client
npm run prisma:migrate   # create & run dev migrations
npm run prisma:deploy    # apply migrations (production)
npm run prisma:studio    # open Prisma Studio
npm run db:seed          # populate demo users/tasks
```

### Frontend (`frontend/`)

```bash
npm run dev      # Vite dev server on :5173
npm run build    # production build
npm run preview  # preview the production build
```

---

## 11. Troubleshooting

- **`JWT_SECRET must be at least 16 characters`** — set a long secret in `backend/.env`.
- **`@prisma/client did not initialize yet`** — run `npm run prisma:generate` in `backend/`.
- **`P1001: Can't reach database server`** — ensure Postgres is running, `DATABASE_URL` is correct.
- **CORS errors in browser** — set `CORS_ORIGIN=http://localhost:5173` in `backend/.env` and restart.
- **Redis connection warnings** — they are safe to ignore when `REDIS_ENABLED=false`; caching is skipped.

---

## License

MIT — build cool things.

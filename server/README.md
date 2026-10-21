# @buildment/server

The Buildment API: Express 5 + TypeScript (ESM), Prisma 7 on PostgreSQL, Zod validation.

```
src/
├─ index.ts          process entry: connect DB, listen, graceful shutdown
├─ app.ts            Express app assembly (importable by tests)
├─ config/env.ts     every env var, validated once at boot
├─ routes/           URL → middleware chain → controller
│  ├─ v1/            first-party API (/api/v1) — { success, data } envelope
│  └─ integrations   public organisation API (/integrations/v1) — published contract
├─ validations/      Zod schemas for params / query / body, reused by services
├─ controllers/      thin: read validated input, call a service, send a response
├─ services/         all business logic and Prisma access, grouped by domain
├─ middlewares/      authenticate, requireOrganization, validate, rate limits, error handlers
├─ shared/           contract code both apps run: block schemas + graders, API wire types,
│                    enums, MDX block extraction, pure helpers (copied to frontend/src/shared)
├─ jobs/             in-process daily scheduler (inactivity nudges)
├─ utils/            errors (AppError family), responses (ok/created), logger
├─ types/            Express request augmentation, SessionUser, view models
└─ generated/prisma  Prisma client (generated, git-ignored)
tests/
├─ api/              supertest suites against a real Postgres
├─ scripts/          unit tests for the content scripts
└─ helpers/          fixtures that build and tear down their own course/org
scripts/             course import/validation/audit, demo seeds, stats backfill, sync-shared (tsx)
prisma/              schema, migrations, seed
Dockerfile           production image, self-contained (build from this folder)
Procfile             Heroku: release = migrate deploy, web = node dist/index.js
```

## Conventions

- **Flow:** route → `validate(...)` → controller → service. Controllers never touch Prisma.
- **Errors:** services throw `NotFoundError`, `ForbiddenError("...", "STABLE_CODE")`, etc. from
  `utils/errors`. The global handler turns them into `{ success: false, message, code, errors? }`.
  Express 5 forwards rejected promises, so no `catchAsync` wrappers.
- **Auth:** opaque session tokens in the `Session` table, accepted as `Authorization: Bearer` or
  the `authjs.session-token` cookie. `authenticate` rejects, `optionalAuth` only decorates.
- **Config:** import `env` from `config/env.ts`; never read `process.env` elsewhere.
- **Shared code:** `src/shared` is the single source of the code both apps run. After editing it,
  run `pnpm sync-shared` to refresh `frontend/src/shared` and commit both; CI runs
  `pnpm sync-shared:check`. Files there must stay free of Express, Prisma and React imports.
- **Authorization:** `requireInstructor` / `requireAdmin` gate the routers; course, thread and
  enrollment ownership is decided in `services/teach/access.ts` and nowhere else.
- **Jobs:** `jobs/scheduler.ts` runs each job at its UTC hour inside the process
  (`JOBS_ENABLED`, `INACTIVITY_NUDGE_HOUR_UTC`, `WEEKLY_GOAL_REMINDER_HOUR_UTC`);
  daily goal reminders require `AUTH_RESEND_KEY` and an explicit learner opt-in. `/api/v1/jobs/*` + `CRON_SECRET` exist for
  external schedulers and multi-replica deployments.

## Course images (Cloudflare R2)

Set `R2_ENDPOINT`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY` in the API environment. The endpoint is the account S3 endpoint, without the bucket suffix. Use an R2 S3 token scoped to the `buildment` bucket. Never put the secret in the frontend environment or source code.

Course creators can upload cover images in course settings and insert images from the chapter editor. JPEG, PNG, WebP, GIF, and AVIF files up to 8 MB are accepted. Uploads go through the authenticated API; the bucket can remain private, and browser CORS or an R2 public development URL are not required. Covers are served publicly through `/api/v1/media`, while chapter images are served only to course instructors, administrators, and learners with content access.

## Commands

| Command | |
|---|---|
| `pnpm dev` | `tsx watch` with pretty logs |
| `pnpm build` / `pnpm start` | compile to `dist/` and run it |
| `pnpm test` | unit + API tests (`DATABASE_URL`, or `TEST_DATABASE_URL`, must point at Postgres) |
| `pnpm typecheck` / `pnpm lint` | |
| `pnpm db:migrate` / `db:ready` / `db:seed` / `db:studio` | Prisma |
| `pnpm content:import` / `content:validate` / `content:validate:source` / `content:audit` | course content pipeline (`content/import/` → Postgres) |
| `pnpm db:seed:showcase` / `db:seed:integration` / `stats:backfill` | demo data and maintenance |
| `pnpm sync-shared` / `sync-shared:check` | copy `src/shared` into the web app / verify the copy is current |

## Docker

```bash
docker build -t buildment-api .                 # from this folder
docker run --rm --env-file .env buildment-api pnpm exec prisma migrate deploy
docker run -p 4000:4000 --env-file .env buildment-api
```

The image carries the compiled API, the Prisma schema and migrations, and the scripts, so
`pnpm db:seed` works inside the container too (the course import reads `content/` from a checkout).

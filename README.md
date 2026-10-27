# Buildment

An interactive, project-based learning platform. Mentors write MDX chapters with graded
checkpoints (quizzes, tests, must-reads, open questions, runnable code); mentees work through
them; progress and reports are computed server-side.

Full product/technical spec lives in [`docs/`](docs/README.mdx) — start there. Load-bearing
invariants (security, gating, grading) are spelled out in the topic docs linked from that map.

**Shipping the shareable demo:** follow [`docs/phases/demo-10-day.mdx`](docs/phases/demo-10-day.mdx)
(ten days: real progress, chapter locking, ask-mentor, UI consistency). We are **not** replacing
Postgres with Mongo — the LMS stays relational; Mongo is what the FreshMarket course teaches.

## Stack

Two independent apps, each with its own `package.json` and lockfile, deployable from its own
folder (Vercel root directory `frontend`, Heroku/Render/Fly from `server`). The split from the
original Next.js monolith is recorded in [`docs/phases/backend-split.mdx`](docs/phases/backend-split.mdx):

| Folder | What | Stack |
|---|---|---|
| `frontend/` | Web app, UI only — every read and write goes through the API | Next.js 16 (App Router) · TypeScript · Tailwind + shadcn/ui · Playwright |
| `server/` | API — owns Postgres, sessions, email, background jobs, content scripts, and the contract code in `src/shared` | Express 5 · TypeScript · Prisma 7 · Zod · Vitest + supertest |

The code both apps run (block schemas and graders, API wire types, enums, MDX block extraction,
pure helpers) lives in `server/src/shared`. The web app carries a committed copy in
`frontend/src/shared`; `pnpm sync-shared` refreshes it and CI fails when it is stale. There is no
workspace link between the two folders, which is what lets each deploy on its own.

Browser code calls same-origin `/api/v1/*`; Next.js proxies it to the API (`API_URL`). Pathment and
other tenants call `/integrations/v1/*` on the API host directly.

## Prerequisites

- Node.js 20.19+
- [pnpm](https://pnpm.io) 10
- Docker (for local Postgres) — or point `DATABASE_URL` at any Postgres instance instead

## Setup

```bash
pnpm install && pnpm install:all      # root: the `concurrently` helper; then server/ and frontend/
cp server/.env.example server/.env    # DATABASE_URL, APP_URL, email keys
cp frontend/.env.example frontend/.env # API_URL (the web app never talks to Postgres)
docker compose up -d                  # starts local Postgres on :5432
pnpm db:ready                         # migrate deploy + prisma generate (use after git pull)
pnpm db:seed                          # 1 admin, 1 mentor, 3 mentees, 1 course, 4 preview enrollments
pnpm content:import                   # sync FreshMarket chapters/blocks from courses/
pnpm dev                              # API on :4000, web on :3000
```

Run one side on its own with `pnpm --dir server dev` or `pnpm --dir frontend dev` — or `cd` into
the folder and treat it as a normal project; nothing outside it is needed.

### Email delivery (optional for local dev)

Sessions, sign-up, verification emails and magic links are all handled by the API. Set
`AUTH_RESEND_KEY`/`EMAIL_FROM` in `server/.env` (from [Resend](https://resend.com/api-keys)) to
send real email. Without a key the API logs the links instead and activates new accounts
immediately, so the whole flow stays testable offline.

### Local dev login (no email keys needed)

After seeding, the [login page](http://localhost:3000/login) lists a "dev only" sign-in link per
seeded user (mentor + 3 mentees). Clicking one hits `/api/v1/auth/dev-login?email=...` on the API, which mints a real
database session for that user — no email credentials required. This route 404s when
`NODE_ENV=production`, so it can never ship as a production auth bypass.

### AI review drafts (optional)

Mentors can ask OpenRouter to draft feedback for a pending open-question response. Configure the
credential on the server only; never use a `NEXT_PUBLIC_` prefix:

```bash
OPENROUTER_API_KEY=your-rotated-key
OPENROUTER_REVIEW_MODEL=google/gemini-2.5-flash # optional
```

The request is made only after the mentor clicks **Draft with AI**. The mentor sees and edits the
draft, then independently chooses the final verdict. See [`docs/05-review-queue.mdx`](docs/05-review-queue.mdx)
for the data-sharing boundary.

## Common commands

Run from the repo root unless noted.

| Command | What it does |
|---|---|
| `pnpm dev` | Start the API and the web app together |
| `pnpm build` | Build server, then frontend |
| `pnpm test` | Vitest in both apps (server suite needs Postgres) |
| `pnpm typecheck` / `pnpm lint` | Type-check / lint both apps |
| `pnpm sync-shared` | Refresh `frontend/src/shared` from `server/src/shared` after editing contract code |
| `pnpm db:migrate` | `prisma migrate dev` (server) |
| `pnpm db:seed` | Re-run the seed script (idempotent — upserts) |
| `pnpm db:studio` | Prisma Studio, a GUI for the local database |
| `pnpm content:import` | Import course content from `courses/` into the database |
| `pnpm content:validate` | Compile-check every stored chapter the way publish does (needs DB) |
| `pnpm --dir server content:validate:source` | Compile-check from `courses/` (no DB) |
| `pnpm --dir server content:audit` | Structural audit (gates, learning logs, STYLE heuristics) |
| `pnpm --dir server db:seed:showcase` | Add realistic, repeatable demo history after the course import |
| `pnpm --dir frontend exec playwright test` | Browser end-to-end suite (starts API + web itself; see `frontend/playwright.config.ts`) |

Content and seed scripts live in `server/scripts` next to the database they write.

## 15-minute demo (local)

After setup, import course content and start the app:

```bash
pnpm content:import   # FreshMarket course → Postgres
pnpm dev              # http://localhost:3000 (API on :4000)
```

1. **Mentee path** — dev-login as a mentee (e.g. `mentee1@example.com` from seed). Open **Dashboard → Continue** into module 1. Complete the **1.11 gate** (checklist + learning log — try the **mic** on a question). Submit the **2.7 quiz** (short answer supports dictation). On **3.10 gate**, submit the **ERD link** open question.
2. **Locking** — with `sequential` enabled (seed sets this), confirm module 2 stays locked until module 1 is complete.
3. **Ask mentor** — from any unlocked lesson, **Ask for help** in the reader header; reply as mentor at `/help`.
4. **Mentor path** — dev-login as mentor. **Mentees** tab → **Recalculate progress** if rollups look stale. **Review queue** shows open answers including submitted links.

Full day-by-day checklist: [`docs/phases/demo-10-day.mdx`](docs/phases/demo-10-day.mdx).

## Observability (optional)

Sentry and PostHog are both wired to no-op unless their env vars are set — see `frontend/.env.example`.
Nothing to configure for local development.

## Deploying

Each folder deploys on its own; nothing outside it is needed.

- **Web on Vercel:** import the repository, set Root Directory to `frontend`, keep the Next.js
  preset. Environment: `API_URL` (the API's public URL) and `APP_URL` (the Vercel URL). Browser
  traffic to `/api/v1/*` and `/integrations/v1/*` is proxied to the API server-side, so there is
  no CORS and the session cookie just works. Live notifications use Server-Sent Events through the
  same proxy, so nothing else is required; optionally set `NEXT_PUBLIC_REALTIME_URL` to the API's
  public URL (build time) to open the stream straight to the API instead.
- **API on Heroku:** deploy the full repository so `courses/` and `agent-ip/scripts/` reach
  the backend release. The root `Procfile` supports a root deployment; `server/Procfile`
  supports a monorepo buildpack with `APP_BASE=server` that retains sibling directories.
  The release phase runs `prisma migrate deploy` and then publishes opted-in courses using
  the existing `DATABASE_URL`. A server-only subtree deploy cannot publish courses.
  The `build` script generates the Prisma client and compiles. Config vars:
  `DATABASE_URL`, `APP_URL` (the web URL — used in email links),
  `CORS_ORIGINS`, the email and OpenRouter keys from `server/.env.example`, `CRON_SECRET`.
  Scheduled jobs (hourly study reminders, daily cleanup, and the daily weekly-goal and integrity
  jobs) run inside the process; set `JOBS_ENABLED=false` on every dyno but one, or hand the
  schedule to an external scheduler calling `POST /api/v1/jobs/*` (study reminders hourly). The
  notification email worker also runs in the process and is safe on every dyno. With more than
  one dyno, set the same `REALTIME_TOKEN_SECRET` everywhere — and see
  [`docs/12-notifications.mdx`](docs/12-notifications.mdx) for what live push needs across replicas.
- **Containers anywhere:** `docker build -f server/Dockerfile -t buildment-api .` and
  `docker build -t buildment-web frontend/` (Next.js standalone output);
  `docker compose --profile app up --build` runs Postgres, migrations and both apps locally.
- **CI** (`.github/workflows/ci.yml`): one job per app (typecheck, lint, tests against Postgres,
  production build), a check that `frontend/src/shared` matches `server/src/shared`, and on
  `main` both image builds.

## Project layout

See [`docs/07-architecture.mdx`](docs/07-architecture.mdx) for the full route/folder layout and
the reasoning behind each stack choice. See [`docs/11-decisions-and-open-questions.mdx`](docs/11-decisions-and-open-questions.mdx)
for a running log of decisions made along the way, including a few where the stack drifted from
the original spec (e.g. Next.js 16 instead of 15, Prisma 7's driver-adapter requirement).

# buildment

An interactive, project-based learning platform. Mentors write MDX chapters with graded
checkpoints (quizzes, tests, must-reads, open questions, runnable code); mentees work through
them; progress and reports are computed server-side.

Full product/technical spec lives in [`docs/`](docs/README.mdx) — start there. Load-bearing
invariants (security, gating, grading) are spelled out in the topic docs linked from that map.

**Shipping the shareable demo:** follow [`docs/phases/demo-10-day.mdx`](docs/phases/demo-10-day.mdx)
(ten days: real progress, chapter locking, ask-mentor, UI consistency). We are **not** replacing
Postgres with Mongo — the LMS stays relational; Mongo is what the FreshMarket course teaches.

## Stack

Two deployables plus a shared package — see [`docs/phases/backend-split.mdx`](docs/phases/backend-split.mdx)
for the migration status:

| Folder | What | Stack |
|---|---|---|
| `frontend/` | Web app | Next.js 16 (App Router) · TypeScript · Tailwind + shadcn/ui · Auth.js v5 (until Phase 2) |
| `server/` | API | Express 5 · TypeScript · Prisma 7 + PostgreSQL · Zod · Vitest + supertest |
| `shared/` | `@buildment/shared` | Block schemas + graders, domain enums, learning-log schema, mdx remark plugins |

Browser code calls same-origin `/api/v1/*`; Next.js proxies it to the API (`API_URL`). Pathment and
other tenants call `/integrations/v1/*` on the API host directly.

## Prerequisites

- Node.js 20.19+
- [pnpm](https://pnpm.io) 10
- Docker (for local Postgres) — or point `DATABASE_URL` at any Postgres instance instead

## Setup

```bash
pnpm install                          # installs all workspaces, builds shared/, generates Prisma clients
cp server/.env.example server/.env    # DATABASE_URL, APP_URL, email keys
cp frontend/.env.example frontend/.env # API_URL, AUTH_SECRET (see below), DATABASE_URL (transitional)
docker compose up -d                  # starts local Postgres on :5432
pnpm db:ready                         # migrate deploy + prisma generate (use after git pull)
pnpm db:seed                          # 1 admin, 1 mentor, 3 mentees, 1 course, 4 preview enrollments
pnpm --filter @buildment/frontend content:import   # sync FreshMarket chapters/blocks from content/import
pnpm dev                              # API on :4000, web on :3000, shared/ rebuilding on change
```

Run one side on its own with `pnpm --filter @buildment/server dev` or
`pnpm --filter @buildment/frontend dev`.

Generate `AUTH_SECRET`:

```bash
pnpm dlx auth secret
```

### Google OAuth / email magic link (optional for local dev)

`AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` (from the
[Google Cloud console](https://console.cloud.google.com/apis/credentials)) and
`AUTH_RESEND_KEY`/`EMAIL_FROM` (from [Resend](https://resend.com/api-keys)) are only needed if you
want to test real sign-in. Without them, use the dev login shortcut below.

### Local dev login (no OAuth/email keys needed)

After seeding, the [login page](http://localhost:3000/login) lists a "dev only" sign-in link per
seeded user (mentor + 3 mentees). Clicking one hits `/api/v1/auth/dev-login?email=...` on the API, which mints a real
database session for that user — no Google/Resend credentials required. This route 404s when
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
| `pnpm dev` | Start API, web app and the shared package watcher together |
| `pnpm build` | Build shared → server → frontend |
| `pnpm test` | Vitest in every workspace (server suite needs Postgres) |
| `pnpm typecheck` / `pnpm lint` | Type-check / lint every workspace |
| `pnpm db:migrate` | `prisma migrate dev` (server) |
| `pnpm db:seed` | Re-run the seed script (idempotent — upserts) |
| `pnpm db:studio` | Prisma Studio, a GUI for the local database |
| `pnpm --filter @buildment/frontend db:seed:showcase` | Add realistic, repeatable demo history after the course import |
| `pnpm --filter @buildment/frontend content:import` | Import course content from `content/import/` into the database |
| `pnpm --filter @buildment/frontend content:validate` | Compile-check every chapter's MDX (needs DB) |
| `pnpm --filter @buildment/frontend content:validate:source` | Compile-check from `content/import/` (no DB) |
| `pnpm --filter @buildment/frontend content:audit` | Structural audit (gates, learning logs, STYLE heuristics) |

The content scripts still live in `frontend/scripts` and move to the server in the last phase of the
backend split.

## 15-minute demo (local)

After setup, import course content and start the app:

```bash
pnpm --filter @buildment/frontend content:import   # FreshMarket course → Postgres (351 chapters)
pnpm dev                                           # http://localhost:3000 (API on :4000)
```

1. **Mentee path** — dev-login as a mentee (e.g. `mentee1@example.com` from seed). Open **Dashboard → Continue** into module 1. Complete the **1.11 gate** (checklist + learning log — try the **mic** on a question). Submit the **2.7 quiz** (short answer supports dictation). On **3.10 gate**, submit the **ERD link** open question.
2. **Locking** — with `sequential` enabled (seed sets this), confirm module 2 stays locked until module 1 is complete.
3. **Ask mentor** — from any unlocked lesson, **Ask for help** in the reader header; reply as mentor at `/help`.
4. **Mentor path** — dev-login as mentor. **Mentees** tab → **Recalculate progress** if rollups look stale. **Review queue** shows open answers including submitted links.

Full day-by-day checklist: [`docs/phases/demo-10-day.mdx`](docs/phases/demo-10-day.mdx).

## Observability (optional)

Sentry and PostHog are both wired to no-op unless their env vars are set — see `frontend/.env.example`.
Nothing to configure for local development.

## Project layout

See [`docs/07-architecture.mdx`](docs/07-architecture.mdx) for the full route/folder layout and
the reasoning behind each stack choice. See [`docs/11-decisions-and-open-questions.mdx`](docs/11-decisions-and-open-questions.mdx)
for a running log of decisions made along the way, including a few where the stack drifted from
the original spec (e.g. Next.js 16 instead of 15, Prisma 7's driver-adapter requirement).

# buildment

An interactive, project-based learning platform. Mentors write MDX chapters with graded
checkpoints (quizzes, tests, must-reads, open questions, runnable code); mentees work through
them; progress and reports are computed server-side.

Full product/technical spec lives in [`docs/`](docs/README.mdx) — start there, or read
[`AGENTS.md`](AGENTS.md) for the load-bearing invariants if you're working on this with an AI
coding agent.

**Shipping the shareable demo:** follow [`docs/phases/demo-10-day.mdx`](docs/phases/demo-10-day.mdx)
(ten days: real progress, chapter locking, ask-mentor, UI consistency). We are **not** replacing
Postgres with Mongo — the LMS stays relational; Mongo is what the FreshMarket course teaches.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS + shadcn/ui (Base UI) · Prisma 7 + PostgreSQL
· Auth.js v5 · Vitest.

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io)
- Docker (for local Postgres) — or point `DATABASE_URL` at any Postgres instance instead

## Setup

```bash
pnpm install
cp .env.example .env        # then fill in AUTH_SECRET at minimum — see below
docker compose up -d        # starts local Postgres on :5432
pnpm db:ready               # migrate deploy + prisma generate (use after git pull)
pnpm db:seed                # creates 1 mentor, 3 mentees, 1 course, 3 enrollments
pnpm content:import         # sync FreshMarket chapters/blocks from content/import
pnpm dev                    # http://localhost:3000 (predev runs prisma generate)
```

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
seeded user (mentor + 3 mentees). Clicking one hits `/api/dev-login?email=...`, which mints a real
database session for that user — no Google/Resend credentials required. This route 404s when
`NODE_ENV=production`, so it can never ship as a production auth bypass.

## Common commands

| Command | What it does |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest unit tests |
| `pnpm db:migrate` | `prisma migrate dev` |
| `pnpm db:seed` | Re-run the seed script (idempotent — upserts) |
| `pnpm db:studio` | Prisma Studio, a GUI for the local database |
| `pnpm content:import` | Import course content from `content/import/` into the database |
| `pnpm content:validate` | Compile-check every chapter's MDX (needs DB) |
| `pnpm content:validate:source` | Compile-check from `content/import/` (no DB) |
| `pnpm content:audit` | Structural audit (gates, learning logs, STYLE heuristics) |

## 15-minute demo (local)

After setup, import course content and start the app:

```bash
pnpm content:import    # FreshMarket course → Postgres (351 chapters)
pnpm dev               # http://localhost:3000
```

1. **Mentee path** — dev-login as a mentee (e.g. `mentee1@example.com` from seed). Open **Dashboard → Continue** into module 1. Complete the **1.11 gate** (checklist + learning log — try the **mic** on a question). Submit the **2.7 quiz** (short answer supports dictation). On **3.10 gate**, submit the **ERD link** open question.
2. **Locking** — with `sequential` enabled (seed sets this), confirm module 2 stays locked until module 1 is complete.
3. **Ask mentor** — from any unlocked lesson, **Ask for help** in the reader header; reply as mentor at `/help`.
4. **Mentor path** — dev-login as mentor. **Mentees** tab → **Recalculate progress** if rollups look stale. **Review queue** shows open answers including submitted links.

Full day-by-day checklist: [`docs/phases/demo-10-day.mdx`](docs/phases/demo-10-day.mdx).

## Observability (optional)

Sentry and PostHog are both wired to no-op unless their env vars are set — see `.env.example`.
Nothing to configure for local development.

## Project layout

See [`docs/07-architecture.mdx`](docs/07-architecture.mdx) for the full route/folder layout and
the reasoning behind each stack choice. See [`docs/11-decisions-and-open-questions.mdx`](docs/11-decisions-and-open-questions.mdx)
for a running log of decisions made along the way, including a few where the stack drifted from
the original spec (e.g. Next.js 16 instead of 15, Prisma 7's driver-adapter requirement).

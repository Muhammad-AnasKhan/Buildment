# buildment — agent entrypoint

**buildment** is an interactive, project-based learning platform. A mentor writes a course in
MDX, drops in interactive blocks (quizzes, tests, must-reads, open questions, runnable code),
assigns it to mentees, and gets a live dashboard of who understood what.

If you are an LLM agent (or a human) picking up work on this repo, **start here**, then go to
[`docs/README.mdx`](docs/README.mdx) for the full documentation map. Do not try to hold the whole
product spec in context at once — the docs are deliberately split by topic and by build phase so
you only need to load 2-4 files for any given task.

## Load-bearing invariants — never violate these

These are structural decisions, not preferences. If a task seems to require breaking one of them,
stop and flag it instead of working around it.

1. **`Block.config` (correct answers, rubrics, hidden tests, sample answers) never reaches the
   client.** It lives server-side only. The client gets a sanitized projection. This is enforced
   by `mdx/sanitize.ts` and must be covered by a test that fails if a `correct`, `rubric`,
   `sampleAnswer`, or `hiddenTests` key ever appears in a client-bound payload. See
   [`docs/09-security.mdx`](docs/09-security.mdx).
2. **Grading for `Quiz`/`Test` is server-side only.** Client-reported results are only trusted for
   `CodeBlock` checks, and that trust boundary is explicitly labeled as such in reports — never
   silently treated as authoritative. See [`docs/03-blocks-registry.mdx`](docs/03-blocks-registry.mdx).
3. **Gating is enforced server-side**, on the data loader, not just hidden in the UI. A locked
   chapter returns 403 from its loader. See [`docs/04-progress-and-gating.mdx`](docs/04-progress-and-gating.mdx).
4. **One block type = one registry entry.** Adding a 7th block type means touching exactly one
   entry in `src/blocks/registry.ts` plus its own folder (`schema`, `grade`, `Component`,
   `report`, editor descriptor) — never a switch statement scattered across the codebase. See
   [`docs/03-blocks-registry.mdx`](docs/03-blocks-registry.mdx).
5. **`Response` rows are append-only.** Never mutate or delete a response to "fix" progress;
   write a new attempt and recompute denormalized rollups in the same transaction. See
   [`docs/04-progress-and-gating.mdx`](docs/04-progress-and-gating.mdx).
6. **Authorization is centralized** in `server/auth/guards.ts` — no ad-hoc per-route checks.
   Mentors only touch their own courses; mentees only touch courses they're enrolled in.
7. **Reports read only denormalized tables**, never heavy aggregate queries on the read path. If a
   report needs new data, add it to `ChapterProgress`/`Enrollment` and recompute in
   `recomputeProgress()`, don't query `Response` directly from a report route.

## Current stack decisions (see [`docs/07-architecture.mdx`](docs/07-architecture.mdx) for full rationale)

- Next.js 15 (App Router, TS strict, RSC by default), Postgres + Prisma, Auth.js v5, Tailwind + shadcn/ui.
- Content editor: **MDXEditor** (Lexical-based) with per-block-type JSX descriptors + `diffSourcePlugin`
  for a rich/source toggle — not a bare CodeMirror + preview split.
- Code runner (v1): **Pyodide** (Python) + **Sandpack** (JS/TS) — not WebContainers (commercial
  licensing risk for production use). Runner is swappable later without touching the block contract.
- MDX rendering: `next-mdx-remote-client` (the maintained successor to the archived `next-mdx-remote`).

## How to work in this repo

1. Read [`docs/README.mdx`](docs/README.mdx) for the doc map.
2. Find your current phase in `docs/phases/` (M0 through M7) and read that file — it lists exactly
   which topic docs it depends on.
3. Read only those linked topic docs, not the whole `docs/` folder.
4. If you make a decision that changes something in `docs/07-architecture.mdx`,
   `docs/08-data-model.mdx`, or resolves an item in `docs/11-decisions-and-open-questions.mdx`,
   update that doc in the same change — these docs must stay the source of truth, not this file.
5. `docs/08-data-model.mdx` mirrors `prisma/schema.prisma`. Once the schema file exists, treat the
   schema file as canonical and keep the doc in sync when you change it, not the other way around.

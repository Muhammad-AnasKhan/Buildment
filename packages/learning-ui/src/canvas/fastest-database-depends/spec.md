---
artifact: canvas-spec
course: build-with-ai (v2)
chapter: 6.3
slug: fastest-database-depends
version: 2
owner: interaction-designer
---

# Canvas spec: The fast database depends on the job

## Teaching claim
There is no fastest database. The job (small saves with transactions, totals over many rows, a heavy write stream), who writes, the setup (inside the app or on a server) and the size of the data decide which kind fits, and each is the wrong tool for the opposite job.

## Why a canvas
A table of "if A then X" is read and forgotten. Changing one fact and watching the answer move shows that the question "which is fastest?" was missing its context.

## Model
Data for the shared context picker (`models/context-picker.ts`, factory `makeContextPickerCanvas`). First rule that matches wins; `checkContextConfig` reports no problems; every option is reached.

- Factors: The job (Shop orders, Totals, Event stream); Who writes (One program, Many at once); Setup (Inside the app, Own server); Data size (Small, Very large).
- Options: SQLite (one file), PostgreSQL (row store), DuckDB (columns, in-app), ClickHouse (column store), LSM store (write-optimised).
- Start: Shop orders, One program, Inside the app, Small (SQLite).

| Rule | When | Pick | Dossier ids behind it |
|---|---|---|---|
| 0 | orders, one writer, inside the app | SQLite | B52, B53: one writer at a time, same host only, fits low writer concurrency |
| 1 | orders (any other mix) | PostgreSQL | B45 (row store), B53 (many writers or networked clients suggest client and server) |
| 2 | totals, small table, inside the app | SQLite | The course's reading of B44 (column stores help when a query adds up many rows; no row count is given), B53; the reason says "measure" |
| 3 | totals, small table, on a server | PostgreSQL | The same reading; the reason says "measure" |
| 4 | totals, very large table, inside the app | DuckDB | B47: analytics, runs in the host process |
| 5 | totals, very large table, on a server | ClickHouse | B44, B46: column store, speed grows with cores (vendor docs) |
| 6 | event stream | LSM store | B48, B49: cheap writes, costlier reads, background merging |
| fallback | none (never reached) | PostgreSQL | The course's safe start: measure on your own data |

All 24 combinations: orders+one+app (small or very large) SQLite; every other orders mix PostgreSQL; totals+small+app SQLite; totals+small+server PostgreSQL; totals+very large+app DuckDB; totals+very large+server ClickHouse; every stream combination LSM store. Who writes has no effect on totals and streams, because the sources say nothing about it there. The fallback is not reached.

- Claims on purpose left out: "ClickHouse is faster than PostgreSQL" (different jobs), any benchmark ranking (B55 is one benchmark for one kind of query, B56 measures different jobs), "LSM is faster than B-trees" (it is a trade), and any row count where a column store pays (not in the sources).
- Assumptions: the rules are the course's reading of project docs checked 2026-10-25.
- Limitations: real choices have more facts; stated in `limits`.

## Rendering
The shared `ContextPicker` primitive: question chip, four factors as pills, five option cards, a ring and "Fits" pill on the pick, a banner with the reason (every reason is 79 characters or fewer). Choices are at most 14 characters, factors at most 18.

## Controls
Pills for each factor and "Reset". Nothing else.

## Copy
- What this shows: the kind of database that fits the facts, with the reason.
- Try this: 1. Change The job to Totals and keep the table small. 2. Change Data size to Very large. 3. Back on Shop orders, change Who writes to Many at once. 4. Choose Event stream.
- What changed: the ring moves and the reason changes.
- Limits of the model: see `limits`.

## Edge cases
Five option cards with two-line labels fit (checked by the picker's own layout, rendered in a test). Four factors fit within the maximum.

## Accessibility
Each pill is a button (`aria-pressed`, keyboard reachable, visible focus ring) named "Factor: Choice". The figure announces the best fit and the reason in an `aria-live="polite"` line. The ring moves with a short transition that is off under `prefers-reduced-motion`.

## Acceptance criteria
- [x] The claim is testable (different jobs and sizes give different picks).
- [x] The model is tested (`checkContextConfig` clean; all 24 combinations resolve as listed).
- [x] The design is simple and legible (four factors, five options).
- [ ] Prediction before, transfer check after (chapter 6.3: predict before the canvas, two quiz items after).
- [x] Reader fallback exists (the table above, repeated in the chapter's fold).

## Placement
Course 13 v2, chapter 6.3 "The fastest database depends", beat 2 ("Pick the job, the writers and the setup"). Data: `fastest-database-depends/data.ts` (`FASTEST_DATABASE_DEPENDS`, `fastestDatabaseDepends`). The orchestrator registers the slug.

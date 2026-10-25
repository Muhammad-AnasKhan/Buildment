---
artifact: canvas-spec
course: build-with-ai (v2)
chapter: 6.3
slug: fastest-database-depends
version: 1
owner: interaction-designer
---

# Canvas spec: The fast database depends on the job

## Teaching claim
There is no fastest database. The job (small saves with transactions, totals over many rows, a heavy write stream), who writes and the setup (inside the app or on a server) decide which kind fits, and each is the wrong tool for the opposite job.

## Why a canvas
A table of "if A then X" is read and forgotten. Changing one fact and watching the answer move shows that the question "which is fastest?" was missing its context.

## Model
Data for the shared context picker (`models/context-picker.ts`, factory `makeContextPickerCanvas`). First rule that matches wins; `checkContextConfig` reports no problems; every option is reached.

- Factors: The job (Shop orders, Big totals, Event stream); Who writes (One program, Many at once); Setup (Inside the app, Own server).
- Options: SQLite (one file), PostgreSQL (row store), DuckDB (columns, in-app), ClickHouse (column store), LSM store (write-optimised).
- Start: Shop orders, One program, Inside the app (SQLite).

| Rule | When | Pick | Dossier ids behind it |
|---|---|---|---|
| 0 | orders, one writer, inside the app | SQLite | B52, B53: one writer at a time, same host only, fits low writer concurrency |
| 1 | orders (any other mix) | PostgreSQL | B45 (row store), B53 (many writers or networked clients suggest client and server) |
| 2 | totals, inside the app | DuckDB | B47: analytics, runs in the host process |
| 3 | totals, on a server | ClickHouse | B44, B46: column store, speed grows with cores (vendor docs) |
| 4 | event stream | LSM store | B48, B49: cheap writes, costlier reads, background merging |
| fallback | none (never reached) | PostgreSQL | The course's safe start: measure on your own data |

All 12 combinations: orders+one+app SQLite; orders+one+server, orders+many+app, orders+many+server PostgreSQL; totals+one+app and totals+many+app DuckDB; totals+one+server and totals+many+server ClickHouse; every stream combination LSM store. For totals the sources say nothing about many writers, so the picker ignores that fact there. The fallback is not reached by any of the 12 combinations.

- Claims on purpose left out: "ClickHouse is faster than PostgreSQL" (different jobs), any benchmark ranking (B55 is one benchmark for one kind of query, B56 measures different jobs), "LSM is faster than B-trees" (it is a trade).
- Assumptions: the rules are the course's reading of project docs checked 2026-10-25.
- Limitations: real choices have more facts; stated in `limits`.

## Rendering
The shared `ContextPicker` primitive: question chip, three factors as pills, five option cards, a ring and "Fits" pill on the pick, a banner with the reason (every reason is 77 characters or fewer). Labels checked: choices at most 14 characters, factors at most 18, options at most 14.

## Controls
Pills for each factor and "Reset". Nothing else.

## Copy
- What this shows: the kind of database that fits the facts, with the reason.
- Try this: 1. Change The job to Big totals. 2. Back on Shop orders, change Who writes to Many at once. 3. Choose Event stream.
- What changed: the ring moves and the reason changes.
- Limits of the model: see `limits`.

## Edge cases
Five option cards with two-line labels fit (checked by the picker's own layout). Setting Who writes has no effect on totals and streams, by design. The fallback line is never shown for these facts.

## Accessibility
Each pill is a button (`aria-pressed`, keyboard reachable, visible focus ring) named "Factor: Choice". The figure announces the best fit and the reason in an `aria-live="polite"` line. The ring moves with a short transition that is off under `prefers-reduced-motion`.

## Acceptance criteria
- [x] The claim is testable (different jobs give different picks).
- [x] The model is tested (`checkContextConfig` clean; all 12 combinations resolve as listed).
- [x] The design is simple and legible (three factors, five options).
- [ ] Prediction before, transfer check after (chapter 6.3: predict before the canvas, two quiz items after).
- [x] Reader fallback exists (the table above, repeated in the chapter's fold).

## Placement
Course 13 v2, chapter 6.3 "The fastest database depends", beat 2 ("Pick the job, the writers and the setup"). Data: `fastest-database-depends/data.ts` (`FASTEST_DATABASE_DEPENDS`, `fastestDatabaseDepends`). The orchestrator registers the slug.

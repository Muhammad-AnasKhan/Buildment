# Course content improvement loop — state

Last updated: 2026-09-23 (iteration 10 — interaction consistency + commerce reliability)

## Course

Multi-Vendor Food Marketplace — `content/import/multi-vendor-marketplace/`

## Iteration 10 — 2026-09-23

**Course-wide interaction consistency:**

- Replaced generic Predict prompts with lesson-specific, exactly-two-option decisions and immediate-feedback explanations.
- Replaced 17 reserved quiz chapters with importer-valid knowledge checks; Predict blocks remain in teaching chapters, not quizzes.
- Removed stale instructions telling learners to skip quiz placeholders.
- Documented the interaction taxonomy in `content/import/STYLE.md`.

**Content depth and technical correctness:**

- Reworked modules 19–23 around payment integrity, order-state ownership, cache correctness, durable queues, and deploy/recovery evidence.
- Reworked module 24 to use atomic inventory counters and transactions so concurrent checkout cannot oversell stock.
- Reworked module 25 around deterministic minor-unit discounts, one redemption per checkout, immutable snapshots, and abuse controls.
- Improved progression, accessibility expectations, failure states, concurrency tests, and mentor-verifiable evidence throughout these modules.

**Importer and audit guardrails:**

- Import no longer invents Open Questions from prose headings or appends synthetic lesson checkpoints.
- Added regression tests proving ordinary lessons and Reflect sections remain prose unless an author explicitly adds a block.
- Structural audit now validates Predict and Quiz fences and rejects placeholder quizzes and generic Predict prompts.

**Validation:** source validation 379/379; structural audit 0 errors; importer regression tests, TypeScript, scoped ESLint, and whitespace checks passed.

**Next iteration should:**

1. Deep content pass on modules 09–13, then 14–18.
2. Resolve remaining long-table audit warnings by moving prose out of cells.
3. Redesign the learner-facing chapter navigation, answer controls, quiz presentation, and Predict instant-feedback UI as a separate application-UI pass.

## Iteration 9 — 2026-09-22 (Waves 0–5 program)

**Platform (demo):**

- Open Question: optional `allowSpeechInput`, `allowUrl`, URL in payload; Web Speech on textarea
- Learning log: mic on every question; copy mentions platform persistence
- Chapter error UI: retry, continue API, ask mentor
- Module gate banner in reader when `Chapter.isMilestone`
- Mentor **Recalculate progress** on mentees table
- `content/import/STYLE.md`, `pnpm content:audit`, `scripts/content-dedupe-scene-openers.ts`

**Wave 0 (modules 01–03):**

- Added `01.11-checklist.md` (introduction gate)
- Prose: deduped `01.04-scope.md`; fixed `02.07-quiz.md` persistence copy
- `03.10-checklist.md`: ERD link `openquestion` block with URL + speech
- `02.07`: short quiz q3 enables speech

**Wave 1 (modules 04–08):**

- `04.01-set-the-scene.md`: removed redundant bridge section (STYLE paragraph-first)
- Remaining 04–08: validated via `pnpm content:validate:source` (351 chapters OK); use audit warnings as backlog

**Waves 2–5 (modules 09–23 + closing):**

- Catalog compiles clean; structural audit warns on long table cells and env checklist (intentional sub-gate)
- Continue one module per loop iteration using `STYLE.md` — priority order 09→13, 14→18, 19→23, 99

**Validation:** `pnpm content:validate:source` — 351 chapters OK; `pnpm content:audit` — 0 errors on demo modules 01–03

**Next iteration should:**

1. Module 05 — deepen prime-your-thinking + data model build cluster prose
2. Module 06–08 — auth narrative bridges
3. Fix audit warnings in modules 21–22 table cells (move prose above tables)
4. Optional: learning log URL field per-question (phase 2)

### Prior iterations (8 and earlier)

See git history and sections below for iterations 1–8 (modules 10–20 build clusters, checklists, etc.).

## Backlog

- Role-filtered Open Question prompts (post-demo)
- Full prose pass on modules 09–23 (ongoing waves)
- `23.08-production-env-checklist.md` — keep as Check step, not full gate (document in STYLE)

# Course content improvement loop — state

Last updated: 2026-09-22 (iteration 9 — demo + full-course program kickoff)

## Course

Multi-Vendor Food Marketplace — `content/import/multi-vendor-marketplace/`

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

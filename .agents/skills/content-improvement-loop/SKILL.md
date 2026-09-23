---
name: content-improvement-loop
description: >-
  Run one iteration of the course content improvement loop for the Multi-Vendor
  Food Marketplace curriculum. Use when the user says /loop, asks to improve course
  content, or wants the next curriculum improvement iteration.
---

# Course content improvement loop

**Scope:** Course content only — `content/import/multi-vendor-marketplace/`. Do not change the LMS, mentor panels, or teacher tools. Do not change the project itself; improve how it is taught.

**Output target:** Edit `content/import/` (source of truth). Run `pnpm content:import` only if the user asks to sync the database.

## Before each iteration

1. Read `.cursor/loop/content-improvement-state.md` for progress and the current focus module.
2. Skim pedagogy from respected platforms (Epic Web interleaved practice, Frontend Masters learning paths, Full Stack Open problem-first sequencing) — apply structure ideas, never copy content.
3. Pick **one module or a tight cluster** (e.g. fix all cross-refs in a chapter, or deepen one weak lesson). Do not scatter edits across the whole course in one pass.

## Quality bar (every edit)

- **Context before implementation** — why this exists, what problem it solves, production relevance.
- **No sudden jumps** — bridge from previous chapter; prerequisites explicit.
- **Strong transitions** — end with the next problem; next lesson opens by solving it.
- **Reduced cognitive load** — short sections, checkpoints, callouts, common mistakes.
- **Explain the why** — not just what to type.
- **Consistent difficulty** — gradual ramp; no unexplained jargon.
- **Plain English** — professional but beginner-friendly.

Each module should include where appropriate: learning objectives, why it matters, real-world motivation, architecture notes, common mistakes, production notes, reflection questions, checkpoints, summary, what's next.

## Iteration workflow

1. **Diagnose** — read set-the-scene, recap, and 2–3 implementation lessons in the target module; note gaps, wrong cross-refs, missing bridges, walls of text.
2. **Improve** — focused edits in `content/import/`; match existing frontmatter and MDX component conventions (`Callout`, `ChapterRecap`, etc.).
3. **Validate** — `pnpm content:validate` if you touched many files or block syntax.
4. **Update state** — append to `.cursor/loop/content-improvement-state.md`: date, module, changes, next focus.

## Module order (suggested)

Modules 01–02 are baseline quality. Prioritize 03 onward where quality drops:

| Priority | Modules | Typical issues |
|---|---|---|
| High | 21–23 | Cross-chapter numbering drift, production topics without enough context |
| Medium | 06–08, 14–16 | Auth/catalogue jumps, weak prime-your-thinking bridges |
| Ongoing | 03–05, 09–13, 17–20 | Transitions, checklist gates, implementation lesson tone |

## Research (lightweight, each session)

- Epic Web: interleaved practice, problem/solution exercises, workshop structure.
- Frontend Masters: learning paths, gradual full-stack depth.
- Full Stack Open / Odin Project: project-continuous narrative, explicit prerequisites.

Use research to improve sequencing and pedagogy only.

## After finishing

Summarize for the user: what module was improved, concrete changes, and what the next iteration should target. Do not commit unless asked.

## Course UI preview images (Stitch MCP)

When a lesson needs a Stitch PNG in `public/showcase/multi-vendor-marketplace/`, call the **Stitch MCP** tools directly (`generate_screen` → `get_screen_image`). Full workflow: `.cursor/rules/stitch-mcp.mdc`. Do not run the legacy generate scripts.

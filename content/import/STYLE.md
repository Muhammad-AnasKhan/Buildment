# FreshMarket course — authoring style (import source)

Edit files under `content/import/multi-vendor-marketplace/` only. Run `pnpm content:validate:source` after bulk edits.

## Voice and tone

- Professional, beginner-friendly plain English.
- Explain **why** before **what to type**.
- FreshMarket examples beat abstract definitions.

## Paragraph-first

- Open each section with 2–4 sentences of prose.
- Use bullets as scannable summaries after explanation, not as the primary teaching surface.
- Avoid duplicate paragraphs (say it once, well).

## Tables

- Use tables for comparisons and inventories, not long explanations in cells.
- Keep cell text under ~120 characters; move detail above the table.
- One idea per row when possible.

## Lesson skeleton

1. Hook (problem or scenario)
2. Concept
3. FreshMarket example
4. Common mistake (optional callout)
5. Explicit “what you’ll do next” / bridge to the following lesson

## Module spine

| Piece | Filename pattern | Notes |
|-------|------------------|--------|
| Set the scene | `*.01-set-the-scene.md` | Objectives, why this module |
| Lessons | `*.NN-*.md` | Read / build / check |
| Mid-module quiz | `*-quiz.md` | When concepts need a check before build |
| Gate | `*-checklist.md`, `stepType: Gate` | Checklist + learning log |
| Recap | `*-recap-and-whats-next.md` | Last lesson or dedicated recap |

Module 01 includes `01.11-checklist.md` (introduction gate). Module 99-closing is reflection-only.

## Gate lessons (canonical layout)

Follow `03-why-mongodb/03.10-checklist.md`:

- `## Chapter N checklist` with task list under a gate heading
- `## Learning log` with numbered questions
- `## All boxes ticked?` with completion instructions
- `<ChapterRecap />` and **Next:** line

Import normalizes embedded `### Learning log` sections via `normalizeGateLearningLog`.

## Interactive honesty

- Every checklist item must be verifiable by the learner.
- Learning log questions should match what the platform persists (ticks + saved answers).
- Open questions and quizzes must not reference “browser-only” storage.
- Author every interaction intentionally. The importer does not add a fallback question to lessons
  that have no interactive block.
- Use `Predict` for a quick, optional two-choice decision immediately before the explanation it
  prepares. It is not a quiz substitute and does not belong in quiz chapters.
- Use a quiz for auto-graded concept checks with plausible distractors and useful explanations.
- Use the learning log for private, autosaved reflection. A prose `## Reflect` section stays prose
  unless the author explicitly chooses a learning-log component.
- Use `OpenQuestion` only when the answer is worth submitting or reviewing, such as an architecture
  defense, project evidence, or a substantial written explanation. Never use it as generic
  “what was your takeaway?” filler.

## MDX components

Use existing components (`BigWordAlert`, `Callout`, `ChapterRecap`, `InterestingRead`, etc.) consistently. Gate/quiz focus chapters strip optional enrichment on import — do not rely on those in checklist files.

## Code in lessons

Teach with **syntax-highlighted fenced code**, `FileTree` / `TerminalBlock`, and `Steps` — not in-browser `CodeExercise` labs (removed from import).

## Inline predict

Add a ` ```predict``` ` block in a `*-prime-your-thinking.md` lesson or before a major build
decision only when a concrete prediction improves the lesson. Every Predict has exactly two
options, one valid `correctOptionId`, and a concise explanation. The options must be specific to
the current FreshMarket decision; do not reuse a generic prompt across modules.

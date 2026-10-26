---
artifact: canvas-spec
course: build-with-ai
chapter: 06.03-say-when-ai-helped
slug: disclose-ai-help
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Before you publish: say when AI helped

## Teaching claim
Before you publish, list what AI did, write an AI-use line with three parts (the tool, what it did, what you checked), check the rules of the place where you post, then publish; "all my own work" is refused when it is not true, and a mistake found later is corrected in the open.

## Why a canvas
Honesty about AI help feels like a single yes or no. The canvas turns it into a short path of checks in a fixed order, with one claim the path refuses. Stepping through it, the learner meets the tempting "all my own work" at the moment Hani meets it, after he has written every word, which a static list cannot stage.

## Model
- Inputs: none beyond the shared step controls.
- Outputs: the highlighted state, the active edge, the step note and chips.
- Rule: six states in a snake (Draft ready, AI help listed, AI line written on row 0; Rules checked, Published, Corrected on row 1); five transitions and one rejected loop ("all my own" on AI line written); seven steps.
- Fixed data (from chapter 10.3): Gemini wrote the first version of the low-stock check, which Hani rewrote and tested; it explained one error and suggested the title; the AI-use line is the one quoted in the chapter; LinkedIn makes the author responsible and DEV offers an AI-Assisted mark (checked 2026-10-24); the shop owner allows the shop's name but not its numbers; the correction line on the first post is the one quoted in the chapter.
- Assumptions: one post, two platforms, one person's AI help that he can list in full.
- Limitations: platform rules change; universities, clients and employers can have stricter rules.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 columns by 2 rows, a snake (left to right on row 0, back right to left on row 1), so the narrow layout fits 340px.
- Edge labels are at most 12 characters. The edge between two states in the same column ("ok", from AI line written to Rules checked) has 2 characters, because on phones it becomes horizontal with only about 22px between pills.
- One rejected loop only ("all my own"), on AI line written, so loop labels cannot overlap.
- Static fallback: chapter 10.3 tells the same steps in prose (Hani's list, his line, the rules, the correction) before and after the canvas.

## Controls
Shared stepper controls only. No numeric inputs: the claim is about order and honesty, not quantities.

## Visualisation
Six labelled pills, five arrows and one rejected loop. Tone: bad on the refused "all my own work" step (outcome "refused"), good on the published post (outcome "honest") and on the open correction (outcome "corrected openly"), each with a text badge.

## Copy
- What this shows: the checks between a finished draft and an honest post.
- Try this: 1. Go to step 3 and read why "all my own work" is refused (this answers the chapter's predict without repeating it). 2. At step 4, say the line's three parts from memory.
- What changed: each step note says what Hani did at that state and why.
- Limits of the model: as in `limits`.

## Edge cases
Step 3 revisits AI line written through the rejected loop; the state does not change. Step 7 lights Corrected with no active edge. State names are at most 15 characters and subs at most 18.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole path for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (two quiz items after the canvas: choose the honest and complete AI-use line, and what to do before publishing on a platform with a label rule and a screenshot with customer data).
- [x] The model is tested (registry consistency and label-fit tests, once registered).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose in 6.3).

## Placement
Chapter 10.3, after the worked example and its diagram (the predict sits earlier, right after the opening story), and before the section "The rules where you post".

## Build plan
`packages/learning-ui/src/canvas/disclose-ai-help/data.ts`, export `discloseAiHelp`, to be registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.

---
artifact: canvas-spec
course: faith-and-resilience
chapter: 03.02-what-sabr-is
slug: sabr-keeps-moving
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Sabr keeps moving

## Teaching claim
Sabr is steadiness at the first shock that keeps acting; grief and asking for help are part of it, giving up is not.

## Why a canvas
The chapter says it in prose, but the misunderstanding it corrects ("sabr means silence") is a picture of one quiet road. Stepping through Mariam's days lets the learner see tears, words, help and a small step on the same road, see a sad day loop back into steadiness, and then see the calm-looking road of giving up beside it. A single static diagram cannot show the loop and the order together.

## Model
- Inputs: none beyond the step controls (Back, Next, Play, step chips).
- Outputs: the highlighted state, the active edge, the step note and chips.
- Rule: six states. A path First shock, Right words, Ask for help, A small step; a loop A small step, Sad day again, Right words; a branch First shock, Give up. Eight steps, the last revisiting A small step as the summary.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: one person, one loss, the first days after it. Every source in the notes is from the course dossier (Sahih al-Bukhari 1283, 1303, 1469; Quran 2:153).
- Limitations: grief is not a straight line; the map simplifies it. It does not measure faith or patience.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 columns by 2 rows. Row 0: First shock, Right words, Ask for help. Row 1: Give up, Sad day again, A small step.
- Edges between states in the same column ("so", "and", "or") have labels of three characters or fewer, because they become short sideways arrows on a phone. No diagonal edges.
- Static fallback: chapter 3.2 teaches the same road in prose and in a mermaid diagram, and the worked example walks through each step.

## Controls
Shared stepper controls only. No numeric inputs: the claim is about what sabr includes, not about amounts.

## Visualisation
Six labelled pills and six arrows. Tone: good on the small step and the summary, warn on the returning sad day, bad on giving up, each with a text outcome badge.

## Copy
- What this shows: Mariam's first days after a scholarship rejection, and which road is sabr.
- Try this:
  1. At step 6, check the prediction: can patience grow in a person who keeps trying?
  2. Compare step 4 with step 7: both look calm; what would differ in a week?
- What changed: each step note says what Mariam did and the source behind it.
- Limits of the model: as in `limits`.

## Edge cases
Step 1 has no edge; step 8 revisits a state with no edge, and the renderer shows the state with no active arrow. State names are 15 characters or fewer. No Arabic script in the canvas; "inna lillahi" appears only in Latin letters.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole map for screen readers; tone always has a text badge.

## Acceptance criteria
- [ ] The claim is testable (the quiz after the canvas asks which step fits sabr in a new case).
- [ ] The model is tested (registry consistency and label-fit tests, once registered).
- [ ] The design is simple and legible.
- [ ] Prediction before, transfer check after.
- [ ] Reader fallback exists (prose and mermaid in 3.2).

## Build plan
`frontend/src/canvas/sabr-keeps-moving/data.ts` (export `sabrKeepsMoving`), to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.

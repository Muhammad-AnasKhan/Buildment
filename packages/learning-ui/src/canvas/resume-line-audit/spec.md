---
artifact: canvas-spec
course: founder-interviews
chapter: 03.04-the-resume-line-audit
slug: resume-line-audit
version: 2
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: The five checks on Karam's resume lines

## Teaching claim
Every resume line passes five checks in order (what I did, why, what happened, how I know, what I would change); a line that fails a check is rewritten, not defended, and a line that passes is kept.

## Why a canvas
The chapter gives the five checks as a list. Stepping through them on a real line shows the order, shows which checks fail and why, and ends with a rewrite and with a line that needs no change, which a list cannot show side by side.

## Model
- Inputs: none beyond the step controls.
- Outputs: the highlighted check, the active edge, the step note and chips.
- Rule: six states (five checks and a verdict) in a snake; five edges labelled by how the check went ("fails" after checks 1 and 4, "ok" after checks 2, 3 and 5); eight steps. Step 1 shows the line, steps 2 to 6 run the checks on Karam's checkout line (fail, pass, pass, fail, pass; check 3 passes because Karam can say the result, and check 4 asks whether he can show it), step 7 shows the rewrite, step 8 shows a second line that passes all five and is kept.
- Assumptions: Karam's facts as in chapters 3.1 and 3.3; the second line's numbers (7 support emails the month before, 0 the month after, from the support inbox) are stated in the chapter.
- Limitations: the checks find lines you cannot defend; they do not rank lines.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 columns by 2 rows, a snake. The edge between two states in the same column uses a label of 3 characters or fewer (here "ok", on a passing check).
- Static fallback: the five checks and the Karam audit are written out in prose in 3.4.

## Controls
Shared stepper controls only.

## Visualisation
Six pills. Tone bad on failed checks, good on passed checks and on the verdict, each with a text badge.

## Copy
- What this shows: five checks run in order on one resume line.
- Try this: 1. Guess the first failing check before step 2. 2. Say the rewrite aloud at step 7 and ask if every word survives a why.
- What changed: each step note says the answer and whether the check passes.
- Limits of the model: as in `limits`.

## Edge cases
Steps 2 and 8 revisit a state without an edge. State names are 17 characters or fewer; the step 1 chip is long and wraps on a phone.

## Accessibility
Shared stepper keyboard support; `summary` gives the whole audit for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (the quiz after the canvas asks which check a new line fails).
- [x] Label fit is covered by the registry test once registered.
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (the audit is in prose in 3.4).

## Build plan
`packages/learning-ui/src/canvas/resume-line-audit/data.ts`; registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`.

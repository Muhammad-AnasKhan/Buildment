---
artifact: canvas-spec
course: build-with-ai
chapter: 02.02-before-you-paste
slug: before-you-paste
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Before you paste: Mahmoud's club job

## Teaching claim
Before anything goes into an AI tool, a short check decides what may go in: keys and passwords never; anything a stranger should not read is made safe (names, numbers and keys replaced with made-up ones) or not pasted; then you send, and you check the answer before you use it.

## Why a canvas
The chapter states the rule and works through Nada's three tasks in prose. Stepping through Mahmoud's job shows the two refusals as moves the check will not make, so the learner sees that the state does not change until the text is made safe, and that the safe path still gets the AI's help.

## Model
- Inputs: none beyond the step controls (Back, Next, Play, step chips).
- Outputs: the highlighted state, the active edge, the step note and chips.
- Rule: four states in a fixed order (Key check, Stranger test, Sent, Checked); three transitions ("no keys", "made safe", "run"); two rejected loops ("paste a key" on Key check, "client file" on Stranger test). Seven steps; step 5 revisits Stranger test with no edge to show the "do not paste" choice.
- Assumptions: one freelance job; the AI needs only the shape of the data to help; checking happens on a copy on the freelancer's own laptop.
- Limitations: some data is public but sensitive; some clients agree in writing; tool settings and rules change; a test on a copy finds many problems, not all.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: row 0 holds Key check (col 0), Stranger test (col 1) and Sent (col 2); row 1 holds only Checked (col 2). The two rejected loops sit on row 0 states whose row 1 cell is empty, so in the narrow layout each loop label has clear space beside it and does not cover another state.
- The only same-column edge (Sent to Checked) is labelled "run", three characters, because on phones it becomes a horizontal edge with about 22px between the pills.
- No diagonal edges.
- Static fallback: chapter 2.2 teaches the five things that never go in, the stranger test and the three output checks in prose, and works through Nada's tasks before the canvas.

## Controls
Shared stepper controls only. No numeric inputs: the claim is about order and refusals, not quantities.

## Visualisation
Four labelled pills, three solid arrows and two dashed rejected loops. Tone: bad on the two refusals, warn on the "do not paste" step, good on the safe send and the check, each with a text outcome badge.

## Copy
- What this shows: `purpose` in `data.ts`.
- Try this: 1. The first line matches the chapter's predict (can Mahmoud still use an AI tool for this job?). 2. At step 5, think of a job that needs real data and what Mahmoud would do.
- What changed: each step note says what was asked, whether it was refused, and why.
- Limits of the model: `limits` in `data.ts`.

## Edge cases
Steps 2, 4 and 5 keep the state unchanged (two rejected loops and one step with no edge). State names are 13 characters or fewer; subs are 15 or fewer. Edge labels are 11 characters or fewer.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole flow for screen readers; every tone has a text badge.

## Acceptance criteria
- [x] The claim is testable (the quiz after the canvas transfers it to Anas's order sheet, and a second item to checking a formula and a link).
- [x] The model is tested (registry consistency and label-fit tests, once registered).
- [x] The design is simple and legible (four states, no diagonals).
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose in 2.2).

## Placement
In "Mahmoud's next job", right after the predict and before "Check what comes back".

## Build plan
`frontend/src/canvas/before-you-paste/data.ts` exporting `beforeYouPaste`; to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.

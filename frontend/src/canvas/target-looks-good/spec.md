---
artifact: canvas-spec
course: cause-and-effect
chapter: 07.03-incentives-and-targets
slug: target-looks-good
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: A target that looks good while the work gets worse

## Teaching claim
When a reward is attached to one number, people take the quickest way to move that number, so the number can improve while the real work gets worse. A target with more than one measure, including one that the shortcut makes worse, is harder to push.

## Why a canvas
The claim is about who does what, and in what order: the reward goes down to the agents, the shortcut goes out to the clinics, the good number goes up to the manager, and the bad news comes back by another path. Three lanes show the two paths side by side, which a table of before and after numbers does not.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow between lanes, the step note, chips and outcome badge.
- Rule: three lanes (Manager, Agents, Clinics); seven steps: target, shortcut, good number, reopened tickets, falling rating, new target, better help.
- Assumptions: the numbers of chapter 7.3 (40 to 14 hours; 10 to 78 reopened a week; 200 to 260 tickets a week; rating 4.4 to 3.6; after two months 22 hours, about 6 in 100 reopened, rating 4.5).
- Limitations: one team, one target, a few months; the numbers belong to the example.

## Rendering
- Primary: the shared sequence renderer. Arrow labels are 18 characters or fewer.
- Static fallback: chapter 7.3 tells the case in prose and gives the numbers in a table after the canvas.

## Controls
Shared stepper controls only.

## Visualisation
Good on the falling time to close (the number looks good), bad on reopened tickets and the falling rating, good on the improved help, each with a text badge.

## Copy
- What this shows: a target and its reward moving through a team, and two paths of feedback.
- Try this: 1. Before step 4, predict what happens to the number of tickets each week (matches the chapter's predict). 2. At step 3, which other number would have shown the manager the problem?
- What changed: each note gives the before and after number.
- Limits of the model: as in `limits`.

## Edge cases
Arrows run both ways between the same lanes; the renderer draws each step's arrow on its own row.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole flow; every tone has a text badge.

## Acceptance criteria
- [x] The claim is testable (the chapter's quiz asks which conclusion a hotel desk's facts support).
- [x] The model is tested (registry consistency and label-fit tests).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose and table in 7.3).

## Build plan
`frontend/src/canvas/target-looks-good/data.ts`, to be registered by the orchestrator in `registry.ts` and `slugs.ts`; covered by the registry test; preview at `/workspace/canvases`.

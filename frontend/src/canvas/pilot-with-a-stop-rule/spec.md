---
artifact: canvas-spec
course: cause-and-effect
chapter: 07.04-side-effects
slug: pilot-with-a-stop-rule
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: A small pilot with a stop rule

## Teaching claim
Writing the watch measures and a stop rule before a small pilot lets a side effect show up early and decides what to do about it, even when the goal measure looks good.

## Why a canvas
The order is the lesson: the watch list comes first, the good news comes before the bad news, and the stop rule acts after both. Stepping through makes the learner see the goal met at step 3 and still face a crossed line at step 6.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow, note, chips and outcome badge.
- Rule: three lanes (Yara, Customers, Delivery); seven steps: watch list, offer, goal met, returns sent, returns counted, stop rule checked, plan changed.
- Assumptions: the numbers of chapter 7.4 (average order 95 to 112 shekels; returns 3 in 60, then 10 in 66; stop rule above 10 in 100; 8 of the 10 returns were coasters).
- Limitations: a two-week pilot with about 60 orders is a hint, and a before-and-after comparison can move back toward normal on its own; the limits text says how to make it fairer.

## Rendering
- Primary: the shared sequence renderer. Arrow labels are 18 characters or fewer. Steps 1 and 6 are loops inside Yara's lane.
- Static fallback: chapter 7.4 tells the pilot step by step in prose and gives the numbers in a table.

## Controls
Shared stepper controls only.

## Visualisation
Good on the goal met and the second pilot, bad on the returns, warn on the counted returns and the crossed line, each with a text badge.

## Copy
- What this shows: a pilot run in the order the chapter teaches.
- Try this: 1. Before step 3, predict whether the average order really rises (matches the chapter's predict). 2. At step 6, what would Yara have decided with no stop rule?
- What changed: each note gives the number and what it means for the decision.
- Limits of the model: as in `limits`.

## Edge cases
Two steps are loops within one lane; the renderer draws them as self-arrows.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole flow; every tone has a text badge.

## Acceptance criteria
- [x] The claim is testable (the chapter's quiz asks which pilot plan follows the method, on a school canteen).
- [x] The model is tested (registry consistency and label-fit tests).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose and table in 7.4).

## Build plan
`frontend/src/canvas/pilot-with-a-stop-rule/data.ts`, to be registered by the orchestrator in `registry.ts` and `slugs.ts`; covered by the registry test; preview at `/workspace/canvases`.

---
artifact: canvas-spec
course: cause-and-effect
chapter: 03.02-change-one-thing
slug: one-change-price-weeks
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Did the price cut bring Sami's clients?

## Teaching claim
A fair test changes one thing and holds the rest still. If the changed thing really caused the result, taking it away should take the result away. When the 60-dollar weeks look like the 45-dollar weeks, the price was not the cause.

## Why a canvas
The chapter gives six weekly results and two totals. Stepping through the weeks one at a time lets the learner watch for the fall back to the old quiet weeks that would appear if the price were the cause, and see that it never comes. A table shows the same numbers all at once and hides the moment of checking.

## Model
- Inputs: none beyond the step controls (Back, Next, Play, step chips).
- Outputs: the active arrow, the step note, the outcome badge and chips.
- Rule: three lanes (Sami, Profile, Clients); nine steps: hold the rest still, six alternating weeks (60, 45, 60, 45, 60, 45 dollars), add up, decide.
- Data (from chapter 3.2): enquiries 7, 7, 6, 8, 7, 6; logo clients 3, 3, 2, 3, 3, 3; 60-dollar weeks 20 enquiries, 8 clients, 480 dollars; 45-dollar weeks 21 enquiries, 9 clients, 405 dollars; one referral in week 4.
- Assumptions: the held items stay still; each client orders one logo.
- Limitations: six weeks is small; alternating spreads slow changes but does not remove them; the photo and portfolio are not tested.

## Rendering
- Primary: the shared sequence renderer, narrow layout below `sm`.
- Arrow labels are at most 13 characters ("week 1 at 60").
- Static fallback: chapter 3.2 gives the same weeks and totals in prose under "What Sami found".

## Controls
Shared stepper controls only. The claim is about order and comparison, not about inputs.

## Copy
- What this shows: the purpose line in `data.ts`.
- Try this: in `data.ts`; the first line matches the chapter's predict (what the 60-dollar weeks should look like if the price were the cause).
- What changed: each step note gives that week's numbers; the add-up step states the comparison.
- Limits of the model: in `data.ts` (`limits`).

## Edge cases
"Add it up" is a loop on Sami's lane. Week 4 uses the warn tone with a text badge ("noted") for the referral.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole test for screen readers; every tone has a text badge.

## Acceptance criteria
- [x] The claim is testable (the chapter's quizzes transfer it to new cases: Rasha's photos, Tamer's cooling pad).
- [x] Numbers match chapter 3.2 exactly.
- [x] Prediction before, prose "what it showed" after.
- [x] Reader fallback exists.

## Placement
In "Worked example: Sami tests his price", after the predict and before "What Sami found".

---
artifact: canvas-spec
course: cause-and-effect
chapter: 03.04-small-experiments
slug: stop-early-banner-test
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Should Nadine stop on Wednesday?

## Teaching claim
Early counts in a small test swing with luck. Stopping the first time one version is ahead often picks a lucky winner. Deciding the end of the test in advance, and keeping to it, gives a smaller, true answer.

## Why a canvas
The chapter tells the start (9 to 4) and the end (66 to 61). Stepping day by day and week by week shows the lead shrinking and even swinging to the other banner in week 3. That is the moment a learner understands why the end date is fixed first.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow, running totals in the label, the note, outcome badges.
- Rule: three lanes (Nadine, Banner A, Banner B); nine steps: plan, Monday, Tuesday, Wednesday, end of weeks 1 to 4, read the result. The arrow comes from the banner that is ahead.
- Data: running orders B 3 and A 1, B 6 and A 2, B 9 and A 4 (Wednesday, from the chapter), B 18 and A 15, B 33 and A 31, A 47 and B 46, B 66 and A 61 (end, from the chapter); about 2,100 visitors per banner; about 3 orders per 100 visitors each.
- Assumptions: the intermediate weekly totals are one illustrative run, consistent with about 2 orders a day per banner; the chapter prose states them.
- Limitations: one run only; the canvas is about when to stop, not how many visitors a test needs.

## Rendering
- Primary: the shared sequence renderer, narrow layout below `sm`.
- Arrow labels at most 18 characters ("Week 1: B 18, A 15").
- Static fallback: chapter 3.4 gives the start, the weekly swing and the end in prose under "What happened after Wednesday".

## Controls
Shared stepper controls only.

## Copy
- What this shows: the purpose line in `data.ts`.
- Try this: the first line matches the chapter's predict (stop on Wednesday or not).
- What changed: each step note gives the running totals and what moved.
- Limits of the model: in `data.ts`.

## Edge cases
Two loop steps on Nadine's lane (plan, read it). Wednesday and week 3 use the warn tone with text badges.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` for screen readers; text badges with every tone.

## Acceptance criteria
- [x] The claim is testable (quizzes after: Tamim's eight numbers, Maha's four-day test).
- [x] Numbers match chapter 3.4 exactly.
- [x] Prediction before, prose after.
- [x] Reader fallback exists.

## Placement
After the predict at the end of "Worked example: Nadine's banner test", at the start of "What happened after Wednesday".

---
artifact: canvas-spec
course: cause-and-effect
chapter: 05.04-split-the-problem-in-half
slug: halving-booking-chain
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Split in half: where do Hadi's bookings go?

## Teaching claim
In a chain where each step feeds the next, a test in the middle of what is left rules out half of it, whichever way the answer goes: 8 steps need at most 3 tests, where one step at a time could need up to 7. A fix counts only when a test confirms it.

## Why a canvas
The shrinking set of suspects is the lesson. Stepping through lets the learner say how many steps are still under suspicion before each note confirms it.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow, step note, outcome badge (steps left) and chips.
- Rule: four lanes (Hadi, Booking sheet, Email, Phone) grouping the 8 steps; seven steps: write the chain, three tests in the middle of what is left, the fix, the check, the count.
- Assumptions: one broken step; each test gives a clear answer.
- Limitations: causes that act together, a middle that cannot be tested safely, faults that come and go.

## Rendering
The shared sequence renderer, narrow layout below `sm`; arrow labels at most 18 characters; good on cleared steps and the confirmed fix, warn on tests that narrow toward the fault, each with a text badge.

## Copy
- What this shows: each test in the middle halves what is left.
- Try this: 1. Before step 2, predict how much one look at the sheet clears (the chapter's predict). 2. Count the suspects after each test.
- What changed: the outcome badge names how many steps are left.
- Limits of the model: as in `limits`.

## Edge cases
Loop steps on Hadi's lane (write the chain, count the tests) carry no tone. No long labels.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole search for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quiz after the canvas: the first test in a new chain of a school bus timetable).
- [x] The model is tested (registry consistency and label-fit tests).
- [x] Facts match chapter 5.4 exactly (8 steps, since Sunday, three bookings, spam folder, test booking twice).
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (chapter 5.4 tells the same tests in prose).

## Build plan
`packages/learning-ui/src/canvas/halving-booking-chain/data.ts` (export `halvingBookingChain`), registered by the orchestrator.

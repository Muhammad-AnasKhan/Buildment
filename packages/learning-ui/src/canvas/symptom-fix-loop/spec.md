---
artifact: canvas-spec
course: cause-and-effect
chapter: 04.02-symptoms-and-root-causes
slug: symptom-fix-loop
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Why do the late deliveries keep coming back?

## Teaching claim
Fixes aimed at what you can see (a symptom) bring a better week and then the same problem, because nothing underneath changed. Checking the chain with evidence finds a link the rest of the chain depends on, which is where a lasting fix can reach.

## Why a canvas
The loop is the lesson: the path reaches "Late again" twice, once for each quick fix, before the learner checks the chain. Stepping round the loop makes the repetition felt. The static chain diagram kept in the chapter shows where the fixes were aimed; it cannot show the problem returning twice.

## Model
- Inputs: none beyond the step controls.
- Outputs: the highlighted state, the active edge, the step note, outcome badges.
- Rule: six states on a 3 by 2 grid, a snake (row 0 left to right, row 1 right to left): Deliveries late, Symptom fix, A better week, Late again, Check the chain, Bags late. Five edges. Eight steps; step 5 revisits "Symptom fix" for the second quick fix (no edge), step 6 revisits "Late again".
- Data (chapter 4.2 and the five-whys-chain canvas): late on 11 of 20 delivery days, promised by 14:00; riding faster saves about ten minutes on a round of about an hour; free bread about 75 shekels in 20 delivery days; Hani leaves after 13:00; packing ends at about 12:45 (three mornings).
- Limitations: the bottom link is not yet the root cause; chapter 4.3 digs further.

## Rendering
- Primary: the shared state-machine renderer.
- The only same-column edge ("but", from A better week down to Late again) has a three-character label. No diagonals.
- Static fallback: chapter 4.2 tells the fixes and the checks in prose (steps 1 to 5 of the worked example).

## Controls
Shared stepper controls only.

## Copy
- What this shows: the purpose line in `data.ts`.
- Try this: the first line matches the chapter's predict (is "Hani leaves after 13:00" the root cause).
- What changed: each step note.
- Limits of the model: in `data.ts`.

## Edge cases
Steps 5 and 6 revisit states; step 5 has no active edge. Tones: bad on the "Late again" steps, good on the last step, each with a text badge.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` for screen readers; text badges with every tone.

## Acceptance criteria
- [x] The claim is testable (quizzes after: Joud's file sizes, Malek's egg round).
- [x] Facts match chapter 4.2 and the five-whys-chain canvas.
- [x] Prediction before, prose after.
- [x] Grid and labels follow the state machine layout rules (checked with the registry test's geometry checks).

## Placement
In "Worked example: sorting Amal's list", right after the predict in step 2.

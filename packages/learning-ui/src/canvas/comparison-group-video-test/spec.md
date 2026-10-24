---
artifact: canvas-spec
course: cause-and-effect
chapter: 03.03-compare-with-a-control
slug: comparison-group-video-test
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Does a video note win Sami more replies?

## Teaching claim
A result means something only next to what would have happened anyway. A comparison group chosen by chance, in the same weeks, shows that background. Picking groups by hand lets a hidden factor (a good fit) decide the result.

## Why a canvas
The before-and-after story and the comparison story use the same numbers but say different things. Stepping from last month, through the hand-picking trap, to the coin and the two groups lets the learner see the background reply rate appear before the video group's result, which a single table flattens.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow, the note, outcome badge and chips.
- Rule: four lanes (Sami, Coin, Video, No video); eight steps: last month, hand-picking (bad tone), coin, heads 21, tails 19, no-video replies, video replies, compare.
- Data (from chapter 3.3): last month 4 of 20 replied; 21 heads and 19 tails; 9 of 21 and 5 of 19 replied; about three more replies per 20 proposals.
- Assumptions: everything else stays the same in both groups.
- Limitations: 40 proposals is small; the one-reply rise in the background is only a hint.

## Rendering
- Primary: the shared sequence renderer, narrow layout below `sm`.
- Arrow labels at most 15 characters.
- Static fallback: chapter 3.3 tells the same test in prose under "Worked example" and "Reading the result".

## Controls
Shared stepper controls only.

## Copy
- What this shows: the purpose line in `data.ts`.
- Try this: the first line matches the chapter's predict (hand-picking with a video that does nothing).
- What changed: each step note.
- Limits of the model: in `data.ts`.

## Edge cases
Two loop steps on Sami's lane (last month, compare). The hand-picking step is a "what if" and uses the bad tone with the text badge "unfair".

## Accessibility
Shared stepper keyboard support and focus ring; `summary` for screen readers; text badges with every tone.

## Acceptance criteria
- [x] The claim is testable (quizzes after: Batoul's practice exam, Yusra's discount card).
- [x] Numbers match chapter 3.3 exactly.
- [x] Prediction before, prose after.
- [x] Reader fallback exists.

## Placement
In "Worked example: does a video note win more replies?", right after the predict in step 3, before the paragraph on why the choice must not be left to Sami.

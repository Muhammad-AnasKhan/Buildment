---
artifact: canvas-spec
course: building-habits
chapter: 06.03-study-and-focused-work
slug: dina-study-block
version: 1
owner: interaction-designer
renderer: sequence (4 actors, 9 steps)
---

# Canvas spec: Dina's study block: start, interruption, return

## Teaching claim
A start signal, the phone in another room and the next step written down protect a focused study block; an interruption is handled with a quick note and a return, not by abandoning the block.

## Why a canvas
The order matters: signal, phone away, next step, work, interruption, note, help, return, next step. Stepping through it shows where each protection acts, and the interruption arriving from another lane (her mother) shows that interruptions are part of the day, not a failure.

## Model
- Inputs: none beyond the step controls.
- Lanes: Dina, Phone (kitchen shelf), Notebook (next step), Mother (next room).
- Rule: 12:40 start signal (close laptop, glass of water, same seat); phone to the kitchen; read yesterday's next step (lesson 12, exercise 3); 15 minutes of work; 12:55 her mother calls; quick note "stopped at question 6"; help for about 5 minutes; return; block ends 13:15 instead of 13:10; write tomorrow's next step (question 7, page 40 aloud).
- Assumptions: one short interruption.
- Limitations: some days bring many interruptions; then the smallest version counts.

## Rendering
- The shared sequence renderer, 4 lanes; arrow labels at most 18 characters.
- Static fallback: chapter 6.3 tells the same block in prose in the worked example.

## Controls
Back, Next, Play and the step chips of the shared stepper.

## Visualisation
The interruption is the only arrow that starts in another lane, in warn tone; the return is in good tone.

## Copy
- What this shows: one focused block and the four things that protect it.
- Try this:
  1. Before step 6, predict whether Dina stops for the day or notes and returns (the chapter's predict).
  2. Find the two steps where Dina writes something down.
- What changed: each step note says what Dina did and what it protected.
- Limits of the model: as in `limits`.

## Edge cases
Self-loop "start signal" fits beside Dina's lane at 340px; the arrow from Mother to Dina crosses two lanes.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole block for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quizzes after the canvas: a time-leak log for a new study block, and an anchor for a block that must not follow a client's clock).
- [x] The model is tested (registry consistency and label-fit tests).
- [x] Times match chapter 6.3 (12:40 start, 12:55 interruption, 13:15 end).
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists.

## Build plan
`packages/learning-ui/src/canvas/dina-study-block/data.ts` (export `dinaStudyBlock`), registered by the orchestrator.

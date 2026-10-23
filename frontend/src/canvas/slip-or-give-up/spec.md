---
artifact: canvas-spec
course: building-habits
chapter: 05.04-slow-results-and-restarting
slug: slip-or-give-up
version: 1
owner: interaction-designer
renderer: state-machine (3 columns by 2 rows)
---

# Canvas spec: After a missed day: two roads

## Teaching claim
After a missed day there are two roads: the harsh story "I failed, so why bother" leads to giving up, while a kind restart plan (the smallest version at the next cue) leads back to the habit. The miss is the same on both roads; the thought after it decides the road.

## Why a canvas
The claim is a fork: the same state (missed a day) with two different next states. Walking road 1 and then road 2 from the same point shows that the miss itself did not decide the outcome. A paragraph tells it; the fork shows it.

## Model
- Inputs: none beyond the step controls.
- States: Doing the habit (0,0), Missed a day (1,0), Thinks: I failed (2,0), Smallest version (0,1), Restart plan (1,1), Gives up (2,1).
- Edges: slip, harsh story, so, or, next cue, and, restart.
- Rule: Yousef misses Wednesday and Thursday (helping his uncle move house). Road 1: harsh story, giving up, the gap grows. Road 2: kind, then a restart plan (Friday after the meal, 5 questions), done, then the full 20 minutes on Saturday. Last step: from giving up, a restart plan is still open (a new week as a push, the next cue sooner).
- Assumptions: the restart works first time.
- Limitations: restarts can fail; the slip versus relapse idea comes from relapse prevention work and is used here as an analogy for everyday habits (dossier finding 13).

## Rendering
- The shared state machine renderer. Labels across rows: "slip", "harsh story", "next cue", "restart". Labels inside a column (short sideways arrows on a phone): "so", "or", "and" (3 characters or fewer). No diagonal edges.

## Controls
Back, Next, Play and the step chips of the shared stepper.

## Visualisation
Road 1 runs to the right column (bad tone), road 2 drops to the bottom row and returns to the left (good tone).

## Copy
- What this shows: the same missed days, two roads, and what decides between them.
- Try this:
  1. Before step 6, predict which Friday plan works better: a double session or 5 questions (the chapter's predict).
  2. Compare steps 3 and 5: same misses, different thought.
- What changed: each step note names the thought or the plan and what it led to.
- Limits of the model: as in `limits`.

## Edge cases
States are revisited (Missed a day, Doing the habit, Restart plan); each visit has its own note and badge. Narrow layout checked: no label overlaps.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives both roads for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quiz after the canvas: a new slip and three possible next steps).
- [x] The model is tested (registry consistency, layout and label-overlap tests).
- [x] Facts match chapter 5.4 (Wednesday and Thursday missed, 5 questions on Friday, 20 minutes on Saturday).
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (the chapter tells both roads in prose).

## Build plan
`frontend/src/canvas/slip-or-give-up/data.ts` (export `slipOrGiveUp`), registered by the orchestrator.

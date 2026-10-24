---
artifact: canvas-spec
course: building-habits
chapter: 01.03-cue-routine-reward
slug: habit-loop-repeats
version: 1
owner: interaction-designer
renderer: state-machine (2 rows by 3 columns)
---

# Canvas spec: How Rami's phone habit was built

## Teaching claim
A cue, a routine and a reward, repeated in the same situation, build a link from the cue to the routine; once the habit is strong, the cue can start the routine with less need for the reward. The canvas says "can", never a firm "even when the reward is gone" (research dossier finding 3: the human evidence is mixed).

## Why a canvas
The claim is about repetition: the same loop, gone round several times, ends in a different state. Stepping round the loop, then leaving it for "Strong habit" and "Runs on the cue", shows that change over time. A static loop diagram shows the parts but not the turns or the change.

## Model
- Inputs: none beyond the step controls.
- States (col, row): Cue (0,0), Routine (1,0), Strong habit (2,0), Link grows (0,1), Reward (1,1), Runs on the cue (2,1).
- Edges: Cue to Routine "starts"; Routine to Reward "get" (same column, 3 characters); Reward to Link grows "repeat"; Link grows to Cue "so" (same column); Routine to Strong habit "weeks later"; Strong habit to Runs on the cue "can" (same column).
- Steps: cue, routine, reward (good, "reward"), link (week 1 to 3), cue again (week 6), strong habit, runs on the cue (warn, "can").
- Facts match chapter 1.3: sitting down on the mattress after dinner, messages then videos, the Friday night when nobody writes.
- Assumptions: one main cue and one kind of reward.
- Limitations: many cues at once in real life; rewards are not all or nothing; human evidence for reward-insensitive habits is mixed; the canvas makes no claim about how long a habit runs without any reward.

## Rendering
- Shared state machine renderer, 3 columns by 2 rows. The loop is a square on columns 0 and 1; the strong-habit states sit in column 2.
- Labels across a row: "starts", "weeks later", "repeat". Labels inside a column, at most 3 characters: "get", "so", "can". No diagonal edges.
- State names at most 15 characters.

## Controls
The shared stepper (Back, Next, Play/Pause, Start over, step chips, arrow keys).

## Visualisation
The lit state and edge move round the loop twice, then out to column 2. Good tone only on the reward; warn tone on "can", each with a text badge.

## Copy
- What this shows: the three parts repeated in the same situation, and the link growing.
- Try this:
  1. Before step 7, predict whether the routine can start on a night with no reward (the chapter's predict).
  2. At step 7, cover the reward box: what is left to start the habit?
- What changed: early turns need all three parts; after many weeks the cue alone can start the routine.
- Limits of the model: as in `limits`.

## Edge cases
The loop passes the cue twice; each pass has its own note and chips. Labels fit the narrow layout (columns become rows 150px apart).

## Accessibility
Shared stepper keyboard support and focus ring; `summary` describes the whole loop for screen readers; tones always carry a text badge.

## Acceptance criteria
- [x] The claim is testable (transfer MCQs in 1.3: find the cue in Tareq's one-day log of phone checks; choose the reward that helps while Fadi's habit forms). The predict before it asks whether Rami's hand will move on a night with no reward.
- [x] The model is tested (registry consistency, layout and label-overlap tests once registered).
- [x] Facts match chapters 1.2 and 1.3.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (chapter 1.3 explains the loop and the "can" in prose).

## Build plan
`packages/learning-ui/src/canvas/habit-loop-repeats/data.ts` (export `habitLoopRepeats`), registered by the orchestrator.

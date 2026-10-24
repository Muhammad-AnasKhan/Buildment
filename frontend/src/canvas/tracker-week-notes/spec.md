---
artifact: canvas-spec
course: building-habits
chapter: 05.02-tracking-that-helps
slug: tracker-week-notes
version: 1
owner: interaction-designer
renderer: sequence (3 actors, 10 steps)
---

# Canvas spec: Yousef's week: what the notes show

## Teaching claim
A tracker that records the action, with a short note on each day, shows a pattern that memory hides (Yousef's misses all fall on evenings with no power, not on tired days), and that pattern leads to one specific change.

## Why a canvas
The pattern only appears when the days are seen one after another and then read together. Stepping through the week lets the learner form the same wrong memory Yousef has ("tired days") before the card corrects it. A finished table shows the answer at once.

## Model
- Inputs: none beyond the step controls.
- Outputs: the lit arrow, the step note, outcome badges (tick, cross, one change) and chips.
- Rule: three lanes (Yousef, Laptop, Tracker card). A done day is an arrow to the laptop; a missed day is an arrow to the card with a note. Week: done Saturday, Sunday, Tuesday, Thursday (Saturday and Tuesday tired); missed Monday, Wednesday, Friday, each "no power after dinner". Done 4 of 7.
- Assumptions: one clear cause.
- Limitations: real notes are messier; one week is a hint, not proof.

## Rendering
- The shared sequence renderer, 3 lanes; arrow labels at most 18 characters ("Mon: cross, note" is 16).
- Static fallback: chapter 5.2 shows the same week as a table in the worked example.

## Controls
Back, Next, Play and the step chips of the shared stepper.

## Visualisation
Done days point to the laptop, missed days to the card, so the eye sees which lane the misses use before reading the notes.

## Copy
- What this shows: one week of tracking with notes, and how the notes find the cause.
- Try this:
  1. Before step 9, predict what the three misses have in common (the chapter's predict).
  2. Would a tick-only calendar have shown why he missed?
- What changed: each step note gives the day, the tick or cross and the note; step 9 counts and compares memory with the card.
- Limits of the model: as in `limits`.

## Edge cases
Self-loop label "read the notes" fits beside Yousef's lane at 340px. Ten steps fit the narrow layout.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole week; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quiz after the canvas: a tracker table whose notes point to one cause).
- [x] The model is tested (registry consistency and label-fit tests).
- [x] Numbers match chapter 5.2 (done 4 of 7; misses Monday, Wednesday, Friday).
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists.

## Build plan
`frontend/src/canvas/tracker-week-notes/data.ts` (export `trackerWeekNotes`), registered by the orchestrator.

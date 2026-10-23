---
artifact: canvas-spec
course: building-habits
chapter: 06.04-a-daily-rhythm
slug: prayer-time-anchors
version: 1
owner: interaction-designer
renderer: state-machine (3 columns by 2 rows)
---

# Canvas spec: Event or clock: what happens when the seasons change

## Teaching claim
Habits tied to events in the day (a prayer, a meal) move with those events when clock times change through the seasons, while habits tied to a clock time stay at the same number and drift to a different part of the day.

## Why a canvas
In winter the two plans look identical; only stepping into summer shows them come apart. Seeing the same states light up in two seasons is the point, and a single static picture can show only one season.

## Model
- Inputs: none beyond the step controls.
- States: Sunset prayer (0,0), Evening meal (1,0), Tea with mother (2,0), Tea skipped (0,1), Busy hour (1,1), Alarm at 18:00 (2,1).
- Edges: then, then, fit (alarm to tea, winter), summer (alarm to busy hour), clash (busy hour to tea skipped).
- Rule, with this example's times: winter prayer about 16:45, meal ends about 17:45, tea after the meal and tea at 18:00 coincide. Summer prayer about 19:45, meal ends about 20:45, tea after the meal follows at about 20:45; the 18:00 alarm rings while Dina cooks and cares for her mother, and the tea is rushed or skipped.
- Assumptions: the family always eats after the sunset prayer.
- Limitations: times are illustrative; research found clock cues and routine cues about equally effective in the few studies that compared them (dossier finding 6, S7), so the claim is about fit with a day, not about one cue type being proven better. No claim about prayer's effects (dossier U12).

## Rendering
- The shared state machine renderer. The event chain runs along the top row; the clock chain along the bottom row, right to left. "fit" is the only edge inside a column (3 characters). No diagonals.

## Controls
Back, Next, Play and the step chips of the shared stepper.

## Visualisation
Winter steps light both chains ending at the tea; summer steps send the event chain to the tea again and the clock chain to "Tea skipped".

## Copy
- What this shows: one habit written two ways, followed from winter to summer.
- Try this:
  1. Before step 5, predict which plan fits the summer evening (the chapter's predict).
  2. Turn a clock-time habit into one that follows an event.
- What changed: each step note gives the season, the times and where the tea lands.
- Limits of the model: as in `limits`.

## Edge cases
States are revisited across the two seasons; each step names its season in a chip. Narrow layout checked: no label overlaps.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives both seasons and both plans for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quiz after the canvas: a study habit set by clock time in winter, checked in summer).
- [x] The model is tested (registry consistency, layout and label-overlap tests).
- [x] Times match chapter 6.4.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists.

## Build plan
`frontend/src/canvas/prayer-time-anchors/data.ts` (export `prayerTimeAnchors`), registered by the orchestrator.

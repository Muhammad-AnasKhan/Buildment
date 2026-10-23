---
artifact: canvas-spec
course: cause-and-effect
chapter: 06.04-bottlenecks
slug: bakery-bottleneck-moves
version: 1
owner: interaction-designer
renderer: state-machine (2 rows by 3 columns)
---

# Canvas spec: Huda's bottleneck, and where it moves

## Teaching claim
The slowest step sets the pace of the whole process. Fix it in order: find it, get the most out of it, make everything else serve it, add capacity only after that, then start again, because the bottleneck moves to the next slowest step.

## Why a canvas
The order of the five steps and the moment the bottleneck moves are the lesson. Stepping through lets the learner predict each number (8 a day, 16 a day, the new bottleneck) before the note shows it.

## Model
- Inputs: none beyond the step controls.
- Outputs: the lit state and edge, the note, outcome badges and chips.
- Rule: five process steps in a snake (Take orders 20, Mix batter 12, Bake 6, Decorate 10, Deliver 15) plus Cakes out. Output per day is the smallest capacity: 6, then 8 after the oven is never empty, then 10 when two ovens bake 16 and decorating is slowest.
- Assumptions: fixed daily capacities; one cake per order.
- Limitations: real steps vary; the limit can be demand.

## Rendering
- The shared state machine renderer, 3 columns by 2 rows: the top row runs left to right, the bottom row right to left.
- The one arrow inside a column (Bake to Decorate) is labelled "go" (at most 3 characters). No diagonal edges.

## Copy
- What this shows: the slowest step sets the pace, and it moves once you fix it.
- Try this: 1. Before step 3, predict whether the same oven can bake more (the chapter's predict). 2. Find the next slowest step if decorating rose to 20.
- What changed: each note names the new number and what it means for the week.
- Limits of the model: as in `limits`.

## Edge cases
Bake is lit three times (find, exploit, add capacity), each with its own badge. Labels fit the narrow layout.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives all the numbers for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quiz after the canvas: Rima's uniform workshop, first move and the moved bottleneck).
- [x] The model is tested (registry consistency, layout and label-overlap tests).
- [x] Numbers match chapter 6.4 (20, 12, 6, 10, 15; 8 a day, 48 a week; 16 a day; 60 a week).
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (chapter 6.4 walks the same five steps in prose).

## Build plan
`frontend/src/canvas/bakery-bottleneck-moves/data.ts` (export `bakeryBottleneckMoves`), registered by the orchestrator.

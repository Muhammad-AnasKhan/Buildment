---
artifact: canvas-spec
course: building-habits
chapter: 02.03-if-then-plans
slug: if-then-moment
version: 1
owner: interaction-designer
renderer: sequence (4 actors, 8 steps)
---

# Canvas spec: Sometime today, or if-then?

## Teaching claim
A vague intention lets the moment pass; an if-then plan links a specific situation to a specific first step, so the situation itself starts the action. Lina's Monday ("practise sometime today") against her Tuesday ("if I finish my morning tea, then I open my writing notebook and write three sentences").

## Why a canvas
The claim is about time order: on Monday the tea comes and goes with nothing attached, and the day fills up; on Tuesday the same tea starts the writing before the day begins. Stepping through both days in order makes the missing link on Monday visible.

## Model
- Inputs: none beyond the step controls.
- Actors: Lina (translator), Morning tea (after Fajr), Client work (on the laptop), Notebook (writing).
- Steps: Monday: sometime today (loop); drinks tea (Lina to tea); starts work (Lina to work); too late (loop, warn, "missed", 22:30). Tuesday: if tea, then write (loop); glass is empty (tea to Lina); write 3 sentences (Lina to notebook, good, "done"); starts work (Lina to work).
- Facts match chapter 2.3: the sticky note, the long client call, the sister's form, 22:30, three sentences in about five minutes.
- Assumptions: the two days are otherwise alike.
- Limitations: a plan makes action more likely, not certain; it helps most with new habits the person really wants.

## Rendering
Shared sequence renderer, narrow and wide layouts. Arrow labels at most 18 characters ("if tea, then write"); loops only on lane 0.

## Controls
The shared stepper (Back, Next, Play/Pause, Start over, step chips, arrow keys).

## Visualisation
Warn tone only on Monday's missed practice; good tone only on Tuesday's three sentences, each with a text badge.

## Copy
- What this shows: the same small habit, with and without a named moment.
- Try this:
  1. Before step 6, predict what starts the writing on Tuesday (matches the chapter's predict).
  2. Count how often Lina must remember the plan on each day.
- What changed: on Monday the plan lived in her head; on Tuesday the situation started the action.
- Limits of the model: as in `limits`.

## Edge cases
Three loops on lane 0 with labels up to 18 characters; all fit the narrow layout. "starts work" appears twice on purpose: the busy day comes on both days.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives both days for screen readers; tones carry text badges.

## Acceptance criteria
- [x] The claim is testable (transfer MCQs in 2.3: Nadia's plans for reading at the library corner; Fadi's alarm versus hanging up his apron).
- [x] The model is tested (registry consistency and label-fit tests once registered).
- [x] Facts match chapter 2.3.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (chapter 2.3 tells both days in prose).

## Build plan
`frontend/src/canvas/if-then-moment/data.ts` (export `ifThenMoment`), registered by the orchestrator.

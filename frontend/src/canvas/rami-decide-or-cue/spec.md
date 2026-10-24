---
artifact: canvas-spec
course: building-habits
chapter: 01.02-what-a-habit-is
slug: rami-decide-or-cue
version: 1
owner: interaction-designer
renderer: sequence (4 actors, 7 steps)
---

# Canvas spec: Rami's evening: decide or cue?

## Teaching claim
A new behaviour goes through deciding every time; a habit goes from the cue to the action and skips the deciding step. Rami's phone (sit down, hand moves) has no deciding step; his study (notice, weigh, decide, often "later") has one every evening.

## Why a canvas
The claim is about the shape of two paths: one with a stop in the middle and one without. Stepping arrow by arrow makes the learner see the extra stop on the study path, and see that it is still there on a good evening (Thursday). A static picture shows both paths at once and hides the order.

## Model
- Inputs: none beyond the step controls.
- Actors: Rami (after dinner), Deciding (weigh it up), Study course (on the laptop), Phone (in his pocket).
- Steps: sits down (loop on Rami); hand moves (Rami to Phone, warn, "no decision"); videos, messages (Phone to Rami, 40 minutes, 21:15); should I study? (Rami to Deciding); later (Deciding to Rami, warn, "later"); yes: open lesson (Deciding to Study course, good, "studied", Thursday); compare (loop on Rami).
- Facts match chapters 1.1 and 1.2: dinner ends about 20:30, phone from about 20:35 to 21:15, laptop opened and closed at 22:10, power off at 23:00, Thursday study of 40 minutes with the lesson already open.
- Assumptions: one typical tired evening and one good evening stand for Rami's pattern.
- Limitations: some phone use is a real choice; some study feels easy on good days; a habit starts an action but the lesson still takes thought.

## Rendering
- Shared sequence renderer (`renderers/sequence/`), narrow and wide layouts.
- Arrow labels at most 16 characters ("videos, messages", "yes: open lesson"); loops only on lane 0 with short labels ("sits down", "compare").

## Controls
The shared stepper: Back, Next, Play/Pause, Start over, numbered step chips, arrow keys, Home and End.

## Visualisation
Four lanes, one arrow per step. Warn tone only on the two moments that lose the study ("no decision" on the phone, "later"); good tone only on Thursday's study. Each tone has a text badge.

## Copy
- What this shows: the phone goes from a situation straight to the action; the study goes through deciding first.
- Try this:
  1. Recall the chapter's predict (how many of Rami's 23 phone pickups he chose), then count the deciding steps on each path.
  2. Before step 5, say what the decision will answer on a tired Tuesday; compare with step 6.
- What changed: each step note says what happened at that arrow; step 7 compares the two paths.
- Limits of the model: as in `limits`.

## Edge cases
Two loops on lane 0 (first and last steps); labels fit both layouts. Seven steps keep the narrow picture short enough to read without losing the top lanes.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole evening in one sentence for screen readers; tone always has a text badge; reduced motion handled by the renderer.

## Acceptance criteria
- [x] The claim is testable (transfer MCQ in 1.2: Salma's canteen boiler switch versus her stock list).
- [x] The model is tested (registry consistency and label-fit tests once registered).
- [x] Numbers and facts match chapters 1.1 and 1.2.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (chapter 1.2 explains both paths and sorts Rami's day in prose).

## Build plan
`frontend/src/canvas/rami-decide-or-cue/data.ts` (export `ramiDecideOrCue`), registered by the orchestrator.

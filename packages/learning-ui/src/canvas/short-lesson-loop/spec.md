---
artifact: canvas-spec
course: build-with-ai (v2)
chapter: 9.3 Short lessons on demand
slug: short-lesson-loop
version: 1
owner: interaction-designer
---

# Canvas spec: A short lesson, checked

## Teaching claim
A short AI lesson is a first pass. Ask for a plan, take the lesson, let the assistant quiz you, check one claim against a primary page, and write your own notes. The machine refuses "paste the summary as notes" and "skip the check".

## Why a canvas
The mistake is a shortcut that feels fine: the lesson reads clearly and the quiz is all right. A learner must see the quiz pass and the check still find a mistake, which a paragraph cannot show.

## Model
- Inputs: the step control of the state machine renderer (Back, Next, Replay).
- States (grid 3 by 2): Ask (0,0), Lesson (1,0), Quiz (2,0), Check (1,1), Your notes (0,1).
- Edges: Ask to Lesson "ask"; Lesson to Quiz "quiz"; Quiz to Check "pick"; Check to Your notes "write it"; two refused moves, Lesson to Your notes "paste" and a Quiz loop "skip check". Your notes sits at column 0 and Check at column 1 of row 1, so the refused loop label never covers a state on a phone.
- Steps (eight): ask; the lesson arrives; paste as notes refused; the quiz (3 of 3); skip the check refused; one claim picked; the lesson was wrong (a made-up mistake: "a 404 status means the server crashed", while the documentation says 404 means not found); notes in his own words with the page name and the date.
- Dossier ids: C20 and C21 (study mode and Guided Learning can make mistakes and tell learners to double-check); C17 to C21 as reused from v1 chapters 3.4 and 3.5; the "15-minute lesson" idea is the course's method (C20 and C21 do not test accuracy).
- Assumptions: Murad is fictional and the mistake is made up for the example.
- Limitations: stated in `limits` (a real lesson has many claims, one check is the habit).

## Rendering
- Primary: the shared state machine renderer (inline SVG).
- Why this renderer: a lifecycle with two refused moves is exactly what it draws.
- Layout checks (tested with the repository's geometry): every state inside the width in both layouts, no edge label outside the picture, no two edge labels overlapping. Edge labels are at most 14 characters.
- Static fallback: the renderer's summary text.

## Controls
Back, Next and Replay on the renderer. No other control.

## Visualisation
Five state pills and the two rejected loops drawn as refusals, with the current step lit.

## Copy
- What this shows: one lesson from request to notes, with the two shortcuts refused.
- Try this:
  1. Step 4 shows the quiz score, and step 7 shows what the check found. Can a lesson be wrong while the quiz is all right?
  2. Look at the two refused moves. What would each one have cost Murad on Thursday?
  3. Which claim would you check in a lesson of your own, and which page would you open?
- What changed: the lit state and the note for each step.
- Limits of the model: set in `limits`.

## Edge cases
Eight steps, two of them with a refused loop. The summary text for screen readers is one paragraph.

## Accessibility
The renderer provides keyboard stepping, a live region for each step, and a text summary. Tone is always shown with a word (refused, mistake found, kept).

## Acceptance criteria
- [x] The claim is testable: after step 7 the learner can say what the check found that the quiz did not.
- [x] The geometry check passes for both layouts.
- [x] The first try-this line matches the chapter's predict.
- [x] Prediction before (chapter 9.3), transfer check after (quick check on a new case).
- [x] Reader fallback exists (the summary).

## Build plan
`packages/learning-ui/src/canvas/short-lesson-loop/data.ts` (export `shortLessonLoop`). The orchestrator registers the slug.

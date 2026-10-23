---
artifact: canvas-spec
course: build-with-ai
chapter: 03.06-notes-you-own
slug: note-page-lifecycle
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: A note page grows up

## Teaching claim
A note page grows up: captured, rewritten in your own words, linked to a lab, reviewed weekly. Pasting an AI summary as the note is refused.

## Why a canvas
The chapter shows one finished page (Lina's subnetting page) and explains each part. The canvas shows a different page (routing) changing over weeks, so the learner sees that a useful page is the result of several small moves, and sees the shortcut the lifecycle refuses, drawn as a rejected loop that leaves the page where it was.

## Model
- Inputs: none beyond the shared step controls.
- Outputs: the highlighted state, the active edge, the step note, outcome badge and chips.
- Rule: five states (Captured, Own words, Linked, Reviewed, Used); one rejected loop on Captured ("paste summary"); four transitions; six steps.
- Facts (checked twice, match chapters 3.5 and 3.6): the most specific matching route wins; with no matching route and no default route, the router drops the packet; Lina reviews on Fridays; Odai is the classmate whose lab answer was wrong in 3.5.
- Assumptions: one page, one topic, a weekly review that happens.
- Limitations: real pages move back and forth between states; Friday is Lina's choice of day.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: Captured (col 0, row 0), Own words (col 1, row 0), Linked (col 2, row 0), Reviewed (col 2, row 1), Used (col 1, row 1). Col 0 row 1 is empty on purpose, so the rejected loop on Captured has free space beside it in the narrow layout.
- The edge from Linked to Reviewed is in one column, so its label is three characters ("Fri"): it becomes horizontal on phones.
- Rejected loop label "paste summary" is 13 characters; other labels are 8 characters or fewer. No diagonal edges.
- Static fallback: chapter 3.6 describes the page's life in prose after the canvas ("What it showed").

## Controls
Shared stepper controls only.

## Visualisation
Five labelled pills, one dashed rejected loop and four arrows. Bad tone on the refused paste, warn on the review that finds a miss, good on the page used to teach; each with a text badge.

## Copy
- What this shows: a notes page becoming useful through small moves, and the shortcut that is refused.
- Try this: 1. Before step 2, predict which page will help Lina more in six weeks: the pasted AI summary or her own short page (matches the chapter's predict). 2. At step 5, what does the Friday review add that the first four states do not?
- What changed: each step note says what Lina did to the page.
- Limits of the model: as in `limits`.

## Edge cases
Step 1 has no edge (start state). Step 2 uses the rejected loop: the state does not change. Tool names are not used.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole lifecycle for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quiz after the canvas asks what to do with a pasted AI summary, and how to give a long page structure).
- [ ] The model is tested (registry consistency and label-fit tests, run by the orchestrator after registration).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose in 3.6).

## Placement
Chapter 3.6, section "A page grows up", after the predict and before "What it showed".

## Build plan
`frontend/src/canvas/note-page-lifecycle/data.ts`, exporting `notePageLifecycle`. To be registered by the orchestrator in `frontend/src/canvas/registry.ts` and the shared slug lists; covered by `frontend/tests/unit/canvas/registry.test.ts`.

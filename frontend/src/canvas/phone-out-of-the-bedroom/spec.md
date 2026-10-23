---
artifact: canvas-spec
course: building-habits
chapter: 04.04-remove-the-cue
slug: phone-out-of-the-bedroom
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: The phone leaves the bedroom

## Teaching claim
Removing the cue and adding friction does more than a promise: a night with only a promise (phone on the pillow, asleep about 1:00), one night with the plan (phone charging in the kitchen, the urge noticed and named, the replacement routine, asleep 23:40) and one slip night handled by noticing and acting.

## Why a canvas
The chapter describes the two tools and their order. The sequence shows them as moves between Maha, the phone and the book: the phone leaving the room first, the urge as a loop on Maha's own lane, the book catching her, then the phone coming back on a slip night and leaving again. The direction of the arrows (toward the kitchen, back to the pillow, toward the kitchen again) carries the claim in a way prose alone does not.

## Model
- Inputs: none beyond the shared step controls.
- Outputs: the active arrow, the step note, chips and outcome badge.
- Rule: three lanes (Maha, Phone in the kitchen, Book on the pillow). Eight steps: promise only (loop, the old way); charge in kitchen; read one story; urge noticed (loop); back to the page; phone comes to bed (slip); notice and stop (loop); kitchen first (the new if-then line).
- Assumptions: the chapter's case (phone to the kitchen at 22:45, battery clock about 15 shekels, asleep 23:40 on the plan night; slip at 23:20, noticed at 23:50, asleep 00:15).
- Limitations: three nights; noticing gives control in the moment and does not remove the habit; some urges win before they are noticed.

## Rendering
- Primary: the shared sequence renderer.
- Why this renderer: the claim is about moves between three things over one night and a slip night, in order.
- Arrow labels are 18 characters or fewer ("phone comes to bed" is 18).
- Static fallback: the worked example in chapter 4.4 lists every step in prose, and a Mermaid diagram shows the two tools and the slip loop.

## Controls
Shared stepper controls only.

## Visualisation
Three lanes, eight arrows (three loops). Tone bad on the promise night ("about 1:00"), warn on the noticed urge ("noticed"), good on "back to the page" ("23:40") and "notice: stop" ("00:15"), bad on the slip ("slip"), each with a text badge.

## Copy
- What this shows: a promise night, a night with the plan and a slip night, with the cue removed, friction added and the moment noticed.
- Try this:
  1. Check the prediction: at step 7, what did Maha do instead of trying not to think about the videos?
  2. At step 6, what brought the cue back? Which line in step 8 deals with it?
- What changed: step notes give the times (asleep 23:40 on the plan night; 00:15 instead of 1:00 on the slip night).
- Limits of the model: as in `limits`.

## Edge cases
Three loops on Maha's lane (the promise, the urge, the noticing). Labels fit the narrow layout at 18 characters or fewer.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives both nights for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quiz items on Mazen's television and Hiba's log of video calls).
- [x] The model is tested (registry consistency and label-fit tests once registered).
- [x] The design is simple and legible.
- [x] Prediction before (what works on the slip night), transfer check after.
- [x] Reader fallback exists (worked example in chapter 4.4).

## Build plan
`frontend/src/canvas/phone-out-of-the-bedroom/data.ts`, to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.

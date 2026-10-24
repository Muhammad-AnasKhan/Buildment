---
artifact: canvas-spec
course: build-with-ai
chapter: 05.03-a-weekly-plan
slug: week-plan-check-resources
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Yara's caching week: ask, check, then plan

## Teaching claim
An AI is a fast way to find what to learn in a week, but its list becomes a plan only after each item is checked to exist and be current: one item in six here is a book that does not exist, it looks as real as the others, and its author is a real writer, so only a search for the title itself settles it.

## Why a canvas
The chapter's resource table shows the result of the checks all at once. Stepping through them one at a time makes the learner see six equally convincing suggestions first, then watch one fail its check, which a finished table cannot show. It also shows that the AI saved time, so the claim is "ask, then check", not "do not ask".

## Model
- Inputs: none beyond the shared step controls.
- Outputs: the active arrow between lanes, the step note, outcome badge and chips.
- Rule: four lanes (Yara, Chat assistant, Sources, Her plan); eight steps: ask with context, six suggestions, check the three videos (all real, one nine years old), check the book (the author is real, the title is not found anywhere), check the two articles (real), replace the book with official docs found by hand, write the week plan, end with a recall test.
- Assumptions: the area is caching, week 7 of Yara's plan (month 2); her context is beginner, about 8 hours this week, phone, little data.
- Limitations: a real list can hold more invented items or real items with wrong details; existing is not the same as correct.

## Rendering
- Primary: the shared sequence renderer, narrow layout below `sm`.
- Arrow labels are at most 17 characters ("ask what to learn", "open the articles").
- Static fallback: chapter 5.3 walks through the same checks in prose ("A week, step by step") and shows the resulting resource table before the canvas.

## Controls
Shared stepper controls only. No numeric inputs: the claim is about the order and the kind of check, not about quantities.

## Visualisation
Four lanes, one arrow per step. Tone good on checks that pass, on the replacement and on the recall test; bad on the missing book; every tone carries a text badge ("3 of 3 real", "no such book", "2 of 2 real", "replaced", "week done").

## Copy
- What this shows: `purpose` in `data.ts`.
- Try this:
  1. Go to step 4 and compare the author search with the title search (answers the chapter's predict: a real author does not prove a real book).
  2. Count what Yara kept at the end, and how many suggestions were invented.
  3. What she still checks before copying a command from the nine-year-old video.
- What changed: each step note says what was checked, how, and the result.
- Limits of the model: `limits` in `data.ts`.

## Edge cases
The step from Yara to Her plan crosses all four lanes; its label "write the week" is 14 characters. The final loop step on Yara's lane carries an outcome badge. Chips are short and wrap on a phone.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole sequence for screen readers; tone always has a text badge, never colour alone.

## Acceptance criteria
- [x] The claim is testable: the quiz after the canvas (Hamza's index week, with a video link that opens the wrong video) asks which resources count as checked.
- [x] The model is tested by the shared registry consistency and label-fit tests.
- [x] The design is simple and legible: four lanes, eight steps.
- [x] Prediction before (does finding a real author show the book exists), transfer check after.
- [x] Reader fallback exists (prose and table in 5.3).

## Placement
In chapter 5.3, under "Check before you plan", after the predict and before "Where it goes wrong". The first `tryThis` line points at the step that answers the predict, without restating it. Names and numbers match the chapter: six suggestions (three videos, one book chapter, two articles), the nine-year-old video, the three places searched for the book, the official docs as the replacement, week 7 in month 2.

## Build plan
`frontend/src/canvas/week-plan-check-resources/data.ts` exporting `weekPlanCheckResources`; the orchestrator registers it in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`.

---
artifact: canvas-spec
course: build-with-ai
chapter: 06.02-from-commits-to-an-article
slug: commits-to-article
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: From Salma's week 6 log to two posts

## Teaching claim
A week of lab logs becomes a short article in your own voice: you draft from the log, the AI edits and asks questions, you check every fact against your repository, then you adapt the post for two other platforms without changing a fact.

## Why a canvas
The chapter tells the steps in prose. Stepping through them puts the AI edit in its place in the order: after Salma's own draft and before the fact check. The learner sees the edited sentence arrive, and has to ask where the proof is, before the next step shows the repository answering. A static list of steps hides that moment.

## Model
- Inputs: none beyond the shared step controls.
- Outputs: the active arrow between lanes, the step note, outcome badge and chips.
- Rule: four lanes (Salma, Repository, Chat assistant, Platforms); seven steps: read the week, draft, ask for an edit, the edit returns with one new claim, check each fact, answer and add the AI-use line, adapt for two platforms.
- Fixed data (from chapter 6.2): week 6 holds labs 26 to 30; Salma's project is a shuttle bus timetable for her university; lab 27 is the lost edit to the 8:00 trip; the test sends 20 edits and exactly 1 is saved; the draft is about 650 words; the LinkedIn version is about 120 words; the DEV version is the full post marked AI-assisted.
- Assumptions: the edit changes exactly one fact, and the repository holds the evidence that catches it.
- Limitations: real edits can change meaning in quieter ways; platform labels change.

## Rendering
- Primary: the shared sequence renderer, narrow layout below `sm`.
- Arrow labels are at most 18 characters ("edit, no new facts" and "edits, 3 questions" are exactly 18).
- Static fallback: chapter 6.2 tells the same steps in prose, including the changed sentence, before and after the canvas.

## Controls
Shared stepper controls only. No numeric inputs: the claim is about order and checking, not quantities.

## Visualisation
Four lanes, one arrow per step. Tone: warn on the returned edit (outcome "one new claim"), good on the fact check (outcome "20, not hundreds") and on the adapted posts (outcome "same facts"), each with a text badge.

## Copy
- What this shows: a week of logs becoming one honest write-up and two posts.
- Try this: 1. Go to step 4 and compare its chips with the number in step 2 (this answers the chapter's predict without repeating it). 2. At step 5, name the file that proves the edited sentence wrong.
- What changed: each step note says what moved between Salma, her repository, the chat assistant and the platforms.
- Limits of the model: as in `limits`.

## Edge cases
Loop steps on Salma's lane (draft, answer and add the AI line) have no arrow between lanes. Tool names appear only as the chapter uses them: "chat assistant", LinkedIn and DEV.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole flow for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (two quiz items after the canvas: an edit that added a claim, and three versions of one write-up where the AI-shortened one changed a fact).
- [x] The model is tested (registry consistency and label-fit tests, once registered).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose in 6.2).

## Placement
Chapter 6.2, after the predict on whether every number in the draft survives the edit, and before the section "Adapt for two platforms".

## Build plan
`frontend/src/canvas/commits-to-article/data.ts`, export `commitsToArticle`, to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.

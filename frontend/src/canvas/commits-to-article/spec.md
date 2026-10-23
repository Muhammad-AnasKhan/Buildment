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
- Fixed data (from chapter 6.2): week 6 holds labs 26 to 30; lab 27 is the double booking of pitch 1 at 18:00; the test sends 20 requests and exactly 1 is accepted; the draft is about 650 words; the LinkedIn version is about 120 words; the DEV version is the full post marked AI-assisted.
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
- Try this: 1. Before step 3, predict whether Salma should ask for an edit at all (matches the chapter's predict). 2. At step 4, which file proves the new sentence wrong?
- What changed: each step note says what moved between Salma, her repository, the chat assistant and the platforms.
- Limits of the model: as in `limits`.

## Edge cases
Loop steps on Salma's lane (draft, answer and add the AI line) have no arrow between lanes. Tool names appear only as the chapter uses them: "chat assistant", LinkedIn and DEV.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole flow for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (two quiz items after the canvas: an edit that added a claim, and adapting one write-up for two platforms).
- [x] The model is tested (registry consistency and label-fit tests, once registered).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose in 6.2).

## Placement
Chapter 6.2, after the predict on whether Salma should ask for an edit, and before the section "Adapt for two platforms".

## Build plan
`frontend/src/canvas/commits-to-article/data.ts`, export `commitsToArticle`, to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.

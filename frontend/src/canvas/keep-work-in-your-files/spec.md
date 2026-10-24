---
artifact: canvas-spec
course: build-with-ai
chapter: 02.04-habits-that-outlast-tools
slug: keep-work-in-your-files
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Where does Ahmad's work live?

## Teaching claim
Work kept only in a tool's chat history is lost when the tool changes; work copied into your own notes and repository survives the next change.

## Why a canvas
The chapter tells Ahmad's March story in 2.1 and his new routine in 2.4 in prose. Stepping through one story with a turn puts the two tool changes on the same picture: in March the arrow from the chat tool comes back with "month lost", in June the same kind of arrow comes back with "nothing lost", and the only difference is the two lanes on the right that Ahmad now writes to.

## Model
- Inputs: none beyond the step controls (Back, Next, Play, step chips).
- Outputs: the active arrow, the step note, chips and outcome badge.
- Rule: four lanes (Ahmad, Chat tool, His notes, Repository); eight steps. Steps 1 to 3 are March (ask, history only, the free tier change). Steps 4 to 8 are May and June (ask, own-words copy, weekly upload, the tool stops opening, read his own pages).
- Assumptions: the story is fictional and describes no real tool; the copy-out takes about ten minutes; the upload is weekly.
- Limitations: some days the copy-out is missed; a repository is a second copy only while you can sign in to it.

## Rendering
- Primary: the shared sequence renderer.
- Four lanes; names 10 characters or fewer, subs 9 or fewer, so the narrow layout (pill width about 77px) fits.
- Arrow labels 15 characters or fewer (rule: under about 18).
- Static fallback: chapter 2.1 tells the March story; chapter 2.4 gives the five habits, Ahmad's routine under "Worked example: Ahmad's day and week", and the fallback diagram, all before the canvas.

## Controls
Shared stepper controls only. No numeric inputs: the claim is about where work lives, not quantities.

## Visualisation
Four lanes and eight arrows, one per step. Tone: warn on "history only" and on "will not open", bad on the March change, good on the weekly upload and the final read, each with a text outcome badge where it matters.

## Copy
- What this shows: `purpose` in `data.ts`.
- Try this: 1. The first line points at step 7, which answers the chapter's predict (the same-day copy in his notes app, not the weekly upload, keeps the week going). 2. Compare step 3 with step 7.
- What changed: each step note says where the work is after that step.
- Limits of the model: `limits` in `data.ts`.

## Edge cases
Step 2 is a loop on the Chat tool lane; its label is placed on the side with room. Steps 3 and 7 run right to left. The story matches the chapter exactly: about 30 chats, an old school email, indexes as the restarted topic, about ten minutes a day, Friday uploads at a café, a private repository named `sql-notes`, a week without the tool in June.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` tells the whole story for screen readers; every tone has a text badge or a title that says what happened.

## Acceptance criteria
- [x] The claim is testable (the quiz after the canvas transfers it to Aseel's glossary and to Nada's toolkit page, where her saved prompts are locked inside the tool that stopped opening).
- [x] The model is tested (registry consistency and label-fit tests, once registered).
- [x] The design is simple and legible (four lanes, eight steps).
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose in 2.1 and 2.4).

## Placement
In "What happens next time", right after the predict and before "Where it goes wrong".

## Build plan
`frontend/src/canvas/keep-work-in-your-files/data.ts` exporting `keepWorkInYourFiles`; to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.

---
artifact: canvas-spec
course: build-with-ai
chapter: 01.02-what-ai-does-not-know
slug: ai-missing-context
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Same question, with and without the facts

## Teaching claim
An AI answer is only as good as the context it gets: the same question gives a generic answer, adding facts only you know changes it, and some facts the AI still cannot know, so you check them with people and official pages.

## Why a canvas
The chapter explains the four kinds of missing knowledge in prose and works through Yara's list on paper. The canvas shows something the prose does not: the same question run twice, side by side in time, so the learner sees the answer change shape when facts go in, and then sees one fact that no question could add. Stepping lets the learner predict the second answer before seeing it.

## Model
- Inputs: none beyond the shared step controls (Back, Next, Play, step chips).
- Outputs: the highlighted arrow, the step note, chips and outcome badge.
- Rule: three lanes (You, Chat assistant, Project facts); seven steps in a fixed order: question alone, generic answer, list the facts, question with facts, fitted answer, ask the owner, decide and test.
- Assumptions: the AI uses the facts it is given; the owner answers honestly.
- Limitations: one question, one tool, one fact that nobody wrote down; real chats can ignore facts or ask questions back.

## Rendering
- Primary: the shared sequence renderer.
- Lanes: 3 actors, so the narrow layout gives each pill about 96px. Names are 3, 14 and 13 characters ("You", "Chat assistant", "Project facts"); the pack's "Your project facts" is shortened to "Project facts" so it fits a phone pill.
- Arrow labels are 17 characters or fewer: "same question", "generic answer", "list the facts", "question + facts", "fitted answer", "ask the owner", "decide, then test".
- Static fallback: chapter 1.2 tells the whole story in prose after the canvas ("The canvas showed ..."), and the hook tells the first answer.

## Controls
Shared stepper controls only. No numeric inputs: the claim is about which facts reach the answer, not about quantities.

## Visualisation
Three lanes and seven arrows. Tones: warn on the generic answer (fits most shops) and on the fact nobody wrote down; good on the fitted answer and on the final checked decision. Every tone has a text outcome badge.

## Copy
- What this shows: the same question asked without and with the facts only you know, and one fact that only a person could give.
- Try this:
  1. Step 5 shows which part of the first plan the AI kept, and step 6 shows why that part still fails at this shop. (Points at the steps that answer the chapter's predict, which asks which part of the first plan survives; it does not repeat the question.)
  2. At step 6, which kind of missing knowledge is the email problem?
  3. Look at step 4: what did Majd leave out of his question on purpose, and why?
- What changed: each step note says what the AI saw and what it produced.
- Limits of the model: as in `limits`.

## Edge cases
- Step 7 is a loop on the "You" lane; its label "decide, then test" sits to the right of the lane, inside 340px.
- Chips are kept short (under 25 characters) so they wrap cleanly on a phone.
- Numbers match the chapter exactly: a budget of $300, nothing monthly, cash at the counter, hosting already paid for this year.
- Classification matches chapter 1.2: all four facts in step 3 are context (who the customers are, how they pay, the budget, what the shop already has), as the chapter defines context; the email fact in step 6 is the kind "nobody wrote it down".

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole flow for screen readers; every tone has a text badge, so colour is never the only signal.

## Acceptance criteria
- [x] The claim is testable: the quizzes after the canvas transfer it to a school lab plan (context) and a library poster with last year's opening hours (local and recent).
- [x] The model is tested: registry consistency and label-fit tests, once the orchestrator registers the slug.
- [x] The design is simple and legible: three lanes, seven steps.
- [x] Prediction before (chapter predict, first line of `tryThis`), transfer check after (two MCQs).
- [x] Reader fallback exists: the prose in chapter 1.2.

## Build plan
`frontend/src/canvas/ai-missing-context/data.ts`, export `aiMissingContext` (SequenceSpec). To be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.

## Placement
Chapter 1.2, after the predict in "What happens when the facts go in", before "Where it goes wrong".

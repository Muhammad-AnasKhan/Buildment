---
artifact: canvas-spec
course: build-with-ai
chapter: 03.04-make-the-ai-quiz-you
slug: ai-quiz-partner
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Explain it, or quiz me?

## Teaching claim
When you ask the AI to quiz you one question at a time and wait for your answer, you do the recall; when you ask it to explain, it does the work. The session ends with reviews planned for later days.

## Why a canvas
The chapter builds the quiz prompt line by line and argues the case in prose. The canvas shows the same chat assistant used both ways in one session, so the learner sees the arrow of work change direction: in step 1 the answer comes from the AI; from step 3 on, every answer comes from Lina. The mixed question and the hint show why mixing and hints matter, which a written prompt alone does not show.

## Model
- Inputs: none beyond the shared step controls.
- Outputs: the active arrow between lanes, the step note, outcome badge and chips.
- Rule: three lanes (Lina, Chat assistant, Her notes); eight steps: explain (warn), the quiz prompt, question 1, a right answer, a mixed question answered wrongly, a hint and a right second try, the miss logged, two reviews planned.
- Facts (checked twice, match chapter 3.4): video calls use UDP at this exam's level because late pieces are useless; a file needs every piece, so TCP; reviews on Wednesday (three days after Sunday) and the Wednesday after (a week later), following the course's rule of thumb.
- Assumptions: the chat assistant follows the prompt; Lina's lecture notes agree with the answers.
- Note: the chapter's predict asks about step 5, where the mixed-in file question shows Lina choosing by speed.
- Limitations: a quiz partner can be wrong; real protocols are more complicated than the exam level; the review gaps are a rule of thumb.

## Rendering
- Primary: the shared sequence renderer, narrow layout below `sm`.
- Arrow labels are 18 characters or fewer ("quiz me, then wait" is the longest, at exactly 18).
- Arrows from the chat assistant to Lina are questions and the hint; arrows from Lina to the chat assistant are her asks and answers. The direction of the arrow is the teaching point.
- Static fallback: chapter 3.4 describes the session in prose after the canvas ("What it showed").

## Controls
Shared stepper controls only.

## Visualisation
Three lanes, one arrow per step. Warn tone on the explain step and on the wrong answer; good tone on the right answers and on the planned reviews; each with a text badge.

## Copy
- What this shows: the same chat assistant used to explain, then to quiz.
- Try this: 1. Compare steps 4 and 5: a right answer for the video call, then 'faster' as the reason for the file; read what the hint in step 6 changes (points at the steps that answer the chapter's predict about the mixed question). 2. Look at step 1 again: who produced the answer there?
- What changed: each step note says who produced the answer.
- Limits of the model: as in `limits`.

## Edge cases
No loops. Tool names are not used: the lane is "Chat assistant". Quoted questions inside notes use single quotes.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole session for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quiz after the canvas asks which request makes a new learner do the recall, and which review plan fits the rule of thumb).
- [ ] The model is tested (registry consistency and label-fit tests, run by the orchestrator after registration).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose in 3.4).

## Placement
Chapter 3.4, section "Lina's quiz session", after the predict and before "What it showed".

## Build plan
`frontend/src/canvas/ai-quiz-partner/data.ts`, exporting `aiQuizPartner`. To be registered by the orchestrator in `frontend/src/canvas/registry.ts` and the shared slug lists; covered by `frontend/tests/unit/canvas/registry.test.ts`.

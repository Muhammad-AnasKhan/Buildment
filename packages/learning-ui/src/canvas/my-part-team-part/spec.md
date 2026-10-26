---
artifact: canvas-spec
course: founder-interviews
chapter: 01.03-your-part-and-the-team
slug: my-part-team-part
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: What exactly did you do?

## Teaching claim
Under "What exactly did you do?", an answer that only says "we" gets the same question again, and borrowed credit breaks at the second probe. An answer that names the team's work and then says "my part was..." moves the interview forward.

## Why a canvas
The chapter explains the rule. A sequence makes the learner see the order of questions and the moment a claim breaks, and shows that the strong answer comes from preparation (Samer's notes), not from luck in the room. A single before-and-after table would hide the second probe.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow, the step note and chips, and an outcome badge on the steps where the claim breaks ("borrowed credit", "claim breaks") and where it works ("clear line", "moves on").
- Rule: three actors (Founder, Samer, Samer's notes); nine steps: question, team-only list, same question, claim of everything, the check question that breaks it, Samer writes his part in his notes, the notes give the words, the strong answer, the founder moves to "Why flag?".
- Assumptions: the founder asks a small check question when a claim is wide; the facts match chapter 1.1 (a team of four, an address check, a choice to flag and not block, the dispatch call sheet).
- Limitations: one conversation; real follow-ups differ. Borrowing is named as a kind of faking by researchers who study interview faking (dossier finding 6); saying "we" is not itself faking.

## Rendering
- Primary: the shared sequence renderer, three lanes.
- Arrow labels are 18 characters or fewer ("who wrote filters?" is exactly 18). Loops (from equal to to) show work inside an actor.
- Static fallback: the chapter tells the weak and strong answers in prose after the canvas.

## Controls
Shared stepper controls only.

## Visualisation
Three lanes with numbered arrows. Tone: warn on the team-only list, bad on the claim and its break, good on the notes and the strong answer; each tone has a text badge.

## Copy
- What this shows: two answers to the same question and how the founder reacts to each.
- Try this: 1. At step 4, say what the founder asks next, then check step 5. 2. At step 8, find the sentence about the team and the sentence about Samer.
- What changed: the weak answer needed three founder questions to fall apart; the strong one led to a new question about a decision.
- Limits of the model: as in `limits`.

## Edge cases
Steps 5 and 6 cross the middle lane; arrow labels are short enough for the narrow layout.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` describes the whole flow; no colour-only meaning.

## Acceptance criteria
- [x] The claim is testable (quiz items in 1.3 and 1.5 ask for the accurate "I" and "we" answer).
- [x] The model is tested (registry and label-fit tests, run by the orchestrator).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose in 1.3).

## Build plan
`packages/learning-ui/src/canvas/my-part-team-part/data.ts` (export `myPartTeamPart`), registered by the orchestrator in `registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by the registry tests; preview at `/workspace/canvases`.

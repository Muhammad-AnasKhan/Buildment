---
artifact: canvas-spec
course: build-with-ai
chapter: 01.03-you-make-the-call
slug: who-makes-the-call
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Who makes the call?

## Teaching claim
AI can draft options; a person checks, decides and owns the result. The machine refuses "AI decides" and "ship unchecked", and the person's choice may still be the AI's own suggestion.

## Why a canvas
The chapter's hook tells Dina's first try (the mistake) and its worked example walks Yara through a different decision in prose. The canvas shows the rule as a machine: which moves exist, which two are refused, and that the only way from a draft to an owned result goes through a person's check and choice. A static list of "AI does / you do" cannot show a refused move.

## Model
- Inputs: none beyond the shared step controls.
- Outputs: the highlighted state, the active edge, the step note, chips and outcome badge.
- Rule: five states (Question, Options drafted, Owned, Checked, Decided) and six edges. Allowed path: Question, AI drafts, Options drafted, you (check), Checked, you choose, Decided, own, Owned. Refused: "AI decides" (a loop on Question) and "ship unchecked" (Options drafted to Owned, drawn dashed; the state does not change).
- Assumptions: each check gives a clear yes or no; one person decides.
- Limitations: real decisions can have more options, a committee, or unsure checks; fixing a problem after posting is left out.

## Rendering
- Primary: the shared state-machine renderer.
- Grid (3 columns by 2 rows): Question (0,0), Options drafted (1,0), Owned (2,0); Checked (1,1), Decided (2,1); cell (0,1) is empty.
- Why this layout: the refused loop on Question needs the cell below it empty, because the narrow layout puts the loop label where a row 1 pill would be. The refused "ship unchecked" edge runs straight along row 0 from Options drafted to Owned, so the picture shows the short way (dashed, refused) next to the long way round through Checked and Decided.
- Same-column edges ("you" from Options drafted to Checked, "own" from Decided to Owned) have labels of 3 characters, because the narrow layout turns them into short horizontal edges with about 22px between pills.
- No diagonal edges. Longest edge label: "ship unchecked" (14 characters).
- Static fallback: chapter 1.3 explains the five states and both refused moves in prose after the canvas.

## Controls
Shared stepper controls only. No numeric inputs: the claim is about who may make which move.

## Visualisation
Five pills, four allowed arrows and two refused (dashed) moves. Tones: bad with the badge "refused" on both refused steps; good with badges "decided" and "owned" on the last two steps.

## Copy
- What this shows: one decision from question to owned result, with the two moves a responsible process refuses.
- Try this:
  1. Before step 6, predict: can Dina use the timetable the AI recommended, or must she choose B to stay in charge? (Matches the chapter's predict.)
  2. At step 5, which of Dina's three checks could the AI have known, and which could only come from her?
  3. Look at the two refused moves. What would each one have cost the club?
- What changed: each step note says who made the move and why it is allowed or refused.
- Limits of the model: as in `limits`.

## Edge cases
- Step 3 lights Options drafted with no edge.
- Two steps light the same state (Question, then Options drafted) with a refused edge; the state does not change on a refused step.
- Facts match the chapter: four teams, one hall, hall closes at 18:00 on Thursdays, coach clash in B on Monday at 16:00, youngest team done by 17:00.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole path for screen readers; every tone has a text badge.

## Acceptance criteria
- [x] The claim is testable: the quizzes after the canvas transfer it to a café booking tool (agreeing with a checked AI pick) and an exam seating plan (who is accountable).
- [x] The model is tested: registry consistency, label-fit and label-overlap tests, once registered.
- [x] The design is simple and legible: five states, six edges, no diagonals.
- [x] Prediction before (chapter predict, first line of `tryThis`), transfer check after.
- [x] Reader fallback exists: the prose in chapter 1.3.

## Build plan
`frontend/src/canvas/who-makes-the-call/data.ts`, export `whoMakesTheCall` (StateMachineSpec). To be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.

## Placement
Chapter 1.3, section "Dina's second try", after the predict and before "Where it goes wrong".

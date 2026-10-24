---
artifact: canvas-spec
course: build-with-ai
chapter: 04.02-the-shape-of-a-daily-lab
slug: daily-lab-loop
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: One lab day, in four parts

## Teaching claim
A lab day has four parts, study, build, break one thing and write, in about 30 to 45 minutes; when the build gets stuck you loop back to a smaller step instead of running past your time, and a power cut ends the day at "write what you have", which still counts as a lab day.

## Why a canvas
The chapter states the four parts and sizes them in prose. The two exits from the plan, stuck and power cut, are moments of decision. The chapter's predict asks what the log shows for /K7QA, and the prose asks the learner to decide what they would do first at minute 18; stepping through answers both, and shows the loop on Build that a static list of four parts flattens.

## Model
- Inputs: none beyond the step controls.
- Outputs: the highlighted state, the active edge, the step note and chips.
- Rule: five states. The main path Study, Build, Break one thing, Write it down; a loop on Build labelled "stuck"; a side exit from Build to "Short write-up" labelled "power cut". Six steps: study, stuck at minute 18, a smaller step runs at minute 24, the break (a short code in capital letters), the write (to minute 40), and lab day 6 ended by a power cut after the study part, at minute 20.
- Fixed data (Yara's lab day 3, as in chapter 4.2): study 10, build 15, break 5, write 10, total 40 minutes; stuck at minute 18 with the build ending at minute 25; runs at minute 24; /K7QA instead of /k7Qa gives source=db and not found.
- Assumptions: the minutes are the course's guide and Yara's example, not a rule.
- Limitations: some problems cannot be made smaller in one evening; then the smaller step is writing down the exact error and what was tried.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: main path on row 1 (Study col 0, Build col 1, Break one thing col 2), Write it down at col 2 row 0, Short write-up at col 0 row 0. The rows were chosen so that the "power cut" diagonal label does not overlap the "then" label in the narrow layout (checked with the registry geometry).
- The only same-column edge (Break one thing to Write it down) is labelled "log", three characters, because it becomes horizontal on phones with about 22px between pills.
- Names are 15 characters or fewer; the longest sub is "write what you have".
- Static fallback: chapter 4.2 plans the same lab before the canvas and tells the stuck moment and the power cut in prose after it.

## Controls
Shared stepper controls only.

## Visualisation
Five pills and five edges, one of them a loop. Tones: warn on stuck and on the power cut, good on the smaller step that runs and on the written entry, each with a text badge.

## Copy
- What this shows: one 40-minute lab and the two ways a day leaves the plan.
- Try this: 1. Go to step 4 to check the chapter's prediction (the log says source=db and the page says not found). 2. At step 2, compare what you would do first with step 3.
- What changed: each step note says the minute, what happened and what she did.
- Limits of the model: as in `limits`.

## Edge cases
Step 5 (write) has no edge. Step 6 moves to another evening, and its title says so. Steps 2 and 3 both light Build, first with the loop and then with the exit edge.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole day, including the power cut, for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quizzes after the canvas ask for the right plan in 35 minutes and for a question small enough for one lab).
- [x] The model is tested (registry consistency and label-fit tests; checked locally with the registry geometry).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose in 4.2).

## Build plan
`packages/learning-ui/src/canvas/daily-lab-loop/data.ts`, export `dailyLabLoop`, to be registered in `packages/learning-ui/src/canvas/registry.ts` and the slug lists by the orchestrator; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.

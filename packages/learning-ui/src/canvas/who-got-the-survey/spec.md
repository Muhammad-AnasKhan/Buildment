---
artifact: canvas-spec
course: cause-and-effect
chapter: 02.04-survivors-and-selection
slug: who-got-the-survey
version: 1
owner: chapter-writer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Who got the survey, and who was never asked?

## Teaching claim
A number drawn only from the people who stayed describes the survivors, not everyone who started. Follow every path from the start to see who is missing, and treat answers from the missing group as a second filtered group.

## Why a canvas
The two paths from sign-up are the lesson. Stepping down the survivors' path first, then back to the start and down the other path, shows the learner how much of the group the survey never saw, and lets them guess what the missing students will say before the replies appear.

## Model
- Inputs: none beyond the step controls.
- Outputs: the highlighted state, the active edge, the step note and chips.
- Rule: six states. Row 0: 400 signed up, 100 still using, 92 say it helped. Row 1: 300 stopped, 30 emailed, 20 replied. Five edges; seven steps.
- Assumptions: the numbers of chapter 2.4 (92 + 8 + 300 = 400; replies 11 + 6 + 3 = 20).
- Limitations: only 20 of the 300 replied; replies are a filtered group too.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 by 2. The edge from "400 signed up" to "300 stopped" runs inside one column, so its label is "out" (3 characters). No diagonal edges.
- Static fallback: chapter 2.4 gives the same numbers in prose and works out 23 in every 100.

## Controls
Shared stepper controls only (Back, Next, Play/Pause, Start over, numbered step chips). No numeric inputs: the claim is about order and evidence.

## Visualisation
Labelled pills or lanes with arrows from the shared renderer. Tones come from `primitives/tones.ts` only, and good, warn and bad always sit next to a text outcome badge.

## Copy
- What this shows: both paths from sign-up, and who the survey reached.
- Try this: 1. Before step 7, guess whether many who replied say the app did not help. 2. At step 5, work out what share of all 400 is known to have felt helped.
- What changed: step 5 turns 92 out of 100 into at least 92 out of 400; step 7 shows the missing students tell a different story.
- Limits of the model: as in `limits`.

## Edge cases
Steps 3 and 7 light a state with no edge. Warn tone with text badges on the never-asked and second-filter steps.

## Accessibility
Shared stepper keyboard support (arrow keys, Home, End) and the shared focus ring; `summary` gives the whole model for screen readers; tone is never the only signal. Reduced motion follows the renderer's rule.

## Acceptance criteria
- [x] The claim is testable: the quiz items after the canvas ask for the main problem with a graduates claim and with conclusions from written complaints.
- [ ] The model is tested (registry consistency and label-fit tests, once the orchestrator registers the slug).
- [x] The design is simple and legible (checked against the renderer geometry for the narrow and wide layouts).
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (the chapter teaches the claim in prose).
- [x] Names, numbers and facts match the chapter exactly; no em or en dashes, idioms or brand names.

## Build plan
`packages/learning-ui/src/canvas/who-got-the-survey/data.ts`, to be registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.

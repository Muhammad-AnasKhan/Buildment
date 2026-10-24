---
artifact: canvas-spec
course: founder-interviews
chapter: 07.02-feedback-and-gaps
slug: feedback-to-next-project
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Tala reads her feedback card

## Teaching claim
Practice feedback is evidence to check, not a verdict: find your own words in the transcript for each line, keep the lines the transcript supports, question the ones it does not (AI tools tend to agree with you and to like long answers), compare the same flags across practice interviews, and turn the gap you find in your story bank into a plan with a step and a date.

## Why a canvas
The chapter explains the method in prose. Stepping through one real card makes the learner decide, line by line, whether the transcript supports the line before the canvas says so. Step 4 puts a supported flag and an unsupported praise side by side on the same state, which a static diagram would flatten.

## Model
- Inputs: none beyond the step controls (Back, Next, Play, step chips).
- Outputs: the highlighted state, the active edge, the step note and chips, and a tone badge on the keep or question steps.
- Rule: six states in a fixed path (the card, find your words, keep or question, compare drills, find the gap, plan to fill it); five transitions; seven steps. Steps 3 and 4 both sit on "Keep or question": the flag is kept, the praise is questioned.
- Assumptions: one card, two lines checked; every verdict rests on a quoted piece of the transcript; the numbers match chapter 7.2 (one flag, three strengths, about 190 words, 3 flags in the first card).
- Limitations: a real card has more lines and an unclear transcript may need a mentor; the card can be wrong in both directions.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 columns by 2 rows, a snake (left to right on row 0, back right to left on row 1), as in `five-whys-chain`.
- Edge labels: 2 to 12 characters. The edge between the two states in column 2 is labelled "so" (2 characters), which fits the short sideways arrow on a phone.
- Static fallback: chapter 7.2 walks the same card in prose before the canvas.

## Controls
Shared stepper controls only. No numeric inputs: the claim is about the order of checks, not about quantities.

## Visualisation
Six labelled pills and five arrows. Tone: good on the kept flag, the first-to-last comparison and the plan; warn on the questioned praise. Every tone has a text outcome badge.

## Copy
- What this shows: one feedback card checked against the transcript, then turned into a plan.
- Try this:
  1. At step 3, check your prediction. Did the transcript support the flag?
  2. At step 4, count the numbers in the long answer. Why is a long answer not the same as a result?
- What changed: each step note says which words were found and what the learner decides.
- Limits of the model: as in `limits`.

## Edge cases
Step 4 revisits "Keep or question" without an edge, so the renderer shows the state with no active arrow. State names are 18 characters or fewer. The names, numbers and facts match chapter 7.2 and 7.1 exactly: no dashes, idioms or brand names in the text.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole path for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (the quiz after the canvas asks for the same check on a new card).
- [x] The model is tested (registry consistency and label-fit tests).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (the card is walked in prose in 7.2).

## Build plan
`packages/learning-ui/src/canvas/feedback-to-next-project/data.ts`, registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.

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
Practice feedback is evidence to check, not a verdict: tag your own answers with the five flag names first (the card's Things to watch list can miss a flag), compare your tags with the card, keep the lines your own words support, question the ones they do not (AI tools tend to agree with you and to like long answers), compare your tags across practice interviews, and turn the gap you find in your story bank into a plan with a step and a date.

## Why a canvas
The chapter explains the method in prose and works it through on a different case (Fares). The canvas makes the learner think before each step: every step note ends with one short question that the next step answers, so the learner decides whether the transcript supports a line before the canvas says so. Steps 3 and 4 put a line both sources support and a line only the card makes side by side on the same state, which a static diagram would flatten. It is not a replay of the chapter text: the chapter does not retell Tala's steps.

## Model
- Inputs: none beyond the step controls (Back, Next, Play, step chips).
- Outputs: the highlighted state, the active edge, the step note and chips, and a tone badge on the keep or question steps.
- Rule: six states in a fixed path (tag first, read the card, keep or question, compare drills, find the gap, plan to fill it); five transitions; seven steps. Steps 3 and 4 both sit on "Keep or question": the line both sources support is kept, the praise only the card makes is questioned.
- Assumptions: one card, two lines checked; every verdict rests on a quoted piece of the transcript; the numbers match chapters 7.1 and 7.2 (one tag in the last interview, three in the first, about 190 words, the card has three strengths and one weakness). The card has no flags field, as on the platform.
- Limitations: a real card has more lines and an unclear transcript may need a mentor; the card can be wrong in both directions; self-tags can be too kind.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 columns by 2 rows, a snake (left to right on row 0, back right to left on row 1), as in `five-whys-chain`.
- Edge labels: 2 to 12 characters. The edge between the two states in column 2 is labelled "so" (2 characters), which fits the short sideways arrow on a phone.
- Static fallback: chapter 7.1 tells Tala's two interviews in prose, and 7.2 teaches the four steps on a different case.

## Controls
Shared stepper controls only. No numeric inputs: the claim is about the order of checks, not about quantities.

## Visualisation
Six labelled pills and five arrows. Tone: good on the kept line, the first-to-last comparison and the plan; warn on the questioned praise. Every tone has a text outcome badge.

## Copy
- What this shows: one feedback card checked against the learner's own tags and words, then turned into a plan.
- Try this:
  1. At step 7, check your prediction: what should Tala say if her lead says no?
  2. At each question, answer in your own words before pressing Next. At step 4, count the numbers in the long answer first.
- What changed: each step note says which words were found and what the learner decides.
- Under the canvas in the chapter: two or three sentences only (what it shows, what to try first, the limit). No totals or verdicts are repeated.
- Limits of the model: as in `limits`.

## Edge cases
Step 4 revisits "Keep or question" without an edge, so the renderer shows the state with no active arrow. State names are 18 characters or fewer. The names, numbers and facts match chapters 7.1 and 7.2 exactly: no dashes, idioms or brand names in the text.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole path for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (the quiz after the canvas asks for the same check with a missing fact).
- [x] The model is tested (registry consistency and label-fit tests).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (7.1 and 7.2 teach the same method in prose).

## Build plan
`packages/learning-ui/src/canvas/feedback-to-next-project/data.ts`, registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.

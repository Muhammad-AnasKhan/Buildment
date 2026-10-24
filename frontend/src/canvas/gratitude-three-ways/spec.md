---
artifact: canvas-spec
course: faith-and-resilience
chapter: 04.02-gratitude-you-can-practise
slug: gratitude-three-ways
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Gratitude in three places

## Teaching claim
Gratitude lives in the heart, the tongue and action, including thanking the people who helped.

## Why a canvas
Learners often treat gratitude as a feeling they either have or lack, and wait for it before they act. Step 1 starts on a flat evening on purpose. Drawing the heart, the tongue and the hands as three lanes, with a fourth lane for the person who helped, shows gratitude as movement between places: noticed, said, thanked, used and passed on. The lanes make it visible that a thank you to Yousef and a CV for Yousef are both gratitude.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the note, chips and badge.
- Rule: four lanes (Heart, Tongue, Hands, Yousef) and six steps: notice (loop in Heart), alhamdulillah (Heart to Tongue), thank you (Tongue to Yousef), use it well (Heart to Hands, portfolio 8 to 11 pieces), a CV design (Hands to Yousef), looks below (loop in Heart).
- Arithmetic: 8 portfolio pieces plus the menu and two logos is 11; the two logo jobs paid $60 and $45, $105 in total, as in chapters 4.1 and 4.2.
- Assumptions: sources only from the course dossier (Quran 31:12, 2:152; Sunan Abi Dawud 4811; Sahih al-Bukhari 4836; Sahih Muslim 2963).
- Limitations: one good evening in a neat order; gratitude is not always this tidy. No measure of gratitude or reward.

## Rendering
- Primary: the shared sequence renderer.
- Four actors, the maximum. Arrow labels are 18 characters or fewer ("thank you, brother" is exactly 18).
- Static fallback: chapter 4.2 teaches each place in prose, with a mermaid diagram and a worked example of the same evening.

## Controls
Shared stepper controls only.

## Visualisation
Four lanes and six arrows or loops. Tone: good on "use it well" with the badge "8 to 11 pieces".

## Copy
- What this shows: one evening of Ahmad's gratitude, from heart to tongue to hands, and to his brother.
- Try this:
  1. At step 1, check the prediction: did Ahmad wait to feel grateful before he started?
  2. Count the steps in the Hands lane, and pick one you could do this week.
- What changed: each note names the place, the action and the source.
- Limits of the model: as in `limits`.

## Edge cases
Loops draw work inside one lane. "Look at those below you" is shown only as a tool Ahmad uses on himself, never said to another person. No Arabic script; "alhamdulillah" appears in Latin letters.

## Accessibility
Shared stepper keyboard support; `summary` describes the whole evening; the tone has a text badge.

## Acceptance criteria
- [ ] The claim is testable (quiz items after the canvas ask about thanking a person who helps, and the right use of "look at those below you").
- [ ] The model is tested (registry label-fit tests, once registered).
- [ ] The design is simple and legible.
- [ ] Prediction before, transfer check after.
- [ ] Reader fallback exists (prose and mermaid in 4.2).

## Build plan
`frontend/src/canvas/gratitude-three-ways/data.ts` (export `gratitudeThreeWays`), to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.

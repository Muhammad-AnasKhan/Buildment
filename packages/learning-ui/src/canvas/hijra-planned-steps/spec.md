---
artifact: canvas-spec
course: faith-and-resilience
chapter: 02.04-the-prophets-planning
slug: hijra-planned-steps
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: The Hijra: planned steps, and trust in the cave

- **Export:** `hijraPlannedSteps` in `data.ts`

## Teaching claim
Every step of the Hijra in Sahih al-Bukhari 3905 was planned, and the trust in the cave came with the plan, not instead of it.

## Why a canvas
The claim is about order and number: many planned steps, in sequence, before one moment of pure trust. Stepping through them one at a time lets the learner count the planning before reaching the cave, and the lanes show that the plan involved many people, each with a job. A paragraph lists the steps; the canvas makes the learner walk through them.

## Model
- Inputs: none beyond the shared step controls (Back, Next, Play, step chips).
- Outputs: the active arrow, the step note, chips and an outcome badge.
- Rule: four actors (the Prophet; Abu Bakr; Abu Bakr's family; the helpers Amir and the guide); nine steps in the order the hadith gives them: camels fed for four months, the visit at noon, payment for the camel, food packed and Asma's belt, the guide hired, Abdullah's news, Amir's milk, the trust in the cave, the guide's return with the camels.
- Sources: Sahih al-Bukhari 3905 for every planning step; Sahih al-Bukhari 2979 for the belt cut in two; Sahih al-Bukhari 3653 and Quran 9:40 (cave clause only) for the trust.
- Assumptions: none beyond the sources; the order follows the hadith.
- Limitations: no details from outside these sources (no spider, no dove, no account of any search, no guide's name), no battle context, and no comparison with any other time or place.

## Rendering
- Primary: the shared sequence renderer.
- Four lanes, so each lane is about 77px wide on a phone: actor names are 11 characters or fewer and subtitles 13 or fewer; the Prophet's lane has no subtitle, and the honorific is in the first step's note. Arrow labels are 17 characters or fewer.
- Static fallback: chapter 2.4 tells every step in prose, in the same order, before the canvas.

## Controls
Shared stepper controls only. No numeric inputs: the claim is about the order and the number of planned steps.

## Visualisation
Four lanes, nine arrows, two of them loops (Abu Bakr feeding the camels; the family packing the food). Tone: good on the trust step, with the badge "trust".

## Copy
- What this shows: the planned steps of the Hijra in order, and the trust in the cave.
- Try this: 1. Check the prediction about the guide at step 5, then count the planned steps before step 8. 2. Name which earlier steps made the cave possible.
- What changed: each step note says what was done, by whom, and the source.
- Limits of the model: as in `limits`.

## Edge cases
Two consecutive arrows run from the Prophet's lane to Abu Bakr's; their labels differ. Loop labels sit to whichever side of the lane has room. No Arabic script, no brand names, no dashes.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole sequence for screen readers; tone always has a text badge.

## Acceptance criteria
- [ ] The claim is testable (the chapter's quiz transfers the pattern of planning, an expert chosen for skill, and trust to new cases).
- [ ] The model is tested (registry consistency and label-fit tests once registered).
- [ ] The design is simple and legible.
- [ ] Prediction before, transfer check after.
- [ ] Reader fallback exists (prose steps in 2.4).

## Build plan
`packages/learning-ui/src/canvas/hijra-planned-steps/data.ts`, to be registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.

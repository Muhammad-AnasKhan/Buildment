---
artifact: canvas-spec
course: faith-and-resilience
chapter: 03.04-waiting-well
slug: yusuf-waiting-well
version: 2
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Waiting well in Surah Yusuf

## Teaching claim
In Surah Yusuf nobody waits by doing nothing: Yaqub waited with beautiful patience and kept searching, Yusuf asked to be remembered and then waited several years, and at the end he forgave and named Allah's kindness.

Version 2 (revision round 1): the canvas no longer says that Yusuf's request in 12:42 "was a means". Classical commentary reads that verse in more than one way, so step 2 states only what the verse says and adds "Scholars read this verse in more than one way; ask a scholar you trust." The predict now asks what Yusuf spoke of at the end (12:100).

Note for the orchestrator: the roadmap's claim says Yusuf "kept doing good in every place he waited". The dossier does not describe what Yusuf did in prison beyond the request in 12:42, so "doing good" rests on Yusuf's own words in 12:90, and the search rests on Yaqub (12:86 to 87).

## Why a canvas
The story is spread over many verses, and learners often remember it as events done to Yusuf. Stepping through it place by place shows what was done in each place. The last step returns to the several years to show the wait was not wasted (12:90).

## Model
- Inputs: none beyond the step controls.
- Outputs: the highlighted state, the active edge, the note and chips.
- Rule: six states in a snake (Yaqub waits, Yusuf in prison, Forgotten, Recognised, He forgives, Family together), five edges, seven steps; the last revisits Forgotten as the summary.
- Honorifics: the first mention of Yaqub and of Yusuf in the step notes carries "peace be upon him".
- Assumptions: only what the course dossier states: Quran 12:18, 12:42, 12:86 to 87, 12:90, 12:92, 12:100.
- Limitations: much of the surah is left out. No number of years is given, because the Quran gives none ("several years", 12:42). No single reading of 12:42 is asserted. Nothing explains why anyone waited.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 columns by 2 rows, a snake (left to right on row 0, right to left on row 1). The same-column edge from Forgotten to Recognised is labelled "yet" (three characters) because it becomes a short sideways arrow on a phone.
- Static fallback: chapter 3.4 tells the same steps in prose with each reference.

## Controls
Shared stepper controls only. No numbers: the claim is about what was done while waiting, not how long.

## Visualisation
Six labelled pills and five arrows. Tone: warn on Forgotten ("a long wait"), good on Family together and the summary, each with a text badge.

## Copy
- What this shows: the waiting in Surah Yusuf, place by place.
- Try this:
  1. At step 6, check the prediction: what did Yusuf speak about at the end?
  2. Look at each place: what was someone doing there while they waited?
- What changed: each note says what was done in that place, with its verse.
- Limits of the model: as in `limits`.

## Edge cases
Step 1 has no edge; step 7 revisits a state without an edge. State names are 15 characters or fewer. No Arabic script in the canvas.

## Accessibility
Shared stepper keyboard support; `summary` gives the whole story for screen readers; tone always has a text badge.

## Acceptance criteria
- [ ] The claim is testable (quiz items after the canvas transfer "keep doing good and using means while waiting" and the dua of Yunus to new cases).
- [ ] The model is tested (registry consistency and label-fit tests).
- [ ] The design is simple and legible.
- [ ] Prediction before, transfer check after.
- [ ] Reader fallback exists (prose in 3.4).

## Build plan
`packages/learning-ui/src/canvas/yusuf-waiting-well/data.ts` (export `yusufWaitingWell`), registered in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.

---
artifact: canvas-spec
course: faith-and-resilience
chapter: 03.04-waiting-well
slug: yusuf-waiting-well
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Waiting well in Surah Yusuf

## Teaching claim
In Surah Yusuf nobody waits by doing nothing: Yaqub waited with beautiful patience and kept searching, Yusuf used the means he had and stayed mindful of Allah and patient when it failed for several years, and at the end he forgave and named Allah's kindness.

Note for the orchestrator: the roadmap's claim says Yusuf "kept doing good in every place he waited". The dossier does not describe what Yusuf did in prison beyond asking the freed man to mention him (12:42), so the canvas grounds "doing good" in Yusuf's own words in 12:90 (the mindful and patient, whose reward as doers of good is not lost) and adds Yaqub's search (12:86 to 87). No story detail beyond the dossier is used.

## Why a canvas
The story is spread over many verses, and learners often remember it as events done to Yusuf. Stepping through it place by place, with what was done in each place, makes the pattern of waiting well visible, and the last step returns to the failed means to show the waiting was not wasted.

## Model
- Inputs: none beyond the step controls.
- Outputs: the highlighted state, the active edge, the note and chips.
- Rule: six states in a snake (Yaqub waits, Yusuf in prison, Forgotten, Recognised, He forgives, Family together), five edges, seven steps; the last revisits Yusuf in prison as the summary.
- Assumptions: only what the course dossier states: Quran 12:18, 12:42, 12:86 to 87, 12:90, 12:92, 12:100.
- Limitations: much of the surah is left out. No number of years is given, because the Quran gives none ("several years", 12:42). Nothing explains why anyone waited.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 columns by 2 rows, a snake (left to right on row 0, right to left on row 1). The same-column edge from Forgotten to Recognised is labelled "yet" (three characters) because it becomes a short sideways arrow on a phone.
- Static fallback: chapter 3.4 tells the same steps in prose with each reference.

## Controls
Shared stepper controls only. No numbers: the claim is about what was done while waiting, not how long.

## Visualisation
Six labelled pills and five arrows. Tone: warn on Forgotten ("the means failed"), good on Family together and the summary, each with a text badge.

## Copy
- What this shows: the waiting in Surah Yusuf, place by place.
- Try this:
  1. At step 2, check the prediction: was asking the freed man a lapse in trust, or a means?
  2. At step 6, notice what Yusuf chose to talk about at the end.
- What changed: each note says what was done in that place, with its verse.
- Limits of the model: as in `limits`.

## Edge cases
Step 1 has no edge; step 7 revisits a state without an edge. State names are 15 characters or fewer. No Arabic script in the canvas.

## Accessibility
Shared stepper keyboard support; `summary` gives the whole story for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quiz items after the canvas transfer "a means that failed is not a lapse in trust" and "keep doing good while waiting" to new cases).
- [x] The model is tested (registry consistency and label-fit tests, once registered).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose in 3.4).

## Build plan
`frontend/src/canvas/yusuf-waiting-well/data.ts` (export `yusufWaitingWell`), to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.

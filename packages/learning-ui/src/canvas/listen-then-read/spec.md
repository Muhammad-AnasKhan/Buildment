---
artifact: canvas-spec
course: build-with-ai
chapter: 03.05-listen-then-read
slug: listen-then-read
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Listen first, then read and check

## Teaching claim
Sources first: trusted sources go into a source notebook; the audio overview is for listening while you walk or wait; then you read the sources; then you check one claim the audio made against the page and find a detail it got wrong or left out.

## Why a canvas
The chapter sets up Lina's week in prose (sources, privacy check, focus prompt, size check) and stops before the result. The canvas lets the learner follow the order of the steps and predict, before step 6, whether a source-grounded audio can still be wrong. The arrows show the order the course designs: sources, notebook, audio, Lina, then back to the sources.

## Model
- Inputs: none beyond the shared step controls.
- Outputs: the active arrow between lanes, the step note, outcome badge and chips.
- Rule: four lanes (Lina, Her sources, Notebook, Audio); seven steps: choose sources, add them, make a focused overview, listen on a walk, read the chapter, check one claim (warn), write the fix (good).
- Facts (checked twice, match chapter 3.5): when several routes match, a router uses the most specific (longest matching prefix); when no route matches, the router uses its default route if it has one. The audio's wrong claim is "the first route in its table that matches". Numeric address examples were removed in revision round 1 to lower the technical load.
- Tool facts (dossier, checked 2026-10-24): the notebook is opened as the web version in the phone's browser; the overview is focused with a prompt; the file size is checked before download; the phone-browser download is tried, with listening while connected as the fallback (dossier U3: untested). No length in minutes appears anywhere.
- Assumptions: the three sources are correct; one claim is checked.
- Limitations: on another day the checked claim may be right; tool features change.

## Rendering
- Primary: the shared sequence renderer, narrow layout below `sm`.
- Lane names are short ("Notebook", "Audio") so four lanes fit 340px; the subs say "web version" and "short overview".
- Arrow labels are 17 characters or fewer.
- Step 7 is a loop on Lina's lane (writing the fix in her own notes).
- Static fallback: chapter 3.5 describes the check and its result in prose after the canvas ("What the check found").

## Controls
Shared stepper controls only.

## Visualisation
Four lanes, one arrow per step. Warn tone on the checked claim, good tone on the corrected rule; each with a text badge.

## Copy
- What this shows: the audio is where Lina meets the topic; the page is where she checks it.
- Try this: 1. At step 6, read the audio's claim and the page's rule side by side before you look at the badge (points at the step that answers the chapter's predict) 2. Which step could Lina drop if her data ran out, and which could she not?
- What changed: each step note says what Lina did and what it gave her.
- Limits of the model: as in `limits`.

## Edge cases
Tool names are not used in the canvas: the lanes are "Notebook" and "Audio". The lab partner's name is removed in step 1, matching the chapter's privacy check.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole week for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quiz after the canvas asks for the next step when an audio claim disagrees with a source page).
- [ ] The model is tested (registry consistency and label-fit tests, run by the orchestrator after registration).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose in 3.5).

## Placement
Chapter 3.5, section "From the walk to the page", after the predict and before "What the check found".

## Build plan
`packages/learning-ui/src/canvas/listen-then-read/data.ts`, exporting `listenThenRead`. To be registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and the shared slug lists; covered by `frontend/tests/unit/canvas/registry.test.ts`.

---
artifact: canvas-spec
course: build-with-ai
chapter: 05.05-learn-from-open-source
slug: reuse-open-source-safely
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Reuse open-source code, within the licence

## Teaching claim
Reusing open-source code safely is a sequence: find a project, check its licence first, check its health, read it in order (README, run it, one folder), reuse only within the licence, and credit it; copying from a project with no licence is refused, and so is replacing the licence notice with a thank-you.

## Why a canvas
The chapter states the licence cases in a table and the reading order in prose. The canvas puts them in the order a fellow meets them, and shows the two refusals as moves the machine will not make, at the exact point where people try them: right after finding a popular unlicensed project, and right after adding a README credit.

## Model
- Inputs: none beyond the shared step controls.
- Outputs: the highlighted state, the active edge, the step note and chips.
- Rule: six states on a 3 by 2 grid in a snake (Project found, Licence checked, Health checked on row 0; Read in order, Part reused, Credit given on row 1, right to left); five transitions; two rejected loops ("copy anyway" on Licence checked, "drop notice" on Credit given); eight steps.
- Assumptions: shortlane is a made-up project with an MIT licence, a commit three weeks ago, nine contributors and answered issues; Yara reads it on lab day 9 (week 9) and reuses a 20-line function in week 9, her short codes week.
- Limitations: four licence cases only; not legal advice; health signs do not make code correct.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: columns 0 to 2, rows 0 to 1. The only edge between two states in the same column is Health checked to Read in order, labelled "ok" (2 characters), because it becomes horizontal on phones with about 22px between pills.
- No diagonal edges. The two rejected loops sit on states in different columns and rows (column 1 row 0, column 0 row 1), so their labels do not overlap in the narrow layout, where loops sit to the right of the pill.
- Edge labels are at most 13 characters.
- Static fallback: chapter 5.5 covers finding, health and the reading order in prose before the canvas, and the four licence cases and credit right after it.

## Controls
Shared stepper controls only. No numeric inputs: the claim is about order and permission.

## Visualisation
Six labelled pills, five arrows and two rejected loops. Tone good on the MIT licence, the health check, the reuse within the licence and the final credit; bad on the two refused moves; every tone has a text badge.

## Copy
- What this shows: `purpose` in `data.ts`.
- Try this:
  1. Step 2 then step 7: the notice is MIT's one condition, and a README thank-you does not replace it (answers the chapter's predict without restating it).
  2. Step 3: stars do not change what she may copy.
  3. Steps 4 and 5: health says the project is worth reading; the order says where to start.
- What changed: each step note says what was checked or done and why it is allowed or refused.
- Limits of the model: `limits` in `data.ts`.

## Edge cases
Step 3 and step 7 are rejected loops: the state stays the same. Step 8 revisits Credit given with no edge; the renderer shows the state with no active arrow. State names are at most 15 characters.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole path, including both refusals, for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable: the quiz after the canvas (Saleh's pharmacy app) asks which reuse a licence allows, and a second item (Malak's school timetable) asks which project's health signs make it worth studying.
- [x] The model is tested by the shared registry consistency, label-fit and label-overlap tests.
- [x] The design is simple and legible.
- [x] Prediction before (on what condition she may reuse MIT code: keep the notice, or thank the author), transfer check after.
- [x] Reader fallback exists (prose and table in 5.5).

## Placement
In chapter 5.5, under "May she reuse it?", after the predict and before "Licences in four cases". Names and numbers match the chapter: shortlane (made up), MIT, last commit three weeks ago, nine contributors, a 20-line function, the README line.

## Build plan
`frontend/src/canvas/reuse-open-source-safely/data.ts` exporting `reuseOpenSourceSafely`; the orchestrator registers it in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`.

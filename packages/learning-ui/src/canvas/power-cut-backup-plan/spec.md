---
artifact: canvas-spec
course: building-habits
chapter: 03.04-power-cuts-and-weak-internet
slug: power-cut-backup-plan
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Three versions through a hard week

## Teaching claim
A habit with only one version breaks on hard days; a habit with a full, a backup and a smallest version continues through no power and weak internet, and returns to full when conditions return.

## Why a canvas
The chapter tells the week in prose. Stepping through the same four evenings twice, with the version changing on the top row and the misses piling up on the bottom row, makes the difference visible as a sequence. A static table would show the totals (4 of 4 against 1 of 4) but not that every version starts from the same cue and that the gap is what makes the restart hard.

## Model
- Inputs: none beyond the shared step controls.
- Outputs: the highlighted state, the active edge, the step note, chips and outcome badge.
- Rule: six states on a 3 by 2 grid. Row 0: full, backup, smallest. Row 1: only one version, day missed, three days missed. Edges "weak net" and "no power" along each row (horizontal in the wide layout; no edge inside a column; no diagonal). Eight steps: Monday full, Tuesday backup, Wednesday smallest, Thursday backup (revisit), back to full (revisit), then the one-version week: Monday done, Tuesday missed, Wednesday and Thursday missed.
- Assumptions: the chapter's case (Monday normal, Tuesday weak internet, Wednesday and Thursday no evening power after the schedule changes to 06:00 to 14:00; 20, 10 and 2 minutes).
- Limitations: real weeks are messier; some evenings even the smallest version will not happen.

## Rendering
- Primary: the shared state-machine renderer.
- Why this renderer: the claim is about which state the habit is in on each kind of evening and what each condition moves it to.
- Grid: 3 columns by 2 rows; edge labels are 8 characters, all on edges between columns, so they sit beside vertical arrows in the narrow layout.
- Static fallback: the chapter's worked example lists every evening and the totals in prose, and a Mermaid diagram shows the choice at the cue.

## Controls
Shared stepper controls only.

## Visualisation
Six pills, four arrows. Tone good on the smallest-version step ("still done"), the Thursday step ("done") and the return step ("4 of 4"); bad on the missed steps ("missed", "1 of 4"). Every tone has a text badge.

## Copy
- What this shows: one habit with three versions through weak internet and no power, back to full when conditions return, next to the same habit with one version.
- Try this:
  1. Check the prediction: which habit ends the week with nothing to restart?
  2. At step 3, what did Khaled need the day before to make the smallest version possible?
- What changed: the step notes give the tracker at the end of each row: 4 of 4 with no gap; 1 of 4 with a gap of three days.
- Limits of the model: as in `limits`.

## Edge cases
Each step lights the arrow that led into its state. Steps 1, 4, 5 and 6 have no edge (the start of each row and two revisits). State names are 18 characters or fewer ("Three days missed" is 17). Edge labels are 8 characters.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives both weeks for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quiz items on Lama's versions and Iyad's return to full).
- [x] The model is tested (registry consistency and label-fit tests once registered).
- [x] The design is simple and legible.
- [x] Prediction before (which habit is easier to keep going), transfer check after.
- [x] Reader fallback exists (worked example in chapter 3.4).

## Build plan
`packages/learning-ui/src/canvas/power-cut-backup-plan/data.ts`, to be registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.

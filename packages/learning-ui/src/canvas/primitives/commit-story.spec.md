---
artifact: canvas-spec
course: shared (first used by build-with-ai v2)
chapter: shared primitive
slug: commit-story
version: 1
owner: interactive-canvas-builder
---

# Canvas spec: Commit story

## Teaching claim
The same work can leave a history a reviewer can follow or one they cannot; small commits with clear messages are the evidence of how the work was done.

## Why a canvas
Telling a learner "commit often" does not show what a reviewer sees. Putting two histories of the same work side by side, with every commit readable, does.

## Model
- Inputs: which of the two histories to show (tab), which commit is selected.
- Outputs: per history, `historyStats` (commits, total lines, largest commit, span of days); per commit, the message, `+added -removed`, files and the note.
- Formula or rule: lines changed = added + removed. Dot radius = 6 + 20 x min(1, sqrt(lines / 2000)), so 5,000 lines is the largest dot (26 units). Dots sit at their day on a shared day range and are pushed apart so they never overlap. `checkCommitStory` rejects other than two histories, duplicate ids, days out of order, negative counts and 0 or more than 12 commits.
- Assumptions: both histories describe the same work over the same days.
- Limitations: commit size is a rough signal; real review looks at the diff.

## Rendering
- Primary: inline SVG, `viewBox` 420 by 354.
- Why this renderer: dots on a lane are the picture; moving them between tabs shows the same work in two shapes.
- SVG structure: dot grid; verdict banner with the history's tone; stats line; lane with dots, day axis; a card for the selected commit (monospace message, +added, -removed, files, note).
- Controls: one `BeatSegmented` (the two histories) under the picture.
- Static fallback: the live line gives the verdict, the stats and the selected commit in words.

## Controls
Tabs switch histories and select the first commit. Tap a dot, or use Left and Right (also Up, Down, Home and End) on the lane, to select a commit.

## Visualisation
One lane of days, one dot per commit, coloured by the history's tone with the verdict text beside it. The selected dot is solid with an accent ring.

## Copy
- What this shows: the same work, two ways.
- Try this: switch the tab, then tap the biggest dot.
- What changed: the dots slide to their new places and the verdict changes.
- Limits of the model: set per slug in `limits`.

## Edge cases
One commit (centred). Twelve commits on few days (dots pushed apart, shifted back inside the lane). A 5,000-line commit (clamped dot). Two commits on the same day. Long messages wrap to two lines and long notes to three.

## Accessibility
Dots are buttons with `aria-pressed` and roving tab stops; arrow keys move along the lane. Each has a name with its number, day and message. The group has a text summary and an `aria-live="polite"` line for the selected commit. Dots slide in 500 ms; under `prefers-reduced-motion` they jump.

## Acceptance criteria
- [x] The claim is testable.
- [x] The model is tested (`frontend/tests/unit/canvas/commit-story.test.ts`).
- [x] The design is simple and legible at 375 px, light and dark.
- [ ] Prediction before, transfer check after (set by each chapter that uses it).
- [x] Reader fallback exists (live text and the chapter prose).

## Build plan
`primitives/commit-story.tsx`, factory `makeCommitStoryCanvas` in `primitives/canvas-factories.tsx`, model `models/commit-story.ts`, test `frontend/tests/unit/canvas/commit-story.test.ts`. The orchestrator registers course slugs.

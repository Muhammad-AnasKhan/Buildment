---
artifact: canvas-spec
course: build-with-ai
chapter: 10.6-keep-it-human
slug: dump-or-story
version: 1
owner: interaction-designer
renderer: custom, on the reusable Commit story primitive (primitives/commit-story.tsx, model models/commit-story.ts)
---

# Canvas spec: One dump or a story: Yara's Qasir week

## Teaching claim
The same week of work can leave one commit a reviewer cannot follow, or small commits with messages that say what changed and why; the small steps are the evidence of how the work was done.

## Why a canvas
Telling a learner to commit small does not show what a reviewer sees. Putting two histories of the same work side by side, with every commit readable, does. The learner can also see that the totals are the same: only the shape differs.

## Model
- Inputs: which of the two histories is shown (tab), and which commit is selected.
- Outputs: per history `historyStats` (commits, total lines, largest commit, span of days); per commit the message, +added, -removed, files and a note on what a reviewer learns.
- Fixed data (chapter 10.6, Yara adds click counts to Qasir, a fictional link shortener, over 7 days):
  | History | Commit | Day | Files | Added | Removed |
  |---|---|---|---|---|---|
  | One dump | update | 7 | 7 | 410 | 38 |
  | Small steps | Add clicks table and migration | 1 | 2 | 42 | 0 |
  | Small steps | Count a click when a short link is opened | 2 | 2 | 61 | 4 |
  | Small steps | Add test: two visits give a count of 2 | 3 | 1 | 38 | 0 |
  | Small steps | Fix: do not count clicks on links that do not exist | 4 | 2 | 9 | 14 |
  | Small steps | Show click counts on the link list page | 5 | 3 | 176 | 12 |
  | Small steps | README: how click counts work and one known gap | 7 | 1 | 84 | 8 |
- Checked totals: small steps add 42 + 61 + 38 + 9 + 176 + 84 = 410 and remove 0 + 4 + 0 + 14 + 12 + 8 = 38, so 448 lines changed, the same as the dump (410 + 38 = 448). The small steps touch 7 different files in all (migration, model, route, test, page template, style, README), which is the dump's file count. Largest small step: 176 + 12 = 188 lines. Span: dump 1 day, small steps 7 days.
- Assumptions: both histories describe the same work over the same week.
- Limitations: commit size is a rough signal; real review looks at the changes. The dossier (C74 to C76) says good commits are logically separate changes with a clear first line; on a squash-merge project the main branch keeps one commit and the pull request carries the story. The canvas does not show dates being set or any way to fake a history (C67), and the chapter gives no how-to.

## Rendering
- Primary: the shared Commit story, inline SVG on a 420 by 354 viewBox.
- Why this renderer: dots on a lane are the picture; switching tabs moves the same work into two shapes.
- Controls: one segmented control (the two histories) under the picture; tap a dot, or use Left and Right, to select a commit.
- Static fallback: the live line gives the verdict, the stats and the selected commit in words; chapter beat text and fold repeat the key facts.

## Controls
Tabs "One dump" and "Small steps" switch histories and select the first commit.

## Visualisation
One lane of days, one dot per commit, bigger for more lines, coloured by the history's tone (bad for the dump, good for the steps) with the verdict in words.

## Copy
- What this shows: the same week, saved two ways.
- Try this: 1. Tap the dump, read its message, then switch to Small steps. 2. Tap day 4 and read what the message tells a reviewer about the bug.
- What changed: the dots slide to new places and the verdict changes.
- Limits of the model: as in `limits`.

## Edge cases
One commit is centred. Messages are 52 characters or fewer, notes 110 or fewer, labels 14 or fewer, verdicts 40 or fewer (all checked by `checkCommitStory` and the tests). No dashes in any text.

## Accessibility
Dots are buttons with `aria-pressed` and roving tab stops; arrow keys move along the lane; each has a name with its number, day and message; a polite live region reads the selected commit; reduced motion makes dots jump.

## Acceptance criteria
- [x] The claim is testable (quick check and quiz items on commit history).
- [x] The model is tested (`checkCommitStory` returns no problems; sums checked above).
- [x] The design is simple and legible at 375 px.
- [x] Prediction before (the chapter's predict is in beat 3), transfer check after.
- [x] Reader fallback exists (beat text and fold).

## Placement
Chapter 10.6, beat 1 ("One week of Qasir, saved two ways").

## Build plan
`packages/learning-ui/src/canvas/dump-or-story/data.ts`, exports `DUMP_OR_STORY` and `dumpOrStory`, to be registered by the orchestrator in `registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by the registry tests and `checkCommitStory`.

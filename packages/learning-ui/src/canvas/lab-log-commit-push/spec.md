---
artifact: canvas-spec
course: build-with-ai
chapter: 04.05-the-lab-log-on-github
slug: lab-log-commit-push
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: From a lab entry to GitHub

## Teaching claim
One lab entry becomes a commit and a push in a fixed order: write the entry, check for secrets, commit with a clear message, push. Committing a file with a password or key is refused, because once it is in the history of a public repository, deleting it later does not remove it.

## Why a canvas
The order is the lesson: the check sits before the commit, where a mistake is still free to fix. A rejected loop on "Checked" makes the refusal visible as a request the process says no to, and the learner decides whether committing .env is harmless before seeing it refused.

## Model
- Inputs: none beyond the step controls.
- Outputs: the highlighted state, the active edge, the step note and chips (commands and file names).
- Rule: four states (Entry written, Checked, Committed, Pushed); edges "check", "commit" and "go", and a rejected loop "commit a key" on Checked. Six steps: write the entry, git status shows the entry and .env, committing .env is refused, .env goes into .gitignore and the check passes, commit with a clear message, push.
- Fixed data (as in chapter 4.5): `labs/day-04-stop-the-cache.md`; `.env` holds the database password for her codespace; commit message "Day 4: stop the cache, links still work but slower"; repository qasir-labs.
- Assumptions: the repository is public and already connected to GitHub.
- Limitations: a first push may ask you to sign in; GitHub's push protection tries to block some secrets in public repositories but does not catch everything (dossier S39, S109).

## Rendering
- Primary: the shared state-machine renderer.
- Grid: Entry written col 0 row 0, Checked col 1 row 0, Committed col 2 row 0, Pushed col 2 row 1.
- The same-column edge from Committed to Pushed is labelled "go", two characters, because it becomes horizontal on phones with about 22px between pills. The command `git push` is in that step's chip.
- The rejected loop label "commit a key" is 12 characters and was checked to fit both layouts with the registry geometry.
- Static fallback: chapter 4.5 teaches the entry, the commands and the check in prose before and after the canvas.

## Controls
Shared stepper controls only.

## Visualisation
Four pills, three transitions and one rejected loop. Tones: bad on the refused commit, good on the clean check and on the push, each with a text badge.

## Copy
- What this shows: one entry passing a check before it is saved and sent.
- Try this: 1. Go to step 4 to check the chapter's prediction (once .env is in .gitignore, git status shows only the entry and .gitignore). 2. At step 5, read only the commit message: what does a mentor learn from it?
- What changed: each step note says what git status shows or what was saved.
- Limits of the model: as in `limits`.

## Edge cases
Step 1 has no edge. Steps 2 to 4 all light Checked: the check, the refusal on the rejected edge, then the clean check with no edge.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole flow, including the refusal, for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quizzes after the canvas ask which files to commit, and what to do with other people's data in an entry).
- [x] The model is tested (registry consistency and label-fit tests; checked locally with the registry geometry).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose in 4.5).

## Build plan
`packages/learning-ui/src/canvas/lab-log-commit-push/data.ts`, export `labLogCommitPush`, to be registered in `packages/learning-ui/src/canvas/registry.ts` and the slug lists by the orchestrator; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.

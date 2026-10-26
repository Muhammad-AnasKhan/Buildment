---
artifact: canvas-spec
course: build-with-ai
chapter: 08.02-learn-adopt-research-fast
slug: adopt-a-tool-loop
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Adopt a new tool in days

## Teaching claim
Adopt a new tool fast and safely with one loop: read its own docs first (version, date, limits), run a tiny lab where you break one thing, explain it back without notes, and only then use it, small, in your project. The loop refuses two shortcuts: using a tool because a post said so, and using code because it ran. It ties to the daily lab of chapter 4.2, the explain-back rule of chapter 7.4 and the habits the Redis case teaches: read the licence page and the dated announcement, compare release notes, note the date (dossier section 7; B29, B31, B32, B33).

## Why a canvas
The chapter tells the loop in beats and a Mermaid diagram of the fast path that failed. The machine shows which moves exist, which two are refused, and that "In my project" can only be reached through an explanation. A list of four steps cannot show a refused move.

## Model
- Inputs: none beyond the shared step controls.
- Outputs: the highlighted state, the active edge, the step note, chips and an outcome badge.
- Rule: five states (New tool, Docs read, Tiny lab, Explained back, In my project) and six edges. Allowed path: New tool, read docs, Docs read, run it, Tiny lab, say, Explained back, use small, In my project. Refused: "from a post" (a loop on New tool) and "it ran" (Tiny lab to In my project, drawn dashed). A refused step does not change the state.
- Facts: Mawid and Yazan are made up. The version (3.2), the limit (jobs live in memory, so a restart forgets them) and every time are this example's numbers: docs 30 minutes, lab 15 + 10 + 5 = 30 minutes, explain back about 20, first use about 40. Checked total: 30 + 30 + 20 + 40 = 120 minutes over four days.
- Assumptions: one tool, one person, docs that can be read in 30 minutes.
- Limitations: real docs are longer and some tools cannot be tried in 30 minutes; then the lab is smaller or the use waits.

## Rendering
- Primary: the shared state-machine renderer.
- Grid (3 columns by 2 rows): New tool (0,0), Docs read (1,0), Tiny lab (2,0); Explained back (2,1), In my project (1,1). Cell (0,1) is empty on purpose, because the refused loop on New tool needs the cell below it in the narrow layout.
- The refused "it ran" edge is the diagonal from Tiny lab to In my project. Its label ("it ran") and the label of the edge from Docs read to Tiny lab ("run") are short, so they do not touch in the same square of four cells.
- The edge between Tiny lab and Explained back joins two states in one column, so its label has 3 characters ("say"). In the narrow layout that label sits between the two pills, as the 3-character labels do in the who-makes-the-call canvas. Longest label: "from a post" (11 characters).
- Static fallback: chapter 8.2 explains the five states and both refused moves in prose after the canvas.

## Controls
Shared stepper controls only. No numeric inputs: the claim is about the order of moves.

## Visualisation
Five pills, four allowed arrows and two refused (dashed) moves. Tones: bad with the badge "refused" on both refused steps; warn with "limit found" at the lab; good with "explained" and "in the project" at the end.

## Copy
- What this shows: one tool from a post to one small use, with the two moves the loop refuses.
- Try this: three lines. The first matches the chapter's predict (step 5: use it because it ran, or explain it first).
- What changed: each step note says who did what and why a move is allowed or refused.
- Limits of the model: as in `limits`.

## Edge cases
- Step 1 lights New tool with no edge. Steps 2 and 5 are refused and the state does not change.
- Step numbers in `tryThis` count from 1: step 2 refuses the post, step 3 is the docs, step 4 the lab, step 5 refuses "it ran", step 6 the explain-back, step 7 the first use.
- Facts match chapter 8.2: Yazan, Mawid, version 3.2, the 20:00 job, Sunday reminders, the storage option, a restart test.

## Accessibility
Shared stepper keyboard support and focus ring. `summary` gives the whole path for screen readers. Every tone has a text badge.

## Acceptance criteria
- [x] The claim is testable: the quick check after the canvas transfers it to a new tool and person.
- [x] The model is tested by the registry consistency and label-fit tests once registered.
- [x] The design is simple and legible: five states, six edges.
- [x] Prediction before (chapter predict, first line of `tryThis`), transfer check after.
- [x] Reader fallback exists: the chapter's prose and its Mermaid diagram.

## Build plan
`packages/learning-ui/src/canvas/adopt-a-tool-loop/data.ts`, export `adoptAToolLoop` (StateMachineSpec). To be registered by the orchestrator in `registry.ts` and `server/src/shared/canvas/slugs.ts`.

## Placement
Chapter 8.2, beat 3 ("Four steps, two refusals"), after the beat that shows three sources and the predict.

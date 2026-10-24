---
artifact: canvas-spec
course: faith-and-resilience
chapter: 05.04-istikhara
slug: istikhara-in-order
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Istikhara in its place

- **Slug:** `istikhara-in-order`
- **Export:** `istikharaInOrder` in `data.ts`

## Teaching claim
Permissible options, research and shura first; then istikhara; then decide, act and watch whether the way opens. No dream is needed.

## Why a canvas
Learners arrive with a picture of istikhara as a stand-alone event: pray, sleep, wait for a dream. A state machine shows it as one state in a sequence, with the moves that are refused drawn as refusals (istikhara about something not allowed; waiting for a dream). Stepping through it in order lets the learner predict whether research and consultation are still needed once istikhara is prayed, then see the answer.

## Model
- Inputs: none beyond the shared step controls.
- Outputs: the highlighted state, the active edge, the step note, chips and outcome badge.
- Rule: five states (row 0 left to right: options allowed, facts and advice, istikhara; row 1 right to left: decide and act, watch the way). Four forward edges and two refused loops ("not allowed" on the first state, "wait for dream" on istikhara). Eight steps; each step lights the edge that led into its state. Facts (5.2) and consultation (5.3) share one state, visited in two steps.
- Sources: Sahih al-Bukhari 1166 (two rak'as that are not obligatory, then the dua, naming the matter); the dossier's agreed core (allowed choices only; no dream required; study and consult as well) and its course phrasing for afterwards ("go ahead with what seems best and watch whether the way opens"; scholars differ on the weight of a feeling; you may repeat it, no number); Quran 3:159 (decide, then trust).
- Facts carried from the chapter: offers almost level at 39 and 38; Rania saves 500 shekels a month; Muath helps Jana; the startup agrees to 18:00 calls by Wednesday.
- Assumptions: the learner follows the course's order; the canvas does not claim the order is the only valid one.
- Limitations: does not measure any answer to a prayer; Rania's way opening is her story, not a promise.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 columns by 2 rows, a snake like `five-whys-chain`, so the narrow layout fits 340px.
- Both refused loops sit on row 0 states. In the wide layout a loop is drawn over the top of its pill, so a loop on a row 1 state would land on the label of the vertical edge above it (a first draft with six states failed the overlap check for this reason).
- The edge between two states in the same column ("istikhara" to "decide and act") has a two-character label, "go", because it becomes a short sideways arrow on phones.
- No diagonal edges. Checked with the registry's geometry rules (pill and label bounds, no label overlap) in both layouts.
- Static fallback: the order is written out in prose and in a mermaid diagram in chapter 5.4.

## Controls
Shared stepper only. No numeric inputs: the claim is about order and about what is not required.

## Visualisation
Five pills, four forward arrows and two refused loops. Tone: bad on the two refused moves (with text badges "not for this" and "not needed"), good on the last step (badge "the way opened").

## Copy
- What this shows: where istikhara sits in a decision, and two things it does not need.
- Try this:
  1. Predict whether Rania needs a dream before she can decide.
  2. At step 6, what would waiting for a dream have done to the deadlines?
  3. At step 7, which earlier step gave Rania her backup idea?
- What changed: each step note says what Rania did and why.
- Limits of the model: as in `limits`.

## Edge cases
Two steps revisit a state through its refused loop (steps 2 and 6); the first step and the consultation step (step 4) have no edge. State names are 16 characters or fewer; edge labels 14 or fewer ("wait for dream" is exactly 14).

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole order for screen readers; every tone has a text badge.

## Acceptance criteria
- [ ] The claim is testable (the chapter's quiz asks about no dream and about an option one is unsure is allowed).
- [ ] The model is tested (registry consistency and label-fit tests).
- [ ] The design is simple and legible.
- [ ] Prediction before, transfer check after.
- [ ] Reader fallback exists (prose and diagram in 5.4).
- [ ] No reward, faith or decree is measured; scholarly differences are named, not graded.

## Build plan
`frontend/src/canvas/istikhara-in-order/data.ts`, to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.

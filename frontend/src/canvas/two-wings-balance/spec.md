---
artifact: canvas-spec
course: faith-and-resilience
chapter: 04.03-hope-and-fear-in-balance
slug: two-wings-balance
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Two wings: hope and fear

## Teaching claim
Fear alone leads to despair, hope alone to carelessness; both together keep a believer steady and acting.

## Why a canvas
Despair and carelessness are usually taught as opposites, so learners pick a side. The canvas puts them on the same grid as two copies of one failure (a single wing), and shows that each cure is to add the missing wing. The symmetry is the lesson, and a state map shows it at a glance.

## Model
- Inputs: none beyond the step controls.
- Outputs: the highlighted state, the active edge, the note and chips.
- Rule: six states. Row 0: Only fear, Both wings, Only hope. Row 1: Despair, Steady and acting, Careless. Edges: Only fear to Despair, Only hope to Careless, Both wings to Steady (each "so"); Only fear to Both wings ("add hope"); Only hope to Both wings ("add fear"). Eight steps through Ahmad's Monday (despair) and Thursday (carelessness), each mended, ending at Steady and acting.
- Assumptions: sources only from the course dossier (Quran 7:56, 17:57, 39:53, 15:56; Sahih al-Bukhari 7405; Ibn al-Qayyim's two wings, as the dossier phrases it). Fear means care about one's own choices only.
- Limitations: the two wings are a picture, not a measurement. No canvas value scores hope, fear, faith or reward, and no hardship is read as punishment.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 columns by 2 rows, with Both wings in the middle so both cures point inward. The three same-column edges are labelled "so" because they become short sideways arrows on a phone. No diagonals.
- Static fallback: chapter 4.3 teaches both evenings and both cures in prose, with a mermaid diagram.

## Controls
Shared stepper controls only.

## Visualisation
Six labelled pills and five arrows. Tone: bad on Despair and Careless (badge "one wing"), good on Steady and acting (badge "both wings").

## Copy
- What this shows: how one missing wing breaks the balance, and how adding it brings a heart back to steady action.
- Try this:
  1. At step 3, check the prediction: what did Ahmad's heart need on Monday night?
  2. Compare steps 6 and 7: each cure adds the missing wing, never more of the one he had.
- What changed: each note says which wing is missing or added, with the source.
- Limits of the model: as in `limits`.

## Edge cases
Steps 1, 2 and 4 light a state with no edge. Steps 6 and 7 both end at Both wings by different edges. The lost client on Monday is described explicitly as not a punishment. No Arabic script.

## Accessibility
Shared stepper keyboard support; `summary` gives the whole map for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quiz items after the canvas ask about fear as care about choices, and sadness versus despair, in new cases).
- [x] The model is tested (registry consistency and label-fit tests, once registered).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose and mermaid in 4.3).

## Build plan
`frontend/src/canvas/two-wings-balance/data.ts` (export `twoWingsBalance`), to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.

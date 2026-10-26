---
artifact: canvas-spec
course: build-with-ai
chapter: 01.03-what-the-data-shows
slug: fear-versus-data
version: 1
owner: interaction-designer
renderer: custom, on the reusable FlipDeck primitive (primitives/flip-deck.tsx, model models/flip-deck.ts)
---

# Canvas spec: Fear versus data

## Teaching claim
Some fears about AI and jobs are not supported (replacing all developers), some are (harder entry-level hiring in AI-exposed jobs, in US data), and some are partly true or out of date (the 19% slower result). The learner commits to a guess, then sees the evidence and its source (dossier A7, A21, A29, A30, A31, A34, A38, A39).

## Why a canvas
Reading a list of facts does not test what the learner already believes. Guessing first, then flipping the card, shows the gap between belief and evidence one claim at a time, in a deck small enough to finish on a phone.

## Model
- Inputs: one verdict per card: "Data supports it", "Partly" or "Data does not".
- Outputs: the card's evidence and source after the choice; the tally of cards matched on the first choice.
- Rule: shared FlipDeck model; `checkFlipDeck` limits are met (front 90, back 170, source 44).
- Cards (6): laid-off workers and AI (not, A7); hiring of young workers in exposed jobs (supports, A21); software developer jobs shrinking (partly, A29, A30, A31); AI will soon replace all software developers (not, a prediction, A21, A29); 19% slower with AI (partly, out of date, A38, A39); beginners faster on suited tasks (supports, A34).
- Distribution: 2 supports, 2 partly, 2 not. Order: not, supports, partly, not, partly, supports.
- Assumptions: "supports" means the cited data supports the claim as worded, in US data where the card says so.
- Limitations: a verdict is a coarse label; the source line is a pointer, not a proof.

## Rendering
Shared FlipDeck: 420 by 314 viewBox, one card at a time, verdict buttons under the picture, then "Next card".

## Copy
- What this shows: a claim, then what the data says.
- Try this: pick a verdict before you flip. Notice which cards moved you from your first guess.
- Limits: as in `limits`.

## Edge cases
- Dates: Gallup (June 2026 report of a Q1 2026 survey), Stanford (August 2026 revision), BLS (page modified 27 August 2026), Indeed (16 October 2026), METR (July 2025 and February 2026), Brynjolfsson, Li and Raymond (QJE 2025). All checked 2026-10-25.
- The developer-jobs card uses two occupations: BLS counts software developers, QA analysts and testers together (10% growth) and computer programmers separately (7% fewer).

## Accessibility
Shared FlipDeck: verdict buttons at 44 px; focus moves to the next action; a live line states the card, choice, evidence and source; never red for a wrong guess.

## Acceptance criteria
- [x] Every figure matches chapter 1.3 and dossier part A, with its date.
- [x] Prediction before (the chapter's predict about two findings that can both be true), transfer after (two quick checks).
- [x] Reader fallback: the chapter's folds give the same six findings in prose.

## Build plan
`packages/learning-ui/src/canvas/fear-versus-data/data.ts`, exports `FEAR_VERSUS_DATA` and `fearVersusData` (CustomCanvasSpec). To be registered by the orchestrator in `registry.ts` and `server/src/shared/canvas/slugs.ts`.

## Placement
Chapter 1.3, beat 2 ("Test six claims against the data").

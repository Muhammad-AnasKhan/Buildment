---
artifact: canvas-spec
course: build-with-ai
chapter: 10.5-ai-help-without-the-ai-look
slug: detector-myths
version: 1
owner: interaction-designer
renderer: custom, on the reusable Flip deck primitive (primitives/flip-deck.tsx, model models/flip-deck.ts)
---

# Canvas spec: What the evidence says about AI detectors

## Teaching claim
AI detectors are unreliable and wrongly flag second-language writers, so a score is a guess; authorship is shown by dated drafts, notes, a real story and checked facts, which support your word without proving it.

## Why a canvas
A learner who reads that detectors are unreliable still tends to feel that a score means something. Committing to a verdict before the card flips makes that feeling visible, one claim at a time, and shows the source next to each answer.

## Model
- Inputs: one verdict per card, chosen once. Verdicts: Data supports it, Partly, Data does not.
- Outputs: the card back (evidence and source line) and the tally of cards answered as the evidence says on the first choice.
- Rule: `chooseVerdict` records a match only on the first choice; `nextCard` moves on after a choice.
- Cards (8) and their evidence:
  | Card | Verdict | Dossier basis |
  |---|---|---|
  | OpenAI shut down its own detector for low accuracy | supports | C68 (withdrawn 20 July 2023; 26% of AI text labelled correctly at launch) |
  | A detector can wrongly call a person's own writing AI-made | supports | C68 (9% of human text mislabelled at launch), C69 |
  | Detectors judge second-language writers fairly | not | C69 (seven detectors, 91 essays, 61.22% called AI on average; US eighth graders almost perfectly judged) |
  | A detector's score is proof | not | C68, C69 |
  | A 150-word post is easy for a detector to judge | not | C68 (unreliable under 1,000 characters; English only recommended) |
  | Wikipedia's AI-signs list can help you edit your draft | partly | C70 (advice page, signs not proof) |
  | Dated drafts and notes show a post is yours | partly | course advice; the source line says "not a study" |
  | Medium needs a label for any AI help, even grammar | not | C71 (grammar or outline help need not be disclosed; generated text must be; undisclosed gets Network Only) |
- Assumptions: the learner has read the chapter's first beat; no card teaches evasion. The 2023 study's own finding that prompts change scores is left out on purpose: the course teaches showing authorship, not beating a score.
- Limitations: small samples, older detectors, 2023 data; Medium's rules can change (checked 2026-10-25).

## Rendering
- Primary: the shared Flip deck, inline SVG on a 420 by 314 viewBox, one card at a time.
- Why this renderer: predict, then reveal, for a whole deck, with the source on every back.
- Controls: up to three verdict buttons, then "Next card" or "See the tally", then "Again".
- Static fallback: the live line states the card, the choice, the evidence and the source.

## Controls
Verdict buttons (44 px) before the choice; one next button after. Focus moves to the next action.

## Visualisation
Good when the guess matches the evidence, warn when it differs, never red: a wrong guess is welcome. Both carry a text label.

## Copy
- What this shows: a claim, then what the evidence says.
- Try this: 1. Answer the second-language card before you read the others. 2. Read the source line on the dated-drafts card and notice it says "not a study".
- What changed: the card flips and shows the evidence and source.
- Limits of the model: as in `limits`.

## Edge cases
Front text is 90 characters or fewer, back 170 or fewer, source 44 or fewer, verdict labels 16 or fewer (checked by `checkFlipDeck`). Two verdict ids appear on three cards each or more; every verdict is used.

## Accessibility
Verdict buttons are real buttons with text; the flip is announced in a polite live region; reduced motion shows the back at once.

## Acceptance criteria
- [x] The claim is testable (the quick check after the chapter's beats: Anwar and an 80% score).
- [x] The model is tested (`checkFlipDeck` returns no problems).
- [x] The design is simple and legible at 375 px.
- [x] Prediction before (Zaid's evidence), transfer check after.
- [x] Reader fallback exists (the chapter's beat text and fold).

## Placement
Chapter 10.5, beat 2 ("Test claims about AI detectors"), right after the beat that shows Zaid's trail of files and the chapter's predict.

## Build plan
`packages/learning-ui/src/canvas/detector-myths/data.ts`, exports `DETECTOR_MYTHS` and `detectorMyths`, to be registered by the orchestrator in `registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by the registry tests and `checkFlipDeck`.

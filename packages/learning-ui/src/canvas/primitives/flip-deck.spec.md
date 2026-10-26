---
artifact: canvas-spec
course: shared (first used by build-with-ai v2)
chapter: shared primitive
slug: flip-deck
version: 1
owner: interactive-canvas-builder
---

# Canvas spec: Flip deck

## Teaching claim
Commit to a guess before you see the evidence; a claim that sounds right is not the same as a claim the data supports.

## Why a canvas
Reading a list of facts does not test the reader's own belief. Predicting first, then flipping the card, makes the gap between belief and evidence visible, one claim at a time.

## Model
- Inputs: one verdict per card, chosen once (2 or 3 verdicts, 4 to 8 cards).
- Outputs: the card state (front, or back with the evidence and source) and the tally of cards answered as the evidence says on the first try.
- Formula or rule: `chooseVerdict` records `matched` only when the first choice equals `answer`; later choices on the same card are ignored. `nextCard` moves on only after a choice. `checkFlipDeck` rejects unknown answers, duplicate ids, empty text and text over the limits.
- Assumptions: each card has exactly one verdict that the cited evidence supports.
- Limitations: a verdict is a coarse label for a messier truth; the source line is a pointer, not a proof.

## Rendering
- Primary: inline SVG, `viewBox` 420 by 314.
- Why this renderer: the card is the picture; the flip is a transform on one group.
- SVG structure: dot grid; banner; one card with the deck label and "Card n of N". Front: the claim. Back: "You said: X", a match pill, the evidence, a source pill. End: the tally and the end note.
- Controls: HTML buttons under the picture, at most three: the verdicts, then "Next card" (or "See the tally"), then "Again".
- Static fallback: the live line states the card, the choice, the evidence and the source.

## Controls
Verdict buttons (44 px) before the choice; one "Next card" button after. Focus moves to the next action so keyboard users never lose their place.

## Visualisation
One card at a time. Good (green) when the guess matches; warn (amber) when it differs. Never red: a wrong guess is welcome. Both carry a text label.

## Copy
- What this shows: a claim, then what the evidence says.
- Try this: pick a verdict before you flip.
- What changed: the card shows your guess next to the evidence.
- Limits of the model: set per slug in `limits`.

## Edge cases
Longest allowed text (90, 170 and 44 characters) wraps inside the card. A deck of 8 cards. A repeat press on a verdict is ignored. "Again" restarts with the tally cleared.

## Accessibility
Buttons are real buttons. The figure has a text alternative for the current card; an `aria-live="polite"` line reads the guess, the evidence and the source. The flip is about 400 ms (two 200 ms halves) and is replaced by an instant swap under `prefers-reduced-motion`.

## Acceptance criteria
- [x] The claim is testable.
- [x] The model is tested (`frontend/tests/unit/canvas/flip-deck.test.ts`).
- [x] The design is simple and legible at 375 px, light and dark.
- [ ] Prediction before, transfer check after (the deck is the prediction; the chapter adds the transfer check).
- [x] Reader fallback exists (live text; the chapter prose repeats the cards).

## Build plan
`primitives/flip-deck.tsx`, factory `makeFlipDeckCanvas` in `primitives/canvas-factories.tsx`, model `models/flip-deck.ts`, test `frontend/tests/unit/canvas/flip-deck.test.ts`. The orchestrator registers course slugs.

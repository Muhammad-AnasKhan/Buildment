---
artifact: canvas-spec
course: shared (first used by build-with-ai v2)
chapter: shared primitive
slug: word-sampler
version: 1
owner: interactive-canvas-builder
---

# Canvas spec: Word sampler

## Teaching claim
A language model picks likely words, so the common answer comes out most of the time, and adding context changes the odds.

## Why a canvas
"It predicts the next word" stays abstract. Asking again and again and watching the tally follow the bars shows both the pattern and the chance in it.

## Model
- Inputs: the context (1 to 3 prompts), "Ask once", "Ask N times" (N from 10 to 50), the seed.
- Outputs: each word's share (`shares`), each word's draw count, the last word drawn, and once there are 10 or more draws, the line "<top word> came out <n> of <m> times".
- Formula or rule: `draw` uses mulberry32 (as `dealOrder` does) and picks a word in proportion to its weight, so the same seed gives the same draws. `checkWordSampler` rejects a prompt without `___`, non-positive weights, duplicate words, and counts out of range (1 to 3 contexts, 2 to 6 words, manyCount 10 to 50, non-zero integer seed).
- Assumptions: the weights are illustrative and are not measured from any real model; the picture says so.
- Limitations: a real model's odds depend on far more than one prompt.

## Rendering
- Primary: inline SVG, `viewBox` 420 wide, height from the largest context.
- Why this renderer: bars, the tally and the blank are one picture; the drawn word flies from its bar into the blank.
- SVG structure: dot grid; the prompt card with a highlighted blank (room reserved for the longest word, so text never reflows); one row per word (word, share bar, percentage, draw count); a verdict banner; the caption "Illustrative numbers, not measured".
- Controls: "Ask once" and "Ask N times" buttons, plus a `BeatSegmented` for the prompts when there are two or three.
- Static fallback: the figure's text alternative lists every word, its percentage and its count.

## Controls
Two buttons, both 44 px. The prompt tabs keep each context's tally, so switching back shows the old draws.

## Visualisation
Bars scale to the share out of 100 percent so the lengths are honest. The last drawn word's row is tinted. Accent only.

## Copy
- What this shows: how likely each word is, and how often it came out.
- Try this: ask once a few times, then ask many times, then switch the prompt.
- What changed: the tally grows and the bars change with the context.
- Limits of the model: set per slug in `limits`.

## Edge cases
Two words or six. A 14-character word in a 60-character prompt. A small share (3 percent) still shows a thin bar. Counts in the hundreds. A prompt whose blank ends a line.

## Accessibility
Real buttons; the prompt tabs are a radio group. The figure has a text alternative; an `aria-live="polite"` line reads what was asked and the leader. The flight of the word takes 450 ms and bars slide in 500 ms; under `prefers-reduced-motion` the word appears in the blank at once and the bars jump.

## Acceptance criteria
- [x] The claim is testable.
- [x] The model is tested (`frontend/tests/unit/canvas/word-sampler.test.ts`).
- [x] The design is simple and legible at 375 px, light and dark.
- [ ] Prediction before, transfer check after (set by each chapter that uses it).
- [x] Reader fallback exists (live text and the chapter prose).

## Build plan
`primitives/word-sampler.tsx`, factory `makeWordSamplerCanvas` in `primitives/canvas-factories.tsx`, model `models/word-sampler.ts`, test `frontend/tests/unit/canvas/word-sampler.test.ts`. The orchestrator registers course slugs.

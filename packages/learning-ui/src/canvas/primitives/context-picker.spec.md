---
artifact: canvas-spec
course: shared (first used by build-with-ai v2)
chapter: shared primitive
slug: context-picker
version: 1
owner: interactive-canvas-builder
---

# Canvas spec: Context picker

## Teaching claim
The same question gets a different right answer in a different context, so say the context before you ask for the answer.

## Why a canvas
A table of "if A then X" is read and forgotten. Changing one fact and watching the answer move teaches that the answer was never fixed, which a static diagram cannot show.

## Model
- Inputs: one choice per factor (2 to 4 factors, 2 or 3 choices each). Defaults: `start`.
- Outputs: the option that fits (`pick`), the one-line reason (`why`), the index of the rule that fired (`rule`, -1 for the fallback).
- Formula or rule: `resolveContext`. The first rule whose `when` entries all equal the context wins; otherwise `fallback`. `allContexts` lists every combination; `checkContextConfig` rejects unknown ids, an incomplete start, an option no combination reaches, and more than 4 factors, 3 choices or 5 options.
- Assumptions: the rules are the course's own, written for the claim; they are not a benchmark.
- Limitations: real choices have more than four facts and more than one good answer.

## Rendering
- Primary: inline SVG, `viewBox` 420 wide, height from the data (about 340 for 2 factors, about 520 for the maximum).
- Why this renderer: the picture is the control; the pills and the highlight move in one picture.
- SVG structure: dot grid; question chip; one labelled group per factor with pills 40 units tall inside 52-unit tap areas; option cards in a grid (up to 3 columns); a moving ring with a "Fits" pill; a wrapped note banner with the reason.
- Controls: the pills are SVG buttons (`role="button"`, `aria-pressed`, shared focus ring). One control outside the picture: "Reset".
- Static fallback: the figure's text alternative lists the factors, the best fit and the reason.

## Controls
The pills set the context. Reset returns to `start`. Nothing else, so the learner only changes facts.

## Visualisation
Cards for options, one tinted and ringed. Colour: the accent only. Text at least 13 units, wrapped with `wrapWords`.

## Copy
- What this shows: the best option for the chosen context and why.
- Try this: change one pill and watch the ring move.
- What changed: the ring moves and the reason changes.
- Limits of the model: set per slug in `limits`.

## Edge cases
Four factors with three choices and five options with long labels fit without touching. A pick id that matches no option shows no ring. A start that misses a factor falls back to that factor's first choice. Labels longer than the card wrap to two lines.

## Accessibility
Every pill is keyboard reachable (Tab, Enter, Space) with a visible focus ring and the name "Factor: Choice". The figure is a labelled group; an `aria-live="polite"` line announces the best fit and the reason. The ring moves with a 300 ms transition that is off under `prefers-reduced-motion`.

## Acceptance criteria
- [x] The claim is testable.
- [x] The model is tested (`frontend/tests/unit/canvas/context-picker.test.ts`).
- [x] The design is simple and legible at 375 px, light and dark.
- [ ] Prediction before, transfer check after (set by each chapter that uses it).
- [x] Reader fallback exists (text alternative; `allContexts` for a table).

## Build plan
`primitives/context-picker.tsx`, factory `makeContextPickerCanvas` in `primitives/canvas-factories.tsx`, model `models/context-picker.ts`, test `frontend/tests/unit/canvas/context-picker.test.ts`. The orchestrator registers course slugs.

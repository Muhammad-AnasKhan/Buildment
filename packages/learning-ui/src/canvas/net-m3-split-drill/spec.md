# Canvas spec: net-m3-split-drill

- **Course and chapter:** networking, 3.5, beat 5. Brief: `agent-ip/work/networking/module-briefs/03-local-network.md` and the `net-m3-split-drill` entry of `agent-ip/work/networking/interaction-map.yaml`.
- **Renderer:** custom beat canvas, `mode="split"`, view `drill` of `net-m2-address-bits/AddressBitsCanvas.tsx` (view in `SplitView.tsx`), on `BeatFrame`. Anything the learner presses or drags is a native HTML button or range input; the SVG only draws. Model: `models/net-subnet.ts`, parameters checked by a zod schema in the same file.
- **Claim:** I can size a network from its host count and say where a block may start, without a calculator.
- **Input:** tap an answer, then **Next**; **New set** draws the next seed.
- **Rule:** `generateSplitDrill(setNumber, block)` in `models/net-subnet.ts`. Wrong options are one prefix off, half a block off, or inside the block already placed; each is checked against the model in tests.
- **Picture:** 3.5 beat 5: unassisted practice. Five seeded questions per set: smallest prefix for a host count (twice), a valid start (twice) and where the next block goes.
- **Verdict:** "Question 3 of 5", then "Right" or "Not quite", and the score on the last question.
- **Edge cases (tested):** Same set number, same questions. Exactly one option is right in every question.
- **Accessibility:** every control is a native button or input with an accessible name; a live summary under the picture says what changed; colour is never the only signal (digits, words and icons carry the same meaning); reduced motion respected (no animation beyond short colour changes); labels at least 13 units on a 420-wide view box.
- **Limits (in the fold):** Practice only: nothing here is saved or graded, and the graded check is the quiz at the end of the chapter. Each set is numbered and always asks the same five questions, so a mentor can open the same set again. Questions use prefixes from /25 to /29 inside a /24 and place the biggest block first.

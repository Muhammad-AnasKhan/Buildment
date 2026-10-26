# Canvas spec: net-m3-mask-drill

- **Course and chapter:** networking, 3.2, beat 7. Brief: `agent-ip/work/networking/module-briefs/03-local-network.md` and the `net-m3-mask-drill` entry of `agent-ip/work/networking/interaction-map.yaml`.
- **Renderer:** custom beat canvas, `mode="mask-and"`, view `drill` of `net-m2-address-bits/AddressBitsCanvas.tsx` (view in `MaskView.tsx`), on `BeatFrame`. Anything the learner presses or drags is a native HTML button or range input; the SVG only draws. Model: `models/net-subnet.ts`, parameters checked by a zod schema in the same file.
- **Claim:** I can find the network, the broadcast and the same-subnet answer by hand, without a calculator.
- **Input:** tap an answer, then **Next**; **New set** draws the next seed.
- **Rule:** `generateMaskDrill(setNumber)` in `models/net-subnet.ts`. The first wrong option is the first-three-numbers shortcut whenever it differs from the answer; the other is a neighbouring block. Feedback shows the AND of the cut byte in bits.
- **Picture:** 3.2 beat 7: unassisted practice. Five seeded questions per set (network twice, broadcast twice, same network once); one question per set uses a /20 or a /23.
- **Verdict:** "Question 3 of 5", then "Right" or "Not quite", and the score on the last question.
- **Edge cases (tested):** Same set number, same questions. No option repeats inside a question. Prefixes are never multiples of 8.
- **Accessibility:** every control is a native button or input with an accessible name; a live summary under the picture says what changed; colour is never the only signal (digits, words and icons carry the same meaning); reduced motion respected (no animation beyond short colour changes); labels at least 13 units on a 420-wide view box.
- **Limits (in the fold):** Practice only: nothing here is saved or graded, and the graded check is the quiz at the end of the chapter. Each set is numbered and always asks the same five questions, so a mentor can open the same set again. Prefixes run from /17 to /30 and skip the multiples of 8, where the first-three-numbers shortcut fails; /31 and /32 are not asked.

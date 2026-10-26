# Canvas spec: net-m9-v6-drill

- **Course and chapter:** networking, 9.2, beat 6. Brief: `agent-ip/work/networking/module-briefs/09-ipv6.md` and the `net-m9-v6-drill` entry of `agent-ip/work/networking/interaction-map.yaml`.
- **Renderer:** custom beat canvas, `mode="v6"`, view `drill` of `net-m2-address-bits/AddressBitsCanvas.tsx` (view in `V6View.tsx`), on `BeatFrame`. Anything the learner presses or drags is a native HTML button or range input; the SVG only draws. Model: `models/net-ipv6.ts`, parameters checked by a zod schema in the same file.
- **Claim:** I can write the standard short form, expand a short one and tell invalid from non-standard, by hand.
- **Input:** tap an answer, then **Next**; **New set** draws the next seed.
- **Rule:** `generateV6Drill(setNumber)` in `models/net-ipv6.ts`. The form questions are labelled by `judgeV6`, so the drill and the typing picture cannot disagree.
- **Picture:** 9.2 beat 6: unassisted practice. Five seeded questions per set: the short form (twice), the full form (once) and whether a form is standard, non-standard or invalid (twice).
- **Verdict:** "Question 3 of 5", then "Right" or "Not quite", and the score on the last question.
- **Edge cases (tested):** Same set number, same questions. Wrong short forms are the realistic slips: leading zeros kept, the wrong run, nothing compressed, uppercase, two `::`.
- **Accessibility:** every control is a native button or input with an accessible name; a live summary under the picture says what changed; colour is never the only signal (digits, words and icons carry the same meaning); reduced motion respected (no animation beyond short colour changes); labels at least 13 units on a 420-wide view box.
- **Limits (in the fold):** Practice only: nothing here is saved or graded, and the graded check is the quiz at the end of the chapter. Each set is numbered and always asks the same five questions, so a mentor can open the same set again. The addresses are made up; many sit in the documentation range 2001:db8::/32.

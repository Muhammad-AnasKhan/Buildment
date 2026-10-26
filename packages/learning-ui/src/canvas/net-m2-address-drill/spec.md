# Canvas spec: net-m2-address-drill

- **Course and chapter:** networking, 2.2. Full spec: `agent-ip/work/networking/canvas-specs/net-m2-address-bits.md`, section 3.
- **Renderer:** custom beat canvas, `mode="drill"` of `net-m2-address-bits/AddressBitsCanvas.tsx` (view in `DrillView.tsx`). Model: `models/net-address.ts` (`generateDrill`, `checkAnswer`, `explainQuestion`).
- **Claim:** I can convert between a byte and its bits, and spot an address that cannot exist, by hand, without a calculator.
- **Questions (five per set):** two byte to bits (tap eight bit cards, then **Check**), two bits to byte (pick one of three numbers), one real or not (pick "Real address" or "Cannot exist").
- **Distractors for bits to byte:** one bit misread, and the bits read right to left; same number of digits as the answer where possible.
- **Feedback:** after each answer, the banner says "Right" or "Not quite" and the correct bits are summed in words ("16 + 4 + 2 + 1 = 23"). End of set: "4 of 5 by hand".
- **Seed:** the set number; **New set** moves to the next number. The same set number always gives the same five questions, none repeated inside a set, and 0 or 255 appears in at least one of every three consecutive sets.
- **Controls:** **Check** or **Next** (the label follows the question), and **New set**.
- **Limits (in the fold):** practice only, not saved or graded; the graded check is the chapter quiz.

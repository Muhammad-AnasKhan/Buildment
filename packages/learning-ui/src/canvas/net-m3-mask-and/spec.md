# Canvas spec: net-m3-mask-and

- **Course and chapter:** networking, 3.2, beat 3. Brief: `agent-ip/work/networking/module-briefs/03-local-network.md` and the `net-m3-mask-and` entry of `agent-ip/work/networking/interaction-map.yaml`.
- **Renderer:** custom beat canvas, `mode="mask-and"`, view `and` of `net-m2-address-bits/AddressBitsCanvas.tsx` (view in `MaskView.tsx`), on `BeatFrame`. Anything the learner presses or drags is a native HTML button or range input; the SVG only draws. Model: `models/net-subnet.ts`, parameters checked by a zod schema in the same file.
- **Claim:** Address AND mask, bit by bit, gives the network address: a 1 under a 1 stays, anything under a 0 becomes 0.
- **Input:** tap any address bit of the chosen byte; tap a byte button to choose another byte; **Reset**. Default byte 3 (143, the byte the /20 cuts).
- **Rule:** `andBits`, `subnetFacts` and `andWorking` in `models/net-subnet.ts`; flipping uses `flipAddressBit` from `models/net-address.ts`.
- **Picture:** 3.2 beat 3: the network address is the address AND the mask. Four byte buttons show the address, the mask and the result for each byte; the chosen byte opens into eight address bits you can flip, the mask bits and the AND.
- **Verdict:** "10.20.143.7 AND 255.255.240.0 = 10.20.128.0", updated with every flip.
- **Edge cases (tested):** Flipping a bit under a 0 of the mask changes the address but not the network; flipping one under a 1 changes both.
- **Accessibility:** every control is a native button or input with an accessible name; a live summary under the picture says what changed; colour is never the only signal (digits, words and icons carry the same meaning); reduced motion respected (no animation beyond short colour changes); labels at least 13 units on a 420-wide view box.
- **Limits (in the fold):** IPv4 only, one fixed mask (/20). The AND is shown one byte at a time: under this mask the first two bytes are kept whole and the last is cleared. Contiguous masks only.

# Canvas spec: net-m3-wide-mask

- **Course and chapter:** networking, 3.2, beat 5. Brief: `agent-ip/work/networking/module-briefs/03-local-network.md` and the `net-m3-wide-mask` entry of `agent-ip/work/networking/interaction-map.yaml`.
- **Renderer:** custom beat canvas, `mode="mask-and"`, view `wide` of `net-m2-address-bits/AddressBitsCanvas.tsx` (view in `MaskView.tsx`), on `BeatFrame`. Anything the learner presses or drags is a native HTML button or range input; the SVG only draws. Model: `models/net-subnet.ts`, parameters checked by a zod schema in the same file.
- **Claim:** The mask, not the first three numbers, decides whether a destination is local: a /23 spans two third numbers.
- **Input:** a destination address typed in the field (plain-words errors, the picture keeps the last valid one); **Reset**. Default 192.168.0.40.
- **Rule:** `localCheck` in `models/net-subnet.ts`: local when destination AND mask equals address AND mask; the shortcut compares the first three numbers.
- **Picture:** 3.2 beat 5: 192.168.1.23/23 covers 192.168.0.0 to 192.168.1.255, so 192.168.0.40 is local although its first three numbers differ. The third number is drawn in bits for the address, the destination and the mask, and the two ANDs are compared.
- **Verdict:** "Local: it is on my network" or "Not local: it goes via the router", with the comparison and the shortcut line under the bits.
- **Edge cases (tested):** `192.168.1.40` is local and the shortcut agrees; `192.168.2.40` is not local; `10.168.1.23` differs in the first number; the shortcut is wrong for `/20` and `/25` as well (tested).
- **Accessibility:** every control is a native button or input with an accessible name; a live summary under the picture says what changed; colour is never the only signal (digits, words and icons carry the same meaning); reduced motion respected (no animation beyond short colour changes); labels at least 13 units on a 420-wide view box.
- **Limits (in the fold):** IPv4 only, one fixed mask (/23). The shortcut shown is the one from chapter 1.4, keep the first three numbers, which is right only for a /24. Contiguous masks only.

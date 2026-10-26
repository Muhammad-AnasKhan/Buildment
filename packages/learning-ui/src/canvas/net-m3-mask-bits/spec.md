# Canvas spec: net-m3-mask-bits

- **Course and chapter:** networking, 3.2, beat 2. Brief: `agent-ip/work/networking/module-briefs/03-local-network.md` and the `net-m3-mask-bits` entry of `agent-ip/work/networking/interaction-map.yaml`.
- **Renderer:** custom beat canvas, `mode="mask-and"`, view `bits` of `net-m2-address-bits/AddressBitsCanvas.tsx` (view in `MaskView.tsx`), on `BeatFrame`. Anything the learner presses or drags is a native HTML button or range input; the SVG only draws. Model: `models/net-subnet.ts`, parameters checked by a zod schema in the same file.
- **Claim:** The 1 bits of a mask mark the network part of an address; the 0 bits mark the host part.
- **Input:** a native range input (and two step buttons) for the prefix length, /8 to /32. Default /20.
- **Rule:** `maskNumber(n)` is n ones then 32 - n zeros (`models/net-address.ts`); `subnetFacts` gives the dotted mask, the block size and the counts (`models/net-subnet.ts`).
- **Picture:** 3.2 beat 2: the mask is 32 bits, n ones then zeros, and the ones mark the network part of an address. The campus address 10.20.143.7 and a prefix from /8 to /32; the address bits and the mask bits sit one above the other, the first n of both tinted, with each byte's value above it.
- **Verdict:** "20 network bits, 12 host bits", updated with every change.
- **Edge cases (tested):** `/32` shows 0 host bits and one address; `/31` shows 1 host bit; every digit is printed, so the tint is never the only signal.
- **Accessibility:** every control is a native button or input with an accessible name; a live summary under the picture says what changed; colour is never the only signal (digits, words and icons carry the same meaning); reduced motion respected (no animation beyond short colour changes); labels at least 13 units on a 420-wide view box.
- **Limits (in the fold):** IPv4 only, one address at a time. Contiguous masks only: the 1 bits are all on the left. The picture shows which bits are network and which are host; the AND that uses the mask is the next picture.

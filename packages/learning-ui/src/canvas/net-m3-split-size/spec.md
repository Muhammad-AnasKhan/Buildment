# Canvas spec: net-m3-split-size

- **Course and chapter:** networking, 3.5, beat 2. Brief: `agent-ip/work/networking/module-briefs/03-local-network.md` and the `net-m3-split-size` entry of `agent-ip/work/networking/interaction-map.yaml`.
- **Renderer:** custom beat canvas, `mode="split"`, view `size` of `net-m2-address-bits/AddressBitsCanvas.tsx` (view in `SplitView.tsx`), on `BeatFrame`. Anything the learner presses or drags is a native HTML button or range input; the SVG only draws. Model: `models/net-subnet.ts`, parameters checked by a zod schema in the same file.
- **Claim:** A network needs the smallest block whose usable count (size minus 2) holds its devices: 100 need a /25, 50 a /26, 20 a /27.
- **Input:** tap a prefix for each of the three networks; **Reset**. A block too small is refused with the reason and nothing changes.
- **Rule:** `hostsPrefix(hosts)` and `usableCount(prefix)` (`models/net-subnet.ts`, `models/net-address.ts`). 126 devices fit a `/25`, 127 need a `/24` (tested).
- **Picture:** 3.5 beat 2: 100 devices need a /25 (126 usable), 50 a /26 (62) and 20 a /27 (30). Each network offers five prefixes, /24 to /28, as native buttons.
- **Verdict:** "All fit, 48 spare: the least possible" when each network has its smallest block.
- **Edge cases (tested):** Ordinary networks stop at `/30`; a `/31` is for a point-to-point link. A bigger block than needed is allowed and shown as spare.
- **Accessibility:** every control is a native button or input with an accessible name; a live summary under the picture says what changed; colour is never the only signal (digits, words and icons carry the same meaning); reduced motion respected (no animation beyond short colour changes); labels at least 13 units on a 420-wide view box.
- **Limits (in the fold):** Usable hosts are the block size minus two, up to /30. A block too small is refused; a bigger one is allowed and the spare count rises. Sizes only: where each block goes comes in the next pictures.

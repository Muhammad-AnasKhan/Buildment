# Canvas spec: net-m3-split-place

- **Course and chapter:** networking, 3.5, beat 3. Brief: `agent-ip/work/networking/module-briefs/03-local-network.md` and the `net-m3-split-place` entry of `agent-ip/work/networking/interaction-map.yaml`.
- **Renderer:** custom beat canvas, `mode="split"`, view `place` of `net-m2-address-bits/AddressBitsCanvas.tsx` (view in `SplitView.tsx`), on `BeatFrame`. Anything the learner presses or drags is a native HTML button or range input; the SVG only draws. Model: `models/net-subnet.ts`, parameters checked by a zod schema in the same file.
- **Claim:** Placing the biggest block first keeps the free space in one piece; 192.168.10.0/25 takes .0 to .127.
- **Input:** tap a network's button to place it; **Reset**. Default: nothing placed.
- **Rule:** `placeInOrder` and `firstFit` in `models/net-subnet.ts`. Worked order: `192.168.10.0/25`, `192.168.10.128/26`, `192.168.10.192/27`, free `192.168.10.224/27`.
- **Picture:** 3.5 beat 3: 192.168.10.0/25 takes .0 to .127 and the free space is the other half. The block is drawn as a bar of 256 addresses; each tap places a block at the lowest free boundary of its size.
- **Verdict:** "All placed, no gaps. Free: .224 to .255" or "Gap .32 to .63: 32 addresses stranded".
- **Edge cases (tested):** Smallest first puts the /27 at .0, the /26 at .64 and the /25 at .128, leaving `192.168.10.32/27` as a gap. A block with no room is refused.
- **Accessibility:** every control is a native button or input with an accessible name; a live summary under the picture says what changed; colour is never the only signal (digits, words and icons carry the same meaning); reduced motion respected (no animation beyond short colour changes); labels at least 13 units on a 420-wide view box.
- **Limits (in the fold):** Each block goes to the lowest free boundary of its own size; there is no choice of place. Biggest first leaves one free piece at the end. Smallest first can leave a gap, which still fits here but strands space when the sizes change.

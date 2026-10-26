# Canvas spec: net-m3-overlap-line

- **Course and chapter:** networking, 3.6, beat 2. Brief: `agent-ip/work/networking/module-briefs/03-local-network.md` and the `net-m3-overlap-line` entry of `agent-ip/work/networking/interaction-map.yaml`.
- **Renderer:** custom beat canvas, `mode="overlap"`, view `line` of `net-m2-address-bits/AddressBitsCanvas.tsx` (view in `OverlapView.tsx`), on `BeatFrame`. Anything the learner presses or drags is a native HTML button or range input; the SVG only draws. Model: `models/net-subnet.ts`, parameters checked by a zod schema in the same file.
- **Claim:** Every block is a range of numbers; two blocks overlap when their ranges share a number.
- **Input:** a native range input that slides the /24 along the line, one /24 at a time; **Reset**. Default 172.17.5.0/24.
- **Rule:** `rangeOf`, `relate` and `windowSlots` in `models/net-subnet.ts`. 172.17.0.0/16 is 2,886,795,264 to 2,886,860,799; 172.17.5.0/24 is 2,886,796,544 to 2,886,796,799 (tested).
- **Picture:** 3.6 beat 2: each block is a stretch of address numbers on one line. 172.17.0.0/16 runs from 2,886,795,264 to 2,886,860,799; the office /24 starts inside it at 172.17.5.0.
- **Verdict:** "Overlap: Office is inside Docker" or "No overlap: the blocks are apart".
- **Edge cases (tested):** Touching blocks (the end of one is one below the start of the next) share no address and are not an overlap. A block never overlaps by halves.
- **Accessibility:** every control is a native button or input with an accessible name; a live summary under the picture says what changed; colour is never the only signal (digits, words and icons carry the same meaning); reduced motion respected (no animation beyond short colour changes); labels at least 13 units on a 420-wide view box.
- **Limits (in the fold):** IPv4 ranges on one line, from 172.16.0.0 to 172.19.255.255 only. No routing consequence is modelled: the overlap is shown, not what a router then does. 172.17.0.0/16 is what one test machine showed as its default bridge; check your own with docker network inspect bridge.

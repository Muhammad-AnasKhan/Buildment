# Canvas spec: net-m3-split-boundary

- **Course and chapter:** networking, 3.5, beat 4. Brief: `agent-ip/work/networking/module-briefs/03-local-network.md` and the `net-m3-split-boundary` entry of `agent-ip/work/networking/interaction-map.yaml`.
- **Renderer:** custom beat canvas, `mode="split"`, view `boundary` of `net-m2-address-bits/AddressBitsCanvas.tsx` (view in `SplitView.tsx`), on `BeatFrame`. Anything the learner presses or drags is a native HTML button or range input; the SVG only draws. Model: `models/net-subnet.ts`, parameters checked by a zod schema in the same file.
- **Claim:** A /26 may start only at .0, .64, .128 or .192; one at .100 is refused with the reason.
- **Input:** a native range input for the start (0 to 255), and **Previous boundary** and **Next boundary**. Default .100.
- **Rule:** `checkPlacement`, `startIsAligned`, `alignedStarts` and `boundaryScenario` in `models/net-subnet.ts`. Reasons: not a multiple of the size (with the last bits shown), overlap with a placed block, outside the block.
- **Picture:** 3.5 beat 4: the 100-device /25 is already at .0 to .127. The 50-device /26 starts at .100 and is refused with the reason; the learner moves it to a boundary.
- **Verdict:** "Refused: .100 is not a start for a /26" or "Allowed: a /26 may start at .128".
- **Edge cases (tested):** `.100`: refused, last 6 bits `100100`. `.64`: aligned but overlaps the /25. `.128` and `.192`: allowed. A start past `.255` runs outside the block.
- **Accessibility:** every control is a native button or input with an accessible name; a live summary under the picture says what changed; colour is never the only signal (digits, words and icons carry the same meaning); reduced motion respected (no animation beyond short colour changes); labels at least 13 units on a 420-wide view box.
- **Limits (in the fold):** A block of 2^k addresses starts only where its last k bits are zero, so a /26 starts at .0, .64, .128 or .192. The 100-device block already holds the first half, so .0 and .64 are also refused for overlap.

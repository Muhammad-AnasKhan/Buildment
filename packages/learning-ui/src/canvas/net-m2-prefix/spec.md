# Canvas spec: net-m2-prefix

- **Course and chapter:** networking, 2.3. Full spec: `agent-ip/work/networking/canvas-specs/net-m2-addr-modes-and-scenes.md`, section "net-m2-prefix".
- **Renderer:** custom beat canvas, `mode="prefix"` of `net-m2-address-bits/AddressBitsCanvas.tsx` (view in `PrefixView.tsx`), on `RailSlider`. Model: `models/net-address.ts` (`prefixFacts`, `prefixTable`, `blockSize`, `usableCount`, `maskNumber`).
- **Claim:** the prefix length sets the block size (2^(32-n)) and the mask, together.
- **Input:** drag the rail or use the arrow keys, or the two step buttons, from `/8` to `/32` on `10.20.143.7`. Default `/24`.
- **Shows:** the address and mask as 32 bits (the first n tinted as the network part, every digit printed), the mask in dotted form, block size, usable count, first and last address, and a one-line rule.
- **Edge cases (tested):** `/31` shows 2 addresses (point to point, RFC 3021); `/32` shows 1.
- **Limits (in the fold):** IPv4 only; usable is size minus two up to /30; non-contiguous masks not covered.

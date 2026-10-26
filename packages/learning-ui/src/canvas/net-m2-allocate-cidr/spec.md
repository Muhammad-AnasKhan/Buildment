# Canvas spec: net-m2-allocate-cidr

- **Course and chapter:** networking, 2.3. Full spec: `agent-ip/work/networking/canvas-specs/net-m2-addr-modes-and-scenes.md`, section "net-m2-allocate-class and net-m2-allocate-cidr".
- **Renderer:** custom beat canvas, `mode="allocate"` of `net-m2-address-bits/AddressBitsCanvas.tsx` (view in `AllocateView.tsx`), `flavour: "cidr"`. Model: `models/net-address.ts`.
- **Claim:** CIDR sizes each block to the need.
- **Data:** the same five organisations; nine choices, `/19` to `/27`.
- **Input:** tap a row, then a prefix. Too small is refused; a bigger block is allowed and the unused count rises. **Reset**.
- **Numbers (tested):** the smallest block that fits is /27 (30 usable) for 30, /23 (510) for 300, /22 (1,022) for 700, /21 (2,046) for 2,000 and /19 (8,190) for 5,000. Total unused 0 + 210 + 322 + 46 + 3,190 = 3,768, still 5 routing table entries.
- **Verdict:** "N of 5 placed, X unused", then "3,768 unused: the least possible", or "X unused; 3,768 is possible".
- **Limits (in the fold):** made-up organisations; usable is size minus two; the route count is before any blocks are merged.

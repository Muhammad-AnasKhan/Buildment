# Canvas spec: net-m2-allocate-class

- **Course and chapter:** networking, 2.1. Full spec: `agent-ip/work/networking/canvas-specs/net-m2-addr-modes-and-scenes.md`, section "net-m2-allocate-class and net-m2-allocate-cidr".
- **Renderer:** custom beat canvas, `mode="allocate"` of `net-m2-address-bits/AddressBitsCanvas.tsx` (view in `AllocateView.tsx`). Model: `models/net-address.ts` (`allocateConfigSchema`, `placeBlock`, `allocationTotals`, `allocateVerdict`). Data: plain parameters in `data.ts`, checked by the schema, so the slug can become a Markdown `canvas` fence later without new code.
- **Claim:** fixed classes forced a 300-computer company into a block of 65,534 usable addresses.
- **Data:** five made-up organisations needing 30, 300, 700, 2,000 and 5,000 computers; two choices, class C (254 usable) and class B (65,534 usable).
- **Input:** tap a row, then a class. A block too small is refused ("300 computers do not fit in 254") and nothing changes. **Reset**.
- **Numbers (tested):** unused when every choice is right is 224 + 65,234 + 64,834 + 63,534 + 60,534 = 254,360, with 5 routing table entries (one per block).
- **Picture:** one row per organisation (need, block, a bar of used against unused, the unused count); a card with total unused and routing table entries; the block chips with their usable count.
- **Verdict:** "Give each organisation a class", then "N of 5 placed, X unused", then "254,360 unused: classes cannot do better".
- **Accessibility:** rows and chips are named buttons (`aria-pressed` on the selected row and the current block); polite live summary; nothing animates.
- **Limits (in the fold):** made-up organisations; usable is size minus two; class A left out; real allocations were not this tidy.

# Canvas spec: net-m2-byte-bits

- **Course and chapter:** networking, 2.2. Full spec: `agent-ip/work/networking/canvas-specs/net-m2-address-bits.md`, section 1.
- **Renderer:** custom beat canvas on `BeatFrame`, `DotGrid`, `VerdictBanner` and `SvgButton`. One component, `net-m2-address-bits/AddressBitsCanvas.tsx`, `mode="byte"`. Model: `models/net-address.ts`, tested in `frontend/tests/unit/canvas/net-address.test.ts`.
- **Claim:** One part of an address is one byte: eight bits worth 128, 64, 32, 16, 8, 4, 2 and 1, so it holds 0 to 255, and 256 needs a ninth bit that is not there.
- **Input:** tap any of the eight bit cards (each is a button with `aria-pressed`); **Add 1** and **Reset** under the picture.
- **Rule:** value = sum of the place values that are on. Add 1 is a binary increment with carry; at 255 the carry leaves the byte, every bit becomes 0 and the overflow flag is set.
- **Default:** `00010111` = 23, the last part of `192.168.1.23`.
- **Picture:** place value above each card, the bit printed on it, the running sum ("16 + 4 + 2 + 1") and the value ("= 23"), a dashed ghost ninth card labelled "no ninth bit".
- **Motion:** Add 1 ripples the carry right to left, one card per step; at 255 the ghost card flashes and every card drops to 0. Reduced motion: the final state at once.
- **Verdict:** "23 in one byte"; "255: the biggest number one byte can hold"; "256 needs a ninth bit. A byte has eight."
- **Accessibility:** card names like "Bit worth 16, off"; live text summary ("Value 23. Bits on: 16, 4, 2, 1."); the digit 0 or 1 is always printed.
- **Limits (in the fold):** a byte is eight bits; adding one across a part is only to show the limit, addresses are not counted this way.
